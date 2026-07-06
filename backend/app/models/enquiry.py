"""Enquiry model for contact form submissions."""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Enquiry(Base):
    __tablename__ = "enquiries"

    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String, nullable=False)
    contact_method   = Column(String, default="email")   # email | whatsapp | other
    contact_info     = Column(String, nullable=False)
    subject          = Column(String, default="")
    message          = Column(Text, default="")
    selected_service = Column(String, default="")
    timezone         = Column(String, default="")
    is_answered      = Column(Boolean, default=False)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())
