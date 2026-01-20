from playwright.sync_api import sync_playwright

def verify_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Verify Become Host Exit Button
        print("1. Verifying 'Become a Host' exit...")
        # Need to be logged in to access /become-a-host usually, or it might redirect.
        # But looking at code, it doesn't strictly redirect on load, only on submit?
        # Actually storage.ts has RBAC, verify_rbac.py showed guest POST is 403.
        # HostDashboard redirects guests.
        # But BecomeHost page might render for anyone? Let's assume yes for now or login.
        # To be safe, let's login as host.
        page.goto("http://localhost:5000/?login=true") # Logs in as Guest by default usually?
        # Actually verify_flow.py used ?login=true.
        # Let's just go there.
        page.goto("http://localhost:5000/become-a-host")

        # Check for "Exit" button
        exit_btn = page.locator("button", has_text="Exit")
        if exit_btn.is_visible():
            print("SUCCESS: 'Exit' button is visible on first step.")
            exit_btn.click()
            page.wait_for_url("**/host")
            print("SUCCESS: Clicked 'Exit' and navigated to /host.")
        else:
            print("FAILURE: 'Exit' button not found.")
            # Check if it's "Back" and disabled
            back_btn = page.locator("button", has_text="Back")
            if back_btn.is_visible():
                 print(f"DEBUG: Found 'Back' button. Disabled: {back_btn.is_disabled()}")


        # 2. Verify Map Link
        print("\n2. Verifying Map Link...")
        page.goto("http://localhost:5000/")

        # Click "Show map"
        page.click("button:has-text('Show map')")

        # Wait for markers
        # Leaflet markers are usually images with class leaflet-marker-icon
        page.wait_for_selector(".leaflet-marker-icon")

        # Click the first marker
        page.click(".leaflet-marker-icon >> nth=0")

        # Wait for popup
        popup_link = page.locator(".leaflet-popup-content a", has_text="View Details")

        # Check href
        href = popup_link.get_attribute("href")
        print(f"Found Popup Link Href: {href}")

        if "/villas/" in href:
            print("SUCCESS: Link href contains '/villas/'.")
        else:
            print(f"FAILURE: Link href is '{href}' (expected '/villas/...')")

        browser.close()

if __name__ == "__main__":
    verify_fixes()
