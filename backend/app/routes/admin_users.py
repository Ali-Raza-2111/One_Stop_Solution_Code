"""Admin user management routes (CRUD for AdminUser — the login users).

All endpoints require an authenticated admin. Extra safety:
  - Cannot delete yourself.
  - Cannot deactivate yourself.
  - Cannot delete/deactivate the last remaining active admin (enforced in service).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin, get_current_admin
from app.models.admin_user import AdminUser
from app.schemas.admin_user import AdminUserCreate, AdminUserUpdate, AdminUserResponse
from app.services import admin_user_service

router = APIRouter(prefix="/admin-users", tags=["Admin Users"])


@router.get("/", response_model=list[AdminUserResponse],
            dependencies=[Depends(require_admin)])
def list_admins(db: Session = Depends(get_db)):
    return admin_user_service.list_admins(db)


@router.get("/me", response_model=AdminUserResponse)
def get_me(current: AdminUser = Depends(get_current_admin)):
    """Return the currently authenticated admin's profile."""
    return {
        "id":            current.id,
        "username":      current.username,
        "display_name":  current.display_name,
        "is_active":     current.is_active,
        "created_at":    current.created_at.isoformat() if current.created_at else "",
        "last_login_at": current.last_login_at.isoformat() if current.last_login_at else None,
    }


@router.get("/{admin_id}", response_model=AdminUserResponse,
            dependencies=[Depends(require_admin)])
def get_admin(admin_id: int, db: Session = Depends(get_db)):
    res = admin_user_service.get_admin(db, admin_id)
    if not res:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return res


@router.post("/", response_model=AdminUserResponse,
             status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def create_admin(body: AdminUserCreate, db: Session = Depends(get_db)):
    try:
        return admin_user_service.create_admin(db, body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{admin_id}", response_model=AdminUserResponse,
            dependencies=[Depends(require_admin)])
def update_admin(
    admin_id: int,
    body: AdminUserUpdate,
    db: Session = Depends(get_db),
    current: AdminUser = Depends(get_current_admin),
):
    # Prevent self-deactivation.
    if body.is_active is False and admin_id == current.id:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
    try:
        res = admin_user_service.update_admin(db, admin_id, body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not res:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return res


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current: AdminUser = Depends(get_current_admin),
):
    if admin_id == current.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    try:
        ok = admin_user_service.delete_admin(db, admin_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=404, detail="Admin user not found")
