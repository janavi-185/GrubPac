# 📡 Content Broadcasting System (CBS)

A backend API for educational content distribution — teachers upload subject-based content, the principal reviews and approves it, and students access live rotating content via a public API.

---

## 🛠️ Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Runtime       | Node.js 18+                                     |
| Framework     | Express.js                                      |
| ORM           | Sequelize                                       |
| Database      | PostgreSQL via Neon DB                          |
| Auth          | JWT + bcrypt                                    |
| File Upload   | Multer                                          |
| API Docs      | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Rate Limiting | express-rate-limit                              |

---

## 📁 Folder Structure

```
src/
├── app.js
├── config/
│   ├── db.js               # Sequelize + Neon DB connection
│   ├── Swagger.js          # All Swagger/OpenAPI definitions
│   └── env.js              # Environment variable loader
├── controllers/
│   ├── auth.controller.js
│   ├── content.controller.js
│   ├── approval.controller.js
│   └── public.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── content.routes.js
│   ├── approval.routes.js
│   ├── public.routes.js
│   └── user.routes.js
├── services/
│   ├── auth.service.js
│   ├── content.service.js
│   ├── approval.service.js
│   └── scheduling.service.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── upload.middleware.js
│   ├── validate.middleware.js
│   └── rateLimit.middleware.js
├── models/
│   ├── User.js
│   ├── Content.js
│   ├── ContentSlot.js
│   └── ContentSchedule.js
└── utils/
    ├── response.js         # Standardized API response helpers
    └── seed.js             # Seed default users
uploads/                    # Local file storage
server.js                   # Entry point
Architecture notes.txt      # Detailed system design notes
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- A [Neon DB](https://neon.tech) account (free tier works)

### 1. Clone & Install

```bash
git clone <repo-url>
cd backend-project
pnpm install
```

### 2. Configure Environment

Create a `.env` file in the root:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=your_neon_db_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
SERVER_URL=http://localhost:4000
```

### 3. Database Setup

**No manual migration scripts are required.**

This project uses Sequelize ORM with `sequelize.sync({ alter: true })`. When the server starts, it automatically connects to Neon DB and creates/updates all tables:

- `Users`
- `Contents`
- `ContentSlots`
- `ContentSchedules`

### 4. Seed Default Users (Optional)

```bash
pnpm run db:seed
```

This creates:

| Role      | Email                | Password     |
| --------- | -------------------- | ------------ |
| Principal | principal@school.com | principal123 |
| Teacher 1 | teacher1@school.com  | teacher123   |
| Teacher 2 | teacher2@school.com  | teacher123   |

### 5. Start the Server

```bash
# Development (with auto-reload)
pnpm run dev

# Production
pnpm start
```

---

## 📚 API Documentation

Once running, open Swagger UI at:

```
http://localhost:4000/api-docs
```

---

## 🔑 Authentication

All protected routes require a JWT Bearer token:

```
Authorization: Bearer <your_token_here>
```

Get a token via `POST /api/auth/login`.

In Swagger UI, click **Authorize** (🔒) and enter: `Bearer <token>`

---

## 📋 API Endpoints

### Auth

| Method | Endpoint             | Auth | Description                   |
| ------ | -------------------- | ---- | ----------------------------- |
| POST   | `/api/auth/register` | ❌   | Register teacher or principal |
| POST   | `/api/auth/login`    | ❌   | Login and get JWT             |
| GET    | `/api/auth/me`       | ✅   | Get current user profile      |

### Content

| Method | Endpoint              | Role      | Description               |
| ------ | --------------------- | --------- | ------------------------- |
| POST   | `/api/content/upload` | TEACHER   | Upload content file       |
| GET    | `/api/content/my`     | TEACHER   | View own uploaded content |
| GET    | `/api/content`        | PRINCIPAL | View all content          |
| GET    | `/api/content/:id`    | Both      | Get content by ID         |
| DELETE | `/api/content/:id`    | Both      | Delete content            |

### Approval (Principal)

| Method | Endpoint                   | Role      | Description               |
| ------ | -------------------------- | --------- | ------------------------- |
| GET    | `/api/approval/pending`    | PRINCIPAL | View pending content      |
| PATCH  | `/api/approval/:id/review` | PRINCIPAL | Approve or reject content |

### Users (Principal)

| Method | Endpoint              | Role      | Description       |
| ------ | --------------------- | --------- | ----------------- |
| GET    | `/api/users/teachers` | PRINCIPAL | List all teachers |
| GET    | `/api/users/:id`      | PRINCIPAL | Get user by ID    |

### Public (No Auth — Students)

| Method | Endpoint                    | Auth | Description                         |
| ------ | --------------------------- | ---- | ----------------------------------- |
| GET    | `/api/broadcast/teachers`   | ❌   | List all teachers with live content |
| GET    | `/api/broadcast/:teacherId` | ❌   | Get live content for a teacher      |

Query params on public endpoints:

- `?subject=maths` — filter by subject

---

## 🔄 Content Lifecycle

```
Upload → PENDING → [Principal Review] → APPROVED / REJECTED

APPROVED + within start_time/end_time → LIVE (shows in /api/broadcast)
APPROVED + outside time window        → NOT shown
REJECTED                              → rejection_reason visible to teacher
```

### Upload a File (multipart/form-data)

```http
POST /api/content/upload
Authorization: Bearer <teacher_token>
Content-Type: multipart/form-data

title: Chapter 5 Quiz
subject: maths
description: End of term practice (optional)
file: <binary file>
start_time: 2025-01-15T09:00:00Z
end_time: 2025-01-15T17:00:00Z
rotation_duration: 5
```

### Approve Content

```http
PATCH /api/approval/<content_id>/review
Authorization: Bearer <principal_token>
Content-Type: application/json

{
  "action": "approve"
}
```

### Reject Content

```http
PATCH /api/approval/<content_id>/review
Authorization: Bearer <principal_token>
Content-Type: application/json

{
  "action": "reject",
  "rejection_reason": "Contains incorrect data for chapter 5"
}
```

### Get Live Content (Students)

```http
GET /api/broadcast/<teacher_id>
GET /api/broadcast/<teacher_id>?subject=maths
```

---

## ⏱️ Scheduling & Rotation Logic

The live content endpoint uses a **stateless, deterministic rotation algorithm**:

1. Fetch all `APPROVED` content for the teacher within their active time window (`start_time ≤ NOW ≤ end_time`)
2. Group by subject (each subject has its own independent rotation)
3. For each subject group:
   - Sort by `rotation_order` from `ContentSchedule`
   - Use the **earliest `start_time`** as the rotation **epoch**
   - Calculate `total_cycle_ms = SUM(duration * 60000)` for all items in the group
   - Calculate `position_in_cycle = (NOW - epoch) % total_cycle_ms`
   - Walk the sorted items to find the currently active one

**Example:**

```
Maths rotation: [A: 5min] [B: 5min] [C: 5min] → 15min cycle

At t=0min  → A is showing (time_remaining: 300s)
At t=7min  → B is showing (time_remaining: 180s)
At t=12min → C is showing (time_remaining: 180s)
At t=15min → A is showing again (loop)
```

Response includes:

- `time_remaining_seconds` — how long current content will show
- `active_until` — exact UTC timestamp when content switches
- `total_items_in_rotation` — how many items are in this subject's cycle

---

## 🛡️ Edge Cases Handled

| Case                                       | Behavior                   |
| ------------------------------------------ | -------------------------- |
| No approved content                        | Returns `available: false` |
| Content approved but no time window        | Content NOT shown          |
| Content outside time window                | Content NOT shown          |
| Invalid teacher ID                         | Returns `available: false` |
| Rejecting without rejection_reason         | 400 error                  |
| Approving already-reviewed content         | 400 error                  |
| Teacher deleting another teacher's content | 403 Forbidden              |
| File exceeds 10MB                          | 400 error                  |

---

## 📦 File Upload Rules

| Property      | Value                            |
| ------------- | -------------------------------- |
| Field name    | `file`                           |
| Max file size | 10MB                             |
| Storage       | Local disk (`/uploads` folder)   |
| Naming        | UUID-based (prevents collisions) |
| Served at     | `/uploads/<filename>`            |

---

## 🚦 Rate Limiting

Applied to `/api/broadcast/*` (public endpoints only):

- **60 requests per minute** per IP address
- Returns `429 Too Many Requests` with `success: false` when exceeded

---

## 🔧 Environment Variables

| Variable         | Required                  | Description                               |
| ---------------- | ------------------------- | ----------------------------------------- |
| `PORT`           | No (default: 4000)        | Server port                               |
| `NODE_ENV`       | No (default: development) | Environment                               |
| `DATABASE_URL`   | **Yes**                   | Neon DB full connection string            |
| `JWT_SECRET`     | **Yes**                   | Secret key for JWT signing                |
| `JWT_EXPIRES_IN` | No (default: 7d)          | Token expiry                              |
| `SERVER_URL`     | No                        | Public URL for Swagger (e.g., Render URL) |
| `CLIENT_URL`     | No (default: \*)          | Frontend URL for CORS                     |

---

## 🎯 Bonus Features (Implemented)

- ✅ **Rate Limiting** on public broadcast API (60 req/min)
- ✅ **Pagination** on all list endpoints (`?page=1&limit=10`)
- ✅ **Subject filtering** (`?subject=maths`)
- ✅ **Teacher filtering** (`?teacher_id=<uuid>`) on principal's content view
- ✅ **Swagger UI** with complete documentation and examples
- ✅ **File cleanup** on upload failure

---

## 📝 Assumptions & Notes

1. `duration` per content item comes from `ContentSchedule.duration` (minutes)
2. `start_time`/`end_time` on Content are required for it to appear live — content without them is never shown
3. Subjects are normalized to lowercase on upload
4. The rotation epoch is the earliest `start_time` across the subject group
5. `ContentSlot` is auto-created per subject on first upload (one slot per subject)
6. `rotation_order` in `ContentSchedule` is auto-assigned as the next available integer per slot

---

## 🏃 Quick Start (TL;DR)

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env with your DATABASE_URL and JWT_SECRET
# (see Environment Variables section above)

# 3. Start the server (tables auto-created by Sequelize)
pnpm run dev

# 4. Visit Swagger docs
open http://localhost:4000/api-docs

# 5. (Optional) Seed default users
pnpm run db:seed
```

## 🚀 Deployment (Render)

| Field          | Value            |
| -------------- | ---------------- |
| Build Command  | `pnpm install`   |
| Start Command  | `node server.js` |
| Root Directory | _(leave blank)_  |

Set these environment variables in Render's dashboard:

- `DATABASE_URL` — Neon DB connection string
- `JWT_SECRET` — your secret key
- `NODE_ENV` — `production`
- `SERVER_URL` — your Render app URL (e.g., `https://your-app.onrender.com`)
