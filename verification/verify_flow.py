
from playwright.sync_api import Page, expect, sync_playwright
import time
import os

def verify_full_flow(page: Page):
    page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

    # 1. Go to Home
    page.goto("http://localhost:5000")
    print("Navigated to Home")

    # 2. Login as Host using Quick Login
    menu_btn = page.locator("header button").filter(has=page.locator("span.relative.flex.shrink-0.overflow-hidden.rounded-full"))
    if not menu_btn.is_visible():
        menu_btn = page.locator("header button").last
    menu_btn.click()
    page.get_by_role("menuitem", name="Log in").click()

    # Click "Login as Host"
    with page.expect_response("**/api/login") as response_info:
        page.get_by_role("button", name="Login as Host").click()

    response = response_info.value
    print(f"Login Response: {response.status}")
    print(f"Cookies: {page.context.cookies()}")

    # Wait for Toast
    expect(page.get_by_text("Logged in as Host")).to_be_visible()
    print("Logged in as Host (Verified Toast)")

    time.sleep(2)

    # 3. Create Villa
    page.get_by_text("Switch to hosting").click()
    print("Clicked Switch to hosting")
    time.sleep(5) # Wait for reload

    # Check if we are on dashboard
    if page.get_by_role("heading", name="Hosting Dashboard").is_visible():
        print("On Dashboard")
    else:
        print("Not on dashboard. Current URL: " + page.url)
        # Check if login modal reappeared or redirected to home
        page.screenshot(path="verification/debug_redirect.png")

    page.get_by_role("button", name="Create New Listing").click()
    print("Started listing creation")

    # Step 1: Category
    page.get_by_text("House").click()
    print("Selected Category")
    time.sleep(1)

    # Step 2: Location
    expect(page.get_by_role("heading", name="Where is your place located?")).to_be_visible()
    page.fill("input[name='location']", "Test City, Test Country")
    page.get_by_role("button", name="Next").click()

    # Step 3: Guests (Basics)
    expect(page.get_by_text("How many guests can stay?")).to_be_visible()
    page.get_by_role("button", name="Next").click()

    # Step 4: Amenities
    expect(page.get_by_text("What does your place offer?")).to_be_visible()
    page.get_by_text("Wifi").click()
    page.get_by_role("button", name="Next").click()

    # Step 5: Photos
    expect(page.get_by_text("Add some photos of your house")).to_be_visible()
    page.get_by_role("button", name="Next").click()

    # Step 6: Title
    expect(page.get_by_text("Now, let's give your house a title")).to_be_visible()
    page.fill("textarea[name='title']", "My Awesome Test Villa")
    page.get_by_role("button", name="Next").click()

    # Step 7: Description
    expect(page.get_by_text("Create your description")).to_be_visible()
    page.fill("textarea[name='description']", "This is a test description for the villa.")
    page.get_by_role("button", name="Next").click()

    # Step 8: Price
    expect(page.get_by_text("Now, set your price")).to_be_visible()
    page.get_by_role("button", name="Next").click()

    # Step 9: Review & Publish
    expect(page.get_by_text("Review your listing")).to_be_visible()
    page.get_by_role("button", name="Publish").click()
    print("Published listing")

    time.sleep(5)

    # Should be on /host dashboard now
    expect(page.get_by_role("heading", name="Hosting Dashboard")).to_be_visible()

    # 4. Logout
    menu_btn = page.locator("header button").filter(has=page.locator("span.relative.flex.shrink-0.overflow-hidden.rounded-full"))
    if not menu_btn.is_visible():
         menu_btn = page.locator("header button").last
    menu_btn.click()
    page.get_by_role("menuitem", name="Log out").click()
    print("Logged out")
    time.sleep(2)

    # 5. Login as Guest
    menu_btn.click()
    page.get_by_role("menuitem", name="Log in").click()
    page.get_by_role("button", name="Login as Guest").click()
    print("Logged in as Guest")
    time.sleep(2)

    # 6. Find the new villa
    page.goto("http://localhost:5000")

    # Look for "My Awesome Test Villa"
    print("Searching for villa...")
    villa_card = page.get_by_text("My Awesome Test Villa")
    expect(villa_card).to_be_visible(timeout=10000)

    villa_card.click()
    print("Clicked on Villa")

    # 7. Reserve
    page.get_by_text("Add date").first.click()
    available_days = page.locator("button[name='day']:not([disabled])")
    time.sleep(0.5)
    available_days.nth(15).click()
    available_days.nth(18).click()

    page.get_by_role("button", name="Reserve").click()

    # Check for success toast
    expect(page.get_by_text("Booking Confirmed!")).to_be_visible()
    print("Booking Confirmed!")

    # Screenshot
    page.screenshot(path="verification/booking_success.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_full_flow(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_flow.png")
            raise e
        finally:
            browser.close()
