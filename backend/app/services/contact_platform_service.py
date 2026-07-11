"""CRUD for ContactPlatform."""
from sqlalchemy.orm import Session
from app.models.contact_platform import ContactPlatform
from app.schemas.contact_platform import ContactPlatformCreate, ContactPlatformUpdate


def _to_response(p: ContactPlatform) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "icon": p.icon,
        "profile_url": p.profile_url,
        "display_order": p.display_order,
        "is_active": p.is_active,
    }


def list_platforms(db: Session, only_active: bool = False) -> list[dict]:
    q = db.query(ContactPlatform)
    if only_active:
        q = q.filter(ContactPlatform.is_active == True)
    rows = q.order_by(ContactPlatform.display_order.asc(), ContactPlatform.id.asc()).all()
    return [_to_response(p) for p in rows]


def create_platform(db: Session, data: ContactPlatformCreate) -> dict:
    p = ContactPlatform(
        name=data.name,
        icon=data.icon,
        profile_url=data.profile_url,
        display_order=data.display_order,
        is_active=data.is_active,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return _to_response(p)


def update_platform(db: Session, platform_id: int, data: ContactPlatformUpdate) -> dict | None:
    p = db.query(ContactPlatform).filter(ContactPlatform.id == platform_id).first()
    if not p:
        return None
    for field in ("name", "icon", "profile_url", "display_order", "is_active"):
        val = getattr(data, field, None)
        if val is not None:
            setattr(p, field, val)
    db.commit()
    db.refresh(p)
    return _to_response(p)


def delete_platform(db: Session, platform_id: int) -> bool:
    p = db.query(ContactPlatform).filter(ContactPlatform.id == platform_id).first()
    if not p:
        return False
    db.delete(p)
    db.commit()
    return True
