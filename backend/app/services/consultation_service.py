"""CRUD for Consultation."""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.consultation import Consultation
from app.schemas.consultation import ConsultationCreate, ConsultationUpdate


def _to_response(c: Consultation) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "country": c.country,
        "selected_date_time": c.selected_date_time,
        "timezone": c.timezone,
        "pkt_time": c.pkt_time,
        "is_answered": c.is_answered,
        "timestamp": c.created_at.isoformat() if c.created_at else "",
    }


def list_consultations(db: Session) -> list[dict]:
    rows = db.query(Consultation).order_by(desc(Consultation.created_at)).all()
    return [_to_response(c) for c in rows]


def create_consultation(db: Session, data: ConsultationCreate) -> dict:
    c = Consultation(
        name=data.name,
        email=data.email,
        country=data.country,
        selected_date_time=data.selected_date_time,
        timezone=data.timezone,
        pkt_time=data.pkt_time,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _to_response(c)


def update_consultation(db: Session, consultation_id: int, data: ConsultationUpdate) -> dict | None:
    c = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not c:
        return None
    for field in (
        "name", "email", "country", "selected_date_time", "timezone", "pkt_time", "is_answered",
    ):
        val = getattr(data, field, None)
        if val is not None:
            setattr(c, field, val)
    db.commit()
    db.refresh(c)
    return _to_response(c)


def delete_consultation(db: Session, consultation_id: int) -> bool:
    c = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not c:
        return False
    db.delete(c)
    db.commit()
    return True
