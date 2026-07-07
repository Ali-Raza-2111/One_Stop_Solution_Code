"""Service layer for all entities. Each service file is a thin CRUD wrapper."""
from app.services import user_service
from app.services import auth_service
from app.services import service_service
from app.services import enquiry_service
from app.services import consultation_service
from app.services import rating_service
from app.services import resource_service
from app.services import team_member_service
from app.services import site_stats_service

__all__ = [
    "user_service",
    "auth_service",
    "service_service",
    "enquiry_service",
    "consultation_service",
    "rating_service",
    "resource_service",
    "team_member_service",
    "site_stats_service",
]
