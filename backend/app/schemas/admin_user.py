"""Pydantic schemas for AdminUser management.

Note: AdminUser is the auth-user model (login + JWT). The /users/ routes
continue to manage the separate, public `User` model (newsletter-style).
"""
from pydantic import BaseModel, Field, ConfigDict


class AdminUserCreate(BaseModel):
    username:     str = Field(..., min_length=3, max_length=64)
    password:     str = Field(..., min_length=6, max_length=128)
    display_name: str | None = Field(default=None, max_length=120)
    is_active:    bool = True


class AdminUserUpdate(BaseModel):
    """All fields optional. Password, if provided, is hashed before storage."""
    password:     str | None = Field(default=None, min_length=6, max_length=128)
    display_name: str | None = Field(default=None, max_length=120)
    is_active:    bool | None = None


class AdminUserResponse(BaseModel):
    id:           int
    username:     str
    display_name: str | None
    is_active:    bool
    created_at:   str
    last_login_at: str | None

    model_config = ConfigDict(from_attributes=True)
