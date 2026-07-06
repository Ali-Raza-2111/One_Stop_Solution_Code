from pydantic import BaseModel


class TeamMemberCreate(BaseModel):
    name: str
    role: str = ""
    bio: str = ""
    avatar_url: str = ""
    specialties: list[str] = []
    is_online: bool = False
    email: str = ""
    sort_order: int = 0


class TeamMemberUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    specialties: list[str] | None = None
    is_online: bool | None = None
    email: str | None = None
    sort_order: int | None = None


class TeamMemberResponse(BaseModel):
    id: int
    name: str
    role: str
    bio: str
    avatar_url: str
    specialties: list[str]
    is_online: bool
    email: str
    sort_order: int

    model_config = {"from_attributes": True}
