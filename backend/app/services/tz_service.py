"""Timezone + slot validation service for consultations.

Responsibilities:
  - Parse a client-supplied datetime string in many common formats.
  - Convert that datetime to PKT (Asia/Karachi) for `pkt_time`.
  - Reject past dates.
  - Detect double-bookings (same email + same slot already booked).
  - Warn (not reject) when the slot is outside business hours.

We intentionally keep this module pure (no DB writes) so it can be
unit-tested without a running app.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Iterable

from app.models.consultation import Consultation


# ── Timezones ──────────────────────────────────────────────────────────────
PKT = ZoneInfo("Asia/Karachi")
UTC = timezone.utc


# ── Common client-side datetime formats (tried in order) ───────────────────
# The frontend's `<input type="datetime-local">` produces "YYYY-MM-DDTHH:MM".
# Some forms ship a humanized string like "Jul 15, 2026, 3:30 PM (CEST)".
# We try to parse the prefix that contains real date/time information.
_DATETIME_FORMATS: tuple[str, ...] = (
    "%Y-%m-%dT%H:%M",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d %H:%M",
    "%Y-%m-%d %H:%M:%S",
    "%Y/%m/%d %H:%M",
    "%Y/%m/%d %H:%M:%S",
    "%d-%m-%Y %H:%M",
    "%d-%m-%Y %H:%M:%S",
    "%d/%m/%Y %H:%M",
    "%d/%m/%Y %H:%M:%S",
    "%b %d, %Y, %I:%M %p",      # "Jul 15, 2026, 3:30 PM"
    "%B %d, %Y, %I:%M %p",     # "July 15, 2026, 3:30 PM"
    "%b %d, %Y %I:%M %p",
    "%B %d, %Y %I:%M %p",
)


def _strip_tz_suffix(s: str) -> str:
    """Remove trailing '(CEST)', '(PKT)', 'UTC', 'GMT+5' etc. tokens before parsing."""
    # Cut at first '(' that introduces a timezone abbreviation.
    idx = s.find("(")
    if idx > 0:
        s = s[:idx]
    return s.strip()


def parse_datetime(raw: str) -> datetime | None:
    """Try to parse a client-supplied datetime string.

    Returns a *naive* datetime (no tzinfo) on success — the caller decides
    what timezone to attach. Returns None if no known format matches.
    """
    if not raw or not raw.strip():
        return None
    s = _strip_tz_suffix(raw)
    for fmt in _DATETIME_FORMATS:
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def _attach_tz(dt: datetime, tz_name: str | None) -> datetime:
    """Attach a timezone to a naive datetime.

    If `tz_name` is a valid IANA zone, use it. Otherwise default to PKT.
    If the datetime is already tz-aware, return it as-is.
    """
    if dt.tzinfo is not None:
        return dt
    if tz_name:
        try:
            return dt.replace(tzinfo=ZoneInfo(tz_name))
        except Exception:
            pass
    # Default: assume the client meant PKT.
    return dt.replace(tzinfo=PKT)


def to_pkt(dt_aware: datetime) -> datetime:
    """Convert a tz-aware datetime to PKT."""
    return dt_aware.astimezone(PKT)


def format_pkt(dt_aware: datetime) -> str:
    """Format a tz-aware datetime as '15-Jul-2026 06:30 PM (PKT)'."""
    pkt_dt = to_pkt(dt_aware)
    return pkt_dt.strftime("%d-%b-%Y %I:%M %p") + " (PKT)"


# ── Business hours (PKT) ────────────────────────────────────────────────────
BUSINESS_HOUR_START = 9   # 09:00 PKT
BUSINESS_HOUR_END   = 19  # 19:00 PKT (7 PM)
# How far in the future a slot must be (grace window for the client's clock drift).
MIN_LEAD_HOURS = 1
# How far in the future a slot may be (avoid scheduling years out).
MAX_LEAD_DAYS = 180


def is_business_hour(dt_aware: datetime) -> bool:
    pkt = to_pkt(dt_aware)
    return BUSINESS_HOUR_START <= pkt.hour < BUSINESS_HOUR_END


class SlotValidationError(Exception):
    """Raised when a consultation slot fails validation.

    The .public_message attribute is safe to return to the client; the
    exception string may contain extra diagnostics.
    """
    def __init__(self, public_message: str, *, code: str = "invalid_slot") -> None:
        super().__init__(public_message)
        self.public_message = public_message
        self.code = code


def validate_slot(
    *,
    selected_date_time: str,
    timezone_name: str | None,
    email: str,
    existing: Iterable[Consultation],
    skip_double_booking: bool = False,
) -> tuple[datetime, str, list[str]]:
    """Validate a consultation slot.

    Returns: (aware_dt_in_client_tz, pkt_time_string, warnings_list)

    Raises SlotValidationError on:
      - unparseable datetime
      - past datetime (or too soon — within MIN_LEAD_HOURS)
      - too far in the future (beyond MAX_LEAD_DAYS)
      - double-booking (same email + same slot date/time already in `existing`)

    Adds warnings (returned, not raised) for:
      - slot outside PKT business hours (still allowed, but flagged)
    """
    warnings: list[str] = []

    dt_naive = parse_datetime(selected_date_time)
    if dt_naive is None:
        raise SlotValidationError(
            f"Could not parse datetime: '{selected_date_time}'. "
            "Expected formats like 'YYYY-MM-DDTHH:MM' or 'Jul 15, 2026, 3:30 PM'.",
            code="unparseable",
        )

    aware = _attach_tz(dt_naive, timezone_name)
    now_utc = datetime.now(UTC)

    if aware.utcoffset() is None:
        # Defensive: _attach_tz should always succeed, but be safe.
        raise SlotValidationError("Internal error: datetime has no tzinfo", code="internal")

    # Past / too-soon check.
    # Note: clients typically send minute-precision datetimes (no seconds),
    # so a slot that's exactly +1h30s from now gets parsed as +1h0s. To avoid
    # spurious rejections at the boundary, we use a small grace window of 30s.
    lead_seconds = (aware - now_utc).total_seconds()
    if lead_seconds < 0:
        raise SlotValidationError(
            "Selected date/time is in the past. Please pick a future slot.",
            code="past",
        )
    # Allow slots that are at least MIN_LEAD_HOURS from now, with a 30-second
    # grace window to absorb parsing precision loss (client sends HH:MM, we
    # lose the seconds component).
    if lead_seconds < (MIN_LEAD_HOURS * 3600) - 30:
        raise SlotValidationError(
            f"Please pick a slot at least {MIN_LEAD_HOURS} hour(s) from now.",
            code="too_soon",
        )

    # Too-far check.
    if (aware - now_utc) > timedelta(days=MAX_LEAD_DAYS):
        raise SlotValidationError(
            f"Selected date/time is too far in the future (max {MAX_LEAD_DAYS} days).",
            code="too_far",
        )

    # Business-hours warning (NOT a hard reject).
    if not is_business_hour(aware):
        warnings.append(
            f"Slot is outside PKT business hours "
            f"({BUSINESS_HOUR_START:02d}:00–{BUSINESS_HOUR_END:02d}:00 PKT). "
            "The team will confirm by email."
        )

    # Double-booking check: same email + same slot (compare by UTC instant,
    # within a 5-minute window to tolerate client clock drift).
    if not skip_double_booking and email:
        norm_email = email.strip().lower()
        aware_utc = aware.astimezone(UTC)
        for c in existing:
            if not c.email or c.email.strip().lower() != norm_email:
                continue
            c_dt_naive = parse_datetime(c.selected_date_time)
            if c_dt_naive is None:
                continue
            c_aware = _attach_tz(c_dt_naive, c.timezone)
            c_utc = c_aware.astimezone(UTC)
            delta = abs((c_utc - aware_utc).total_seconds())
            if delta <= 300:  # 5 minutes
                raise SlotValidationError(
                    "You already have a consultation booked at this time. "
                    "Please pick a different slot or cancel the existing one.",
                    code="double_booked",
                )

    pkt_time_str = format_pkt(aware)
    return aware, pkt_time_str, warnings
