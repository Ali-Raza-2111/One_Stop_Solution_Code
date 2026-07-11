"""Pydantic schemas for file upload responses."""
from pydantic import BaseModel


class UploadResponse(BaseModel):
    """Response for a successful upload."""
    url:        str   # public URL (relative or absolute depending on config)
    filename:   str   # stored filename (with subfolder prefix)
    size:       int   # bytes
    content_type: str

    model_config = {"from_attributes": True}
