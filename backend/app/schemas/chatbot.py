"""Pydantic schemas for the chatbot endpoints."""
from pydantic import BaseModel, Field


class ChatbotMessage(BaseModel):
    """Incoming chat message from the visitor."""
    message: str = Field(..., min_length=1, max_length=2000,
                         description="The visitor's question or message.")
    session_id: str = Field(
        ...,
        description="Browser session identifier (used for conversation context).",
        max_length=200,
    )
    channel: str = Field(
        default="web",
        description="Source channel: 'web' (default) or 'whatsapp'.",
        max_length=20,
    )


class ChatbotReply(BaseModel):
    """Structured chatbot response."""
    reply: str
    intent: str
    source_faq_id: int | None = None
    suggestions: list[str] = []
    session_id: str | None = None


class ChatHistoryItem(BaseModel):
    """One message in the chat history."""
    direction: str   # 'inbound' or 'outbound'
    body: str
    intent: str = ""
    timestamp: str = ""


class ChatHistoryResponse(BaseModel):
    """Conversation history for a given session/number."""
    session_id: str
    messages: list[ChatHistoryItem] = []
    count: int = 0


class ChatResetResponse(BaseModel):
    """Result of resetting a conversation session."""
    session_id: str
    reset: bool
    message: str = ""
