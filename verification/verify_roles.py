
from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_roles_flow(page: Page):
    page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

    # 1. Login as Guest
    page.goto("http://localhost:5000")
    print("Navigated to Home")

    # Handle mobile/desktop menu difference
    menu_btn = page.locator("header button").filter(has=page.locator("span.relative.flex.shrink-0.overflow-hidden.rounded-full"))
    if not menu_btn.is_visible():
        menu_btn = page.locator("header button").last
    menu_btn.click()

    # Check if already logged in
    if page.get_by_role("menuitem", name="Log out").is_visible():
        page.get_by_role("menuitem", name="Log out").click()
        time.sleep(1)
        menu_btn.click()

    page.get_by_role("menuitem", name="Log in").click()

    with page.expect_response("**/api/login") as response_info:
        page.get_by_role("button", name="Login as Guest").click()
    print("Logged in as Guest")
    expect(page.get_by_text("Logged in as Guest").first).to_be_visible()
    time.sleep(1)

    # 2. Toggle Favorite
    villa_card = page.locator("a[href^='/villas/']").first
    heart_btn = villa_card.locator("button").first
    heart_btn.click()
    print("Clicked Heart")

    # Robust Wishlist Logic
    try:
        # Check for either "Saved" or "Removed"
        # We wait up to 2 seconds for a toast
        saved_toast = page.get_by_text("Saved to wishlist").first
        removed_toast = page.get_by_text("Removed from wishlist").first

        # Poll for visibility
        start_time = time.time()
        toast_seen = False
        while time.time() - start_time < 3:
            if saved_toast.is_visible():
                print("Toast: Saved to wishlist")
                toast_seen = True
                break
            if removed_toast.is_visible():
                print("Toast: Removed from wishlist. Adding back...")
                heart_btn.click()
                expect(saved_toast).to_be_visible()
                toast_seen = True
                break
            time.sleep(0.1)

        if not toast_seen:
            print("No toast detected. Assuming state based on heart icon or proceeding.")

    except Exception as e:
         print(f"Wishlist logic warning: {e}")

    # 3. Check Wishlist via Menu
    menu_btn.click()
    page.get_by_role("menuitem", name="Wishlist").click()
    print("Clicked Wishlist Menu")
    time.sleep(1)
    expect(page.locator("a[href^='/villas/']").first).to_be_visible()
    print("Wishlist verified")

    # 4. Profile Update via Menu
    menu_btn.click()
    page.get_by_role("menuitem", name="Profile").click()
    print("Clicked Profile Menu")

    # Update name
    new_name = f"GuestUpdated_{int(time.time())}"
    page.fill("input[name='firstName']", new_name)
    page.get_by_role("button", name="Save Changes").click()
    expect(page.get_by_text("Profile updated").first).to_be_visible()
    print("Profile updated")

    # Wait for toast to disappear or move on
    time.sleep(2)

    # 5. Book a Villa
    page.locator("a[href='/']").first.click() # Logo link
    expect(page.locator("a[href^='/villas/']").first).to_be_visible()

    # Click 2nd villa to ensure fresh context or just first
    page.locator("a[href^='/villas/']").nth(1).click()
    print("Clicked Villa")

    # Wait for page load
    page.wait_for_load_state("networkidle")

    # Open Date Picker
    page.get_by_text("Add date").first.click()
    time.sleep(0.5)

    available_days = page.locator("button[name='day']:not([disabled])")

    if available_days.count() > 25:
        available_days.nth(20).click()
        time.sleep(0.2)
        available_days.nth(23).click()
    else:
        available_days.first.click()
        time.sleep(0.2)
        available_days.last.click()

    print("Selected dates")
    time.sleep(0.5)

    # Close Popover explicitly
    page.keyboard.press("Escape")
    time.sleep(0.5)

    # Click Reserve
    reserve_btn = page.get_by_role("button", name="Reserve")
    reserve_btn.scroll_into_view_if_needed()
    reserve_btn.click()

    expect(page.get_by_text("Booking Confirmed!").first).to_be_visible()
    print("Booking Created")

    # 6. Check Trips via Menu
    menu_btn.click()
    page.get_by_role("menuitem", name="Trips").click()
    print("Clicked Trips Menu")
    time.sleep(1)

    # "Upcoming reservations"
    expect(page.get_by_text("Upcoming reservations")).to_be_visible()
    # It should be pending
    expect(page.get_by_text("pending", exact=False).first).to_be_visible()
    print("Trips verified")

    # 7. Login as Host
    menu_btn.click()
    page.get_by_role("menuitem", name="Log out").click()
    print("Logged out")
    time.sleep(1)

    menu_btn.click()
    page.get_by_role("menuitem", name="Log in").click()
    page.get_by_role("button", name="Login as Host").click()
    print("Logged in as Host")
    expect(page.get_by_text("Logged in as Host").first).to_be_visible()
    time.sleep(2)

    # 8. Host Dashboard
    page.get_by_text("Switch to hosting").click()
    time.sleep(2)

    page.get_by_text("Calendar").click()
    print("Clicked Calendar Tab")

    # Find Accept button
    accept_btn = page.locator("button:has(svg.lucide-check)").first
    if accept_btn.is_visible():
        accept_btn.click()
        print("Clicked Accept")
        expect(page.get_by_text("Booking updated").first).to_be_visible()
    else:
        print("No pending bookings found to accept (checked first button).")

    time.sleep(1)

    # 9. Verify Guest Trip Status (Logout/Login Guest)
    menu_btn.click()
    page.get_by_role("menuitem", name="Log out").click()
    time.sleep(1)

    menu_btn.click()
    page.get_by_role("menuitem", name="Log in").click()
    page.get_by_role("button", name="Login as Guest").click()
    expect(page.get_by_text("Logged in as Guest").first).to_be_visible()
    time.sleep(2)

    menu_btn.click()
    page.get_by_role("menuitem", name="Trips").click()

    # Verify Confirmed
    expect(page.get_by_text("confirmed", exact=False).first).to_be_visible()
    print("Trip status confirmed verified")

    page.screenshot(path="verification/roles_verified.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_roles_flow(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_roles.png")
            raise e
        finally:
            browser.close()
