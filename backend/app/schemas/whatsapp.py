"""Pydantic schemas for WhatsApp webhook + message log."""
from pydantic import BaseModel, Field


class WhatsAppWebhookVerification(BaseModel):
    """Query params for Twilio/Meta-style webhook GET verification."""
    hub_mode: str = Field(default="", alias="hub.mode")
    hub_challenge: str = Field(default="", alias="hub.challenge")
    hub_verify_token: str = Field(default="", alias="hub.verify_token")


class WhatsAppMessageLog(BaseModel):
    """One WhatsApp message log entry (admin view)."""
    id: int
    from_number: str
    to_number: str = ""
    direction: str   # 'inbound' or 'outbound'
    body: str = ""
    intent: str = ""
    replied: bool = False
    profile_name: str = ""
    twilio_sid: str = ""
    created_at: str = ""

    model_config = {"from_attributes": True}


class WhatsAppConversationList(BaseModel):
    """List of recent WhatsApp conversations (one per phone number)."""
    phone_number: str
    profile_name: str = ""
    last_message: str = ""
    last_intent: str = ""
    last_direction: str = ""
    last_timestamp: str = ""
    inbound_count: int = 0
    outbound_count: int = 0


class WhatsAppSendRequest(BaseModel):
    """Admin-initiated outbound WhatsApp message."""
    to_number: str = Field(..., description="E.164 phone number, e.g. '+923001234567'")
    body: str = Field(..., min_length=1, max_length=1500)


class WhatsAppSendResponse(BaseModel):
    sent: bool
    message: str = ""
    twilio_sid: str = ""
