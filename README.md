# Notes App — Full-Stack MERN with TypeScript

A production-ready full-stack note-taking web application built with TypeScript, React, Express, and MongoDB. Engineered with strict typing, clean layered architecture, security hardening, and resilient database life-cycle management.

---

## 🏛️ System Architecture

The backend follows a clean **Layered Architecture (Separation of Concerns)** to ensure high testability, maintainability, and clean decoupling between the HTTP transport layer and business logic:

```text
HTTP Request
     │
     ▼
[Middleware Layer]
  ├── Security (Helmet, CORS)
  ├── Structured Logging (Pino HTTP with correlation IDs)
  ├── Rate Limiter (Brute-force protection)
  ├── JWT Auth Guard (reads httpOnly cookie)
  └── Request Validation (Zod schemas)
     │
     ▼
[Routes Layer] (/api/auth, /api/notes)
     │
     ▼
[Controller Layer] (Request parsing, status codes, async handler)
     │
     ▼
[Service Layer] (Business logic, HTML-to-text extraction, audit logs)
     │
     ▼
[Repository Layer] (Data access, user-scoped queries, soft delete)
     │
     ▼
[Mongoose Models & MongoDB 7.0] (Compound indexes, TTL indexes, text search)
```

### Architectural Highlights
- **Layer Decoupling**: Controllers handle HTTP semantics; Services contain core domain logic; Repositories manage database queries strictly scoped by `userId`.
- **Tenant Isolation**: Every note query in the repository enforces `user: req.user.id` to prevent cross-tenant data access.
- **Security-First Defaults**:
  - Auth tokens are delivered strictly via **`httpOnly`, `SameSite: Lax`** cookies (immune to XSS token theft).
  - Passwords hashed using **bcrypt** with 12 salt rounds.
  - Zero raw request bodies in 500 error logs to prevent credential leakage (CWE-532).
  - Stack traces exposed exclusively in explicit development mode (CWE-209).
  - Docker MongoDB published only on loopback `127.0.0.1:27017` (CWE-668).
- **Graceful Lifecycle Management**:
  - Server boot uses non-blocking connection retry with exponential backoff (capped at 8s).
  - Unified process shutdown handles `SIGINT`, `SIGTERM`, and unhandled rejections with a 10-second safety deadline while retaining error exit codes.

---

## 💻 Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules, `"type": "module"`)
- **Language**: TypeScript 5.7+ (Strict Mode, zero `any`)
- **Web Framework**: Express 5.x
- **Database**: MongoDB 7.0 + Mongoose 9.x
- **Authentication**: JWT (`jsonwebtoken`) in `httpOnly` secure cookies + `bcryptjs`
- **Validation**: Zod
- **Logging**: Pino & `pino-http` (structured JSON logging)
- **Security**: Helmet, CORS, Cookie-Parser, Express-Rate-Limit
- **Code Quality**: ESLint 9 (Flat Config), Prettier

### Infrastructure
- **Docker Compose**: Containerized MongoDB 7.0 with persistent data volumes and health checks

---

## 📂 Project Structure

```text
cohort-10-mern-20650-iman/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # Mongoose connection & connection retry
│   │   │   └── env.ts              # Validated environment configuration
│   │   ├── controllers/
│   │   │   ├── authController.ts   # Signup, login, logout, me handlers
│   │   │   └── noteController.ts   # Note CRUD & trash handlers
│   │   ├── logger/
│   │   │   └── index.ts            # Pino logger instance
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT httpOnly cookie verification
│   │   │   ├── errorHandler.ts     # Global exception & body parser mapper
│   │   │   ├── notFound.ts         # 404 handler
│   │   │   ├── rateLimiter.ts      # Rate limiter middleware
│   │   │   ├── requestLogger.ts    # Correlation ID & request logging
│   │   │   └── validate.ts         # Zod body & query validation
│   │   ├── models/
│   │   │   ├── Note.ts             # Note schema with indexes & TTL
│   │   │   └── User.ts             # User schema with email index
│   │   ├── repositories/
│   │   │   ├── noteRepository.ts   # Database operations for notes
│   │   │   └── userRepository.ts   # Database operations for users
│   │   ├── routes/
│   │   │   ├── authRoutes.ts       # /api/auth routes
│   │   │   └── noteRoutes.ts       # /api/notes routes
│   │   ├── services/
│   │   │   ├── authService.ts      # Auth logic, JWT issuance, audit logs
│   │   │   └── noteService.ts      # Note business logic & text extraction
│   │   ├── types/
│   │   │   ├── auth.ts             # User & JWT TypeScript types
│   │   │   ├── express.d.ts        # Express Request augmentation (req.user)
│   │   │   └── note.ts             # DTOs and filter interfaces
│   │   ├── utils/
│   │   │   ├── AppError.ts         # Standard operational error class
│   │   │   └── asyncHandler.ts     # Async route wrapper
│   │   ├── app.ts                  # Express application setup
│   │   └── server.ts               # Server startup & graceful shutdown
│   ├── eslint.config.js            # ESLint 9 configuration
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml              # Local MongoDB 7.0 container setup
├── TASKS.md                        # Task checklist & roadmap
└── README.md                       # Project documentation
```

---

## 📡 API Endpoints

### 1. Health Check
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Live service & database connection status | No |

### 2. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register user & issue httpOnly cookie | No (Rate Limited) |
| `POST` | `/api/auth/login` | Login user & issue httpOnly cookie | No (Rate Limited) |
| `POST` | `/api/auth/logout` | Clear auth cookie | Yes (Cookie) |
| `GET` | `/api/users/me` | Fetch currently logged-in user profile | Yes (Cookie) |

### 3. Notes CRUD & Trash (`/api/notes`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/notes` | List active notes (supports `?tag=&color=&pinned=&search=`) | Yes (Cookie) |
| `POST` | `/api/notes` | Create a new note | Yes (Cookie) |
| `GET` | `/api/notes/:id` | Get note by ID | Yes (Cookie) |
| `PUT` | `/api/notes/:id` | Update note | Yes (Cookie) |
| `DELETE` | `/api/notes/:id` | Move note to trash (Soft Delete) | Yes (Cookie) |
| `GET` | `/api/notes/trash` | List soft-deleted notes in trash | Yes (Cookie) |
| `POST` | `/api/notes/:id/restore` | Restore note from trash | Yes (Cookie) |
| `DELETE` | `/api/notes/:id/permanent` | Permanently remove note from database | Yes (Cookie) |

---

## ⚙️ Getting Started Locally

### Prerequisites
- Node.js 20+ installed
- Docker Desktop running (for local MongoDB)

### 1. Start MongoDB Container
From the repository root:
```powershell
docker compose up -d
```
Verify container status:
```powershell
docker compose ps
```

### 2. Configure Backend Environment
Navigate to `backend/` and configure `.env`:
```powershell
cd backend
cp .env.example .env
```
Default `.env` configuration:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://admin:password123@localhost:27017/notes_db?authSource=admin
JWT_SECRET=supersecretjwtkeychangeinproduction1234567890
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
```

### 3. Install & Start Backend Development Server
```powershell
npm install
npm run dev
```
The server will start at `http://localhost:5000` with live reload.

---

## 🧪 Code Quality & Validation

Run quality checks inside `backend/`:
```powershell
# Type checking
npm run typecheck

# Linting (ESLint 9)
npm run lint

# Production build
npm run build
```
