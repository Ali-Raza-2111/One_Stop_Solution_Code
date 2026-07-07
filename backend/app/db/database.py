from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

# `check_same_thread=False` is required for SQLite + FastAPI's threaded request handling.
engine         = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal   = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def create_tables():
    # Importing all models ensures they are registered with Base.metadata before create_all().
    from app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
