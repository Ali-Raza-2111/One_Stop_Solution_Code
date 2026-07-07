"""Consultations routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.schemas.consultation import ConsultationCreate, ConsultationUpdate, ConsultationResponse
from app.services import consultation_service
from app.services.tz_service import SlotValidationError

router = APIRouter(prefix="/consultations", tags=["Consultations"])


@router.get("/", response_model=list[ConsultationResponse], dependencies=[Depends(require_admin)])
def list_consultations(db: Session = Depends(get_db)):
    return consultation_service.list_consultations(db)


@router.post("/", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def create_consultation(body: ConsultationCreate, db: Session = Depends(get_db)):
    """Public endpoint — visitors book consultations.

    Validates the slot (past date, double-booking, etc.) and returns 400
    with a friendly message on rejection.
    """
    try:
        return consultation_service.create_consultation(db, body)
    except SlotValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.public_message)


@router.put("/{consultation_id}", response_model=ConsultationResponse, dependencies=[Depends(require_admin)])
def update_consultation(consultation_id: int, body: ConsultationUpdate, db: Session = Depends(get_db)):
    res = consultation_service.update_consultation(db, consultation_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return res


@router.delete("/{consultation_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_consultation(consultation_id: int, db: Session = Depends(get_db)):
    if not consultation_service.delete_consultation(db, consultation_id):
        raise HTTPException(status_code=404, detail="Consultation not found")
