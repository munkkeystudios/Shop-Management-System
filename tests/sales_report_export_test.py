import unittest
import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class SalesReportExportTest(unittest.TestCase):
    """Test case for validating PDF and Excel export functionality in Sales Report page"""

    def setUp(self):
        """Set up the test environment before each test"""
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")

        self.download_dir = os.path.dirname(os.path.abspath(__file__))
        prefs = {
            "download.default_directory": self.download_dir,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": True
        }
        chrome_options.add_experimental_option("prefs", prefs)

        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        self.driver.implicitly_wait(10)

        self.base_url = "https://shop-management-system-k59j.onrender.com/"

        self.admin_username = "admin123"
        self.admin_password = "YOUR_ADMIN_PASSWORD"

        self.test_log = []

    def log_step(self, step_number, description, expected, actual, success):
        """Log the outcome of each test step"""
        log_entry = {
            "step": step_number,
            "description": description,
            "expected": expected,
            "actual": actual,
            "success": success,
            "log_number": "" if success else f"LOG-{step_number}"
        }
        self.test_log.append(log_entry)

        result = "SUCCESS" if success else "FAILED"
        print(f"Step {step_number}: {result} - {description}")
        if not success:
            print(f"  Expected: {expected}")
            print(f"  Actual: {actual}")

    def test_pdf_export_functionality(self):
        """
        Test Case: PDF Export Functionality in Sales Report Page

        Description: Test whether the PDF export button in the Sales Report page
        successfully initiates a download of a PDF file.
        """
        driver = self.driver
        wait = WebDriverWait(driver, 15)

        try:
            driver.get(self.base_url)
            login_page_displayed = wait.until(EC.visibility_of_element_located((By.ID, "username")))
            self.log_step(
                1,
                "Open the application URL",
                "Login page is displayed correctly",
                "Login page displayed correctly" if login_page_displayed else "Login page not displayed",
                login_page_displayed is not None
            )

            username_input = driver.find_element(By.ID, "username")
            password_input = driver.find_element(By.ID, "password")

            username_input.send_keys(self.admin_username)
            password_input.send_keys(self.admin_password)

            credentials_entered = (username_input.get_attribute("value") == self.admin_username and
                                len(password_input.get_attribute("value")) > 0)

            self.log_step(
                2,
                "Enter valid admin username and password",
                f"Credentials entered: {self.admin_username}/YOUR_ADMIN_PASSWORD",
                "Credentials entered successfully" if credentials_entered else "Failed to enter credentials",
                credentials_entered
            )

            login_button = driver.find_element(By.CSS_SELECTOR, ".submit-button")
            login_button.click()

            try:
                WebDriverWait(driver, 10).until(
                    EC.url_contains("/dashboard")
                )

                login_success = True
                current_url = driver.current_url

                self.log_step(
                    3,
                    "Click the Login/Sign In button",
                    "Login is successful. User is navigated to the main dashboard",
                    f"User successfully navigated to {current_url}",
                    login_success
                )
            except:
                login_success = False
                self.log_step(
                    3,
                    "Click the Login/Sign In button",
                    "Login is successful. User is navigated to the main dashboard",
                    "Login failed or redirection did not occur",
                    False
                )
                raise Exception("Login failed")

            try:

                print("Navigating directly to sales-report page...")
                driver.get(self.base_url + "sales-report")


                reports_page_loaded = WebDriverWait(driver, 20).until(
                    EC.url_contains("/sales-report")
                )


                time.sleep(3)

                self.log_step(
                    4,
                    "Navigate to the Reports page",
                    "User is successfully navigated to the Reports page",
                    "Reports page loaded successfully" if reports_page_loaded else "Reports page did not load correctly",
                    reports_page_loaded
                )
            except Exception as e:
                self.log_step(
                    4,
                    "Navigate to the Reports page",
                    "User is successfully navigated to the Reports page",
                    f"Failed to navigate to Reports page: {str(e)}",
                    False
                )
                raise Exception("Failed to navigate to Reports page")


            try:

                report_header = wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'collapsible-report-header')]"))
                )
                report_header.click()


                collapsible_content = wait.until(
                    EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'collapsible-report-content') and contains(@class, 'open')]"))
                )

                header_clicked = collapsible_content is not None

                self.log_step(
                    5,
                    "Click on the Sales Report collapsible bar",
                    "Sales Report collapsible content expands to reveal export buttons",
                    "Sales Report bar was clicked and content expanded" if header_clicked else "Failed to expand Sales Report content",
                    header_clicked
                )
            except Exception as e:
                self.log_step(
                    5,
                    "Click on the Sales Report collapsible bar",
                    "Sales Report collapsible content expands to reveal export buttons",
                    f"Failed to expand Sales Report content: {str(e)}",
                    False
                )
                raise Exception("Failed to expand Sales Report content")


            try:
                pdf_button = wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'collapsible-report-content') and contains(@class, 'open')]//button[contains(@class, 'pdf-button') and contains(., 'PDF')]"))
                )

                pdf_button_exists = pdf_button is not None

                self.log_step(
                    6,
                    "Check if PDF export button exists",
                    "PDF export button is visible and clickable",
                    "PDF button found and is clickable" if pdf_button_exists else "PDF button not found or not clickable",
                    pdf_button_exists
                )
            except Exception as e:
                self.log_step(
                    6,
                    "Check if PDF export button exists",
                    "PDF export button is visible and clickable",
                    f"PDF button not found or not clickable: {str(e)}",
                    False
                )
                raise Exception("PDF export button not found")


            try:

                pdf_files_before = len([f for f in os.listdir(self.download_dir) if f.endswith('.pdf')])


                pdf_button.click()


                time.sleep(3)


                max_wait_time = 10
                start_time = time.time()
                pdf_downloaded = False

                while time.time() - start_time < max_wait_time:
                    pdf_files_after = len([f for f in os.listdir(self.download_dir) if f.endswith('.pdf')])
                    if pdf_files_after > pdf_files_before:
                        pdf_downloaded = True
                        break
                    time.sleep(1)

                self.log_step(
                    7,
                    "Click the PDF export button",
                    "PDF export is initiated and file is downloaded",
                    "PDF file was successfully downloaded" if pdf_downloaded else "PDF file was not downloaded",
                    pdf_downloaded
                )
            except Exception as e:
                self.log_step(
                    7,
                    "Click the PDF export button",
                    "PDF export is initiated and file is downloaded",
                    f"Error occurred while trying to download PDF: {str(e)}",
                    False
                )
                raise Exception("Failed to download PDF file")


            print("\n=== TEST SUMMARY ===")
            all_steps_passed = all(step["success"] for step in self.test_log)
            print(f"Overall Test Result: {'PASSED' if all_steps_passed else 'FAILED'}")
            print("====================\n")

        except Exception as e:
            print(f"Test failed with exception: {str(e)}")
            raise

    def test_excel_export_functionality(self):
        """
        Test Case: Excel Export Functionality in Sales Report Page

        Description: Test whether the Excel export button in the Sales Report page
        successfully initiates a download of an Excel file.
        """
        driver = self.driver
        wait = WebDriverWait(driver, 15)

        try:
            driver.get(self.base_url)
            login_page_displayed = wait.until(EC.visibility_of_element_located((By.ID, "username")))
            self.log_step(
                1,
                "Open the application URL",
                "Login page is displayed correctly",
                "Login page displayed correctly" if login_page_displayed else "Login page not displayed",
                login_page_displayed is not None
            )

            username_input = driver.find_element(By.ID, "username")
            password_input = driver.find_element(By.ID, "password")

            username_input.send_keys(self.admin_username)
            password_input.send_keys(self.admin_password)

            credentials_entered = (username_input.get_attribute("value") == self.admin_username and
                                len(password_input.get_attribute("value")) > 0)

            self.log_step(
                2,
                "Enter valid admin username and password",
                f"Credentials entered: {self.admin_username}/YOUR_ADMIN_PASSWORD",
                "Credentials entered successfully" if credentials_entered else "Failed to enter credentials",
                credentials_entered
            )

            login_button = driver.find_element(By.CSS_SELECTOR, ".submit-button")
            login_button.click()

            try:
                WebDriverWait(driver, 10).until(
                    EC.url_contains("/dashboard")
                )

                login_success = True
                current_url = driver.current_url

                self.log_step(
                    3,
                    "Click the Login/Sign In button",
                    "Login is successful. User is navigated to the main dashboard",
                    f"User successfully navigated to {current_url}",
                    login_success
                )
            except:
                login_success = False
                self.log_step(
                    3,
                    "Click the Login/Sign In button",
                    "Login is successful. User is navigated to the main dashboard",
                    "Login failed or redirection did not occur",
                    False
                )
                raise Exception("Login failed")

            try:

                print("Navigating directly to sales-report page...")
                driver.get(self.base_url + "sales-report")


                reports_page_loaded = WebDriverWait(driver, 20).until(
                    EC.url_contains("/sales-report")
                )


                time.sleep(3)

                self.log_step(
                    4,
                    "Navigate to the Reports page",
                    "User is successfully navigated to the Reports page",
                    "Reports page loaded successfully" if reports_page_loaded else "Reports page did not load correctly",
                    reports_page_loaded
                )
            except Exception as e:
                self.log_step(
                    4,
                    "Navigate to the Reports page",
                    "User is successfully navigated to the Reports page",
                    f"Failed to navigate to Reports page: {str(e)}",
                    False
                )
                raise Exception("Failed to navigate to Reports page")


            try:

                report_header = wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'collapsible-report-header')]"))
                )
                report_header.click()


                collapsible_content = wait.until(
                    EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'collapsible-report-content') and contains(@class, 'open')]"))
                )

                header_clicked = collapsible_content is not None

                self.log_step(
                    5,
                    "Click on the Sales Report collapsible bar",
                    "Sales Report collapsible content expands to reveal export buttons",
                    "Sales Report bar was clicked and content expanded" if header_clicked else "Failed to expand Sales Report content",
                    header_clicked
                )
            except Exception as e:
                self.log_step(
                    5,
                    "Click on the Sales Report collapsible bar",
                    "Sales Report collapsible content expands to reveal export buttons",
                    f"Failed to expand Sales Report content: {str(e)}",
                    False
                )
                raise Exception("Failed to expand Sales Report content")


            try:
                excel_button = wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'collapsible-report-content') and contains(@class, 'open')]//button[contains(@class, 'excel-button') and contains(., 'Excel')]"))
                )

                excel_button_exists = excel_button is not None

                self.log_step(
                    6,
                    "Check if Excel export button exists",
                    "Excel export button is visible and clickable",
                    "Excel button found and is clickable" if excel_button_exists else "Excel button not found or not clickable",
                    excel_button_exists
                )
            except Exception as e:
                self.log_step(
                    6,
                    "Check if Excel export button exists",
                    "Excel export button is visible and clickable",
                    f"Excel button not found or not clickable: {str(e)}",
                    False
                )
                raise Exception("Excel export button not found")


            try:

                csv_files_before = len([f for f in os.listdir(self.download_dir) if f.endswith('.csv')])


                excel_button.click()


                time.sleep(3)


                max_wait_time = 10
                start_time = time.time()
                csv_downloaded = False

                while time.time() - start_time < max_wait_time:
                    csv_files_after = len([f for f in os.listdir(self.download_dir) if f.endswith('.csv')])
                    if csv_files_after > csv_files_before:
                        csv_downloaded = True
                        break
                    time.sleep(1)

                self.log_step(
                    7,
                    "Click the Excel export button",
                    "Excel export is initiated and file is downloaded",
                    "CSV file was successfully downloaded" if csv_downloaded else "CSV file was not downloaded",
                    csv_downloaded
                )
            except Exception as e:
                self.log_step(
                    7,
                    "Click the Excel export button",
                    "Excel export is initiated and file is downloaded",
                    f"Error occurred while trying to download CSV: {str(e)}",
                    False
                )
                raise Exception("Failed to download CSV file")


            print("\n=== TEST SUMMARY ===")
            all_steps_passed = all(step["success"] for step in self.test_log)
            print(f"Overall Test Result: {'PASSED' if all_steps_passed else 'FAILED'}")
            print("====================\n")

        except Exception as e:
            print(f"Test failed with exception: {str(e)}")
            raise

    def tearDown(self):
        """Clean up after each test"""
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
