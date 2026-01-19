
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 3000})

    try:
        page.goto("http://localhost:5000")
        page.wait_for_selector("text=Nomad Villas", timeout=10000)

        # Wait for dynamic content - longer timeout
        page.wait_for_selector("text=Guest Favorites", timeout=15000)
        page.wait_for_selector("text=Loved by travelers worldwide", timeout=5000)

        page.screenshot(path="verification/landing_page_full.png")
        print("Success: Landing page verified!")
    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/landing_page_error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
