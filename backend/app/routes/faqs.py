"""FAQ routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.schemas.faq import FAQCreate, FAQUpdate, FAQResponse
from app.schemas.reorder import ReorderRequest
from app.services import faq_service

router = APIRouter(prefix="/faqs", tags=["FAQs"])


# IMPORTANT: /reorder is registered BEFORE /{faq_id} so that the literal
# path "/reorder" is not captured by the {faq_id} path-parameter route.
@router.put("/reorder", dependencies=[Depends(require_admin)])
def reorder_faqs(body: ReorderRequest, db: Session = Depends(get_db)):
    faq_service.reorder_faqs(db, [it.model_dump() for it in body.items])
    return {"ok": True, "count": len(body.items)}


@router.get("/", response_model=list[FAQResponse])
def list_faqs(active_only: bool = False, db: Session = Depends(get_db)):
    """Public: returns active FAQs. Admin: pass active_only=false to see all."""
    return faq_service.list_faqs(db, only_active=active_only)


@router.post("/", response_model=FAQResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def create_faq(body: FAQCreate, db: Session = Depends(get_db)):
    return faq_service.create_faq(db, body)


@router.put("/{faq_id}", response_model=FAQResponse, dependencies=[Depends(require_admin)])
def update_faq(faq_id: int, body: FAQUpdate, db: Session = Depends(get_db)):
    res = faq_service.update_faq(db, faq_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return res


@router.delete("/{faq_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_faq(faq_id: int, db: Session = Depends(get_db)):
    if not faq_service.delete_faq(db, faq_id):
        raise HTTPException(status_code=404, detail="FAQ not found")
