"""Seed endpoint — populates DB with the existing mock data on first run."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.services import seed_service

router = APIRouter(prefix="/seed", tags=["Seed"])


@router.post("/", status_code=status.HTTP_200_OK, dependencies=[Depends(require_admin)])
def seed_database(force: bool = False, db: Session = Depends(get_db)):
    """Seed DB with default services, ratings, resources, team members & stats.
    Pass ?force=true to wipe & reseed."""
    return seed_service.run_seed(db, force=force)


@router.get("/status")
def seed_status(db: Session = Depends(get_db)):
    return seed_service.get_seed_status(db)
