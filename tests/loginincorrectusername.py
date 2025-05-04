import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class NonExistentUserLoginTest(unittest.TestCase):
    """Test case for validating login behavior with non-existent username"""
    
    def setUp(self):
        """Set up the test environment before each test"""
        # Setup Chrome options
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        # chrome_options.add_argument("--headless")  # Uncomment for headless mode
        
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        self.driver.implicitly_wait(10)
        
        self.base_url = "https://shop-management-system-k59j.onrender.com"
        
        self.nonexistent_username = "NonExistentUser"
        self.any_password = "AnyPassword"
        
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
    
    def test_nonexistent_user_login(self):
        """
        Test Case: Login with Username That Does Not Exist
        
        Description: Test the system's response when a username that does not exist 
        in the database is used for login.
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
            username_input.clear()
            username_input.send_keys(self.nonexistent_username)
            
            username_entered = username_input.get_attribute("value") == self.nonexistent_username
            
            self.log_step(
                2, 
                "Enter a non-existent username",
                "Username entered",
                f"Username '{self.nonexistent_username}' entered successfully" if username_entered 
                else f"Failed to enter username '{self.nonexistent_username}'",
                username_entered
            )
            
            password_input = driver.find_element(By.ID, "password")
            password_input.clear()
            password_input.send_keys(self.any_password)
            
            password_entered = len(password_input.get_attribute("value")) > 0
            
            self.log_step(
                3, 
                "Enter any password",
                "Password entered",
                "Password entered successfully" if password_entered else "Failed to enter password",
                password_entered
            )
            
           
            
            login_button = driver.find_element(By.CSS_SELECTOR, ".submit-button")
            login_button.click()
            
            
            try:
                error_message = WebDriverWait(driver, 5).until(
                    EC.visibility_of_element_located((By.CSS_SELECTOR, ".error-message"))
                )
                error_text = error_message.text
                
                # Also verify we're still on login page
                still_on_login = driver.current_url.endswith('/login') or driver.current_url == self.base_url
                
               
                
                login_failed_correctly = error_text and "invalid" in error_text.lower() and still_on_login
                
                self.log_step(
                    4, 
                    "Click the Login/Sign In button",
                    "Login fails. An error message like 'Invalid username or password' is displayed. User remains on login page.",
                    f"Error message displayed: '{error_text}'. Still on login page: {still_on_login}",
                    login_failed_correctly
                )
            except:
                current_url = driver.current_url
                still_on_login = current_url.endswith('/login') or current_url == self.base_url
                
                if still_on_login:
                    page_source = driver.page_source.lower()
                    has_error_text = "invalid" in page_source or "incorrect" in page_source or "fail" in page_source
                    
                    self.log_step(
                        4, 
                        "Click the Login/Sign In button",
                        "Login fails. An error message is displayed. User remains on login page.",
                        f"Still on login page: {still_on_login}. Error text found in page: {has_error_text}",
                        still_on_login and has_error_text
                    )
                else:
                    self.log_step(
                        4, 
                        "Click the Login/Sign In button",
                        "Login fails. An error message is displayed. User remains on login page.",
                        f"Unexpected redirect to: {current_url}",
                        False
                    )
                
                
            
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