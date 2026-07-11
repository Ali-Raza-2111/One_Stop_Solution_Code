"""Certification model — badges shown next to a TeamMember.

Examples:
  - "Certified Public Accountant (CPA)"
  - "QuickBooks ProAdvisor"
  - "Certified Internal Auditor (CIA)"
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Certification(Base):
    __tablename__ = "certifications"

    id             = Column(Integer, primary_key=True, index=True)
    team_member_id = Column(Integer, ForeignKey("team_members.id", ondelete="CASCADE"), nullable=False, index=True)
    name           = Column(String, nullable=False)        # "Certified Public Accountant"
    short_code     = Column(String, default="")            # "CPA"
    issuer         = Column(String, default="")            # "AICPA"
    year_obtained  = Column(Integer, nullable=True)
    sort_order     = Column(Integer, default=0)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    team_member = relationship("TeamMember", backref="certifications")
