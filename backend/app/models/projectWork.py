from sqlalchemy import (
    Column, Integer, String, Boolean,
    Float, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from app.config.db import Base


class Service(Base):
    __tablename__ = "projectWork"

    id             = Column(Integer, primary_key=True, index=True)
    title      = Column(String,  nullable=False)
    description    = Column(String,  nullable=False)
    img    = Column(String,  nullable=False)
    tag1           = Column(String,  nullable=False)
    tag2           = Column(String,  nullable=True)
    tag3           = Column(String,  nullable=True)  
    added_by       = Column(Integer, ForeignKey("admin_users.id"),        nullable=False)
    team_member_id = Column(Integer, ForeignKey("team_members.id"),  nullable=True)

    # Relationships
    admin       = relationship("admin_users",       back_populates="services")
    team_member = relationship("team_members",  back_populates="services")
    reviews     = relationship("reviews",      back_populates="service")