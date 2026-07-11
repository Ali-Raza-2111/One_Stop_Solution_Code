"""Rule-based chatbot service with session-aware conversation context.

This is intentionally simple — no LLM, no external API. It does keyword
matching against:
  1. The active FAQ rows in the DB (admin-curated)
  2. A built-in intent map (greetings, services, pricing, contact, hours,
     consultation, payment, refund, team, thanks)
  3. The list of services (so asking "do you do X?" hits a real service)
  4. Conversation context (last_intent + last_topic) — so follow-ups like
     "how much?" after "do you do bookkeeping?" resolve to bookkeeping pricing

The bot returns a structured reply:
  {
    "reply": "string",
    "intent": "faq|greeting|services|pricing|contact|hours|fallback",
    "source_faq_id": int | None,
    "suggestions": ["How much does bookkeeping cost?", ...]   # 0..3 quick replies
  }

The frontend can use `suggestions` to render quick-reply chips.
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Iterable

from sqlalchemy.orm import Session

from app.models.faq import FAQ
from app.models.service import Service
from app.models.whatsapp_message import ConversationSession


# ─── Intent keyword map ──────────────────────────────────────────────────────
# Order matters — first match wins. More specific intents must come first.
_INTENT_RULES: list[tuple[str, list[str], str]] = [
    (
        "greeting",
        ["hi", "hello", "hey", "salam", "salaam", "assalam", "good morning",
         "good evening", "good afternoon", "yo", "hiya"],
        "Hello! Welcome to One Stop Solution. I can help with services, "
        "pricing, booking a consultation, or any general question. "
        "What can I do for you?",
    ),
    (
        "pricing",
        ["price", "pricing", "cost", "rate", "rates", "fee", "fees", "how much",
         "budget", "quote", "charge", "charges", "affordable", "cheap"],
        "Our pricing is project-based and depends on scope, volume, and "
        "complexity. Bookkeeping starts from $199/month, tax preparation "
        "from $149/filing, and VBA/spreadsheet automation is quoted per "
        "project. For an exact quote, please share your requirements via "
        "the Contact section and we'll respond within 24 hours.",
    ),
    (
        "hours",
        ["hour", "hours", "open", "closing", "timing", "timings", "available",
         "weekend", "business hour", "working hour"],
        "Our team is available Monday–Saturday, 9:00 AM to 7:00 PM PKT "
        "(UTC+5). Emergency support is available 24/7 for retainer clients. "
        "You can leave a message anytime via the Contact section and we'll "
        "respond on the next business day.",
    ),
    (
        "contact",
        ["contact", "email", "reach", "phone", "whatsapp", "call", "address",
         "location", "talk to", "speak to", "get in touch"],
        "You can reach us through the Contact section on this page — choose "
        "Email, WhatsApp, or book a live consultation. We typically respond "
        "within a few hours during business hours (9 AM–7 PM PKT).",
    ),
    (
        "consultation",
        ["consultation", "consult", "book", "booking", "schedule", "meeting",
         "appointment", "call back", "callback", "slot"],
        "You can book a free 30-minute consultation directly from the "
        "Contact section. Pick a date and time in your local timezone — "
        "we'll confirm by email and send a PKT-equivalent time so there's "
        "no confusion across timezones.",
    ),
    (
        "payment",
        ["payment", "pay", "paypal", "stripe", "bank transfer", "wire",
         "invoice", "billing", "subscription"],
        "We accept PayPal, Stripe (credit/debit cards), wire transfers, "
        "and Wise. Invoices are sent electronically with net-7 terms for "
        "monthly retainers and 50% advance for one-time projects.",
    ),
    (
        "refund",
        ["refund", "money back", "guarantee", "cancel", "cancellation",
         "policy", "terms"],
        "We offer a 7-day satisfaction guarantee on monthly services — if "
        "you're not happy with the work in the first week, you get a full "
        "refund. One-time projects are non-refundable once work has started, "
        "but we offer free revisions until you're satisfied.",
    ),
    (
        "team",
        ["team", "who are you", "about you", "company", "founder", "staff",
         "people", "expertise", "certified", "certification"],
        "We're a small, fully-remote team of certified accountants and "
        "spreadsheet specialists. Our core certifications include QuickBooks "
        "ProAdvisor, Xero Advisor, CPA, and MOS Excel Expert. Meet the team "
        "in the Team section below.",
    ),
    (
        "thanks",
        ["thanks", "thank you", "thx", "appreciate", "grateful", "shukria",
         "shukriya"],
        "You're welcome! Is there anything else I can help you with?",
    ),
]

# ─── Fallback reply ──────────────────────────────────────────────────────────
_FALLBACK = (
    "I'm not sure I caught that. I can help with: services we offer, "
    "pricing, business hours, booking a consultation, or our team. "
    "Try one of the suggested questions below, or leave a message via "
    "the Contact section and a human will get back to you."
)

# ─── Quick-reply suggestions shown after fallback / greeting ─────────────────
_DEFAULT_SUGGESTIONS = [
    "What services do you offer?",
    "How much does bookkeeping cost?",
    "How do I book a consultation?",
    "What are your business hours?",
]


# ─── Helpers ─────────────────────────────────────────────────────────────────
_STOPWORDS = {
    "the", "a", "an", "is", "are", "do", "does", "did", "can", "could",
    "would", "will", "i", "you", "we", "they", "me", "my", "our", "your",
    "to", "for", "of", "in", "on", "at", "and", "or", "with", "about",
    "what", "how", "when", "where", "why", "who", "which",
    "please", "tell", "give", "show", "want", "need", "have",
}


def _tokenize(text: str) -> list[str]:
    """Lowercase, strip punctuation, split on whitespace, drop stopwords."""
    text = text.lower().strip()
    # Keep alphanumerics and spaces; replace everything else with space
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    tokens = [t for t in text.split() if t and t not in _STOPWORDS]
    return tokens


def _score_match(query_tokens: list[str], keywords: Iterable[str]) -> int:
    """Return how many unique query tokens appear in the keyword set."""
    kw = {k.lower() for k in keywords}
    return sum(1 for t in query_tokens if t in kw)


def _best_faq(db: Session, query_tokens: list[str]) -> tuple[FAQ | None, int]:
    """Find the FAQ whose question + answer best matches the query tokens."""
    if not query_tokens:
        return None, 0
    faqs = db.query(FAQ).filter(FAQ.is_active == True).all()
    best: FAQ | None = None
    best_score = 0
    for f in faqs:
        # Tokenize the question (heavier weight) and the answer (lighter)
        q_tokens = _tokenize(f.question)
        a_tokens = _tokenize(f.answer)
        score = _score_match(query_tokens, q_tokens) * 2 + _score_match(query_tokens, a_tokens)
        if score > best_score:
            best_score = score
            best = f
    return best, best_score


def _service_match(db: Session, query_tokens: list[str]) -> tuple[str | None, str | None]:
    """If the user is asking about a service by name, return (blurb, service_name)."""
    if not query_tokens:
        return None, None
    services = db.query(Service).all()
    for s in services:
        name_tokens = _tokenize(s.name)
        # Match if at least one non-trivial token of the service name appears
        # in the query (e.g. "bookkeeping", "tax", "vba").
        overlap = _score_match(query_tokens, name_tokens)
        if overlap > 0:
            blurb = (
                f"Yes, we offer **{s.name}**. {s.short_desc} "
                f"You can see live portfolio samples and order from the "
                f"Services section, or book a free consultation to discuss scope."
            )
            return blurb, s.name
    return None, None


# ─── Session helpers ─────────────────────────────────────────────────────────
def _get_or_create_session(
    db: Session, session_key: str, channel: str = "web"
) -> ConversationSession:
    """Fetch the ConversationSession row for the given key, or create one."""
    sess = db.query(ConversationSession).filter(
        ConversationSession.session_key == session_key
    ).first()
    if sess is None:
        sess = ConversationSession(
            session_key=session_key,
            channel=channel,
        )
        db.add(sess)
        db.commit()
        db.refresh(sess)
    return sess


def _update_session(
    db: Session, sess: ConversationSession, intent: str, topic: str = ""
) -> None:
    """Persist the latest intent + topic so the next message can use them."""
    sess.last_intent = intent
    if topic:
        sess.last_topic = topic
    sess.message_count = (sess.message_count or 0) + 1
    sess.last_active_at = datetime.now(timezone.utc)
    db.commit()


def _resolve_followup(
    db: Session, sess: ConversationSession, user_message: str, tokens: list[str]
) -> dict | None:
    """If the user is asking a follow-up (e.g. 'how much?' after a service
    question), resolve it using the conversation context.

    Returns a reply dict if resolved, None otherwise.
    """
    msg_lower = user_message.lower().strip()
    # Pricing follow-up: "how much", "cost", "price" with no service name
    pricing_cues = ["how much", "cost", "price", "pricing", "rate", "fee", "charges"]
    is_pricing_followup = any(cue in msg_lower for cue in pricing_cues)

    # Short/ambiguous messages that look like follow-ups
    is_short_ambiguous = len(tokens) <= 2

    if sess.last_topic and (is_pricing_followup or is_short_ambiguous):
        # If the user asked about a service before, give them pricing for it
        if sess.last_intent == "services" and sess.last_topic:
            services = db.query(Service).all()
            for s in services:
                if s.name.lower() == sess.last_topic.lower():
                    reply = (
                        f"For **{s.name}**, pricing depends on scope. "
                        f"Bookkeeping starts from $199/month, tax prep from $149/filing. "
                        f"For an exact quote on {s.name}, share your requirements via "
                        f"the Contact section and we'll respond within 24 hours."
                    )
                    return {
                        "reply": reply,
                        "intent": "pricing_followup",
                        "source_faq_id": None,
                        "suggestions": ["Book a consultation", "What services do you offer?"],
                    }
        # If they previously asked about pricing, suggest booking
        if sess.last_intent == "pricing" and is_short_ambiguous:
            return {
                "reply": (
                    "Would you like to book a free consultation so we can give "
                    "you an exact quote? You can do that from the Contact section, "
                    "or share your specific requirements here and I'll route them "
                    "to the right person."
                ),
                "intent": "consultation",
                "source_faq_id": None,
                "suggestions": ["Book a consultation", "What are your business hours?"],
            }

    return None


# ─── Public API ──────────────────────────────────────────────────────────────
def generate_reply(
    db: Session, user_message: str, session_key: str | None = None,
    channel: str = "web",
) -> dict:
    """Generate a chatbot reply for the given user message.

    If `session_key` is provided (web session ID or WhatsApp number), the
    bot will load + update conversation context for follow-up resolution.
    """
    if not user_message or not user_message.strip():
        return {
            "reply": "Please type a question and I'll do my best to help.",
            "intent": "empty",
            "source_faq_id": None,
            "suggestions": _DEFAULT_SUGGESTIONS,
        }

    # Load or create the conversation session (for context)
    sess: ConversationSession | None = None
    if session_key:
        sess = _get_or_create_session(db, session_key, channel=channel)

    tokens = _tokenize(user_message)

    # 0. Try follow-up resolution using conversation context
    if sess:
        followup = _resolve_followup(db, sess, user_message, tokens)
        if followup:
            _update_session(db, sess, followup["intent"], sess.last_topic or "")
            return followup

    # 1. Try FAQ match first (admin-curated knowledge base)
    faq, faq_score = _best_faq(db, tokens)
    # FAQ is authoritative if it has a strong match (≥3 weighted score)
    if faq and faq_score >= 3:
        if sess:
            _update_session(db, sess, "faq", "")
        return {
            "reply": faq.answer,
            "intent": "faq",
            "source_faq_id": faq.id,
            "suggestions": [],
        }

    # 2. Try built-in intent rules
    best_intent = None
    best_intent_score = 0
    for intent_name, keywords, _ in _INTENT_RULES:
        score = _score_match(tokens, keywords)
        if score > best_intent_score:
            best_intent_score = score
            best_intent = intent_name

    if best_intent and best_intent_score > 0:
        # Find the canned reply for this intent
        for intent_name, _, reply in _INTENT_RULES:
            if intent_name == best_intent:
                suggestions = [] if intent_name in {"thanks"} else _DEFAULT_SUGGESTIONS
                # Special case: services intent → also list service names
                if intent_name == "greeting":
                    suggestions = _DEFAULT_SUGGESTIONS
                if sess:
                    _update_session(db, sess, intent_name, "")
                return {
                    "reply": reply,
                    "intent": intent_name,
                    "source_faq_id": None,
                    "suggestions": suggestions,
                }

    # 3. Try matching against service names ("do you do X?")
    service_reply, service_name = _service_match(db, tokens)
    if service_reply:
        if sess:
            _update_session(db, sess, "services", service_name or "")
        return {
            "reply": service_reply,
            "intent": "services",
            "source_faq_id": None,
            "suggestions": ["How much does it cost?", "Book a consultation"],
        }

    # 4. Weak FAQ match (score 1-2) — still useful, return it
    if faq and faq_score >= 1:
        if sess:
            _update_session(db, sess, "faq_weak", "")
        return {
            "reply": faq.answer,
            "intent": "faq_weak",
            "source_faq_id": faq.id,
            "suggestions": _DEFAULT_SUGGESTIONS,
        }

    # 5. Fallback
    if sess:
        _update_session(db, sess, "fallback", "")
    return {
        "reply": _FALLBACK,
        "intent": "fallback",
        "source_faq_id": None,
        "suggestions": _DEFAULT_SUGGESTIONS,
    }


def get_default_suggestions() -> list[str]:
    """Return the default quick-reply suggestions (for the initial bot state)."""
    return list(_DEFAULT_SUGGESTIONS)


def reset_session(db: Session, session_key: str) -> bool:
    """Reset the conversation session (clear context).

    Returns True if a session was found and reset, False otherwise.
    """
    sess = db.query(ConversationSession).filter(
        ConversationSession.session_key == session_key
    ).first()
    if sess is None:
        return False
    sess.last_intent = ""
    sess.last_topic = ""
    sess.awaiting = ""
    sess.message_count = 0
    sess.last_active_at = datetime.now(timezone.utc)
    db.commit()
    return True


def get_session_history(
    db: Session, session_key: str, limit: int = 50
) -> list[dict]:
    """Return the recent conversation history for a WhatsApp session.

    For web chat, history is stored client-side (frontend localStorage), so
    this is primarily useful for WhatsApp conversations where messages are
    persisted in the WhatsAppMessage table.
    """
    from app.models.whatsapp_message import WhatsAppMessage
    msgs = db.query(WhatsAppMessage).filter(
        WhatsAppMessage.from_number == session_key
    ).order_by(WhatsAppMessage.created_at.desc()).limit(limit).all()
    # Return oldest-first for display
    return [
        {
            "direction": m.direction,
            "body": m.body,
            "intent": m.intent,
            "timestamp": m.created_at.isoformat() if m.created_at else "",
        }
        for m in reversed(msgs)
    ]
