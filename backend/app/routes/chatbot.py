"""Chatbot routes.

A single public POST endpoint that accepts a visitor message and returns
a structured reply. The reply engine is rule-based (no LLM) — see
app.services.chatbot_service for details.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.chatbot import ChatbotMessage, ChatbotReply
from app.services import chatbot_service

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.get("/suggestions")
def get_suggestions() -> dict:
    """Public: return the default quick-reply suggestions for the chat widget."""
    return {"suggestions": chatbot_service.get_default_suggestions()}


@router.post("/", response_model=ChatbotReply, status_code=status.HTTP_200_OK)
def send_message(body: ChatbotMessage, db: Session = Depends(get_db)):
    """Public: generate a chatbot reply for the visitor's message."""
    result = chatbot_service.generate_reply(db, body.message)
    return ChatbotReply(**result)
