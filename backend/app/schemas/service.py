from pydantic import BaseModel
from app.schemas.sub_service import SubServiceResponse
from app.schemas.portfolio_item import PortfolioItemResponse


class ServiceCreate(BaseModel):
    slug: str
    name: str
    accent_color: str = "#6366f1"
    text_color: str = "#ffffff"
    tailwind_color: str = "indigo"
    short_desc: str = ""
    overall_description: str = ""
    icon_name: str = "BookOpen"
    image_asset: str | None = None
    sort_order: int = 0


class ServiceUpdate(BaseModel):
    name: str | None = None
    accent_color: str | None = None
    text_color: str | None = None
    tailwind_color: str | None = None
    short_desc: str | None = None
    overall_description: str | None = None
    icon_name: str | None = None
    image_asset: str | None = None
    sort_order: int | None = None


class ServiceResponse(BaseModel):
    id: int
    slug: str
    name: str
    accent_color: str
    text_color: str
    tailwind_color: str
    short_desc: str
    overall_description: str
    icon_name: str
    image_asset: str | None = None
    sort_order: int
    sub_services: list[SubServiceResponse] = []
    portfolio: list[PortfolioItemResponse] = []

    model_config = {"from_attributes": True}
