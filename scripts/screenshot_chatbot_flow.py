"""Screenshot the website chatbot widget in action — full conversation flow."""
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://localhost:3000/"
OUT_DIR = Path("/home/z/my-project/scripts")
OUT_DIR.mkdir(parents=True, exist_ok=True)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
        )
        page = ctx.new_page()
        # Collect console errors
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)

        print(f"[1] Loading {URL} ...", flush=True)
        page.goto(URL, wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(2500)

        # Find the chatbot launcher button (fixed bottom-right)
        print("[2] Opening chatbot widget ...", flush=True)
        launcher = page.locator('button[aria-label="Open chat assistant"]')
        if launcher.count() == 0:
            print("ERROR: chatbot launcher button not found!")
            # Try fallback
            page.screenshot(path=str(OUT_DIR / "chatbot_no_launcher.png"), full_page=False)
            browser.close()
            sys.exit(1)
        launcher.click()
        page.wait_for_timeout(1500)

        # Screenshot: initial open
        page.screenshot(path=str(OUT_DIR / "chatbot_1_open.png"), full_page=False)
        print("  [saved] chatbot_1_open.png")

        # Type first message
        print("[3] Sending first message: 'hi' ...", flush=True)
        input_field = page.locator('input[placeholder="Type your question..."]')
        if input_field.count() == 0:
            print("ERROR: input field not found")
            sys.exit(1)
        input_field.fill("hi")
        page.locator('button[aria-label="Send message"]').click()
        page.wait_for_timeout(2500)
        page.screenshot(path=str(OUT_DIR / "chatbot_2_greeting.png"), full_page=False)
        print("  [saved] chatbot_2_greeting.png")

        # Send second message: ask about bookkeeping
        print("[4] Sending: 'do you do bookkeeping?' ...", flush=True)
        input_field.fill("do you do bookkeeping?")
        page.locator('button[aria-label="Send message"]').click()
        page.wait_for_timeout(2500)
        page.screenshot(path=str(OUT_DIR / "chatbot_3_service.png"), full_page=False)
        print("  [saved] chatbot_3_service.png")

        # Send follow-up: "how much?"
        print("[5] Sending follow-up: 'how much?' (should be context-aware) ...", flush=True)
        input_field.fill("how much?")
        page.locator('button[aria-label="Send message"]').click()
        page.wait_for_timeout(2500)
        page.screenshot(path=str(OUT_DIR / "chatbot_4_followup.png"), full_page=False)
        print("  [saved] chatbot_4_followup.png")

        # Try clicking a quick-reply suggestion
        print("[6] Clicking quick-reply suggestion ...", flush=True)
        suggestions = page.locator('button:has-text("Book a consultation")')
        if suggestions.count() > 0:
            suggestions.first.click()
            page.wait_for_timeout(2500)
            page.screenshot(path=str(OUT_DIR / "chatbot_5_quickreply.png"), full_page=False)
            print("  [saved] chatbot_5_quickreply.png")
        else:
            print("  no quick-reply button found")

        # Capture the rendered chat panel HTML for verification
        panel = page.locator('.fixed.bottom-20.right-6')
        if panel.count() > 0:
            html = panel.inner_html(timeout=5000)
            print(f"\n[7] Chat panel HTML length: {len(html)} chars")
            # Print just the bot replies' text
            import re
            replies = re.findall(r'rounded-tr-sm[^>]*>(.*?)</div>', html, re.DOTALL)
            print(f"\n=== Conversation captured ===")
            msgs = page.locator('.fixed.bottom-20.right-6 div.flex.items-start').all()
            for m in msgs:
                txt = m.inner_text(timeout=1000)
                if txt.strip():
                    print(f"  • {txt[:120]}")

        # Final full-page screenshot with chat open
        page.screenshot(path=str(OUT_DIR / "chatbot_6_final.png"), full_page=False)
        print("\n[8] Final screenshot saved.")

        if errors:
            print(f"\n[!] Console errors captured:")
            for e in errors[:10]:
                print(f"    {e[:200]}")
        else:
            print("\n[✓] No console errors.")

        browser.close()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
