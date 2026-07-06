"""Service, SubService, and PortfolioItem models."""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Service(Base):
    __tablename__ = "services"

    id                  = Column(Integer, primary_key=True, index=True)
    slug                = Column(String, unique=True, index=True, nullable=False)  # e.g. "bookkeeping"
    name                = Column(String, nullable=False)
    accent_color        = Column(String, default="#6366f1")
    text_color          = Column(String, default="#ffffff")
    tailwind_color      = Column(String, default="indigo")
    short_desc          = Column(String, nullable=False)
    overall_description= Column(Text, default="")
    icon_name           = Column(String, default="BookOpen")
    image_asset         = Column(String, nullable=True)
    sort_order          = Column(Integer, default=0)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), onupdate=func.now())

    sub_services        = relationship("SubService", back_populates="service",
                                        cascade="all, delete-orphan",
                                        order_by="SubService.sort_order")
    portfolio_items     = relationship("PortfolioItem", back_populates="service",
                                        cascade="all, delete-orphan",
                                        order_by="PortfolioItem.id")


class SubService(Base):
    __tablename__ = "sub_services"

    id              = Column(Integer, primary_key=True, index=True)
    service_id      = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    name            = Column(String, nullable=False)
    accent_color    = Column(String, default="#6366f1")
    text_color      = Column(String, default="#ffffff")
    tailwind_color  = Column(String, default="indigo")
    description     = Column(Text, default="")
    sort_order      = Column(Integer, default=0)

    service         = relationship("Service", back_populates="sub_services")


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id             = Column(Integer, primary_key=True, index=True)
    service_id     = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    title          = Column(String, nullable=False)
    description    = Column(Text, default="")
    skills         = Column(Text, default="[]")   # stored as JSON string
    media_type     = Column(String, default="pdf")
    media_url      = Column(String, default="")
    media_title    = Column(String, default="")
    thumbnail_url  = Column(String, default="")

    service        = relationship("Service", back_populates="portfolio_items")
