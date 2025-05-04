import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


class ShopManagementPOSTest(unittest.TestCase):
    def setUp(self):
        # Setup Chrome options
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        # Uncomment the line below if you want to run in headless mode
        # chrome_options.add_argument("--headless")
        
        # Initialize the Chrome driver
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        self.driver.implicitly_wait(10)  # Set implicit wait time
        
        # Base URL
        self.base_url = "https://shop-management-system-k59j.onrender.com"
        
        # Login to the system
        self.login()
        
    def login(self):
        """Login to the system before testing POS"""
        self.driver.get(f"{self.base_url}/login")
        
        # Wait for login page to load
        WebDriverWait(self.driver, 20).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        
        # Enter credentials - using admin123 and YOUR_ADMIN_PASSWORD
        self.driver.find_element(By.ID, "username").send_keys("admin123")
        self.driver.find_element(By.ID, "password").send_keys("YOUR_ADMIN_PASSWORD")
        
        # Click login button
        self.driver.find_element(By.CSS_SELECTOR, ".submit-button").click()
        
        # Wait for dashboard to load
        WebDriverWait(self.driver, 30).until(
            EC.url_contains("/dashboard")
        )
        
        # Navigate to POS page
        self.driver.get(f"{self.base_url}/pos")
        
        # Wait for POS page to load
        WebDriverWait(self.driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".pos-search-input"))
        )
        print("Successfully logged in and navigated to POS page")
        
    def test_loan_payment_validation(self):
        """Test loan payment validation in POS system"""
        print("Starting loan payment validation test...")
        
        # Search for 'black shirt'
        search_input = self.driver.find_element(By.CSS_SELECTOR, ".pos-search-input")
        search_input.clear()
        search_input.send_keys("black shirt")
        
        search_button = self.driver.find_element(By.CSS_SELECTOR, ".pos-search-icon")
        search_button.click()
        
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".pos-search-results"))
        )
        
        search_results = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".pos-product-item"))
        )
        search_results.click()
        
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".cart-item-row"))
        )
        print("Successfully added Black Shirt to cart")
        
        pay_button = self.driver.find_element(By.CSS_SELECTOR, "button.btn-success")
        pay_button.click()
        
        # Wait for payment modal to open
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".modal-content"))
        )
        print("Payment modal opened successfully")
        
     
        loan_radio = self.driver.find_element(By.ID, "loanPayment")
        loan_radio.click()
        time.sleep(1) 
        
        complete_button = self.driver.find_element(By.CSS_SELECTOR, ".payment-summary .btn-success")
        
        self.assertTrue(complete_button.get_attribute("disabled"), 
                       "Complete payment button should be disabled without loan number")
        print("Test 1 passed: Button disabled without loan number")
        
        
        loan_input = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter Loan Number']")
        loan_input.clear()
        loan_input.send_keys("10")
        
        self.assertFalse(complete_button.get_attribute("disabled"), 
                        "Complete payment button should be enabled with loan number")
        print("Test 2 passed: Button enabled with loan number")
        
        
        complete_button.click()
        
        try:
            WebDriverWait(self.driver, 15).until(
                EC.invisibility_of_element_located((By.CSS_SELECTOR, ".modal-content"))
            )
            print("Test 3 passed: Payment completed successfully with loan number")
        except Exception as e:
            error_elements = self.driver.find_elements(By.CSS_SELECTOR, ".alert-danger")
            if error_elements:
                print(f"Payment error: {error_elements[0].text}")
            else:
                print(f"Payment didn't complete: {str(e)}")
            self.fail("Payment process failed")
        
        try:
            empty_cart_message = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".empty-cart"))
            )
            self.assertIn("No products added yet", empty_cart_message.text)
            print("Cart was reset after payment")
        except:
            self.fail("Cart was not reset after payment")
            
    def tearDown(self):
        """Close the browser after tests"""
        self.driver.quit()


if __name__ == "__main__":
    unittest.main()