import time
from playwright.sync_api import sync_playwright

def verify_search():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to home page...")
        page.goto("http://localhost:5000")

        # Wait for page to load
        page.wait_for_load_state("networkidle")

        print("Checking initial state...")
        # Check if we see listings
        listings = page.locator(".grid > div") # Assuming listings are divs in a grid
        print(f"Initial listings count: {listings.count()}")

        print("Performing search for 'Bali'...")
        # Fill location input
        page.fill("input[placeholder='Where are you going?']", "Bali")

        # Click search button
        # The button is an icon button inside the guests div
        page.click("button:has(svg.lucide-search)")

        # Wait for network activity or URL change
        page.wait_for_load_state("networkidle")

        current_url = page.url
        print(f"Current URL: {current_url}")

        if "?location=Bali" in current_url:
            print("SUCCESS: URL updated correctly.")
        else:
            print("FAILURE: URL did not update correctly.")
            browser.close()
            return

        # Check if API call was made (we can't easily intercept network in sync without setup,
        # but we can check if the UI filtered results)

        # Wait a bit for React to re-render
        time.sleep(2)

        # Check if we see Bali listings
        # Assuming the titles or locations are visible.
        # We know "Bali Bamboo Villa" is in the seed data.
        content = page.content()
        if "Bali Bamboo Villa" in content:
             print("SUCCESS: Found 'Bali Bamboo Villa' in results.")
        else:
             print("FAILURE: 'Bali Bamboo Villa' not found in results.")

        # Check if other listings are gone (e.g., 'Manhattan Loft')
        if "Manhattan Loft" not in content:
             print("SUCCESS: 'Manhattan Loft' correctly filtered out.")
        else:
             print("FAILURE: 'Manhattan Loft' still visible.")

        browser.close()

if __name__ == "__main__":
    try:
        verify_search()
        print("Search verification complete.")
    except Exception as e:
        print(f"Error during verification: {e}")
