"""Singleton row holding aggregate site counters (clients / orders / countries)."""
from sqlalchemy import Column, Integer, String
from app.db.database import Base


class SiteStats(Base):
    __tablename__ = "site_stats"

    id         = Column(Integer, primary_key=True, default=1)  # singleton
    clients    = Column(Integer, default=140)
    orders     = Column(Integer, default=380)
    countries  = Column(Integer, default=18)
    label      = Column(String, default="Trusted Performance")
