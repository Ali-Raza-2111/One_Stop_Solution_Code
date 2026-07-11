"""ContactPlatform model — admin-managed list of contact channels.

Comes from the requirements doc:
    "I will be able to add more options of other platforms
     including their Profile Links."

So an admin can add platforms like LinkedIn, Fiverr, Upwork, etc.
along with the company's profile URL on each platform. The public
site then fetches this list to render the Contact section's
"Other Platform" picker.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class ContactPlatform(Base):
    __tablename__ = "contact_platforms"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)         # "LinkedIn"
    icon          = Column(String, default="Linkedin")     # lucide icon name
    profile_url   = Column(String, nullable=False)         # https://linkedin.com/company/...
    display_order = Column(Integer, default=0)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
