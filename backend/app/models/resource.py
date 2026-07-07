"""Downloadable Resource model."""
from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base


class ResourceItem(Base):
    __tablename__ = "resources"

    id             = Column(Integer, primary_key=True, index=True)
    category       = Column(String, default="")
    title          = Column(String, nullable=False)
    description    = Column(Text, default="")
    file_type      = Column(String, default="")
    file_size      = Column(String, default="")
    download_count = Column(Integer, default=0)
