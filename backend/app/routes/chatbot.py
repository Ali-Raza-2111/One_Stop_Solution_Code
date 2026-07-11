"""Chatbot routes.

Endpoints:
  GET  /chatbot/suggestions          — default quick-reply chips
  POST /chatbot/                     — send a message, get a structured reply
  GET  /chatbot/history/{session_id} — recent conversation (WhatsApp)
  POST /chatbot/reset/{session_id}   — clear conversation context
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.chatbot import (
    ChatbotMessage, ChatbotReply,
    ChatHistoryResponse, ChatHistoryItem, ChatResetResponse,
)
from app.services import chatbot_service

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.get("/suggestions")
def get_suggestions() -> dict:
    """Public: return the default quick-reply suggestions for the chat widget."""
    return {"suggestions": chatbot_service.get_default_suggestions()}


@router.post("/", response_model=ChatbotReply, status_code=status.HTTP_200_OK)
def send_message(body: ChatbotMessage, db: Session = Depends(get_db)):
    """Public: generate a chatbot reply for the visitor's message.

    The `session_id` is used to load + persist conversation context so the
    bot can resolve follow-up questions (e.g. "how much?" after asking
    about a service).
    """
    result = chatbot_service.generate_reply(
        db, body.message, session_key=body.session_id, channel=body.channel,
    )
    result["session_id"] = body.session_id
    return ChatbotReply(**result)


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
def get_history(session_id: str, limit: int = 50, db: Session = Depends(get_db)):
    """Public: return the recent conversation history for a session.

    For WhatsApp sessions (session_id = phone number), this returns
    persisted messages from the WhatsAppMessage table. For web sessions,
    history is kept client-side and this endpoint returns an empty list.
    """
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    limit = max(1, min(limit, 200))  # clamp 1..200
    msgs = chatbot_service.get_session_history(db, session_id, limit=limit)
    return ChatHistoryResponse(
        session_id=session_id,
        messages=[ChatHistoryItem(**m) for m in msgs],
        count=len(msgs),
    )


@router.post("/reset/{session_id}", response_model=ChatResetResponse)
def reset_session(session_id: str, db: Session = Depends(get_db)):
    """Public: clear the conversation context for a session.

    Useful when a user wants to start fresh without their previous
    follow-up context being remembered.
    """
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    reset = chatbot_service.reset_session(db, session_id)
    return ChatResetResponse(
        session_id=session_id,
        reset=reset,
        message="Session reset." if reset else "No active session found.",
    )
