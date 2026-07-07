from pydantic import BaseModel


class RatingCreate(BaseModel):
    service_id: str = ""
    name: str
    designation: str = ""
    company: str = ""
    country: str = ""
    avatar_url: str = ""
    comment: str = ""
    rating_stars: int = 5
    is_approved: bool = False


class RatingUpdate(BaseModel):
    service_id: str | None = None
    name: str | None = None
    designation: str | None = None
    company: str | None = None
    country: str | None = None
    avatar_url: str | None = None
    comment: str | None = None
    rating_stars: int | None = None
    is_approved: bool | None = None


class RatingResponse(BaseModel):
    id: int
    service_id: str
    name: str
    designation: str
    company: str
    country: str
    avatar_url: str
    comment: str
    rating_stars: int
    is_approved: bool

    model_config = {"from_attributes": True}
