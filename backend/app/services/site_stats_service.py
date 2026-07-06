"""Singleton stats service."""
from sqlalchemy.orm import Session
from app.models.site_stats import SiteStats
from app.schemas.site_stats import SiteStatsUpdate


def _ensure_singleton(db: Session) -> SiteStats:
    row = db.query(SiteStats).filter(SiteStats.id == 1).first()
    if not row:
        row = SiteStats(id=1, clients=140, orders=380, countries=18, label="Trusted Performance")
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def get_stats(db: Session) -> dict:
    row = _ensure_singleton(db)
    return {
        "clients": row.clients,
        "orders": row.orders,
        "countries": row.countries,
        "label": row.label,
    }


def update_stats(db: Session, data: SiteStatsUpdate) -> dict:
    row = _ensure_singleton(db)
    if data.clients is not None: row.clients = data.clients
    if data.orders is not None: row.orders = data.orders
    if data.countries is not None: row.countries = data.countries
    if data.label is not None: row.label = data.label
    db.commit()
    db.refresh(row)
    return {
        "clients": row.clients,
        "orders": row.orders,
        "countries": row.countries,
        "label": row.label,
    }
