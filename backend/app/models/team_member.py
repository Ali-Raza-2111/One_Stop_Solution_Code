"""Team member model."""
from sqlalchemy import Column, Integer, String, Text, Boolean
from app.db.database import Base


class TeamMember(Base):
    __tablename__ = "team_members"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    role         = Column(String, default="")
    bio          = Column(Text, default="")
    avatar_url   = Column(String, default="")
    specialties  = Column(Text, default="[]")   # JSON list
    is_online    = Column(Boolean, default=False)
    email        = Column(String, default="")
    sort_order   = Column(Integer, default=0)
