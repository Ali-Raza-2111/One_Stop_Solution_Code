#!/usr/bin/env python3
"""Comprehensive P2 + bugfix verification — covers all P2 features and the
new bug fixes (slot validation, country flag normalization, ratings auth,
admin user guards, seed mutation, reorder route ordering).

Run: /home/z/.venv/bin/python /home/z/my-project/scripts/verify_p2_fixes.py
"""
import os
import sys
import time
import json
import urllib.request
import urllib.error
import subprocess

os.chdir("/home/z/my-project/backend")
sys.path.insert(0, "/home/z/my-project/backend")
# Unset problematic env vars so .env file is used
for k in ["DATABASE_URL", "POSTGRES_STRING"]:
    os.environ.pop(k, None)
os.environ["DATABASE_URL"] = "sqlite:///./app.db"

# Clean any old DB
db_path = "/home/z/my-project/backend/app.db"
if os.path.exists(db_path):
    os.remove(db_path)

print("=" * 70)
print("STEP 1: Country flag normalization (BUG #2)")
print("=" * 70)
from app.services.country_flag import country_to_code, flag_url, code_to_country
flag_cases = [
    ("U.S.A.", "us"), ("USA", "us"), ("United States", "us"),
    ("U.K.", "gb"), ("UK", "gb"), ("United Kingdom", "gb"),
    ("U.A.E.", "ae"), ("UAE", "ae"),
    ("Pakistan", "pk"), ("Türkiye", "tr"),
    ("", None), ("Unknown", None),
]
flag_failures = 0
for raw, expected in flag_cases:
    got = country_to_code(raw)
    ok = got == expected
    if not ok: flag_failures += 1
    print(f"  {'✅' if ok else '❌'} country_to_code({raw!r}) -> {got!r} expected={expected!r}")
print(f"  → {len(flag_cases) - flag_failures}/{len(flag_cases)} flag cases passed")

print()
print("=" * 70)
print("STEP 2: Timezone slot validation (BUG #1, P2-4)")
print("=" * 70)
from app.services.tz_service import validate_slot, SlotValidationError, parse_datetime
from datetime import datetime, timedelta, timezone

tz_failures = 0
def tz_test(name, fn, should_pass):
    global tz_failures
    try:
        result = fn()
        if should_pass:
            print(f"  ✅ {name}: passed (result={result!r})")
        else:
            print(f"  ❌ {name}: should have been rejected but passed (result={result!r})")
            tz_failures += 1
    except SlotValidationError as e:
        if not should_pass:
            print(f"  ✅ {name}: rejected as expected (code={e.code})")
        else:
            print(f"  ❌ {name}: should have passed but got {e.code}: {e.public_message}")
            tz_failures += 1

past_dt = (datetime.now(timezone.utc) - timedelta(days=1)).strftime('%Y-%m-%dT%H:%M')
soon_dt = (datetime.now(timezone.utc) + timedelta(minutes=10)).strftime('%Y-%m-%dT%H:%M')
good_dt = (datetime.now(timezone.utc) + timedelta(days=7)).strftime('%Y-%m-%dT%H:%M')
far_dt  = (datetime.now(timezone.utc) + timedelta(days=365)).strftime('%Y-%m-%dT%H:%M')

tz_test("past date", lambda: validate_slot(selected_date_time=past_dt, timezone_name='UTC', email='a@b.c', existing=[]), should_pass=False)
tz_test("too-soon (<1h)", lambda: validate_slot(selected_date_time=soon_dt, timezone_name='UTC', email='a@b.c', existing=[]), should_pass=False)
tz_test("too-far (>180d)", lambda: validate_slot(selected_date_time=far_dt, timezone_name='UTC', email='a@b.c', existing=[]), should_pass=False)
tz_test("valid future", lambda: validate_slot(selected_date_time=good_dt, timezone_name='UTC', email='a@b.c', existing=[]), should_pass=True)
tz_test("unparseable", lambda: validate_slot(selected_date_time='garbage', timezone_name=None, email='a@b.c', existing=[]), should_pass=False)
print(f"  → {5 - tz_failures}/5 tz cases passed")

print()
print("=" * 70)
print("STEP 3: Seed force-reseed (BUG #4 — module-level mutation)")
print("=" * 70)
from app.db.database import Base, engine, SessionLocal, create_tables
create_tables()
from app.services.seed_service import run_seed, DEFAULT_SERVICES, DEFAULT_TEAM
db = SessionLocal()
try:
    skills_before = bool(DEFAULT_SERVICES[0]["portfolio"][0].get("skills"))
    specs_before = bool(DEFAULT_TEAM[0].get("specialties"))
    r1 = run_seed(db, force=True)
    r2 = run_seed(db, force=True)
    skills_after = bool(DEFAULT_SERVICES[0]["portfolio"][0].get("skills"))
    specs_after = bool(DEFAULT_TEAM[0].get("specialties"))
    print(f"  skills: before={skills_before}, after two force-seeds={skills_after}  → {'✅' if skills_before == skills_after else '❌'}")
    print(f"  specialties: before={specs_before}, after two force-seeds={specs_after}  → {'✅' if specs_before == specs_after else '❌'}")
    
    # Verify seeded data still has skills/specialties
    from app.models.service import PortfolioItem
    from app.models.team_member import TeamMember
    import json as _json
    p = db.query(PortfolioItem).first()
    skills_seeded = _json.loads(p.skills) if p and p.skills else []
    t = db.query(TeamMember).first()
    specs_seeded = _json.loads(t.specialties) if t and t.specialties else []
    print(f"  seeded portfolio skills count: {len(skills_seeded)}  → {'✅' if len(skills_seeded) > 0 else '❌'}")
    print(f"  seeded team specialties count: {len(specs_seeded)}  → {'✅' if len(specs_seeded) > 0 else '❌'}")
finally:
    db.close()

print()
print("=" * 70)
print("STEP 4: Live HTTP tests — server + endpoint checks")
print("=" * 70)
env = os.environ.copy()
env["DATABASE_URL"] = "sqlite:///./app.db"
for k in ["POSTGRES_STRING"]:
    env.pop(k, None)
proc = subprocess.Popen(
    ["/home/z/.venv/bin/python", "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8767"],
    cwd="/home/z/my-project/backend", env=env,
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
)
http_failures = 0
try:
    for _ in range(30):
        time.sleep(0.5)
        try:
            urllib.request.urlopen("http://127.0.0.1:8767/health/", timeout=1)
            break
        except urllib.error.URLError:
            continue
    else:
        out = proc.stdout.read().decode() if proc.stdout else ""
        print("❌ Server didn't start")
        print(out[-1500:])
        sys.exit(1)
    print("✅ Server started")

    BASE = "http://127.0.0.1:8767"
    results = []

    def req(method, path, *, headers=None, body=None, expect_status=None, label=""):
        url = BASE + path
        if body is not None:
            data = json.dumps(body).encode()
            h = dict(headers or {})
            h.setdefault("Content-Type", "application/json")
        else:
            data = None
            h = headers or {}
        r = urllib.request.Request(url, data=data, method=method, headers=h)
        try:
            resp = urllib.request.urlopen(r, timeout=5)
            code = resp.getcode()
            try:
                payload = json.loads(resp.read().decode())
            except Exception:
                payload = {}
            ok = (expect_status is None or code == expect_status)
            mark = "✅" if ok else "❌"
            results.append(f"  {mark} {method:6s} {path:48s} → {code} {label}")
            return code, payload
        except urllib.error.HTTPError as e:
            code = e.code
            try:
                payload = json.loads(e.read().decode())
            except Exception:
                payload = {}
            ok = (expect_status is not None and code == expect_status)
            mark = "✅" if ok else "❌"
            results.append(f"  {mark} {method:6s} {path:48s} → {code} {label} {payload.get('detail','')[:40]}")
            return code, payload
        except Exception as e:
            results.append(f"  ❌ {method:6s} {path:48s} → ERROR {label} {e}")
            return None, None

    # --- Public ratings access ---
    req("GET", "/ratings/", expect_status=200, label="(public, default=approved)")
    req("GET", "/ratings/?approved=true", expect_status=200, label="(public, explicit true)")
    req("GET", "/ratings/?approved=false", expect_status=401, label="(public, exposes unapproved)")
    
    # --- Admin login ---
    code, login = req("POST", "/auth/login", body={"username": "admin", "password": "admin123"}, expect_status=200)
    token = login.get("token") if login else ""
    auth_h = {"Authorization": f"Bearer {token}"}
    
    # Admin-only ratings queries
    req("GET", "/ratings/?approved=false", headers=auth_h, expect_status=200, label="(admin, unapproved)")
    
    # --- Admin user self-deactivation guard (BUG: prevent lockout) ---
    code, me = req("GET", "/auth/me", headers=auth_h, expect_status=200)
    my_id = me.get("id") if me else 0
    req("PUT", f"/admin-users/{my_id}", headers=auth_h, body={"is_active": False}, expect_status=400, label="(self-deactivate guard)")
    req("DELETE", f"/admin-users/{my_id}", headers=auth_h, expect_status=400, label="(self-delete guard)")
    
    # --- Admin user last-active-admin guard ---
    req("DELETE", "/admin-users/999", headers=auth_h, expect_status=404, label="(nonexistent)")
    
    # --- Consultation slot validation (live HTTP) ---
    past_dt_iso = (datetime.now(timezone.utc) - timedelta(days=1)).strftime('%Y-%m-%dT%H:%M')
    req("POST", "/consultations/", body={
        "name": "Past Test", "email": "past@example.com", "country": "Pakistan",
        "selected_date_time": past_dt_iso, "timezone": "UTC",
    }, expect_status=400, label="(past date rejection)")
    
    good_dt_iso = (datetime.now(timezone.utc) + timedelta(days=10)).strftime('%Y-%m-%dT%H:%M')
    code, c = req("POST", "/consultations/", body={
        "name": "Future Test", "email": "future@example.com", "country": "U.S.A.",
        "selected_date_time": good_dt_iso, "timezone": "UTC",
    }, expect_status=201, label="(valid future + auto pkt_time)")
    if c:
        pkt = c.get("pkt_time", "")
        ok = bool(pkt) and "(PKT)" in pkt
        results.append(f"  {'✅' if ok else '❌'} server-computed pkt_time: {pkt!r}")
    
    # Double-booking
    req("POST", "/consultations/", body={
        "name": "Future Test 2", "email": "future@example.com", "country": "Pakistan",
        "selected_date_time": good_dt_iso, "timezone": "UTC",
    }, expect_status=400, label="(double-booking rejection)")
    
    # Garbage datetime
    req("POST", "/consultations/", body={
        "name": "Garbage", "email": "garbage@example.com", "country": "Pakistan",
        "selected_date_time": "not-a-date", "timezone": "UTC",
    }, expect_status=400, label="(unparseable rejection)")
    
    # --- File upload: wrong type rejection ---
    import io
    boundary = "----testboundary123"
    body_bytes = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="evil.exe"\r\n'
        f"Content-Type: application/octet-stream\r\n\r\n"
        f"fake exe content\r\n"
        f"--{boundary}--\r\n"
    ).encode()
    h = dict(auth_h)
    h["Content-Type"] = f"multipart/form-data; boundary={boundary}"
    r = urllib.request.Request(BASE + "/uploads/portfolio", data=body_bytes, method="POST", headers=h)
    try:
        resp = urllib.request.urlopen(r, timeout=5)
        code = resp.getcode()
        results.append(f"  ❌ POST /uploads/portfolio (evil.exe)        → {code} should be 415")
    except urllib.error.HTTPError as e:
        code = e.code
        mark = "✅" if code == 415 else "❌"
        results.append(f"  {mark} POST /uploads/portfolio (evil.exe)        → {code} (file type rejection)")
    
    # --- File upload: valid image ---
    # Build a minimal valid PNG (1x1 transparent)
    png_bytes = bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
        "890000000d49444154789c636000000000020001e221bc330000000049454e44ae426082"
    )
    body_bytes = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="test.png"\r\n'
        f"Content-Type: image/png\r\n\r\n"
    ).encode() + png_bytes + f"\r\n--{boundary}--\r\n".encode()
    h = dict(auth_h)
    h["Content-Type"] = f"multipart/form-data; boundary={boundary}"
    r = urllib.request.Request(BASE + "/uploads/portfolio", data=body_bytes, method="POST", headers=h)
    try:
        resp = urllib.request.urlopen(r, timeout=5)
        code = resp.getcode()
        payload = json.loads(resp.read().decode())
        url = payload.get("url", "")
        mark = "✅" if code == 201 and "/uploads/portfolio/" in url else "❌"
        results.append(f"  {mark} POST /uploads/portfolio (test.png)        → {code} url={url!r}")
    except urllib.error.HTTPError as e:
        code = e.code
        results.append(f"  ❌ POST /uploads/portfolio (test.png)        → {code} should be 201")
    
    # --- File upload: no auth → 401 ---
    h = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    r = urllib.request.Request(BASE + "/uploads/portfolio", data=body_bytes, method="POST", headers=h)
    try:
        resp = urllib.request.urlopen(r, timeout=5)
        code = resp.getcode()
        results.append(f"  ❌ POST /uploads/portfolio (no auth)         → {code} should be 401")
    except urllib.error.HTTPError as e:
        code = e.code
        mark = "✅" if code == 401 else "❌"
        results.append(f"  {mark} POST /uploads/portfolio (no auth)         → {code} (auth required)")
    
    # --- /users/ requires admin auth (BUG #5) ---
    req("GET", "/users/", expect_status=401, label="(public, should require admin)")
    req("GET", "/users/", headers=auth_h, expect_status=200, label="(admin)")
    
    # --- /seed/status requires admin auth (BUG #6) ---
    req("GET", "/seed/status", expect_status=401, label="(public, should require admin)")
    req("GET", "/seed/status", headers=auth_h, expect_status=200, label="(admin)")
    
    # --- Reorder routes (BUG: route ordering, was 422 before fix) ---
    req("PUT", "/services/reorder", headers=auth_h, body={"items": [{"id": 1, "sort_order": 1}]}, expect_status=200, label="(route-order fix)")
    req("PUT", "/services/portfolio/reorder", headers=auth_h, body={"items": [{"id": 1, "sort_order": 1}]}, expect_status=200, label="(route-order fix)")
    req("PUT", "/ratings/reorder", headers=auth_h, body={"items": [{"id": 1, "sort_order": 1}]}, expect_status=200, label="(route-order fix)")
    req("PUT", "/team/reorder", headers=auth_h, body={"items": [{"id": 1, "sort_order": 1}]}, expect_status=200, label="(route-order fix)")
    req("PUT", "/faqs/reorder", headers=auth_h, body={"items": [{"id": 1, "sort_order": 1}]}, expect_status=200, label="(route-order fix)")
    
    print()
    for r in results:
        print(r)
    
    failures = [r for r in results if "❌" in r]
    if failures:
        print(f"\n❌ {len(failures)} HTTP checks FAILED")
        sys.exit(1)
    else:
        print(f"\n✅ All {len(results)} HTTP checks PASSED")

finally:
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
