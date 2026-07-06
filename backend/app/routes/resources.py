"""Resources routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.schemas.resource import ResourceItemCreate, ResourceItemUpdate, ResourceItemResponse
from app.services import resource_service

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("/", response_model=list[ResourceItemResponse])
def list_resources(db: Session = Depends(get_db)):
    return resource_service.list_resources(db)


@router.post("/{resource_id}/download", response_model=ResourceItemResponse)
def download_resource(resource_id: int, db: Session = Depends(get_db)):
    """Public endpoint — increments download counter, returns resource."""
    res = resource_service.increment_download(db, resource_id)
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    return res


@router.post("/", response_model=ResourceItemResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def create_resource(body: ResourceItemCreate, db: Session = Depends(get_db)):
    return resource_service.create_resource(db, body)


@router.put("/{resource_id}", response_model=ResourceItemResponse,
            dependencies=[Depends(require_admin)])
def update_resource(resource_id: int, body: ResourceItemUpdate, db: Session = Depends(get_db)):
    res = resource_service.update_resource(db, resource_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    return res


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    if not resource_service.delete_resource(db, resource_id):
        raise HTTPException(status_code=404, detail="Resource not found")
