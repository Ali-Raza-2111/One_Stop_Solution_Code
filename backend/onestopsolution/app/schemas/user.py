from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name:  str
    email: str


class UserResponse(BaseModel):
    id:        int
    name:      str
    email:     str
    is_active: bool

    model_config = {"from_attributes": True}
