from playwright.sync_api import sync_playwright

def verify_branding():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # iPhone X viewport
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()

        page.goto("http://localhost:5000")
        page.wait_for_load_state("networkidle")

        # Take screenshot of the header area
        # Assuming header is the first 80px (h-20 is 5rem = 80px)
        # We can just take a full screenshot or top area
        page.screenshot(path="verification/mobile_branding.png", clip={"x": 0, "y": 0, "width": 375, "height": 100})
        print("Mobile branding screenshot taken.")

        # Verify text presence programmatically just in case
        text = page.inner_text("header")
        if "Nomad Villas" in text:
            print("SUCCESS: 'Nomad Villas' text found in header on mobile.")
        else:
            print("FAILURE: 'Nomad Villas' text NOT found in header on mobile.")

        browser.close()

if __name__ == "__main__":
    verify_branding()
