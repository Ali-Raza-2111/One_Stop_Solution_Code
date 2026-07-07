"""Rating / Client Review model."""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Rating(Base):
    __tablename__ = "ratings"

    id            = Column(Integer, primary_key=True, index=True)
    service_id    = Column(String, default="", index=True)   # references Service.slug, kept loose to match frontend
    name          = Column(String, nullable=False)
    designation   = Column(String, default="")
    company       = Column(String, default="")
    country       = Column(String, default="")
    avatar_url    = Column(String, default="")
    comment       = Column(Text, default="")
    rating_stars  = Column(Integer, default=5)
    is_approved   = Column(Boolean, default=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())
