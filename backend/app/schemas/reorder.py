"""Reorder payload — generic batch reorder for any list entity."""
from pydantic import BaseModel


class ReorderItem(BaseModel):
    id:         int
    sort_order: int


class ReorderRequest(BaseModel):
    """Body for PUT /<entity>/reorder endpoints."""
    items: list[ReorderItem]
