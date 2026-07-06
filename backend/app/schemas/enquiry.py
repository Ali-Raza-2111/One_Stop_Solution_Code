from pydantic import BaseModel


class EnquiryCreate(BaseModel):
    name: str
    contact_method: str = "email"
    contact_info: str
    subject: str = ""
    message: str = ""
    selected_service: str = ""
    timezone: str = ""


class EnquiryUpdate(BaseModel):
    is_answered: bool | None = None
    subject: str | None = None
    message: str | None = None
    selected_service: str | None = None
    contact_info: str | None = None
    contact_method: str | None = None
    name: str | None = None
    timezone: str | None = None


class EnquiryResponse(BaseModel):
    id: int
    name: str
    contact_method: str
    contact_info: str
    subject: str
    message: str
    selected_service: str
    timezone: str
    is_answered: bool
    timestamp: str   # ISO from created_at

    model_config = {"from_attributes": True}
