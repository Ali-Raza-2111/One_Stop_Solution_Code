"""Dashboard aggregation endpoint — returns all analytics in one call."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.schemas.dashboard import DashboardResponse
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardResponse, dependencies=[Depends(require_admin)])
def get_dashboard(db: Session = Depends(get_db)):
    """Admin-only: returns aggregated analytics for the dashboard charts."""
    return dashboard_service.get_dashboard(db)
