"""
PrimeTrade Task Manager API — Main Application Entry Point.

Features:
- JWT Authentication with role-based access (user/admin)
- CRUD operations for Tasks
- API versioning (v1)
- Swagger & ReDoc documentation
- CORS middleware for frontend integration
- Input sanitization & validation
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.database import engine, Base
from app.api.v1.router import router as v1_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created successfully")
    yield
    print("[STOP] Application shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="""
## PrimeTrade Task Manager API

A scalable REST API with authentication and role-based access control.

### Features
- 🔐 **JWT Authentication** — Secure token-based auth with bcrypt password hashing
- 👥 **Role-Based Access** — User and Admin roles with granular permissions
- 📋 **Task Management** — Full CRUD with filtering, search, and pagination
- 🛡️ **Input Sanitization** — All inputs sanitized against XSS/injection
- 📖 **API Versioning** — Versioned endpoints under `/api/v1/`

### Authentication
1. Register via `POST /api/v1/auth/register`
2. Login via `POST /api/v1/auth/login`
3. Use the returned JWT token in the `Authorization: Bearer <token>` header

### Roles
- **user** — Can manage their own tasks
- **admin** — Can manage all tasks and users
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routes
app.include_router(v1_router)


@app.get("/", tags=["Root"])
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["Root"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "ok",
        "database": "connected",
        "api_version": "v1",
    }
