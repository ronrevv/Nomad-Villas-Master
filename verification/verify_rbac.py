
from playwright.sync_api import sync_playwright, expect
import time
import requests

BASE_URL = "http://localhost:5000"

def verify_rbac(page):
    page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

    # 1. Login as Guest
    page.goto(BASE_URL)
    # Open Login Modal if needed (via url or button)
    page.goto(f"{BASE_URL}?login=true")
    page.get_by_role("button", name="Guest", exact=True).click()
    expect(page.get_by_text("Logged in as guest").first).to_be_visible()

    # 2. Verify "Switch to hosting" is hidden
    # "Switch to hosting" button should NOT be visible
    # We check for the specific button text
    switch_btn = page.get_by_text("Switch to hosting")
    expect(switch_btn).not_to_be_visible()
    print("Verified: Guest cannot see 'Switch to hosting'")

    # 3. Try to navigate to /host
    page.goto(f"{BASE_URL}/host")
    # Should redirect to home (check url or element on home)
    try:
        page.wait_for_url(f"{BASE_URL}/", timeout=5000)
        print("Verified: Guest redirected from /host to /")
    except:
        # Check if stripping slash works
        if page.url.rstrip('/') == BASE_URL.rstrip('/'):
             print("Verified: Guest redirected from /host to /")
        else:
             print(f"FAILED: Guest on {page.url}")
             # debug
             page.screenshot(path="verification/failed_redirect.png")

    # 4. Try to POST /api/villas (API check)
    # We need the session cookie from playwright
    cookies = page.context.cookies()
    session_cookie = next((c['value'] for c in cookies if c['name'] == 'connect.sid'), None)

    if session_cookie:
        res = requests.post(
            f"{BASE_URL}/api/villas",
            json={"title": "Hack"},
            cookies={'connect.sid': session_cookie}
        )
        if res.status_code == 403:
            print("Verified: Guest POST /api/villas -> 403 Forbidden")
        else:
            print(f"FAILED: Guest POST /api/villas -> {res.status_code}")

    # 5. Login as Host
    # Logout first
    page.goto(BASE_URL)
    menu_btn = page.locator("header button").filter(has=page.locator("span.relative.flex.shrink-0.overflow-hidden.rounded-full"))
    if not menu_btn.is_visible():
        menu_btn = page.locator("header button").last
    menu_btn.click()
    page.get_by_role("menuitem", name="Log out").click()

    page.goto(f"{BASE_URL}?login=true")
    page.get_by_role("button", name="Host", exact=True).click()
    expect(page.get_by_text("Logged in as host").first).to_be_visible()

    # 6. Verify "Switch to hosting" is visible
    switch_btn = page.get_by_text("Switch to hosting")
    expect(switch_btn).to_be_visible()
    print("Verified: Host can see 'Switch to hosting'")

    # 7. Access /host
    switch_btn.click()
    expect(page.get_by_text("Hosting Dashboard")).to_be_visible()
    print("Verified: Host can access Dashboard")

    # 8. Login as Admin
    # Logout
    page.goto(BASE_URL)
    menu_btn = page.locator("header button").filter(has=page.locator("span.relative.flex.shrink-0.overflow-hidden.rounded-full"))
    menu_btn.click()
    page.get_by_role("menuitem", name="Log out").click()

    page.goto(f"{BASE_URL}?login=true")
    page.get_by_role("button", name="Admin", exact=True).click()
    expect(page.get_by_text("Logged in as admin").first).to_be_visible()

    # 9. Access /host (Admin View)
    page.goto(f"{BASE_URL}/host")
    expect(page.get_by_text("Admin Dashboard")).to_be_visible()
    print("Verified: Admin sees Admin Dashboard")

    # Check if Host User is visible in Admin Dashboard
    # "Host User" is the name of the seeded host
    expect(page.get_by_text("Host User (@hostuser)")).to_be_visible()
    print("Verified: Admin sees Host User")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        verify_rbac(page)
    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/rbac_error.png")
        raise e
    finally:
        browser.close()
