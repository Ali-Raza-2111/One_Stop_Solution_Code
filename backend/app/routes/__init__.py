"""API routes registry."""
from app.routes import (
    health, users, auth, services, enquiries, consultations,
    ratings, resources, team_members, stats, seed,
    # Previously missing — were never registered
    admin_users, certifications, contact_platforms, faqs, visits, uploads,
    dashboard,
    # Chatbot + WhatsApp Business
    chatbot, whatsapp,
)

__all__ = [
    "health", "users", "auth", "services", "enquiries", "consultations",
    "ratings", "resources", "team_members", "stats", "seed",
    "admin_users", "certifications", "contact_platforms", "faqs", "visits", "uploads",
    "dashboard",
    "chatbot", "whatsapp",
]
