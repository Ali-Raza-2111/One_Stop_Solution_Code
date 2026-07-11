"""FastAPI application factory for One Stop Solution backend."""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.database import create_tables, SessionLocal
from app.routes import (
    health, users, auth, services, enquiries, consultations,
    ratings, resources, team_members, stats, seed,
    admin_users, certifications, contact_platforms, faqs, visits, uploads,
    dashboard,
    chatbot, whatsapp,
)
from app.services import seed_service


# ─── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables on startup
    logger.info("Creating DB tables...")
    create_tables()
    # Ensure uploads directory exists
    if settings.UPLOAD_DIR:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        logger.info(f"Upload dir ready: {settings.UPLOAD_DIR}")
    # Auto-seed if DB is empty (idempotent)
    db = SessionLocal()
    try:
        seed_service.run_seed(db, force=False)
        logger.info("Seed complete.")
    finally:
        db.close()
    yield
    logger.info("Shutting down.")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
        lifespan=lifespan,
    )

    # CORS — allow the frontend dev server
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ─── Static file mount for uploads ────────────────────────────────
    if settings.UPLOAD_DIR and os.path.isdir(settings.UPLOAD_DIR):
        app.mount(
            settings.UPLOAD_PUBLIC_BASE,
            StaticFiles(directory=settings.UPLOAD_DIR),
            name="uploads",
        )
        logger.info(f"Mounted /uploads at {settings.UPLOAD_DIR}")

    # ─── Register routers ─────────────────────────────────────────────
    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(services.router)
    app.include_router(enquiries.router)
    app.include_router(consultations.router)
    app.include_router(ratings.router)
    app.include_router(resources.router)
    app.include_router(team_members.router)
    app.include_router(stats.router)
    app.include_router(seed.router)
    # Previously missing — newly registered
    app.include_router(admin_users.router)
    app.include_router(certifications.router)
    app.include_router(contact_platforms.router)
    app.include_router(faqs.router)
    app.include_router(visits.router)
    app.include_router(uploads.router)
    app.include_router(dashboard.router)
    # Chatbot + WhatsApp Business
    app.include_router(chatbot.router)
    app.include_router(whatsapp.router)

    # ─── Global exception handler ─────────────────────────────────────
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "type": type(exc).__name__,
                "path": str(request.url.path),
            },
        )

    @app.get("/", tags=["Root"])
    def root():
        return {
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "endpoints": [
                "/auth/login", "/auth/me",
                "/users/", "/services/", "/enquiries/", "/consultations/",
                "/ratings/", "/resources/", "/team/", "/stats/",
                "/seed/", "/seed/status",
                "/admin-users/", "/certifications/", "/contact-platforms/",
                "/faqs/", "/visits/", "/uploads/", "/dashboard/",
                "/chatbot/", "/chatbot/suggestions", "/chatbot/history/{session_id}",
                "/whatsapp/webhook",
                "/whatsapp/conversations",
                "/whatsapp/send",
            ],
        }

    return app


app = create_app()
