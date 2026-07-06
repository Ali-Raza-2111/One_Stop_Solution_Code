"""Authentication service."""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.admin_user import AdminUser
from app.services.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, LoginResponse


def authenticate(db: Session, payload: LoginRequest) -> LoginResponse | None:
    user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()
    if not user or not user.is_active:
        return None
    if not verify_password(payload.password, user.password_hash):
        return None
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    token = create_access_token(subject=user.username)
    return LoginResponse(
        token=token,
        username=user.username,
        display_name=user.display_name,
    )
