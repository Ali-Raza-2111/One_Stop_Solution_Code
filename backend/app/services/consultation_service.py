"""CRUD for Consultation."""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.consultation import Consultation
from app.schemas.consultation import ConsultationCreate, ConsultationUpdate
from app.services import notification_service
from app.services import tz_service
from app.services.tz_service import SlotValidationError


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
    """Public: book a consultation.

    Runs slot validation BEFORE inserting:
      - parses selected_date_time (rejects unparseable)
      - rejects past / too-soon / too-far slots
      - rejects double-booking (same email + same slot within 5 min)
      - computes pkt_time server-side (ignoring any client-supplied pkt_time)
    """
    existing = (
        db.query(Consultation)
        .filter(Consultation.email == data.email.strip().lower())
        .all()
        if data.email else []
    )
    _aware_dt, pkt_time_str, _warnings = tz_service.validate_slot(
        selected_date_time=data.selected_date_time,
        timezone_name=data.timezone or None,
        email=data.email,
        existing=existing,
    )
    c = Consultation(
        name=data.name,
        email=data.email,
        country=data.country,
        selected_date_time=data.selected_date_time,
        timezone=data.timezone,
        pkt_time=pkt_time_str,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    # Fire admin notifications (email + WhatsApp) — best-effort
    try:
        notification_service.notify_new_consultation(_to_response(c))
    except Exception:
        pass
    return _to_response(c)


def update_consultation(db: Session, consultation_id: int, data: ConsultationUpdate) -> dict | None:
    c = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not c:
        return None
    new_date = getattr(data, "selected_date_time", None)
    new_tz   = getattr(data, "timezone", None)
    # Recompute pkt_time when the admin changes the date or timezone.
    # (Skip the past/double-booking guards here — admin is trusted to edit.)
    recompute_pkt = (new_date is not None and new_date != c.selected_date_time) \
                    or (new_tz is not None and new_tz != c.timezone)
    for field in (
        "name", "email", "country", "selected_date_time", "timezone", "pkt_time", "is_answered",
    ):
        val = getattr(data, field, None)
        if val is not None:
            setattr(c, field, val)
    if recompute_pkt:
        try:
            dt_naive = tz_service.parse_datetime(c.selected_date_time)
            if dt_naive is not None:
                aware = tz_service._attach_tz(dt_naive, c.timezone or None)
                c.pkt_time = tz_service.format_pkt(aware)
        except Exception:
            pass  # best-effort; don't fail the update if pkt recompute fails
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
