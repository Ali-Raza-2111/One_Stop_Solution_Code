"""FAQ schemas."""
from pydantic import BaseModel


class FAQCreate(BaseModel):
    question:   str
    answer:     str
    sort_order: int = 0
    is_active:  bool = True


class FAQUpdate(BaseModel):
    question:   str | None = None
    answer:     str | None = None
    sort_order: int | None = None
    is_active:  bool | None = None


class FAQResponse(BaseModel):
    id:         int
    question:   str
    answer:     str
    sort_order: int
    is_active:  bool

    model_config = {"from_attributes": True}
