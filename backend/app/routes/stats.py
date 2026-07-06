"""Site stats routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.schemas.site_stats import SiteStatsUpdate, SiteStatsResponse
from app.services import site_stats_service

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/", response_model=SiteStatsResponse)
def get_stats(db: Session = Depends(get_db)):
    return site_stats_service.get_stats(db)


@router.put("/", response_model=SiteStatsResponse, dependencies=[Depends(require_admin)])
def update_stats(body: SiteStatsUpdate, db: Session = Depends(get_db)):
    return site_stats_service.update_stats(db, body)
