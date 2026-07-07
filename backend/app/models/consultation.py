"""Consultation model for scheduled consultations."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Consultation(Base):
    __tablename__ = "consultations"

    id                  = Column(Integer, primary_key=True, index=True)
    name                = Column(String, nullable=False)
    email               = Column(String, nullable=False)
    country             = Column(String, default="")
    selected_date_time  = Column(String, nullable=False)
    timezone            = Column(String, default="")
    pkt_time            = Column(String, default="")
    is_answered         = Column(Boolean, default=False)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), onupdate=func.now())
