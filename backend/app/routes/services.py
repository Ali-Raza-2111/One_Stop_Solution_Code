"""Services CRUD routes (also handles nested sub-services & portfolio items)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.schemas.sub_service import SubServiceCreate, SubServiceUpdate, SubServiceResponse
from app.schemas.portfolio_item import PortfolioItemCreate, PortfolioItemUpdate, PortfolioItemResponse
from app.services import service_service

router = APIRouter(prefix="/services", tags=["Services"])


# ---------- Public ----------
@router.get("/", response_model=list[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    return service_service.list_services(db)


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    res = service_service.get_service(db, service_id)
    if not res:
        raise HTTPException(status_code=404, detail="Service not found")
    return res


# ---------- Admin ----------
@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def create_service(body: ServiceCreate, db: Session = Depends(get_db)):
    return service_service.create_service(db, body)


@router.put("/{service_id}", response_model=ServiceResponse,
            dependencies=[Depends(require_admin)])
def update_service(service_id: int, body: ServiceUpdate, db: Session = Depends(get_db)):
    res = service_service.update_service(db, service_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="Service not found")
    return res


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_service(service_id: int, db: Session = Depends(get_db)):
    if not service_service.delete_service(db, service_id):
        raise HTTPException(status_code=404, detail="Service not found")


# ---------- Sub-services ----------
@router.post("/{service_id}/sub-services", response_model=SubServiceResponse,
             status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def add_sub_service(service_id: int, body: SubServiceCreate, db: Session = Depends(get_db)):
    res = service_service.add_sub_service(db, service_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="Service not found")
    return res


@router.put("/sub-services/{sub_id}", response_model=SubServiceResponse,
            dependencies=[Depends(require_admin)])
def update_sub_service(sub_id: int, body: SubServiceUpdate, db: Session = Depends(get_db)):
    res = service_service.update_sub_service(db, sub_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="SubService not found")
    return res


@router.delete("/sub-services/{sub_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_sub_service(sub_id: int, db: Session = Depends(get_db)):
    if not service_service.delete_sub_service(db, sub_id):
        raise HTTPException(status_code=404, detail="SubService not found")


# ---------- Portfolio items ----------
@router.post("/{service_id}/portfolio", response_model=PortfolioItemResponse,
             status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def add_portfolio_item(service_id: int, body: PortfolioItemCreate, db: Session = Depends(get_db)):
    res = service_service.add_portfolio_item(db, service_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="Service not found")
    return res


@router.put("/portfolio/{p_id}", response_model=PortfolioItemResponse,
            dependencies=[Depends(require_admin)])
def update_portfolio_item(p_id: int, body: PortfolioItemUpdate, db: Session = Depends(get_db)):
    res = service_service.update_portfolio_item(db, p_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="PortfolioItem not found")
    return res


@router.delete("/portfolio/{p_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_portfolio_item(p_id: int, db: Session = Depends(get_db)):
    if not service_service.delete_portfolio_item(db, p_id):
        raise HTTPException(status_code=404, detail="PortfolioItem not found")
