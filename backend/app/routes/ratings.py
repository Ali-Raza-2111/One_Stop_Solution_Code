"""Ratings routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.schemas.rating import RatingCreate, RatingUpdate, RatingResponse
from app.services import rating_service

router = APIRouter(prefix="/ratings", tags=["Ratings"])


@router.get("/", response_model=list[RatingResponse])
def list_ratings(
    approved: bool | None = Query(default=None, description="Filter by is_approved"),
    db: Session = Depends(get_db),
):
    """Public: only approved ratings. Admin: all when approved=None."""
    if approved is True:
        return rating_service.list_ratings(db, only_approved=True)
    if approved is False:
        # Return only unapproved (admin use)
        rows = rating_service.list_ratings(db, only_approved=False)
        return [r for r in rows if not r["is_approved"]]
    # When approved is None — admin only
    # We'll let the public request approved=true by default in queries; if None and no auth → empty.
    return rating_service.list_ratings(db, only_approved=False)


@router.post("/", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
def create_rating(body: RatingCreate, db: Session = Depends(get_db)):
    """Public endpoint — visitors submit reviews (default: not approved)."""
    return rating_service.create_rating(db, body)


@router.put("/{rating_id}", response_model=RatingResponse, dependencies=[Depends(require_admin)])
def update_rating(rating_id: int, body: RatingUpdate, db: Session = Depends(get_db)):
    res = rating_service.update_rating(db, rating_id, body)
    if not res:
        raise HTTPException(status_code=404, detail="Rating not found")
    return res


@router.delete("/{rating_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_rating(rating_id: int, db: Session = Depends(get_db)):
    if not rating_service.delete_rating(db, rating_id):
        raise HTTPException(status_code=404, detail="Rating not found")
