const swaggerJSDoc = require('swagger-jsdoc');
try { require('dotenv').config(); } catch (e) {}

const SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4000}`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Content Broadcasting System API',
      version: '1.0.0',
      description: 'Backend API for a school content broadcasting system. Teachers upload content, Principals approve it, and students access live rotating content.',
    },
    servers: [
      {
        url: SERVER_URL,
        description: process.env.SERVER_URL ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['TEACHER', 'PRINCIPAL'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Content: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            subject: { type: 'string' },
            file_url: { type: 'string' },
            file_type: { type: 'string' },
            file_size: { type: 'integer' },
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
            rejection_reason: { type: 'string', nullable: true },
            uploaded_by: { type: 'string', format: 'uuid' },
            approved_by: { type: 'string', format: 'uuid', nullable: true },
            approved_at: { type: 'string', format: 'date-time', nullable: true },
            start_time: { type: 'string', format: 'date-time', nullable: true },
            end_time: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
                currentPage: { type: 'integer' },
                perPage: { type: 'integer' },
                hasNextPage: { type: 'boolean' },
                hasPrevPage: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth — All Users',
        description: 'Register and login. Open to all roles (Teacher & Principal). Returns a JWT token.',
      },
      {
        name: 'Content — Teacher',
        description: 'Upload new content, view your own uploads, delete your own content. Requires TEACHER role.',
      },
      {
        name: 'Content — Principal',
        description: 'View all content across all teachers, filter by subject or teacher. Requires PRINCIPAL role.',
      },
      {
        name: 'Users — Principal',
        description: 'List all teachers and fetch any user by ID. Requires PRINCIPAL role.',
      },
      {
        name: 'Approval — Principal',
        description: 'Review pending content — approve or reject with a reason. Requires PRINCIPAL role.',
      },
      {
        name: 'Broadcast — Public',
        description: 'Student-facing live content API. No login required. Rate limited to 60 requests/min.',
      },
      {
        name: 'Analytics — Principal',
        description: 'Subject-wise analytics and content usage tracking. Requires PRINCIPAL role.',
      },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Auth — All Users'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@school.com' },
                    password: { type: 'string', example: 'password123' },
                    role: { type: 'string', enum: ['TEACHER', 'PRINCIPAL'], example: 'TEACHER' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation error or user already exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Login and receive JWT token',
          tags: ['Auth — All Users'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'principal@school.com' },
                    password: { type: 'string', example: 'principal123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful, returns JWT token',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          summary: 'Get current logged-in user profile',
          tags: ['Auth — All Users'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User profile',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/content/upload': {
        post: {
          summary: 'Upload content (Teacher only)',
          tags: ['Content — Teacher'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['title', 'subject', 'file'],
                  properties: {
                    title: { type: 'string', example: 'Chapter 5 Quiz' },
                    subject: { type: 'string', example: 'maths' },
                    description: { type: 'string', example: 'End of term practice' },
                    start_time: { type: 'string', format: 'date-time', example: '2025-01-15T09:00:00Z' },
                    end_time: { type: 'string', format: 'date-time', example: '2025-01-15T17:00:00Z' },
                    rotation_duration: { type: 'integer', example: 5, description: 'Minutes per rotation cycle' },
                    file: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Content uploaded and pending approval' },
            400: { description: 'Missing required fields or invalid file' },
            403: { description: 'Forbidden — Teachers only' },
          },
        },
      },
      '/api/content/my': {
        get: {
          summary: "Get teacher's own uploaded content",
          tags: ['Content — Teacher'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', example: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', example: 10 } },
            { in: 'query', name: 'subject', schema: { type: 'string', example: 'maths' } },
          ],
          responses: {
            200: { description: "Paginated list of teacher's content" },
            403: { description: 'Forbidden — Teachers only' },
          },
        },
      },
      '/api/content': {
        get: {
          summary: 'Get all content (Principal only)',
          tags: ['Content — Principal'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', example: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', example: 10 } },
            { in: 'query', name: 'subject', schema: { type: 'string', example: 'science' } },
            { in: 'query', name: 'teacher_id', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'], example: 'APPROVED' }, description: 'Filter by approval status' },
          ],
          responses: {
            200: { description: 'Paginated list of all content with uploader info' },
            403: { description: 'Forbidden — Principals only' },
          },
        },
      },
      '/api/content/{id}': {
        get: {
          summary: 'Get content by ID',
          tags: ['Content — Principal'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Content details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Content' } } } },
            404: { description: 'Content not found' },
          },
        },
        delete: {
          summary: 'Delete content (Teacher: own content | Principal: any content)',
          tags: ['Content — Principal'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Content deleted' },
            403: { description: 'Not authorized to delete this content' },
            404: { description: 'Content not found' },
          },
        },
      },
      '/api/users/teachers': {
        get: {
          summary: 'Get all teachers (Principal only)',
          tags: ['Users — Principal'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', example: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', example: 10 } },
          ],
          responses: {
            200: { description: 'Paginated list of all teachers' },
            403: { description: 'Forbidden — Principals only' },
          },
        },
      },
      '/api/users/{id}': {
        get: {
          summary: 'Get a user by ID (Principal only)',
          tags: ['Users — Principal'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'User details', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            404: { description: 'User not found' },
          },
        },
      },
      '/api/approval/pending': {
        get: {
          summary: 'Get all pending content awaiting review (Principal only)',
          tags: ['Approval — Principal'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', example: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', example: 10 } },
          ],
          responses: {
            200: { description: 'Paginated list of pending content' },
            403: { description: 'Forbidden — Principals only' },
          },
        },
      },
      '/api/approval/{id}/review': {
        patch: {
          summary: 'Approve or reject content (Principal only)',
          tags: ['Approval — Principal'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['action'],
                  properties: {
                    action: { type: 'string', enum: ['approve', 'reject'], example: 'approve' },
                    rejection_reason: { type: 'string', example: 'Content contains incorrect information' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Content reviewed successfully' },
            400: { description: 'Content already reviewed or rejection_reason missing' },
            404: { description: 'Content not found' },
          },
        },
      },
      '/api/broadcast/teachers': {
        get: {
          summary: 'Get all teachers currently broadcasting live content',
          tags: ['Broadcast — Public '],
          responses: {
            200: { description: 'List of active teachers' },
          },
        },
      },
      '/api/broadcast/{teacherId}': {
        get: {
          summary: 'Get live rotating content for a teacher',
          description: 'Returns the currently active content per subject, with time_remaining_seconds and active_until. Rate limited to 60 req/min.',
          tags: ['Broadcast — Public'],
          parameters: [
            { in: 'path', name: 'teacherId', required: true, schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'subject', schema: { type: 'string', example: 'maths' }, description: 'Filter by subject' },
          ],
          responses: {
            200: { description: 'Live content with rotation timing metadata' },
            429: { description: 'Too many requests — rate limit exceeded' },
          },
        },
      },
      '/api/analytics/subjects': {
        get: {
          summary: 'Get subjects ranked by view count (most active subject)',
          description: 'Returns all subjects with total_views, unique_content_viewed, and total_approved_content. Sorted by most views.',
          tags: ['Analytics — Principal'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Subject analytics data' },
            403: { description: 'Forbidden — Principals only' },
          },
        },
      },
      '/api/analytics/content-usage': {
        get: {
          summary: 'Get per-content view counts with filters',
          description: 'Returns each content item with its view_count. Supports full filtering by subject, teacher, and status.',
          tags: ['Analytics — Principal'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page', schema: { type: 'integer', example: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', example: 10 } },
            { in: 'query', name: 'subject', schema: { type: 'string', example: 'maths' } },
            { in: 'query', name: 'teacher_id', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'], example: 'APPROVED' } },
          ],
          responses: {
            200: { description: 'Paginated content usage data with view_count per item' },
            403: { description: 'Forbidden — Principals only' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
