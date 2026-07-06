"""CRUD for Enquiry."""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.enquiry import Enquiry
from app.schemas.enquiry import EnquiryCreate, EnquiryUpdate


def _to_response(e: Enquiry) -> dict:
    return {
        "id": e.id,
        "name": e.name,
        "contact_method": e.contact_method,
        "contact_info": e.contact_info,
        "subject": e.subject,
        "message": e.message,
        "selected_service": e.selected_service,
        "timezone": e.timezone,
        "is_answered": e.is_answered,
        "timestamp": e.created_at.isoformat() if e.created_at else "",
    }


def list_enquiries(db: Session) -> list[dict]:
    rows = db.query(Enquiry).order_by(desc(Enquiry.created_at)).all()
    return [_to_response(e) for e in rows]


def create_enquiry(db: Session, data: EnquiryCreate) -> dict:
    e = Enquiry(
        name=data.name,
        contact_method=data.contact_method,
        contact_info=data.contact_info,
        subject=data.subject,
        message=data.message,
        selected_service=data.selected_service,
        timezone=data.timezone,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return _to_response(e)


def update_enquiry(db: Session, enquiry_id: int, data: EnquiryUpdate) -> dict | None:
    e = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not e:
        return None
    for field in (
        "name", "contact_method", "contact_info", "subject", "message",
        "selected_service", "timezone", "is_answered",
    ):
        val = getattr(data, field, None)
        if val is not None:
            setattr(e, field, val)
    db.commit()
    db.refresh(e)
    return _to_response(e)


def delete_enquiry(db: Session, enquiry_id: int) -> bool:
    e = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not e:
        return False
    db.delete(e)
    db.commit()
    return True
