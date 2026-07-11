"""Visit tracking routes — public POST endpoint + admin GET."""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.services import visit_service

router = APIRouter(prefix="/visits", tags=["Visits"])


def _client_ip(request: Request) -> str:
    """Extract real client IP, even when behind a proxy/load balancer."""
    # Prefer X-Forwarded-For (set by nginx, Cloudflare, etc.)
    xff = request.headers.get("X-Forwarded-For", "")
    if xff:
        # First IP in the chain is the original client
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/", status_code=status.HTTP_201_CREATED)
def track_visit(request: Request, db: Session = Depends(get_db)):
    """Public: frontend calls this once per page view to log analytics."""
    ip = _client_ip(request)
    path = request.headers.get("referer", "") or request.headers.get("X-Page-Path", "")
    user_agent = request.headers.get("user-agent", "")
    session_id = request.headers.get("X-Session-Id", "")
    return visit_service.record_visit(
        db,
        ip_address=ip,
        path=path,
        user_agent=user_agent,
        referrer="",
        session_id=session_id,
        geoip=True,
    )


@router.get("/", dependencies=[Depends(require_admin)])
def list_recent_visits(limit: int = 100, db: Session = Depends(get_db)):
    """Admin: recent visits for the dashboard table."""
    from app.models.visit import Visit
    from sqlalchemy import desc
    rows = db.query(Visit).order_by(desc(Visit.created_at)).limit(limit).all()
    return [
        {
            "id": v.id,
            "ip_address": v.ip_address,
            "country": v.country,
            "country_code": v.country_code,
            "city": v.city,
            "path": v.path,
            "timestamp": v.created_at.isoformat() if v.created_at else "",
        }
        for v in rows
    ]


@router.get("/by-country", dependencies=[Depends(require_admin)])
def visits_by_country(limit: int = 20, db: Session = Depends(get_db)):
    """Admin: visits grouped by country (top N)."""
    return visit_service.visits_by_country(db, limit=limit)
