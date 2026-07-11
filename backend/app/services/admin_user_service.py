"""CRUD for AdminUser (auth users — login + JWT).

Safety rules enforced here:
  - Never delete the last active admin (prevents total lockout).
  - Never deactivate the last active admin.
  - Caller (route) is responsible for "don't delete/deactivate yourself".
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.admin_user import AdminUser
from app.schemas.admin_user import AdminUserCreate, AdminUserUpdate
from app.services.security import hash_password


def _to_response(u: AdminUser) -> dict:
    return {
        "id":            u.id,
        "username":      u.username,
        "display_name":  u.display_name,
        "is_active":     u.is_active,
        "created_at":    u.created_at.isoformat() if u.created_at else "",
        "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
    }


def list_admins(db: Session) -> list[dict]:
    rows = db.query(AdminUser).order_by(AdminUser.id.asc()).all()
    return [_to_response(u) for u in rows]


def get_admin(db: Session, admin_id: int) -> dict | None:
    u = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    return _to_response(u) if u else None


def get_admin_by_username(db: Session, username: str) -> AdminUser | None:
    return db.query(AdminUser).filter(AdminUser.username == username).first()


def count_active_admins(db: Session) -> int:
    return db.query(AdminUser).filter(AdminUser.is_active == True).count()


def create_admin(db: Session, data: AdminUserCreate) -> dict:
    if get_admin_by_username(db, data.username):
        raise ValueError(f"Username '{data.username}' already exists")
    u = AdminUser(
        username=data.username,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
        is_active=data.is_active,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return _to_response(u)


def update_admin(db: Session, admin_id: int, data: AdminUserUpdate) -> dict | None:
    u = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not u:
        return None

    # Deactivation guard: cannot deactivate the last active admin.
    if data.is_active is False and u.is_active is True and count_active_admins(db) <= 1:
        raise ValueError("Cannot deactivate the last active admin")

    if data.password:
        u.password_hash = hash_password(data.password)
    if data.display_name is not None:
        u.display_name = data.display_name
    if data.is_active is not None:
        u.is_active = data.is_active

    db.commit()
    db.refresh(u)
    return _to_response(u)


def delete_admin(db: Session, admin_id: int) -> bool:
    u = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not u:
        return False

    # Last-active-admin guard (also applies to deletion).
    if u.is_active and count_active_admins(db) <= 1:
        raise ValueError("Cannot delete the last active admin")

    db.delete(u)
    db.commit()
    return True


def touch_last_login(db: Session, admin_id: int) -> None:
    """Update last_login_at to now. Used by /admin-users/me after login."""
    u = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if u:
        u.last_login_at = datetime.now(timezone.utc)
        db.commit()
