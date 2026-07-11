"""ContactPlatform routes — admin-managed list of contact channels."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.schemas.contact_platform import ContactPlatformCreate, ContactPlatformUpdate, ContactPlatformResponse
from app.services import contact_platform_service

router = APIRouter(prefix="/contact-platforms", tags=["Contact Platforms"])


@router.get("/", response_model=list[ContactPlatformResponse])
def list_platforms(active_only: bool = False, db: Session = Depends(get_db)):
    return contact_platform_service.list_platforms(db, only_active=active_only)


@router.post("/", response_model=ContactPlatformResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def create_platform(body: ContactPlatformCreate, db: Session = Depends(get_db)):
    return contact_platform_service.create_platform(db, body)


@router.put("/{platform_id}", response_model=ContactPlatformResponse,
            dependencies=[Depends(require_admin)])
def update_platform(platform_id: int, body: ContactPlatformUpdate, db: Session = Depends(get_db)):
    res = contact_platform_service.update_platform(db, platform_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="Contact platform not found")
    return res


@router.delete("/{platform_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_platform(platform_id: int, db: Session = Depends(get_db)):
    if not contact_platform_service.delete_platform(db, platform_id):
        raise HTTPException(status_code=404, detail="Contact platform not found")
