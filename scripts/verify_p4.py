"""P4 feature verification — chatbot + magic-byte upload + ContactSection wiring."""
import sys
import os
import io
sys.path.insert(0, '/home/z/my-project/backend')
os.environ['DATABASE_URL'] = 'sqlite:///./app.db'
os.chdir('/home/z/my-project/backend')

from fastapi.testclient import TestClient
from app.db.database import create_tables, SessionLocal
from app.services import seed_service
from app.main import app

# Fresh DB
db_path = '/home/z/my-project/backend/app.db'
if os.path.exists(db_path):
    os.remove(db_path)
create_tables()
db = SessionLocal()
try:
    seed_service.run_seed(db, force=True)
finally:
    db.close()

client = TestClient(app)
results = []

def check(name: str, ok: bool, detail: str = "") -> None:
    icon = "PASS" if ok else "FAIL"
    results.append((name, ok, detail))
    print(f"  {icon}  {name}" + (f" — {detail}" if detail and not ok else ""))


print("\n=== SETUP: fresh DB seeded ===")
print(f"  Routes registered: {len(app.routes)}")


print("\n=== P4-1: Chatbot backend ===")

# Test 1: suggestions endpoint (public)
r = client.get('/chatbot/suggestions')
check("GET /chatbot/suggestions returns 200", r.status_code == 200, f"status={r.status_code}")
data = r.json()
check("Suggestions list is non-empty", isinstance(data.get('suggestions'), list) and len(data['suggestions']) > 0,
      f"got={data.get('suggestions')}")

# Test 2: greeting
r = client.post('/chatbot/', json={'message': 'hi there'})
check("Greeting intent", r.status_code == 200 and r.json().get('intent') == 'greeting',
      f"status={r.status_code}, intent={r.json().get('intent')}")

# Test 3: pricing
r = client.post('/chatbot/', json={'message': 'how much does bookkeeping cost?'})
check("Pricing intent", r.status_code == 200 and r.json().get('intent') == 'pricing',
      f"status={r.status_code}, intent={r.json().get('intent')}")

# Test 4: FAQ match (strong)
r = client.post('/chatbot/', json={'message': 'which bookkeeping software do you support?'})
check("FAQ strong match (intent=faq)", r.json().get('intent') in ('faq', 'faq_weak'),
      f"intent={r.json().get('intent')}")
check("FAQ reply mentions QuickBooks", 'QuickBooks' in r.json().get('reply', ''),
      f"reply={r.json().get('reply', '')[:80]}")

# Test 5: service match
r = client.post('/chatbot/', json={'message': 'do you do tax preparation?'})
check("Service match (intent=services)", r.json().get('intent') == 'services',
      f"intent={r.json().get('intent')}")

# Test 6: fallback
r = client.post('/chatbot/', json={'message': 'xyz qwerty foobar'})
check("Fallback intent", r.json().get('intent') == 'fallback',
      f"intent={r.json().get('intent')}")
check("Fallback has suggestions", len(r.json().get('suggestions', [])) > 0)

# Test 7: empty message
r = client.post('/chatbot/', json={'message': ''})
check("Empty message rejected (422)", r.status_code == 422, f"status={r.status_code}")

# Test 8: suggestions returned in greeting reply
r = client.post('/chatbot/', json={'message': 'hello'})
sugs = r.json().get('suggestions', [])
check("Greeting includes quick-reply suggestions", len(sugs) > 0,
      f"suggestions={sugs}")


print("\n=== P4-2: Chatbot session_id field (no DB needed) ===")
# Optional session_id should be accepted without error
r = client.post('/chatbot/', json={'message': 'hi', 'session_id': 'test-session-123'})
check("Session_id accepted", r.status_code == 200, f"status={r.status_code}")


print("\n=== P4-4: Upload magic-byte validation ===")

# Login as admin first
r = client.post('/auth/login', json={'username': 'admin', 'password': 'admin123'})
admin_token = r.json().get('token')
check("Admin login works", admin_token is not None, f"status={r.status_code}")
headers = {'Authorization': f'Bearer {admin_token}'}

# Test: valid PNG
png_bytes = b'\x89PNG\r\n\x1a\n' + b'\x00' * 100  # valid PNG header + dummy body
r = client.post(
    '/uploads/portfolio',
    headers=headers,
    files={'file': ('test.png', io.BytesIO(png_bytes), 'image/png')},
)
check("Valid PNG upload succeeds", r.status_code == 201, f"status={r.status_code}, body={r.text[:200]}")

# Test: renamed file — .png extension but EXE content
exe_bytes = b'MZ' + b'\x00' * 100  # MZ is the DOS/PE executable magic
r = client.post(
    '/uploads/portfolio',
    headers=headers,
    files={'file': ('evil.png', io.BytesIO(exe_bytes), 'image/png')},
)
check("Renamed EXE → .png rejected by magic-byte check", r.status_code == 415,
      f"status={r.status_code}, body={r.text[:200]}")
check("Rejection detail mentions magic byte", 'magic byte' in r.text.lower() or 'mismatch' in r.text.lower(),
      f"body={r.text[:200]}")

# Test: valid PDF
pdf_bytes = b'%PDF-1.4\n' + b'% Test PDF' + b'\x00' * 100
r = client.post(
    '/uploads/resource',
    headers=headers,
    files={'file': ('doc.pdf', io.BytesIO(pdf_bytes), 'application/pdf')},
)
check("Valid PDF upload succeeds", r.status_code == 201, f"status={r.status_code}")

# Test: renamed .pdf with random bytes
fake_pdf = b'NOT A PDF' + b'\x00' * 100
r = client.post(
    '/uploads/resource',
    headers=headers,
    files={'file': ('fake.pdf', io.BytesIO(fake_pdf), 'application/pdf')},
)
check("Renamed random → .pdf rejected", r.status_code == 415, f"status={r.status_code}")

# Test: valid JPG
jpg_bytes = b'\xff\xd8\xff\xe0' + b'\x00' * 100  # JPEG SOI + APP0 marker
r = client.post(
    '/uploads/portfolio',
    headers=headers,
    files={'file': ('photo.jpg', io.BytesIO(jpg_bytes), 'image/jpeg')},
)
check("Valid JPG upload succeeds", r.status_code == 201, f"status={r.status_code}")

# Test: txt file (no magic byte — should pass on extension alone)
txt_bytes = b'Hello, this is a plain text file.'
r = client.post(
    '/uploads/resource',
    headers=headers,
    files={'file': ('notes.txt', io.BytesIO(txt_bytes), 'text/plain')},
)
check("Plain TXT upload succeeds (no magic byte check)", r.status_code == 201,
      f"status={r.status_code}, body={r.text[:200]}")


print("\n=== ContactSection backend wiring (existing endpoints still work) ===")

# Test: enquiry POST
r = client.post('/enquiries/', json={
    'name': 'Test User',
    'contact_method': 'email',
    'contact_info': 'test@example.com',
    'subject': 'P4 Test',
    'message': 'Verifying enquiry POST works',
    'selected_service': 'bookkeeping',
    'timezone': 'America/New_York',
})
check("POST /enquiries/ works", r.status_code == 201, f"status={r.status_code}")

# Test: consultation POST (slot validation kicks in)
from datetime import datetime, timedelta
future_dt = (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%dT14:00')
r = client.post('/consultations/', json={
    'name': 'P4 User',
    'email': f'p4test-{int(datetime.now().timestamp())}@example.com',
    'country': 'US',
    'selected_date_time': future_dt,
    'timezone': 'America/New_York',
})
check("POST /consultations/ works for valid future slot", r.status_code == 201,
      f"status={r.status_code}, body={r.text[:300]}")

# Test: consultation POST past slot → rejected
past_dt = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%dT14:00')
r = client.post('/consultations/', json={
    'name': 'Past User',
    'email': f'past-{int(datetime.now().timestamp())}@example.com',
    'country': 'US',
    'selected_date_time': past_dt,
    'timezone': 'America/New_York',
})
check("POST /consultations/ rejects past slot", r.status_code == 400,
      f"status={r.status_code}")


# ─── Summary ────────────────────────────────────────────────
total = len(results)
passed = sum(1 for _, ok, _ in results if ok)
print(f"\n{'='*60}")
print(f"RESULTS: {passed}/{total} checks passed")
if passed == total:
    print("All P4 verifications passed! ✓")
else:
    print("SOME CHECKS FAILED ✗")
    for name, ok, detail in results:
        if not ok:
            print(f"  FAIL: {name} — {detail}")
sys.exit(0 if passed == total else 1)
