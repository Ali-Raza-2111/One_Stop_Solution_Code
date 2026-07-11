"""CRUD for FAQ."""
from sqlalchemy.orm import Session
from app.models.faq import FAQ
from app.schemas.faq import FAQCreate, FAQUpdate


def _to_response(f: FAQ) -> dict:
    return {
        "id": f.id,
        "question": f.question,
        "answer": f.answer,
        "sort_order": f.sort_order,
        "is_active": f.is_active,
    }


def list_faqs(db: Session, only_active: bool = False) -> list[dict]:
    q = db.query(FAQ)
    if only_active:
        q = q.filter(FAQ.is_active == True)
    rows = q.order_by(FAQ.sort_order.asc(), FAQ.id.asc()).all()
    return [_to_response(f) for f in rows]


def create_faq(db: Session, data: FAQCreate) -> dict:
    f = FAQ(
        question=data.question,
        answer=data.answer,
        sort_order=data.sort_order,
        is_active=data.is_active,
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    return _to_response(f)


def update_faq(db: Session, faq_id: int, data: FAQUpdate) -> dict | None:
    f = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not f:
        return None
    for field in ("question", "answer", "sort_order", "is_active"):
        val = getattr(data, field, None)
        if val is not None:
            setattr(f, field, val)
    db.commit()
    db.refresh(f)
    return _to_response(f)


def delete_faq(db: Session, faq_id: int) -> bool:
    f = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not f:
        return False
    db.delete(f)
    db.commit()
    return True


def reorder_faqs(db: Session, items: list[dict]) -> None:
    """Batch-update sort_order for many FAQs at once."""
    for it in items:
        f = db.query(FAQ).filter(FAQ.id == it["id"]).first()
        if f:
            f.sort_order = it["sort_order"]
    db.commit()
