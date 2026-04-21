"""
API v1 router — aggregates all v1 sub-routers.
"""

from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.users import router as users_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(tasks_router, prefix="/tasks", tags=["Tasks"])
router.include_router(users_router, prefix="/users", tags=["Users"])
