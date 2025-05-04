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
        
        WebDriverWait(self.driver, 20).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        
        self.driver.find_element(By.ID, "username").send_keys("admin123")
        self.driver.find_element(By.ID, "password").send_keys("YOUR_ADMIN_PASSWORD")
        
        self.driver.find_element(By.CSS_SELECTOR, ".submit-button").click()
        
        WebDriverWait(self.driver, 30).until(
            EC.url_contains("/dashboard")
        )
        
        self.driver.get(f"{self.base_url}/pos")
        
        WebDriverWait(self.driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".pos-search-input"))
        )
        print("Successfully logged in and navigated to POS page")
        
    def test_cash_payment_validation(self):
        """Test cash payment validation in POS system"""
        print("Starting cash payment validation test...")
        
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
        
        subtotal_element = self.driver.find_element(By.CSS_SELECTOR, ".pos-pay-value")
        subtotal_text = subtotal_element.text
        subtotal = float(subtotal_text.replace("Total Payable: $", ""))
        print(f"Subtotal amount: ${subtotal}")
        
        GST = 0.10
        total_with_gst = round(subtotal * (1 + GST), 2)
        print(f"Total with GST: ${total_with_gst}")
        
        pay_button = self.driver.find_element(By.CSS_SELECTOR, "button.btn-success")
        pay_button.click()
        
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".modal-content"))
        )
        print("Payment modal opened successfully")
        
        modal_total_text = self.driver.find_element(By.CSS_SELECTOR, ".payment-total").text
        modal_total = float(modal_total_text.replace("Total Payable: $", ""))
        
        self.assertAlmostEqual(modal_total, total_with_gst, places=2,
                              msg=f"Modal total ${modal_total} should match calculated total ${total_with_gst}")
        print(f"Verified modal total matches calculated total with GST: ${modal_total}")
        
        cash_radio = self.driver.find_element(By.ID, "cashPayment")
        if not cash_radio.is_selected():
            cash_radio.click()
        time.sleep(1)
        
        complete_button = self.driver.find_element(By.CSS_SELECTOR, ".payment-summary .btn-success")
        self.assertTrue(complete_button.get_attribute("disabled"), 
                       "Complete payment button should be disabled without cash amount")
        print("Test 1 passed: Button disabled without cash amount")
        
        cash_input = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder='Enter amount received']")
        cash_input.clear()
        cash_input.send_keys(str(total_with_gst - 5))  # Enter insufficient amount
        time.sleep(1)
        
        self.assertTrue(complete_button.get_attribute("disabled"), 
                        "Complete payment button should be disabled with insufficient cash")
        print(f"Test 2 passed: Button disabled with insufficient cash (${total_with_gst - 5})")
        
        cash_input.clear()
        cash_input.send_keys("1000")  # Enter $1000
        time.sleep(1)
        
        self.assertFalse(complete_button.get_attribute("disabled"), 
                        "Complete payment button should be enabled with sufficient cash")
        print("Test 3 passed: Button enabled with $1000 cash")
        
        change_display = self.driver.find_element(By.CSS_SELECTOR, ".change-display")
        change_value = change_display.get_attribute("value").replace("$", "")
        expected_change = 1000 - total_with_gst
        
        self.assertAlmostEqual(float(change_value), expected_change, places=2, 
                              msg=f"Change should be ${expected_change:.2f}, but got ${change_value}")
        print(f"Test 4 passed: Change calculated correctly as ${change_value}")
        
        complete_button.click()
        
        try:
            WebDriverWait(self.driver, 15).until(
                EC.invisibility_of_element_located((By.CSS_SELECTOR, ".modal-content"))
            )
            print("Test 5 passed: Payment completed successfully with cash payment")
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
            self.assertIn("No products", empty_cart_message.text)
            print("Test 6 passed: Cart was reset after payment")
        except Exception as e:
            self.fail(f"Cart was not reset after payment: {str(e)}")
            
    def tearDown(self):
        """Close the browser after tests"""
        self.driver.quit()


if __name__ == "__main__":
    unittest.main()