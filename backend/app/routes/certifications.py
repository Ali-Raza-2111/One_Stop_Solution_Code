"""Certification routes — badges attached to team members."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.schemas.certification import CertificationCreate, CertificationUpdate, CertificationResponse
from app.services import certification_service

router = APIRouter(prefix="/certifications", tags=["Certifications"])


@router.get("/", response_model=list[CertificationResponse])
def list_certifications(team_member_id: int | None = None, db: Session = Depends(get_db)):
    """Public. Optionally filter by ?team_member_id=N."""
    return certification_service.list_certifications(db, team_member_id=team_member_id)


@router.post("/", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def create_certification(body: CertificationCreate, db: Session = Depends(get_db)):
    return certification_service.create_certification(db, body)


@router.put("/{cert_id}", response_model=CertificationResponse,
            dependencies=[Depends(require_admin)])
def update_certification(cert_id: int, body: CertificationUpdate, db: Session = Depends(get_db)):
    res = certification_service.update_certification(db, cert_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="Certification not found")
    return res


@router.delete("/{cert_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_certification(cert_id: int, db: Session = Depends(get_db)):
    if not certification_service.delete_certification(db, cert_id):
        raise HTTPException(status_code=404, detail="Certification not found")
