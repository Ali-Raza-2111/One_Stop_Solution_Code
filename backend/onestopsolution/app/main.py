from fastapi import FastAPI
from app.config import settings
from app.db.database import create_tables
from app.routes import health, users


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
    )

    # Create DB tables on startup
    create_tables()

    # Register routers
    app.include_router(health.router)
    app.include_router(users.router)

    return app


app = create_app()
