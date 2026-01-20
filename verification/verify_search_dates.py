import datetime
from playwright.sync_api import sync_playwright

def verify_date_search():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Seed data says: "Bali Bamboo Villa" is booked for 7 days starting "next week".
        # We need to calculate what "next week" means relative to the server's time.
        # However, we can also just verify that filtering works by checking if results change.

        # 1. Search without dates -> Bali Bamboo Villa should be there
        print("1. Searching without dates...")
        page.goto("http://localhost:5000")
        page.wait_for_selector("text=Bali Bamboo Villa")
        print("SUCCESS: Bali Bamboo Villa found (default state).")

        # 2. Search with overlapping dates
        # The seed uses: const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
        # So let's construct a URL manually to be precise, rather than fighting the UI date picker in a script.
        # We want to overlap with T+7 to T+14.
        # Let's try T+8 to T+10.

        today = datetime.datetime.now()
        start_overlap = today + datetime.timedelta(days=8)
        end_overlap = today + datetime.timedelta(days=10)

        url_overlap = f"http://localhost:5000/?from={start_overlap.isoformat()}&to={end_overlap.isoformat()}"

        print(f"2. Searching with overlapping dates: {url_overlap}")
        page.goto(url_overlap)

        # Wait for network idle or a specific element state
        page.wait_for_timeout(2000)

        content = page.content()
        if "Bali Bamboo Villa" not in content:
            print("SUCCESS: Bali Bamboo Villa filtered out (booked).")
        else:
            # Note: The seed booking status defaults to "pending" in createBooking?
            # Wait, let's check seedDatabase in server/routes.ts
            # "status will default to pending, but storage sets it."
            # My filter logic in storage.ts only filters "confirmed" bookings.
            # "allVillas.filter(v => ... b.status === 'confirmed')"
            # The seed data creates a booking but doesn't explicitly set it to confirmed?
            # Let's check server/routes.ts seedDatabase again.
            # It just calls createBooking. storage.createBooking sets status to 'pending'.
            # So the filter WON'T work on the seed booking unless I update the seed to make it confirmed.
            print("FAILURE: Bali Bamboo Villa still visible (Booking might be pending, not confirmed).")

        browser.close()

if __name__ == "__main__":
    verify_date_search()
