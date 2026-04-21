# PrimeTrade Task Manager

A **Scalable REST API** with Authentication & Role-Based Access Control, built with **FastAPI** (backend) and **Next.js** (frontend).

![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

### Backend (FastAPI)
- 🔐 **JWT Authentication** — Secure token-based auth with bcrypt password hashing
- 👥 **Role-Based Access Control** — User and Admin roles with granular permissions
- 📋 **Task CRUD** — Full Create, Read, Update, Delete with filtering, search & pagination
- 🛡️ **Input Sanitization** — All inputs sanitized with `bleach` against XSS/injection
- 📖 **API Versioning** — All endpoints under `/api/v1/` for future scalability
- 📄 **Auto-Generated Docs** — Swagger UI at `/docs` and ReDoc at `/redoc`
- ✅ **Validation** — Pydantic schemas with strict type validation and constraints
- 🗄️ **Database** — SQLAlchemy ORM with SQLite (dev) / PostgreSQL (production)

### Frontend (Next.js)
- 🎨 **Premium Dark UI** — Glassmorphism, gradients, micro-animations
- 🔑 **Auth Flow** — Register, Login, Protected Dashboard
- 📊 **Dashboard** — Stats cards, task list with filters/search
- ✏️ **CRUD UI** — Create, edit, delete tasks with modal forms
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🔔 **Toast Notifications** — Success/error feedback from API

### Security & Scalability
- 🔒 Secure JWT token handling with expiration
- 🧹 Input sanitization & Pydantic validation
- 📁 Modular project structure ready for new modules
- 🔀 API versioning for backward compatibility

---

## 🗂️ Project Structure

```
primetrade/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Versioned API routes
│   │   │   ├── auth.py      # Register, login, profile
│   │   │   ├── tasks.py     # CRUD + filters + pagination
│   │   │   ├── users.py     # Admin user management
│   │   │   └── router.py    # V1 route aggregator
│   │   ├── core/
│   │   │   ├── security.py  # JWT + bcrypt utilities
│   │   │   └── dependencies.py  # Auth dependencies
│   │   ├── models/          # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   └── task.py
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   │   ├── user.py
│   │   │   └── task.py
│   │   ├── config.py        # Settings from .env
│   │   ├── database.py      # DB engine & session
│   │   └── main.py          # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env                 # Local config
│   └── .env.example         # Config template
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/       # Login page
│   │   │   ├── register/    # Registration page
│   │   │   ├── dashboard/   # Protected dashboard
│   │   │   ├── layout.tsx   # Root layout
│   │   │   ├── page.tsx     # Root redirect
│   │   │   └── globals.css  # Design system
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Auth state management
│   │   └── lib/
│   │       └── api.ts       # API client with types
│   ├── .env.local           # API URL config
│   └── package.json
├── SCALABILITY.md            # Scalability notes
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/primetrade-task-manager.git
cd primetrade-task-manager
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings (defaults work for dev)

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# .env.local already points to http://localhost:8000

# Run the dev server
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register a new user | ❌ |
| POST | `/api/v1/auth/login` | Login & get JWT token | ❌ |
| GET | `/api/v1/auth/me` | Get current user profile | ✅ |

### Tasks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/tasks/` | Create a new task | ✅ |
| GET | `/api/v1/tasks/` | List user's tasks (with filters) | ✅ |
| GET | `/api/v1/tasks/{id}` | Get a single task | ✅ |
| PUT | `/api/v1/tasks/{id}` | Update a task | ✅ |
| DELETE | `/api/v1/tasks/{id}` | Delete a task | ✅ |
| GET | `/api/v1/tasks/admin/all` | List all tasks (admin) | ✅ 🛡️ |

### Users (Admin)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users/` | List all users | ✅ 🛡️ |
| PUT | `/api/v1/users/me` | Update own profile | ✅ |
| PATCH | `/api/v1/users/{id}/role` | Change user role | ✅ 🛡️ |
| DELETE | `/api/v1/users/{id}` | Delete a user | ✅ 🛡️ |

### Query Parameters (Tasks)
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `per_page` | int | Items per page (1-100, default: 10) |
| `status` | string | Filter: `todo`, `in_progress`, `done` |
| `priority` | string | Filter: `low`, `medium`, `high` |
| `search` | string | Search in title/description |
| `all` | bool | Admin: show all users' tasks |

---

## 🗄️ Database Schema

### Users Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID (string) | Primary Key |
| email | VARCHAR(255) | Unique, Indexed |
| username | VARCHAR(100) | Unique, Indexed |
| hashed_password | VARCHAR(255) | Not Null |
| full_name | VARCHAR(200) | Nullable |
| role | VARCHAR(20) | Default: "user" |
| is_active | BOOLEAN | Default: True |
| created_at | DATETIME(tz) | Auto-set |
| updated_at | DATETIME(tz) | Auto-update |

### Tasks Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID (string) | Primary Key |
| title | VARCHAR(200) | Not Null |
| description | TEXT | Nullable |
| status | VARCHAR(20) | Default: "todo" |
| priority | VARCHAR(20) | Default: "medium" |
| due_date | DATETIME(tz) | Nullable |
| owner_id | UUID (string) | FK → users.id, CASCADE |
| created_at | DATETIME(tz) | Auto-set |
| updated_at | DATETIME(tz) | Auto-update |

---

## 🔐 Security Practices

1. **Password Hashing** — bcrypt with automatic salt generation
2. **JWT Tokens** — Short-lived access tokens (30 min default)
3. **Input Sanitization** — All text inputs sanitized with `bleach` to prevent XSS
4. **Pydantic Validation** — Strict type-checking and constraint enforcement
5. **CORS** — Configured to only allow the frontend origin
6. **Role-Based Access** — Middleware-level admin checks via FastAPI dependencies
7. **SQL Injection Prevention** — SQLAlchemy ORM with parameterized queries

---

## 🧪 Testing with Swagger

1. Start the backend: `uvicorn app.main:app --reload`
2. Open `http://localhost:8000/docs`
3. Register a user via `POST /api/v1/auth/register`
4. Copy the `access_token` from the response
5. Click "Authorize" (🔓) and paste: `Bearer <your_token>`
6. Test all CRUD endpoints

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
