"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.auth import LoginRequest, LoginResponse
from app.services import auth_service
from app.admin_auth import get_current_admin
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    res = auth_service.authenticate(db, payload)
    if not res:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return res


@router.get("/me")
def me(current: AdminUser = Depends(get_current_admin)):
    return {
        "id": current.id,
        "username": current.username,
        "display_name": current.display_name,
        "is_active": current.is_active,
    }
