"""ContactPlatform schemas."""
from pydantic import BaseModel


class ContactPlatformCreate(BaseModel):
    name:          str
    icon:          str = "Linkedin"
    profile_url:   str
    display_order: int = 0
    is_active:     bool = True


class ContactPlatformUpdate(BaseModel):
    name:          str | None = None
    icon:          str | None = None
    profile_url:   str | None = None
    display_order: int | None = None
    is_active:     bool | None = None


class ContactPlatformResponse(BaseModel):
    id:            int
    name:          str
    icon:          str
    profile_url:   str
    display_order: int
    is_active:     bool

    model_config = {"from_attributes": True}
