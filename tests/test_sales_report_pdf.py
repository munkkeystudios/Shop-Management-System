import os
import time
import unittest
import PyPDF2
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class TestSalesReportPDF(unittest.TestCase):
    """
    Test case for validating the PDF export functionality in the Sales Report page.

    This test verifies that:
    1. The PDF export button is present and clickable
    2. Clicking the button initiates a download
    3. The downloaded file has the correct format and is a valid PDF
    """

    def setUp(self):
        """Set up the test environment before each test method."""
        # Configure Chrome options for headless operation and download handling
        chrome_options = Options()
        # Uncomment the line below to run in headless mode (no browser UI)
        # chrome_options.add_argument("--headless")
        chrome_options.add_argument("--window-size=1920,1080")

        # Set download directory to the current working directory
        self.download_dir = os.path.join(os.getcwd(), "downloads")
        os.makedirs(self.download_dir, exist_ok=True)

        prefs = {
            "download.default_directory": self.download_dir,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": False,
            "plugins.always_open_pdf_externally": True  # Force PDF to download instead of opening in browser
        }
        chrome_options.add_experimental_option("prefs", prefs)

        # Initialize the Chrome WebDriver
        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=chrome_options
        )

        # Set implicit wait time
        self.driver.implicitly_wait(10)

        # Base URL of the application
        self.base_url = "http://localhost:3000"  # Update with your application URL

        # Login to the application
        self.login()

    def login(self):
        """Log in to the application with manager credentials."""
        self.driver.get(f"{self.base_url}/login")

        # Wait for the login form to be visible
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "username"))
        )

        # Enter credentials
        self.driver.find_element(By.ID, "username").send_keys("admin123")  # Updated with provided username
        self.driver.find_element(By.ID, "password").send_keys("YOUR_ADMIN_PASSWORD")  # Updated with provided password

        # Submit the form - find the button by looking for a button element
        buttons = self.driver.find_elements(By.TAG_NAME, "button")
        for button in buttons:
            if button.get_attribute("type") == "submit" or "Login" in button.text or "Sign In" in button.text:
                button.click()
                break

        # Wait for dashboard to load
        WebDriverWait(self.driver, 10).until(
            EC.url_contains("/dashboard")
        )

    def test_pdf_export(self):
        """Test PDF export functionality."""
        # Navigate directly to the sales report page
        self.driver.get(f"{self.base_url}/sales-report")

        # Wait for the page to load
        try:
            WebDriverWait(self.driver, 10).until(
                EC.visibility_of_element_located((By.CLASS_NAME, "collapsible-report-header"))
            )

            # Expand the report if it's collapsed
            report_header = self.driver.find_element(By.CLASS_NAME, "collapsible-report-header")
            report_content = self.driver.find_element(By.CLASS_NAME, "collapsible-report-content")
            if "open" not in report_content.get_attribute("class"):
                report_header.click()
                time.sleep(1)  # Allow animation to complete
        except:
            # If the specific elements aren't found, wait for any content to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )

        # Clear any existing files in the download directory
        for file in os.listdir(self.download_dir):
            os.remove(os.path.join(self.download_dir, file))

        # Find the PDF button - try multiple approaches
        try:
            # First try by class
            pdf_button = WebDriverWait(self.driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'pdf-button')]"))
            )
        except:
            try:
                # Try by text content
                pdf_button = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'PDF')]"))
                )
            except:
                # Try finding all buttons and look for one with PDF text or icon
                buttons = self.driver.find_elements(By.TAG_NAME, "button")
                pdf_button = None
                for button in buttons:
                    if "PDF" in button.text or "pdf" in button.get_attribute("class").lower():
                        pdf_button = button
                        break

                if not pdf_button:
                    self.fail("Could not find PDF export button")

        # Assert that the button is enabled
        self.assertTrue(pdf_button.is_enabled(), "PDF button should be enabled")

        # Click the PDF export button
        pdf_button.click()

        # Wait for the download to complete (max 10 seconds)
        download_complete = False
        start_time = time.time()
        while not download_complete and time.time() - start_time < 10:
            time.sleep(1)
            # Check if any PDF file exists in the download directory
            pdf_files = [f for f in os.listdir(self.download_dir) if f.endswith('.pdf')]
            if pdf_files:
                download_complete = True

        # Assert that a file was downloaded
        self.assertTrue(download_complete, "PDF file was not downloaded within the expected time")

        # Get the downloaded file
        pdf_files = [f for f in os.listdir(self.download_dir) if f.endswith('.pdf')]
        self.assertEqual(len(pdf_files), 1, "Expected exactly one PDF file to be downloaded")

        # Verify the file is not empty
        file_path = os.path.join(self.download_dir, pdf_files[0])
        self.assertGreater(os.path.getsize(file_path), 0, "Downloaded PDF file is empty")

        # Verify the file is a valid PDF
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                # Check if the PDF has at least one page
                self.assertGreater(len(pdf_reader.pages), 0, "PDF file does not contain any pages")

                # Extract text from the first page to verify content
                text = pdf_reader.pages[0].extract_text()
                # Check for common terms that should be in a sales report (case insensitive)
                self.assertTrue(
                    "sales" in text.lower() or
                    "report" in text.lower() or
                    "total" in text.lower() or
                    "date" in text.lower(),
                    "PDF does not contain expected sales report content"
                )

                print(f"PDF export test passed. File downloaded: {pdf_files[0]}")
        except Exception as e:
            self.fail(f"Failed to read PDF file: {str(e)}")

    def tearDown(self):
        """Clean up after each test method."""
        # Close the browser
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
