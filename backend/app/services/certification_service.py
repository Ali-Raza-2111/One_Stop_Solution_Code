"""CRUD for Certification."""
from sqlalchemy.orm import Session
from app.models.certification import Certification
from app.schemas.certification import CertificationCreate, CertificationUpdate


def _to_response(c: Certification) -> dict:
    return {
        "id": c.id,
        "team_member_id": c.team_member_id,
        "name": c.name,
        "short_code": c.short_code,
        "issuer": c.issuer,
        "year_obtained": c.year_obtained,
        "sort_order": c.sort_order,
    }


def list_certifications(db: Session, team_member_id: int | None = None) -> list[dict]:
    q = db.query(Certification)
    if team_member_id is not None:
        q = q.filter(Certification.team_member_id == team_member_id)
    rows = q.order_by(Certification.sort_order.asc(), Certification.id.asc()).all()
    return [_to_response(c) for c in rows]


def create_certification(db: Session, data: CertificationCreate) -> dict:
    c = Certification(
        team_member_id=data.team_member_id,
        name=data.name,
        short_code=data.short_code,
        issuer=data.issuer,
        year_obtained=data.year_obtained,
        sort_order=data.sort_order,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _to_response(c)


def update_certification(db: Session, cert_id: int, data: CertificationUpdate) -> dict | None:
    c = db.query(Certification).filter(Certification.id == cert_id).first()
    if not c:
        return None
    for field in ("team_member_id", "name", "short_code", "issuer", "year_obtained", "sort_order"):
        val = getattr(data, field, None)
        if val is not None:
            setattr(c, field, val)
    db.commit()
    db.refresh(c)
    return _to_response(c)


def delete_certification(db: Session, cert_id: int) -> bool:
    c = db.query(Certification).filter(Certification.id == cert_id).first()
    if not c:
        return False
    db.delete(c)
    db.commit()
    return True
