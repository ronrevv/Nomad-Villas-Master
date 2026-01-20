from playwright.sync_api import sync_playwright

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Desktop View
        context_desktop = browser.new_context(viewport={"width": 1280, "height": 800})
        page_desktop = context_desktop.new_page()
        page_desktop.goto("http://localhost:5000")
        page_desktop.wait_for_selector("text=Find your next adventure")
        page_desktop.screenshot(path="verification/hero_desktop.png")
        print("Desktop screenshot taken.")

        # 2. Mobile View
        context_mobile = browser.new_context(viewport={"width": 375, "height": 812}) # iPhone X size
        page_mobile = context_mobile.new_page()
        page_mobile.goto("http://localhost:5000")
        page_mobile.wait_for_selector("text=Find your next adventure")
        page_mobile.screenshot(path="verification/hero_mobile.png")
        print("Mobile screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_ui()
