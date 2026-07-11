"""Certification schemas."""
from pydantic import BaseModel


class CertificationCreate(BaseModel):
    team_member_id: int
    name:           str
    short_code:     str = ""
    issuer:         str = ""
    year_obtained:  int | None = None
    sort_order:     int = 0


class CertificationUpdate(BaseModel):
    team_member_id: int | None = None
    name:           str | None = None
    short_code:     str | None = None
    issuer:         str | None = None
    year_obtained:  int | None = None
    sort_order:     int | None = None


class CertificationResponse(BaseModel):
    id:              int
    team_member_id:  int
    name:            str
    short_code:      str
    issuer:          str
    year_obtained:   int | None = None
    sort_order:      int

    model_config = {"from_attributes": True}
