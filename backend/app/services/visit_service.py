"""Visit tracking service.

Logs every public-site page view. Country is filled in via IP→country
geolocation (using the free ipapi.co service, no key required for
~30k requests/month).
"""
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.visit import Visit
from app.config import settings


# ── IP → country cache (in-memory; survives across requests in the same process) ──
_IP_CACHE: dict[str, dict] = {}


def _geoip(ip: str) -> dict:
    """Return {country, country_code, city} for an IP. Cached."""
    if not ip or ip in ("127.0.0.1", "::1", "localhost", "unknown"):
        return {"country": "Local", "country_code": "LO", "city": ""}

    if ip in _IP_CACHE:
        return _IP_CACHE[ip]

    result = {"country": "Unknown", "country_code": "??", "city": ""}
    try:
        # Free tier: 30k req/month, no key needed.
        url = f"https://ipapi.co/{ip}/json/"
        headers = {}
        if settings.IPAPI_TOKEN:
            headers["Authorization"] = f"Bearer {settings.IPAPI_TOKEN}"
        # Synchronous call — runs in worker thread. Fast (<300ms).
        with httpx.Client(timeout=2.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                d = resp.json()
                result = {
                    "country": d.get("country_name", "Unknown"),
                    "country_code": d.get("country_code", "??"),
                    "city": d.get("city", ""),
                }
    except Exception:
        pass  # Geolocation failure should not break the user's request

    _IP_CACHE[ip] = result
    return result


def record_visit(
    db: Session,
    *,
    ip_address: str,
    path: str,
    user_agent: str = "",
    referrer: str = "",
    session_id: str = "",
    geoip: bool = True,
) -> dict:
    """Insert a Visit row. If geoip=True, resolve country from IP."""
    country = {"country": "", "country_code": "", "city": ""}
    if geoip:
        country = _geoip(ip_address)

    v = Visit(
        ip_address=ip_address,
        country=country["country"],
        country_code=country["country_code"],
        city=country["city"],
        path=path,
        user_agent=user_agent,
        referrer=referrer,
        session_id=session_id,
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return {
        "id": v.id,
        "ip_address": v.ip_address,
        "country": v.country,
        "country_code": v.country_code,
        "city": v.city,
        "path": v.path,
        "timestamp": v.created_at.isoformat() if v.created_at else "",
    }


def total_visits(db: Session) -> int:
    return db.query(func.count(Visit.id)).scalar() or 0


def visits_by_country(db: Session, limit: int = 20) -> list[dict]:
    """Return [{country, country_code, visits}] sorted by visits desc."""
    rows = (
        db.query(
            Visit.country,
            Visit.country_code,
            func.count(Visit.id).label("visits"),
        )
        .filter(Visit.country != "Local", Visit.country != "Unknown", Visit.country != "")
        .group_by(Visit.country, Visit.country_code)
        .order_by(desc("visits"))
        .limit(limit)
        .all()
    )
    return [
        {"country": r.country, "country_code": r.country_code, "visits": int(r.visits)}
        for r in rows
    ]
