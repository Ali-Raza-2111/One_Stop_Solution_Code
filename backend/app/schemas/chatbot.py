"""Pydantic schemas for the chatbot endpoint."""
from pydantic import BaseModel, Field


class ChatbotMessage(BaseModel):
    """Incoming chat message from the visitor."""
    message: str = Field(..., min_length=1, max_length=1000,
                         description="The visitor's question or message.")
    session_id: str | None = Field(
        default=None,
        description="Optional session identifier for future analytics.",
        max_length=100,
    )


class ChatbotReply(BaseModel):
    """Structured chatbot response."""
    reply: str
    intent: str
    source_faq_id: int | None = None
    suggestions: list[str] = []
