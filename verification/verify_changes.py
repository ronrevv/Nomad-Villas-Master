
from playwright.sync_api import sync_playwright, expect
import os
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Increase viewport size to ensure elements aren't hidden
    page = browser.new_page(viewport={"width": 1280, "height": 800})

    try:
        # Navigate to homepage
        print("Navigating to homepage...")
        page.goto("http://localhost:5000")

        # Wait for page load
        page.wait_for_selector("text=Nomad Villas", timeout=10000)

        # Take screenshot of homepage
        page.screenshot(path="verification/1_homepage.png")
        print("Homepage verified.")

        # 2. Click on a Villa to go to details
        # Using "Bali Bamboo Villa" which is in seed data
        print("Clicking on Bali Bamboo Villa...")

        # Wait for any image to be visible - the list might be loading
        page.wait_for_selector("img", timeout=10000)

        # Try to find the specific villa, but if not found, screenshot and fail gracefully
        try:
             # Wait for the specific element to be attached and visible
             # Using a more generic selector first to ensure grid is loaded
             page.wait_for_selector(".grid", timeout=5000)

             # Locate by text "Bali Bamboo Villa" and click
             page.click("text=Bali Bamboo Villa", timeout=5000)
        except Exception as e:
            print(f"Could not find Bali Bamboo Villa. Trying generic first card. Error: {e}")
            page.screenshot(path="verification/error_finding_villa.png")
            # Fallback: click the first link that looks like a villa card
            page.click(".grid > a", timeout=5000)

        # Wait for details page
        print("Waiting for details page...")
        page.wait_for_selector("text=Reserve", timeout=10000)
        page.screenshot(path="verification/2_villa_details.png")
        print("Villa details verified.")

        # 3. Verify Login Modal Trigger on "Reserve"
        print("Clicking Reserve (expecting login modal)...")
        # Click Reserve without login
        page.click("button:has-text('Reserve')")

        # Expect Login Modal to appear
        expect(page.get_by_role("dialog")).to_be_visible(timeout=5000)
        # UPDATED: Check for the actual text present in LoginModal.tsx
        expect(page.get_by_text("Welcome to Nomad Villas")).to_be_visible()
        expect(page.get_by_text("Log in to book your stay")).to_be_visible()

        # Verify Quick Login buttons
        # Scope to dialog to avoid finding text in the background page
        modal = page.get_by_role("dialog")
        expect(modal.get_by_role("button", name="Guest")).to_be_visible()
        expect(modal.get_by_role("button", name="Host")).to_be_visible()

        page.screenshot(path="verification/3_login_modal.png")
        print("Login modal verified.")

        # 4. Perform Login as Guest
        print("Logging in as Guest...")
        modal.get_by_role("button", name="Guest").click()

        # Wait for login to complete (modal closes)
        expect(page.get_by_role("dialog")).not_to_be_visible(timeout=5000)
        print("Guest login successful.")

        # 5. Check persistence
        print("Checking auth persistence...")
        # Reload the page
        page.reload()
        page.wait_for_selector("text=Nomad Villas")

        # Verify we are still logged in (Avatar should be visible or Login button gone)
        # But let's just proceed to booking.

        # 6. Complete Booking Flow
        print("Completing booking flow...")
        print(f"Current URL: {page.url}")

        # Take a screenshot to debug
        page.screenshot(path="verification/debug_booking_flow.png")

        # Check for Instant Book text (this confirms component is loaded)
        page.wait_for_selector("text=Instant Book available", timeout=5000)
        expect(page.get_by_text("Instant Book available")).to_be_visible()

        # Select dates
        print("Selecting dates...")

        # Click the Check-in button. It's inside the widget.
        # We target the specific part of the grid in BookingWidget
        # The structure is Check-in label -> sibling button (or in same cell)
        # <div ...>Check-in</div> <button>Add date</button>

        # We find the text "Check-in", go up to the container, then find the button.
        # Or simply: click the button that contains "Add date" (or the formatted date)
        # Since there are two "Add date" texts (one button, one div), we want the button.

        page.locator("button:has-text('Add date')").first.click()

        # Wait for calendar (role=grid)
        print("Waiting for calendar...")
        page.wait_for_selector("role=grid", timeout=5000)

        # Select available days.
        # We need to click two different days.
        # We filter for buttons that are gridcells and not disabled.

        available_days = page.locator("button[role='gridcell']:not([disabled])")

        # Ensure we have enough days
        count = available_days.count()
        if count < 5:
            print("Not enough available days found on calendar.")
            page.screenshot(path="verification/calendar_debug.png")

        print("Clicking start date...")
        available_days.nth(2).click() # Click a day a few days in

        # Click end date
        print("Clicking end date...")
        # We click a later day.
        # Note: If single click logic differs, we might need to handle it, but range usually expects two clicks.
        available_days.nth(6).click()

        # Close popover if it doesn't close automatically?
        # Usually clicking the second date in a range closes it or updates the state.
        # We can click outside or just check if "Reserve" works now.
        # If the popover covers the reserve button, we might need to close it.
        # Hitting Escape is a good way to close popovers.
        page.keyboard.press("Escape")

        # Wait for UI to update (dates should appear in the boxes)
        # The "Add date" text should change.
        # We won't assert exact text because dates vary, but "Add date" might be gone or changed.

        # Click Reserve again
        print("Clicking Reserve...")
        reserve_btn = page.locator("button:has-text('Reserve')")
        reserve_btn.click()

        # Should redirect to /trips
        print("Waiting for redirection to /trips...")
        page.wait_for_url("**/trips", timeout=10000)

        # Verify "Trips" title
        expect(page.get_by_role("heading", name="Trips")).to_be_visible()

        # Verify the new booking is listed (Upcoming reservations)
        expect(page.get_by_text("Upcoming reservations")).to_be_visible()

        # Verify post-booking actions
        # We might have multiple bookings (seed data + new one), so we check that at least one exists
        expect(page.get_by_text("Message Host").first).to_be_visible()
        expect(page.get_by_text("Check-in Info").first).to_be_visible()

        page.screenshot(path="verification/5_trips_success.png")
        print("Booking flow and Trips page verified.")

    except Exception as e:
        print(f"Verification failed: {e}")
        page.screenshot(path="verification/failure.png")
        raise e
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
