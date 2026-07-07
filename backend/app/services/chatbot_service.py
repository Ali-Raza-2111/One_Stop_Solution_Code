"""Lightweight rule-based chatbot service.

This is intentionally simple — no LLM, no external API. It does keyword
matching against:
  1. The active FAQ rows in the DB (admin-curated)
  2. A small built-in intent map (greetings, services, pricing, contact, hours)
  3. The list of services (so asking "do you do X?" hits a real service)

The bot returns a structured reply:
  {
    "reply": "string",
    "intent": "faq|greeting|services|pricing|contact|hours|fallback",
    "source_faq_id": int | null,
    "suggestions": ["How much does bookkeeping cost?", ...]   # 0..3 quick replies
  }

The frontend can use `suggestions` to render quick-reply chips.
"""
from __future__ import annotations

import re
from typing import Iterable

from sqlalchemy.orm import Session

from app.models.faq import FAQ
from app.models.service import Service


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


def _service_match(db: Session, query_tokens: list[str]) -> str | None:
    """If the user is asking about a service by name, return a short blurb."""
    if not query_tokens:
        return None
    services = db.query(Service).all()
    for s in services:
        name_tokens = _tokenize(s.name)
        # Match if at least one non-trivial token of the service name appears
        # in the query (e.g. "bookkeeping", "tax", "vba").
        overlap = _score_match(query_tokens, name_tokens)
        if overlap > 0:
            return (
                f"Yes, we offer **{s.name}**. {s.short_desc} "
                f"You can see live portfolio samples and order from the "
                f"Services section, or book a free consultation to discuss scope."
            )
    return None


# ─── Public API ──────────────────────────────────────────────────────────────
def generate_reply(db: Session, user_message: str) -> dict:
    """Generate a chatbot reply for the given user message."""
    if not user_message or not user_message.strip():
        return {
            "reply": "Please type a question and I'll do my best to help.",
            "intent": "empty",
            "source_faq_id": None,
            "suggestions": _DEFAULT_SUGGESTIONS,
        }

    tokens = _tokenize(user_message)

    # 1. Try FAQ match first (admin-curated knowledge base)
    faq, faq_score = _best_faq(db, tokens)
    # FAQ is authoritative if it has a strong match (≥3 weighted score)
    if faq and faq_score >= 3:
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
                return {
                    "reply": reply,
                    "intent": intent_name,
                    "source_faq_id": None,
                    "suggestions": suggestions,
                }

    # 3. Try matching against service names ("do you do X?")
    service_reply = _service_match(db, tokens)
    if service_reply:
        return {
            "reply": service_reply,
            "intent": "services",
            "source_faq_id": None,
            "suggestions": ["How much does it cost?", "Book a consultation"],
        }

    # 4. Weak FAQ match (score 1-2) — still useful, return it
    if faq and faq_score >= 1:
        return {
            "reply": faq.answer,
            "intent": "faq_weak",
            "source_faq_id": faq.id,
            "suggestions": _DEFAULT_SUGGESTIONS,
        }

    # 5. Fallback
    return {
        "reply": _FALLBACK,
        "intent": "fallback",
        "source_faq_id": None,
        "suggestions": _DEFAULT_SUGGESTIONS,
    }


def get_default_suggestions() -> list[str]:
    """Return the default quick-reply suggestions (for the initial bot state)."""
    return list(_DEFAULT_SUGGESTIONS)
