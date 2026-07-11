"""Visit model — records every public-site hit for analytics.

Each row = one page view. The `country` field is filled in by the
visit-tracking middleware using IP→country geolocation (ipapi.co,
free, no key required).
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base


class Visit(Base):
    __tablename__ = "visits"

    id            = Column(Integer, primary_key=True, index=True)
    ip_address    = Column(String, default="", index=True)
    country       = Column(String, default="", index=True)         # "United States"
    country_code  = Column(String, default="", index=True)         # "US"
    city          = Column(String, default="")
    path          = Column(String, default="", index=True)         # URL path visited
    user_agent    = Column(String, default="")
    referrer      = Column(String, default="")
    session_id    = Column(String, default="", index=True)         # browser fingerprint (cookie)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), index=True)
