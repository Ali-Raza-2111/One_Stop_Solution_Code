from pydantic import BaseModel


class PortfolioItemCreate(BaseModel):
    title: str
    description: str = ""
    skills: list[str] = []
    media_type: str = "pdf"
    media_url: str = ""
    media_title: str = ""
    thumbnail_url: str = ""


class PortfolioItemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    skills: list[str] | None = None
    media_type: str | None = None
    media_url: str | None = None
    media_title: str | None = None
    thumbnail_url: str | None = None


class PortfolioItemResponse(BaseModel):
    id: int
    service_id: int
    title: str
    description: str
    skills: list[str]
    media_type: str
    media_url: str
    media_title: str
    thumbnail_url: str

    model_config = {"from_attributes": True}
