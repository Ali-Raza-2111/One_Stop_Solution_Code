from pydantic import BaseModel


class SubServiceCreate(BaseModel):
    name: str
    accent_color: str = "#6366f1"
    text_color: str = "#ffffff"
    tailwind_color: str = "indigo"
    description: str = ""
    sort_order: int = 0


class SubServiceUpdate(BaseModel):
    name: str | None = None
    accent_color: str | None = None
    text_color: str | None = None
    tailwind_color: str | None = None
    description: str | None = None
    sort_order: int | None = None


class SubServiceResponse(BaseModel):
    id: int
    service_id: int
    name: str
    accent_color: str
    text_color: str
    tailwind_color: str
    description: str
    sort_order: int

    model_config = {"from_attributes": True}
