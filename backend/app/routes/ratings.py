"""Ratings routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.admin_auth import require_admin, get_optional_admin
from app.models.admin_user import AdminUser
from app.schemas.rating import RatingCreate, RatingUpdate, RatingResponse
from app.schemas.reorder import ReorderRequest
from app.services import rating_service
from app.models.rating import Rating

router = APIRouter(prefix="/ratings", tags=["Ratings"])


# IMPORTANT: /reorder is registered BEFORE /{rating_id} so that the literal
# path "/reorder" is not captured by the {rating_id} path-parameter route.
@router.put("/reorder", dependencies=[Depends(require_admin)])
def reorder_ratings(body: ReorderRequest, db: Session = Depends(get_db)):
    """Batch-update sort_order for many ratings at once."""
    for it in body.items:
        r = db.query(Rating).filter(Rating.id == it.id).first()
        if r:
            r.sort_order = it.sort_order
    db.commit()
    return {"ok": True, "count": len(body.items)}


@router.get("/", response_model=list[RatingResponse])
def list_ratings(
    approved: bool | None = Query(default=True, description=(
        "true (default, public): only approved ratings. "
        "false (admin only): only unapproved. "
        "Omit / None (admin only): all ratings."
    )),
    db: Session = Depends(get_db),
    current_admin: AdminUser | None = Depends(get_optional_admin),
):
    """List ratings.

    Public access (no Authorization header):
      - GET /ratings/                → approved only (default)
      - GET /ratings/?approved=true  → approved only

    Admin access (valid bearer token required):
      - GET /ratings/?approved=false → only unapproved (moderation queue)
      - GET /ratings/?approved=all   → not supported; omit `approved` to get None
                                       (None branch returns all ratings).

    When `approved` is False or None and no valid admin token is supplied,
    we return 401 (instead of silently exposing unapproved ratings).
    """
    if approved is True:
        # Public path — only approved ratings.
        return rating_service.list_ratings(db, only_approved=True)

    # approved is False or None → admin-only.
    if current_admin is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Admin authentication required")

    if approved is False:
        rows = rating_service.list_ratings(db, only_approved=False)
        return [r for r in rows if not r["is_approved"]]
    # approved is None → return all
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
