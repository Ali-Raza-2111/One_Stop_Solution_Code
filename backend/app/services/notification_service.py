"""Email + WhatsApp notification service.

Sends admin notifications when a new enquiry or consultation is
submitted. Both channels are optional — if SMTP_HOST / TWILIO_*
are empty, the relevant send_* function silently returns False
without raising. This lets the backend run in dev mode without
external services.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.config import settings


# ── Email (SMTP) ───────────────────────────────────────────────
def send_email(to_addr: str, subject: str, html_body: str, text_body: str = "") -> bool:
    """Send an email via SMTP. Returns True on success, False on failure."""
    if not settings.SMTP_HOST or not to_addr:
        return False  # SMTP not configured — skip silently

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to_addr
        msg["Subject"] = subject
        if text_body:
            msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as srv:
            srv.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                srv.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            srv.sendmail(settings.SMTP_FROM, [to_addr], msg.as_string())
        return True
    except Exception:
        # Don't raise — notifications are best-effort
        return False


# ── WhatsApp (Twilio) ──────────────────────────────────────────
def send_whatsapp(to_number: str, message: str) -> bool:
    """Send a WhatsApp Business message via Twilio. Returns True/False."""
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_WHATSAPP_FROM or not to_number:
        return False  # Twilio not configured — skip silently

    try:
        # Lazy import so the dependency is optional
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            from_=f"whatsapp:{settings.TWILIO_WHATSAPP_FROM}",
            to=f"whatsapp:{to_number}",
            body=message,
        )
        return True
    except Exception:
        return False


# ── High-level notifications ───────────────────────────────────
def notify_new_enquiry(enquiry: dict) -> None:
    """Fire all configured notifications when a new enquiry comes in."""
    subject = f"[New Enquiry] {enquiry.get('subject', '(no subject)')}"
    html = f"""
    <h2>New enquiry received</h2>
    <table border="0" cellpadding="6" cellspacing="0">
      <tr><td><b>Name:</b></td><td>{enquiry.get('name', '')}</td></tr>
      <tr><td><b>Contact method:</b></td><td>{enquiry.get('contact_method', '')}</td></tr>
      <tr><td><b>Contact info:</b></td><td>{enquiry.get('contact_info', '')}</td></tr>
      <tr><td><b>Service:</b></td><td>{enquiry.get('selected_service', '')}</td></tr>
      <tr><td><b>Timezone:</b></td><td>{enquiry.get('timezone', '')}</td></tr>
      <tr><td><b>Subject:</b></td><td>{enquiry.get('subject', '')}</td></tr>
      <tr><td><b>Message:</b></td><td>{enquiry.get('message', '')}</td></tr>
    </table>
    """
    text = (
        f"New enquiry\n"
        f"Name: {enquiry.get('name', '')}\n"
        f"Contact method: {enquiry.get('contact_method', '')}\n"
        f"Contact info: {enquiry.get('contact_info', '')}\n"
        f"Service: {enquiry.get('selected_service', '')}\n"
        f"Timezone: {enquiry.get('timezone', '')}\n"
        f"Subject: {enquiry.get('subject', '')}\n"
        f"Message: {enquiry.get('message', '')}\n"
    )

    if settings.ADMIN_NOTIFY_EMAIL:
        send_email(settings.ADMIN_NOTIFY_EMAIL, subject, html, text)

    # WhatsApp only if client chose whatsapp OR admin wants all notifications there
    if settings.ADMIN_WHATSAPP_TO and enquiry.get("contact_method") == "whatsapp":
        send_whatsapp(settings.ADMIN_WHATSAPP_TO, text)


def notify_new_consultation(consultation: dict) -> None:
    """Fire all configured notifications when a new consultation is booked."""
    subject = f"[Consultation Booked] {consultation.get('name', '')} - {consultation.get('selected_date_time', '')}"
    html = f"""
    <h2>New consultation booked</h2>
    <table border="0" cellpadding="6" cellspacing="0">
      <tr><td><b>Name:</b></td><td>{consultation.get('name', '')}</td></tr>
      <tr><td><b>Email:</b></td><td>{consultation.get('email', '')}</td></tr>
      <tr><td><b>Country:</b></td><td>{consultation.get('country', '')}</td></tr>
      <tr><td><b>Selected time (client tz):</b></td><td>{consultation.get('selected_date_time', '')}</td></tr>
      <tr><td><b>Timezone:</b></td><td>{consultation.get('timezone', '')}</td></tr>
      <tr><td><b>Pakistan time:</b></td><td>{consultation.get('pkt_time', '')}</td></tr>
    </table>
    """
    text = (
        f"New consultation booked\n"
        f"Name: {consultation.get('name', '')}\n"
        f"Email: {consultation.get('email', '')}\n"
        f"Country: {consultation.get('country', '')}\n"
        f"Selected time: {consultation.get('selected_date_time', '')}\n"
        f"Timezone: {consultation.get('timezone', '')}\n"
        f"Pakistan time: {consultation.get('pkt_time', '')}\n"
    )

    if settings.ADMIN_NOTIFY_EMAIL:
        send_email(settings.ADMIN_NOTIFY_EMAIL, subject, html, text)

    if settings.ADMIN_WHATSAPP_TO:
        send_whatsapp(settings.ADMIN_WHATSAPP_TO, text)
