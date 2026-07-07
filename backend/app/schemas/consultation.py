from pydantic import BaseModel


class ConsultationCreate(BaseModel):
    name: str
    email: str
    country: str = ""
    selected_date_time: str
    timezone: str = ""
    # NOTE: pkt_time is computed server-side and stored on the row.
    # We accept (and ignore) a client-supplied pkt_time for backwards
    # compatibility with the legacy frontend that used to send one.
    pkt_time: str = ""


class ConsultationUpdate(BaseModel):
    is_answered: bool | None = None
    name: str | None = None
    email: str | None = None
    country: str | None = None
    selected_date_time: str | None = None
    timezone: str | None = None
    pkt_time: str | None = None


class ConsultationResponse(BaseModel):
    id: int
    name: str
    email: str
    country: str
    selected_date_time: str
    timezone: str
    pkt_time: str
    is_answered: bool
    timestamp: str

    model_config = {"from_attributes": True}
