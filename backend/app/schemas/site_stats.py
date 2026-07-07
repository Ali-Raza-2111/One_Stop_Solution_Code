from pydantic import BaseModel


class SiteStatsUpdate(BaseModel):
    clients: int | None = None
    orders: int | None = None
    countries: int | None = None
    label: str | None = None


class SiteStatsResponse(BaseModel):
    clients: int
    orders: int
    countries: int
    label: str

    model_config = {"from_attributes": True}
