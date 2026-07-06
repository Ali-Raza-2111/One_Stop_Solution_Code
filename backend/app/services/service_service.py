"""CRUD service for Service + nested SubService + PortfolioItem."""
import json
from sqlalchemy.orm import Session, selectinload
from app.models.service import Service, SubService, PortfolioItem
from app.schemas.service import ServiceCreate, ServiceUpdate
from app.schemas.sub_service import SubServiceCreate, SubServiceUpdate
from app.schemas.portfolio_item import PortfolioItemCreate, PortfolioItemUpdate


# ---------- helpers ----------
def _serialize_skills(skills_field: str) -> list[str]:
    try:
        return json.loads(skills_field) if skills_field else []
    except Exception:
        return []


def _to_response(svc: Service):
    """Build a serializable dict matching ServiceResponse shape."""
    return {
        "id": svc.id,
        "slug": svc.slug,
        "name": svc.name,
        "accent_color": svc.accent_color,
        "text_color": svc.text_color,
        "tailwind_color": svc.tailwind_color,
        "short_desc": svc.short_desc,
        "overall_description": svc.overall_description or "",
        "icon_name": svc.icon_name,
        "image_asset": svc.image_asset,
        "sort_order": svc.sort_order,
        "sub_services": [
            {
                "id": ss.id,
                "service_id": ss.service_id,
                "name": ss.name,
                "accent_color": ss.accent_color,
                "text_color": ss.text_color,
                "tailwind_color": ss.tailwind_color,
                "description": ss.description,
                "sort_order": ss.sort_order,
            }
            for ss in svc.sub_services
        ],
        "portfolio": [
            {
                "id": p.id,
                "service_id": p.service_id,
                "title": p.title,
                "description": p.description,
                "skills": _serialize_skills(p.skills),
                "media_type": p.media_type,
                "media_url": p.media_url,
                "media_title": p.media_title,
                "thumbnail_url": p.thumbnail_url,
            }
            for p in svc.portfolio_items
        ],
    }


# ---------- Service CRUD ----------
def list_services(db: Session) -> list[dict]:
    services = (
        db.query(Service)
        .options(selectinload(Service.sub_services), selectinload(Service.portfolio_items))
        .order_by(Service.sort_order, Service.id)
        .all()
    )
    return [_to_response(s) for s in services]


def get_service(db: Session, service_id: int) -> dict | None:
    svc = (
        db.query(Service)
        .options(selectinload(Service.sub_services), selectinload(Service.portfolio_items))
        .filter(Service.id == service_id)
        .first()
    )
    return _to_response(svc) if svc else None


def get_service_by_slug(db: Session, slug: str) -> dict | None:
    svc = (
        db.query(Service)
        .options(selectinload(Service.sub_services), selectinload(Service.portfolio_items))
        .filter(Service.slug == slug)
        .first()
    )
    return _to_response(svc) if svc else None


def create_service(db: Session, data: ServiceCreate) -> dict:
    svc = Service(
        slug=data.slug,
        name=data.name,
        accent_color=data.accent_color,
        text_color=data.text_color,
        tailwind_color=data.tailwind_color,
        short_desc=data.short_desc,
        overall_description=data.overall_description,
        icon_name=data.icon_name,
        image_asset=data.image_asset,
        sort_order=data.sort_order,
    )
    db.add(svc)
    db.commit()
    db.refresh(svc)
    return _to_response(svc)


def update_service(db: Session, service_id: int, data: ServiceUpdate) -> dict | None:
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        return None
    for field in (
        "name", "accent_color", "text_color", "tailwind_color", "short_desc",
        "overall_description", "icon_name", "image_asset", "sort_order",
    ):
        val = getattr(data, field, None)
        if val is not None:
            setattr(svc, field, val)
    db.commit()
    db.refresh(svc)
    return _to_response(svc)


def delete_service(db: Session, service_id: int) -> bool:
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        return False
    db.delete(svc)
    db.commit()
    return True


# ---------- SubService CRUD ----------
def add_sub_service(db: Session, service_id: int, data: SubServiceCreate) -> dict | None:
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        return None
    ss = SubService(
        service_id=service_id,
        name=data.name,
        accent_color=data.accent_color,
        text_color=data.text_color,
        tailwind_color=data.tailwind_color,
        description=data.description,
        sort_order=data.sort_order,
    )
    db.add(ss)
    db.commit()
    db.refresh(ss)
    return {
        "id": ss.id, "service_id": ss.service_id, "name": ss.name,
        "accent_color": ss.accent_color, "text_color": ss.text_color,
        "tailwind_color": ss.tailwind_color, "description": ss.description,
        "sort_order": ss.sort_order,
    }


def update_sub_service(db: Session, sub_id: int, data: SubServiceUpdate) -> dict | None:
    ss = db.query(SubService).filter(SubService.id == sub_id).first()
    if not ss:
        return None
    for field in ("name", "accent_color", "text_color", "tailwind_color", "description", "sort_order"):
        val = getattr(data, field, None)
        if val is not None:
            setattr(ss, field, val)
    db.commit()
    db.refresh(ss)
    return {
        "id": ss.id, "service_id": ss.service_id, "name": ss.name,
        "accent_color": ss.accent_color, "text_color": ss.text_color,
        "tailwind_color": ss.tailwind_color, "description": ss.description,
        "sort_order": ss.sort_order,
    }


def delete_sub_service(db: Session, sub_id: int) -> bool:
    ss = db.query(SubService).filter(SubService.id == sub_id).first()
    if not ss:
        return False
    db.delete(ss)
    db.commit()
    return True


# ---------- PortfolioItem CRUD ----------
def add_portfolio_item(db: Session, service_id: int, data: PortfolioItemCreate) -> dict | None:
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        return None
    p = PortfolioItem(
        service_id=service_id,
        title=data.title,
        description=data.description,
        skills=json.dumps(data.skills, ensure_ascii=False),
        media_type=data.media_type,
        media_url=data.media_url,
        media_title=data.media_title,
        thumbnail_url=data.thumbnail_url,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {
        "id": p.id, "service_id": p.service_id, "title": p.title,
        "description": p.description, "skills": _serialize_skills(p.skills),
        "media_type": p.media_type, "media_url": p.media_url,
        "media_title": p.media_title, "thumbnail_url": p.thumbnail_url,
    }


def update_portfolio_item(db: Session, p_id: int, data: PortfolioItemUpdate) -> dict | None:
    p = db.query(PortfolioItem).filter(PortfolioItem.id == p_id).first()
    if not p:
        return None
    if data.title is not None: p.title = data.title
    if data.description is not None: p.description = data.description
    if data.skills is not None: p.skills = json.dumps(data.skills, ensure_ascii=False)
    if data.media_type is not None: p.media_type = data.media_type
    if data.media_url is not None: p.media_url = data.media_url
    if data.media_title is not None: p.media_title = data.media_title
    if data.thumbnail_url is not None: p.thumbnail_url = data.thumbnail_url
    db.commit()
    db.refresh(p)
    return {
        "id": p.id, "service_id": p.service_id, "title": p.title,
        "description": p.description, "skills": _serialize_skills(p.skills),
        "media_type": p.media_type, "media_url": p.media_url,
        "media_title": p.media_title, "thumbnail_url": p.thumbnail_url,
    }


def delete_portfolio_item(db: Session, p_id: int) -> bool:
    p = db.query(PortfolioItem).filter(PortfolioItem.id == p_id).first()
    if not p:
        return False
    db.delete(p)
    db.commit()
    return True
