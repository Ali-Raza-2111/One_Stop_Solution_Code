"""CRUD for ResourceItem."""
from sqlalchemy.orm import Session
from app.models.resource import ResourceItem
from app.schemas.resource import ResourceItemCreate, ResourceItemUpdate


def _to_response(r: ResourceItem) -> dict:
    return {
        "id": r.id,
        "category": r.category,
        "title": r.title,
        "description": r.description,
        "file_type": r.file_type,
        "file_size": r.file_size,
        "download_count": r.download_count,
    }


def list_resources(db: Session) -> list[dict]:
    rows = db.query(ResourceItem).order_by(ResourceItem.id.asc()).all()
    return [_to_response(r) for r in rows]


def create_resource(db: Session, data: ResourceItemCreate) -> dict:
    r = ResourceItem(
        category=data.category,
        title=data.title,
        description=data.description,
        file_type=data.file_type,
        file_size=data.file_size,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return _to_response(r)


def update_resource(db: Session, resource_id: int, data: ResourceItemUpdate) -> dict | None:
    r = db.query(ResourceItem).filter(ResourceItem.id == resource_id).first()
    if not r:
        return None
    for field in ("category", "title", "description", "file_type", "file_size"):
        val = getattr(data, field, None)
        if val is not None:
            setattr(r, field, val)
    db.commit()
    db.refresh(r)
    return _to_response(r)


def increment_download(db: Session, resource_id: int) -> dict | None:
    r = db.query(ResourceItem).filter(ResourceItem.id == resource_id).first()
    if not r:
        return None
    r.download_count = (r.download_count or 0) + 1
    db.commit()
    db.refresh(r)
    return _to_response(r)


def delete_resource(db: Session, resource_id: int) -> bool:
    r = db.query(ResourceItem).filter(ResourceItem.id == resource_id).first()
    if not r:
        return False
    db.delete(r)
    db.commit()
    return True
