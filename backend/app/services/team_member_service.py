"""CRUD for TeamMember."""
import json
from sqlalchemy.orm import Session
from app.models.team_member import TeamMember
from app.schemas.team_member import TeamMemberCreate, TeamMemberUpdate


def _serialize_specialties(s: str) -> list[str]:
    try:
        return json.loads(s) if s else []
    except Exception:
        return []


def _to_response(t: TeamMember) -> dict:
    return {
        "id": t.id,
        "name": t.name,
        "role": t.role,
        "bio": t.bio,
        "avatar_url": t.avatar_url,
        "specialties": _serialize_specialties(t.specialties),
        "is_online": t.is_online,
        "email": t.email,
        "sort_order": t.sort_order,
    }


def list_team_members(db: Session) -> list[dict]:
    rows = db.query(TeamMember).order_by(TeamMember.sort_order.asc(), TeamMember.id.asc()).all()
    return [_to_response(t) for t in rows]


def create_team_member(db: Session, data: TeamMemberCreate) -> dict:
    t = TeamMember(
        name=data.name,
        role=data.role,
        bio=data.bio,
        avatar_url=data.avatar_url,
        specialties=json.dumps(data.specialties, ensure_ascii=False),
        is_online=data.is_online,
        email=data.email,
        sort_order=data.sort_order,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return _to_response(t)


def update_team_member(db: Session, team_id: int, data: TeamMemberUpdate) -> dict | None:
    t = db.query(TeamMember).filter(TeamMember.id == team_id).first()
    if not t:
        return None
    for field in ("name", "role", "bio", "avatar_url", "is_online", "email", "sort_order"):
        val = getattr(data, field, None)
        if val is not None:
            setattr(t, field, val)
    if data.specialties is not None:
        t.specialties = json.dumps(data.specialties, ensure_ascii=False)
    db.commit()
    db.refresh(t)
    return _to_response(t)


def delete_team_member(db: Session, team_id: int) -> bool:
    t = db.query(TeamMember).filter(TeamMember.id == team_id).first()
    if not t:
        return False
    db.delete(t)
    db.commit()
    return True
