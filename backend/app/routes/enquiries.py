"""Enquiries routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.schemas.enquiry import EnquiryCreate, EnquiryUpdate, EnquiryResponse
from app.services import enquiry_service

router = APIRouter(prefix="/enquiries", tags=["Enquiries"])


@router.get("/", response_model=list[EnquiryResponse], dependencies=[Depends(require_admin)])
def list_enquiries(db: Session = Depends(get_db)):
    return enquiry_service.list_enquiries(db)


@router.post("/", response_model=EnquiryResponse, status_code=status.HTTP_201_CREATED)
def create_enquiry(body: EnquiryCreate, db: Session = Depends(get_db)):
    """Public endpoint — visitors submit enquiries."""
    return enquiry_service.create_enquiry(db, body)


@router.put("/{enquiry_id}", response_model=EnquiryResponse, dependencies=[Depends(require_admin)])
def update_enquiry(enquiry_id: int, body: EnquiryUpdate, db: Session = Depends(get_db)):
    res = enquiry_service.update_enquiry(db, enquiry_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return res


@router.delete("/{enquiry_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_enquiry(enquiry_id: int, db: Session = Depends(get_db)):
    if not enquiry_service.delete_enquiry(db, enquiry_id):
        raise HTTPException(status_code=404, detail="Enquiry not found")
