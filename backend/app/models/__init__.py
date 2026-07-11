"""SQLAlchemy ORM models for One Stop Solution backend."""
from app.models.user import User
from app.models.admin_user import AdminUser
from app.models.service import Service, SubService, PortfolioItem
from app.models.enquiry import Enquiry
from app.models.consultation import Consultation
from app.models.rating import Rating
from app.models.resource import ResourceItem
from app.models.team_member import TeamMember
from app.models.site_stats import SiteStats
# Previously missing — caused tables to not auto-create
from app.models.faq import FAQ
from app.models.visit import Visit
from app.models.contact_platform import ContactPlatform
from app.models.certification import Certification
# New — WhatsApp + conversation state
from app.models.whatsapp_message import WhatsAppMessage, ConversationSession

__all__ = [
    "User",
    "AdminUser",
    "Service",
    "SubService",
    "PortfolioItem",
    "Enquiry",
    "Consultation",
    "Rating",
    "ResourceItem",
    "TeamMember",
    "SiteStats",
    "FAQ",
    "Visit",
    "ContactPlatform",
    "Certification",
    "WhatsAppMessage",
    "ConversationSession",
]
