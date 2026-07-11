"""WhatsApp message log model.

Each row = one inbound or outbound WhatsApp message exchanged via the
Twilio WhatsApp Business API. Persisted so:
  1. Admins can review conversations in the dashboard
  2. The chatbot can use conversation context (last N messages)
     when generating the next reply
  3. We can audit / debug the WhatsApp integration later

Two message directions:
  - inbound  : from a client's WhatsApp number → our bot
  - outbound : from our bot → the client's WhatsApp number
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.db.database import Base


class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"

    id             = Column(Integer, primary_key=True, index=True)
    # The client's phone number in E.164 format (e.g. "+923001234567").
    # Indexed for fast "load recent conversation with this client" queries.
    from_number    = Column(String, nullable=False, index=True)
    # Our Twilio WhatsApp number (always the same in production, but kept
    # per-message for multi-number support later).
    to_number      = Column(String, nullable=False, default="")
    # 'inbound' = client→bot, 'outbound' = bot→client
    direction      = Column(String, nullable=False, default="inbound", index=True)
    # The actual message body (text only — media support can come later)
    body           = Column(Text, default="")
    # Twilio's Message SID (for status tracking / debugging)
    twilio_sid     = Column(String, default="", index=True)
    # The intent the bot classified for this message (greeting/pricing/faq/etc.)
    # Only meaningful for inbound messages; outbound messages leave this null.
    intent         = Column(String, default="")
    # Was this inbound message successfully replied to?
    replied        = Column(Boolean, default=False)
    # Optional profile name Twilio sends along with the message
    profile_name   = Column(String, default="")
    # WA timestamp (string Twilio sends, e.g. "2024-12-25T10:30:00Z")
    wa_timestamp   = Column(String, default="")
    created_at     = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class ConversationSession(Base):
    """A logical conversation between a user (identified by session_id for
    web chat OR phone number for WhatsApp) and the bot.

    Stores the last detected intent so the bot can do context-aware
    follow-ups (e.g. if the user said "I want bookkeeping" then "how much?",
    the bot knows "how much" refers to bookkeeping pricing).
    """
    __tablename__ = "conversation_sessions"

    id             = Column(Integer, primary_key=True, index=True)
    # For web chat: a UUID generated client-side.
    # For WhatsApp: the client's phone number in E.164 format.
    session_key    = Column(String, nullable=False, unique=True, index=True)
    # 'web' or 'whatsapp'
    channel        = Column(String, nullable=False, default="web", index=True)
    # Last detected intent — used for context-aware follow-ups
    last_intent    = Column(String, default="")
    # The topic/entity the user last asked about (e.g. "bookkeeping" if
    # they asked about a specific service). Used to disambiguate "how much?"
    last_topic     = Column(String, default="")
    # Whether we're awaiting a clarification (e.g. bot asked "email or
    # whatsapp?" and is waiting for the answer)
    awaiting       = Column(String, default="")
    # Message count in this session
    message_count  = Column(Integer, default=0)
    # Last activity timestamp — for session expiry / cooldown logic
    last_active_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
