"""File upload service.

Saves uploaded files to a local directory and returns a public URL.
Files are written to a sub-folder per category (`portfolio/`, `resource/`)
so the disk layout stays organized and is easy to mirror to S3 later.

This service does NOT touch the database — callers (routes) are
responsible for storing the returned URL into the appropriate model
column (e.g. PortfolioItem.media_url, ResourceItem.title).

SECURITY: Extension allowlist + magic-byte signature verification.
A malicious user can rename `evil.exe` to `evil.png` to bypass an
extension-only check; magic-byte verification reads the first few bytes
of the file and confirms they match the expected signature for the
claimed file type. Files that don't match are rejected with 415.
"""
import os
import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException, status

from app.config import settings


# Allowed extensions per category, lowercased, no leading dot.
_PORTFOLIO_EXT = {e.strip().lower().lstrip(".") for e in settings.UPLOAD_PORTFOLIO_EXT.split(",") if e.strip()}
_RESOURCE_EXT  = {e.strip().lower().lstrip(".") for e in settings.UPLOAD_RESOURCE_EXT.split(",") if e.strip()}

# Map of category -> allowed extensions
_ALLOWED: dict[str, set[str]] = {
    "portfolio": _PORTFOLIO_EXT,
    "resource":  _RESOURCE_EXT,
}

# Sanity-check the upload root exists; create lazily on first save.
_UPLOAD_ROOT = Path(settings.UPLOAD_DIR).resolve()


# ─── Magic-byte signatures ───────────────────────────────────────────────────
# Each entry is (extension, list_of_acceptable_signatures).
# A signature is a tuple (offset, expected_bytes). We check the file's bytes
# at the given offset against the expected value. The first N bytes of the
# file (the "magic number") uniquely identify most common file formats.
#
# References:
#   https://en.wikipedia.org/wiki/List_of_file_signatures
#   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
_SIGNATURES: dict[str, list[tuple[int, bytes]]] = {
    # Images
    "jpg":  [(0, b"\xff\xd8\xff")],
    "jpeg": [(0, b"\xff\xd8\xff")],
    "png":  [(0, b"\x89PNG\r\n\x1a\n")],
    "gif":  [(0, b"GIF87a"), (0, b"GIF89a")],
    "webp": [(0, b"RIFF"), (8, b"WEBP")],  # both must match
    # Documents
    "pdf":  [(0, b"%PDF")],
    # Office (legacy — OLE2 compound document)
    "doc":  [(0, b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1")],
    "xls":  [(0, b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1")],
    "ppt":  [(0, b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1")],
    # Office (modern — ZIP-based OOXML; PK\x03\x04 is the ZIP local-file header)
    "docx": [(0, b"PK\x03\x04"), (0, b"PK\x05\x06"), (0, b"PK\x07\x08")],
    "xlsx": [(0, b"PK\x03\x04"), (0, b"PK\x05\x06"), (0, b"PK\x07\x08")],
    "pptx": [(0, b"PK\x03\x04"), (0, b"PK\x05\x06"), (0, b"PK\x07\x08")],
    # Archives (ZIP)
    "zip":  [(0, b"PK\x03\x04"), (0, b"PK\x05\x06"), (0, b"PK\x07\x08")],
    # Plain text — no reliable magic byte; allow by extension only (low-risk).
    "txt":  [],
}


def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _ext(filename: str) -> str:
    """Return lowercase extension without the leading dot."""
    return Path(filename).suffix.lower().lstrip(".")


def _validate_extension(file: UploadFile, category: str) -> str:
    """Validate extension against category allowlist. Returns lowercased ext."""
    if category not in _ALLOWED:
        raise HTTPException(status_code=400, detail=f"Unknown upload category: {category}")

    ext = _ext(file.filename or "")
    if ext not in _ALLOWED[category]:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '.{ext}' for {category}. "
                   f"Allowed: {', '.join(sorted(_ALLOWED[category]))}",
        )
    return ext


def _verify_magic_bytes(content: bytes, ext: str) -> None:
    """Verify the file's magic bytes match the expected signature for `ext`.

    Raises HTTPException(415) on mismatch. Files with no known signature
    (e.g. .txt) are allowed by extension alone.
    """
    sigs = _SIGNATURES.get(ext)
    if not sigs:
        # No signature registered → trust the extension (low-risk types only).
        return

    # Group signatures by offset so we can verify multi-byte signatures at
    # different offsets (e.g. webp needs RIFF at 0 AND WEBP at 8).
    # All signatures in the list must match for the file to be accepted.
    for offset, expected in sigs:
        actual = content[offset:offset + len(expected)]
        if actual != expected:
            raise HTTPException(
                status_code=415,
                detail=(
                    f"File content does not match its extension '.{ext}' "
                    f"(magic byte mismatch at offset {offset}). "
                    f"The file may be corrupted, renamed, or malicious."
                ),
            )


async def save_upload(file: UploadFile, category: str) -> dict:
    """Save an uploaded file to disk under `<UPLOAD_DIR>/<category>/<uuid>.<ext>`.

    Returns: {url, filename, size, content_type}

    Validates:
      1. Extension is in the category allowlist
      2. File is non-empty and under UPLOAD_MAX_BYTES
      3. Magic bytes match the expected signature for the claimed extension
    """
    ext = _validate_extension(file, category)

    # Read content with size check
    _ensure_dir(_UPLOAD_ROOT / category)
    content = await file.read()
    size = len(content)
    if size == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    if size > settings.UPLOAD_MAX_BYTES:
        max_mb = settings.UPLOAD_MAX_BYTES / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size} bytes). Max allowed: {max_mb:.1f} MB",
        )

    # Magic-byte verification — defends against renamed malicious files
    _verify_magic_bytes(content, ext)

    # Generate a unique, URL-safe filename. Preserve original extension.
    safe_name = f"{uuid.uuid4().hex}.{ext}"
    rel_path = f"{category}/{safe_name}"
    abs_path = _UPLOAD_ROOT / category / safe_name
    abs_path.write_bytes(content)

    # Build public URL. If UPLOAD_PUBLIC_BASE is set, prepend it; otherwise serve
    # from the same origin (the /uploads static mount in main.py).
    base = settings.UPLOAD_PUBLIC_BASE.rstrip("/")
    url = f"{base}/uploads/{rel_path}" if base else f"/uploads/{rel_path}"

    return {
        "url": url,
        "filename": rel_path,
        "size": size,
        "content_type": file.content_type or "application/octet-stream",
    }
