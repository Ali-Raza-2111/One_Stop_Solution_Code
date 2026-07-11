"""Application configuration.

Reads from backend/.env (or process env). All values have safe defaults
so the backend boots in dev mode without external services — email,
Twilio/WhatsApp, IP geolocation, and uploads all degrade gracefully.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ─── Core ────────────────────────────────────────────────────────
    APP_NAME:     str = "One Stop Solution API"
    APP_VERSION:  str = "0.1.0"
    DEBUG:        bool = True
    HOST:         str = "0.0.0.0"
    PORT:         int = 8000
    SECRET_KEY:   str = "change-me-in-production-please-use-a-long-random-string"
    DATABASE_URL: str = "sqlite:///./app.db"
    CORS_ORIGINS: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:3001,http://127.0.0.1:3001,"
        "http://localhost:5173,http://127.0.0.1:5173"
    )

    # ─── Default admin (auto-seeded on first start) ──────────────────
    DEFAULT_ADMIN_USERNAME:      str = "admin"
    DEFAULT_ADMIN_PASSWORD:      str = "admin123"
    DEFAULT_ADMIN_DISPLAY_NAME:  str = "Site Administrator"

    # ─── IP geolocation (ipapi.co — works without a key, rate-limited) ──
    IPAPI_TOKEN: str = ""   # optional; without it, free tier is used

    # ─── File uploads ────────────────────────────────────────────────
    UPLOAD_DIR:            str = "uploads"
    UPLOAD_MAX_BYTES:      int = 5 * 1024 * 1024   # 5 MB
    UPLOAD_PORTFOLIO_EXT:  str = "png,jpg,jpeg,webp,pdf,mp4,xlsx"
    UPLOAD_RESOURCE_EXT:   str = "pdf,docx,xlsx,pptx,zip"
    UPLOAD_PUBLIC_BASE:    str = "/uploads"

    # ─── SMTP (admin email notifications) ────────────────────────────
    SMTP_HOST:     str = ""
    SMTP_PORT:     int = 587
    SMTP_USER:     str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM:     str = "noreply@onestopsolution.com"
    ADMIN_NOTIFY_EMAIL: str = ""

    # ─── Twilio (WhatsApp Business API) ──────────────────────────────
    TWILIO_ACCOUNT_SID:    str = ""
    TWILIO_AUTH_TOKEN:     str = ""
    TWILIO_WHATSAPP_FROM:  str = ""   # e.g. "+14155238886" (Twilio sandbox number)
    ADMIN_WHATSAPP_TO:     str = ""   # e.g. "+923001234567"

    # ─── WhatsApp webhook verification token ─────────────────────────
    # Set this to any string, then configure the same value in the
    # Twilio console webhook URL: /whatsapp/webhook?token=<WHATSAPP_WEBHOOK_TOKEN>
    # If empty, webhook verification is skipped (dev mode only).
    WHATSAPP_WEBHOOK_TOKEN: str = ""

    # ─── Chatbot tuning ──────────────────────────────────────────────
    # Max messages per session kept in DB for history (older auto-pruned)
    CHATBOT_HISTORY_LIMIT: int = 50
    # Cooldown in seconds before the bot will reply to the same WhatsApp
    # number again (anti-flood). 0 = no cooldown.
    WHATSAPP_COOLDOWN_SECONDS: int = 0


settings = Settings()
