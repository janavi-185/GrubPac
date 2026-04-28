# 📡 Content Broadcasting System (CBS)

A backend API for educational content distribution — teachers upload subject-based content, the principal reviews and approves it, and students access live rotating content via a public API.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | PostgreSQL (Local or Neon DB) |
| Auth | JWT + bcrypt |
| File Upload | Multer |
| API Docs | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Rate Limiting | express-rate-limit |

---

## 📁 Folder Structure

```
src/
├── app.js                  # Entry point — Express setup, routes, middleware
├── config/
│   ├── database.js         # PostgreSQL connection pool
│   └── swagger.js          # Swagger/OpenAPI configuration
├── controllers/            # HTTP request handlers
│   ├── auth.controller.js
│   ├── content.controller.js
│   ├── approval.controller.js
│   └── public.controller.js
├── routes/                 # Express routers (with Swagger JSDoc)
│   ├── auth.routes.js
│   ├── content.routes.js
│   ├── approval.routes.js
│   ├── public.routes.js
│   └── user.routes.js
├── services/               # Business logic
│   ├── auth.service.js
│   ├── content.service.js
│   ├── approval.service.js
│   └── scheduling.service.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── upload.middleware.js
│   └── validate.middleware.js
├── models/                 # Database query layer
│   ├── user.model.js
│   ├── content.model.js
│   └── slot.model.js
└── utils/
    ├── response.js         # Standardized API responses
    ├── migrate.js          # DB schema creation
    └── seed.js             # Seed default users
uploads/                    # Local file storage
architecture-notes.txt      # Detailed system design notes
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### 1. Clone & Install

```bash
git clone <repo-url>
cd content-broadcasting-system
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=4000
NODE_ENV=development

# Option 1: Online Database (Recommended - e.g., Neon DB)
DATABASE_URL=your_neon_db_connection_string

# Option 2: Local Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=content_broadcasting_db
DB_USER=postgres
DB_PASS=your_password
DB_DIALECT=postgres

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760   # 10MB in bytes
UPLOAD_DIR=uploads
```

### 3. Database Setup

**Option A: Neon DB (Recommended & Online)**
You don't need to create a database locally. Just grab your `DATABASE_URL` connection string from your Neon DB dashboard and paste it into your `.env` file. Our code is pre-configured to automatically handle the required SSL connections for Neon DB.

**Option B: Local PostgreSQL**
If you are using a local PostgreSQL instance, create the database first:

```bash
# In psql
CREATE DATABASE content_broadcasting_db;
```

### 4. Run Migrations

**No manual migration scripts are required!**
This codebase uses Sequelize ORM with auto-sync capability (`sequelize.sync({ alter: true })`). When you start the server, it will automatically connect to your database and create or update all the necessary tables (Users, Content, ContentSlots, ContentSchedule).

### 5. Seed Default Users (Optional)

```bash
npm run db:seed
```

This creates:
| Role | Email | Password |
|------|-------|----------|
| Principal | principal@school.com | principal123 |
| Teacher 1 | teacher1@school.com | teacher123 |
| Teacher 2 | teacher2@school.com | teacher123 |

### 6. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## 📚 API Documentation

Once running, open Swagger UI at:

```
http://localhost:3000/api-docs
```

Swagger JSON spec:
```
http://localhost:3000/api-docs.json
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
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register teacher or principal |
| POST | `/api/auth/login` | ❌ | Login and get JWT |
| GET | `/api/auth/me` | ✅ | Get current user profile |

### Content (Teacher)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/content/upload` | Teacher | Upload content file |
| GET | `/api/content/my` | Teacher | View own uploaded content |
| GET | `/api/content` | Principal | View all content |
| GET | `/api/content/:id` | Both | Get content by ID |
| DELETE | `/api/content/:id` | Both | Delete content |

### Approval (Principal)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/approval/pending` | Principal | View pending content |
| PATCH | `/api/approval/:id/review` | Principal | Approve or reject content |

### Users (Principal)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/users/teachers` | Principal | List all teachers |
| GET | `/api/users/:id` | Principal | Get user by ID |

### Public (No Auth — Students)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/content/live/teachers` | ❌ | List all teachers |
| GET | `/api/content/live/:teacherId` | ❌ | Get live content for teacher |

---

## 🔄 Content Lifecycle

```
Upload → PENDING → [Principal Review] → APPROVED / REJECTED

APPROVED + within start_time/end_time → LIVE (shows in /content/live)
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
GET /api/content/live/<teacher_id>
GET /api/content/live/<teacher_id>?subject=maths
```

---

## ⏱️ Scheduling & Rotation Logic

The live content endpoint uses a **stateless, deterministic rotation algorithm**:

1. Fetch all `approved` content for the teacher within their active time window
2. Group by subject (each subject has its own independent rotation)
3. For each subject group:
   - Use the **earliest `start_time`** as the rotation **epoch**
   - Calculate `total_cycle_ms = SUM(rotation_duration * 60000)` for all items
   - Calculate `position_in_cycle = (NOW - epoch) % total_cycle_ms`
   - Walk the sorted items until the active one is found

**Example:**
```
Maths rotation: [A: 5min] [B: 5min] [C: 5min] → 15min cycle

At t=0min  → A is showing (time remaining: 5min)
At t=7min  → B is showing (time remaining: 3min)
At t=12min → C is showing (time remaining: 3min)
At t=15min → A is showing again (loop)
```

The response includes:
- `time_remaining_seconds` → how long the current content will show
- `active_until` → exact UTC timestamp when content switches
- `total_items_in_rotation` → how many items are in this subject's cycle

---

## 🛡️ Edge Cases Handled

| Case | Behavior |
|------|----------|
| No approved content | Returns `"No content available"` |
| Approved but no time window set | Content NOT shown |
| Content outside time window | Content NOT shown |
| Invalid or unknown teacher ID | Returns `"No content available"` |
| Invalid subject filter | Returns empty response |
| File type not allowed | 400 error with details |
| File exceeds 10MB | 400 error |
| Approving already-approved content | 400 error |
| Teacher accessing another teacher's content | 403 Forbidden |

---

## 📦 File Upload Rules

| Property | Value |
|----------|-------|
| Allowed formats | JPG, PNG, GIF |
| Max file size | 10MB |
| Storage | Local disk (`/uploads` folder) |
| Naming | UUID-based (prevents collisions) |
| Served at | `http://localhost:3000/uploads/<filename>` |

---

## 🚦 Rate Limiting

The public broadcasting endpoint is rate-limited:
- **60 requests per minute** per IP address
- Returns `429 Too Many Requests` when exceeded

---

## 🔧 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `DATABASE_URL` | - | Full connection string (e.g., Neon DB). If set, overrides local DB settings. |
| `DB_HOST` | `127.0.0.1` | Local PostgreSQL host |
| `DB_PORT` | `5432` | Local PostgreSQL port |
| `DB_NAME` | `postgres` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASS` | - | Database password |
| `DB_DIALECT`| `postgres`| Database dialect |
| `JWT_SECRET` | - | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `MAX_FILE_SIZE` | `10485760` | Max upload size (bytes) |
| `UPLOAD_DIR` | `uploads` | Upload directory |

---

## 🎯 Bonus Features (Implemented)

- ✅ **Rate Limiting** on public API (60 req/min)
- ✅ **Pagination** on all list endpoints (`?page=1&limit=10`)
- ✅ **Subject filtering** (`?subject=maths`)
- ✅ **Teacher filtering** (`?teacher_id=<uuid>`)
- ✅ **Swagger UI** with complete documentation and examples
- ✅ **File cleanup** on upload failure

## 🎯 Bonus Features (Not Implemented / Extension Points)

- ⬜ **Redis Caching** — Cache `/content/live` responses (add `ioredis`, wrap SchedulingService)
- ⬜ **S3 Storage** — Swap `multer.diskStorage` for `multer-s3`
- ⬜ **Analytics** — Track content view counts per request

---

## 📝 Assumptions & Notes

1. A teacher's `rotation_duration` applies per content item; items within the same subject share the cycle
2. `start_time`/`end_time` are mandatory for content to ever appear live — content without them is never shown
3. The rotation epoch is the earliest `start_time` across the subject group, ensuring consistent rotation for all students
4. File type validation uses both MIME type and file extension to prevent spoofed files
5. Subjects are stored as lowercase strings for case-insensitive matching
6. The seeded principal account is the only account with approval rights by default

---

## 🏃 Quick Start (TL;DR)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env  # → edit .env with your DB credentials (or DATABASE_URL)

# 3. Start the server (Database tables will be auto-created!)
npm run dev

# 4. Visit Swagger API Documentation
open http://localhost:4000/api-docs
```