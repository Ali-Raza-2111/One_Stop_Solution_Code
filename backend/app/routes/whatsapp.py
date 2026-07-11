"""WhatsApp Business webhook routes.

Implements the Twilio WhatsApp Business API integration:

  GET  /whatsapp/webhook   — verify webhook ownership (optional token check)
  POST /whatsapp/webhook   — receive inbound messages from Twilio, generate
                             a reply via chatbot_service, persist everything
                             to WhatsAppMessage + ConversationSession tables,
                             and respond back to Twilio with the reply body.

Twilio sends inbound messages as form-encoded fields:
  From=whatsapp:+923001234567
  To=whatsapp:+14155238886
  Body=Hello
  ProfileName=Shahid Ali
  MessageSid=SM...

The webhook responds with a TwiML <Message> containing the bot's reply.
Twilio then delivers that reply back to the user's WhatsApp.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Form, HTTPException, Query, Request, Response, status
from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import get_db
from app.admin_auth import require_admin
from app.models.whatsapp_message import WhatsAppMessage, ConversationSession
from app.schemas.whatsapp import (
    WhatsAppMessageLog, WhatsAppConversationList,
    WhatsAppSendRequest, WhatsAppSendResponse,
)
from app.services import chatbot_service, notification_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])


# ─── Webhook verification (GET) ──────────────────────────────────────────────
@router.get("/webhook")
def verify_webhook(
    hub_mode: str = Query(default=""),
    hub_challenge: str = Query(default=""),
    hub_verify_token: str = Query(default=""),
):
    """Verify webhook ownership for Meta/Twilio.

    If WHATSAPP_WEBHOOK_TOKEN is configured in env, the incoming
    hub.verify_token must match it. If the env var is empty (dev mode),
    verification is skipped and any challenge is echoed back.
    """
    if settings.WHATSAPP_WEBHOOK_TOKEN:
        if hub_verify_token != settings.WHATSAPP_WEBHOOK_TOKEN:
            raise HTTPException(status_code=403, detail="Invalid verify token")
    # Echo the challenge back — required by Meta/Twilio webhook setup
    return Response(content=hub_challenge or "ok", media_type="text/plain")


# ─── Inbound message handler (POST) ─────────────────────────────────────────
@router.post("/webhook")
async def receive_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """Receive an inbound WhatsApp message from Twilio, generate a reply,
    persist it, and respond with TwiML so Twilio delivers the reply.

    Twilio posts form-encoded data; we read it manually because we want
    to be tolerant of optional fields (ProfileName, MediaUrl0, etc.).
    """
    content_type = request.headers.get("content-type", "")
    if "form" in content_type:
        form = await request.form()
        data = {k: str(v) for k, v in form.items()}
    else:
        # Some setups send JSON; fall back to JSON body
        try:
            data = await request.json()
        except Exception:
            data = {}

    # Normalize fields (Twilio sends 'From', 'To', 'Body', 'MessageSid', 'ProfileName')
    from_raw = data.get("From", "")              # "whatsapp:+923001234567"
    to_raw   = data.get("To", "")                # "whatsapp:+14155238886"
    body     = data.get("Body", "").strip()
    sid      = data.get("MessageSid", "")
    profile  = data.get("ProfileName", "") or data.get("ProfileName", "")
    wa_ts    = data.get("Timestamp", "")

    # Extract just the phone number (strip "whatsapp:" prefix)
    from_number = from_raw.replace("whatsapp:", "").strip()
    to_number   = to_raw.replace("whatsapp:", "").strip()

    if not from_number or not body:
        # Nothing to do — could be a status callback we don't care about
        return Response(
            content="<Response></Response>",
            media_type="application/xml",
            status_code=200,
        )

    logger.info(f"WA inbound from {from_number}: {body[:80]}")

    # 1. Persist the inbound message
    inbound = WhatsAppMessage(
        from_number=from_number,
        to_number=to_number,
        direction="inbound",
        body=body,
        twilio_sid=sid,
        profile_name=profile,
        wa_timestamp=wa_ts,
        replied=False,
    )
    db.add(inbound)
    db.commit()
    db.refresh(inbound)

    # 2. Generate reply via chatbot (uses ConversationSession for context)
    #    For WhatsApp, the session_key is the phone number itself.
    try:
        result = chatbot_service.generate_reply(
            db, body, session_key=from_number, channel="whatsapp",
        )
        reply_text = result.get("reply", "")
        intent = result.get("intent", "")
    except Exception as e:
        logger.exception(f"Chatbot reply failed: {e}")
        reply_text = (
            "Thanks for your message! Our team will get back to you shortly. "
            "For urgent matters, please email us via the Contact section."
        )
        intent = "error"

    # 3. Mark inbound as replied + store intent
    inbound.replied = True
    inbound.intent = intent
    db.commit()

    # 4. Persist the outbound reply (also queued for delivery via Twilio)
    outbound = WhatsAppMessage(
        from_number=from_number,   # the client's number (conversation key)
        to_number=from_number,     # we're sending TO the client
        direction="outbound",
        body=reply_text,
        intent=intent,
        replied=True,
    )
    db.add(outbound)
    db.commit()

    # 5. Respond with TwiML so Twilio delivers the reply
    #    Escape XML special characters in the reply text
    safe_reply = (
        reply_text
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{safe_reply}</Message></Response>'
    return Response(content=twiml, media_type="application/xml", status_code=200)


# ─── Admin: list conversations (admin-only) ─────────────────────────────────
@router.get(
    "/conversations",
    response_model=list[WhatsAppConversationList],
    dependencies=[Depends(require_admin)],
)
def list_conversations(limit: int = 50, db: Session = Depends(get_db)):
    """Admin: return recent WhatsApp conversations (grouped by phone number)."""
    # Get the latest message per phone number
    from sqlalchemy import func as sql_func
    subq = (
        db.query(
            WhatsAppMessage.from_number,
            sql_func.max(WhatsAppMessage.id).label("max_id"),
            sql_func.count().label("total"),
        )
        .group_by(WhatsAppMessage.from_number)
        .order_by(sql_func.max(WhatsAppMessage.id).desc())
        .limit(limit)
        .subquery()
    )
    rows = db.query(
        WhatsAppMessage.from_number,
        WhatsAppMessage.body,
        WhatsAppMessage.intent,
        WhatsAppMessage.direction,
        WhatsAppMessage.profile_name,
        WhatsAppMessage.created_at,
        subq.c.total,
    ).join(
        subq, WhatsAppMessage.id == subq.c.max_id
    ).all()

    result = []
    for r in rows:
        # Count inbound vs outbound for this number
        inbound_count = db.query(WhatsAppMessage).filter(
            WhatsAppMessage.from_number == r.from_number,
            WhatsAppMessage.direction == "inbound",
        ).count()
        outbound_count = db.query(WhatsAppMessage).filter(
            WhatsAppMessage.from_number == r.from_number,
            WhatsAppMessage.direction == "outbound",
        ).count()
        result.append(WhatsAppConversationList(
            phone_number=r.from_number,
            profile_name=r.profile_name or "",
            last_message=(r.body or "")[:200],
            last_intent=r.intent or "",
            last_direction=r.direction or "",
            last_timestamp=r.created_at.isoformat() if r.created_at else "",
            inbound_count=inbound_count,
            outbound_count=outbound_count,
        ))
    return result


# ─── Admin: view one conversation (admin-only) ──────────────────────────────
@router.get(
    "/conversations/{phone_number}",
    response_model=list[WhatsAppMessageLog],
    dependencies=[Depends(require_admin)],
)
def get_conversation(phone_number: str, limit: int = 100, db: Session = Depends(get_db)):
    """Admin: return all messages exchanged with a specific WhatsApp number."""
    # Strip "whatsapp:" prefix if present
    phone = phone_number.replace("whatsapp:", "").strip()
    msgs = db.query(WhatsAppMessage).filter(
        WhatsAppMessage.from_number == phone
    ).order_by(WhatsAppMessage.created_at.desc()).limit(limit).all()
    return [
        WhatsAppMessageLog(
            id=m.id,
            from_number=m.from_number,
            to_number=m.to_number,
            direction=m.direction,
            body=m.body,
            intent=m.intent,
            replied=m.replied,
            profile_name=m.profile_name,
            twilio_sid=m.twilio_sid,
            created_at=m.created_at.isoformat() if m.created_at else "",
        )
        for m in reversed(msgs)
    ]


# ─── Admin: send outbound message (admin-only) ──────────────────────────────
@router.post(
    "/send",
    response_model=WhatsAppSendResponse,
    dependencies=[Depends(require_admin)],
)
def admin_send_message(body: WhatsAppSendRequest, db: Session = Depends(get_db)):
    """Admin: send an arbitrary outbound WhatsApp message to a client.

    Useful for human follow-up when the bot can't help.
    """
    to = body.to_number.replace("whatsapp:", "").strip()
    if not to:
        raise HTTPException(status_code=400, detail="to_number is required")

    sent = notification_service.send_whatsapp(to, body.body)
    # Persist regardless of Twilio success — the admin's intent is logged
    outbound = WhatsAppMessage(
        from_number=to,
        to_number=to,
        direction="outbound",
        body=body.body,
        intent="admin_manual",
        replied=True,
    )
    db.add(outbound)
    db.commit()

    return WhatsAppSendResponse(
        sent=sent,
        message="Message sent." if sent else "Logged locally — Twilio delivery failed (check credentials).",
    )
