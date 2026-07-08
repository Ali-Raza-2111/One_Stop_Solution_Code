from sqlalchemy import (
    Column, Integer, String, Boolean,
    Float, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from app.config.db import Base


class Service(Base):
    __tablename__ = "serviceDetail"

    id             = Column(Integer, primary_key=True, index=True)
    firstWord      = Column(String,  nullable=False)
    featureName    = Column(String,  nullable=False)
    added_by       = Column(Integer, ForeignKey("admin_users.id"),        nullable=False)
    team_member_id = Column(Integer, ForeignKey("team_members.id"),  nullable=True)

    # Relationships
    admin       = relationship("admin_users",       back_populates="services")
    team_member = relationship("team_members",  back_populates="services")
    reviews     = relationship("reviews",      back_populates="service")