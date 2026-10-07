import pandas as pd
import time
from selenium import webdriver
from selenium.webdriver.common.by import By

def scrape_bus_routes(source, destination, travel_date):
    print(f"Initializing scraper for {source} to {destination}...")
    
    options = webdriver.ChromeOptions()
    # options.add_argument('--headless') # Keep commented out initially to verify browser opens
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    # Modern Selenium automatically finds your local Chrome binary
    driver = webdriver.Chrome(options=options)
    
    # Example URL (replace with actual portal target)
    url = f"https://www.google.com"
    driver.get(url)
    print("Browser loaded successfully.")
    
    time.sleep(3)
    driver.quit()

if __name__ == "__main__":
    scrape_bus_routes("Chandigarh", "Shimla", "20-Nov-2026")