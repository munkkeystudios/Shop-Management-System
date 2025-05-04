    import unittest
    import time
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from webdriver_manager.chrome import ChromeDriverManager

    class CashierAccessTest(unittest.TestCase):
        """Test case for validating cashier role permissions in Shop Management System"""
        
        def setUp(self):
            """Set up the test environment before each test"""
            chrome_options = Options()
            chrome_options.add_argument("--start-maximized")
            
            self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
            self.driver.implicitly_wait(10)
            
            self.base_url = "https://shop-management-system-k59j.onrender.com"
            
            self.cashier_username = "cashier123"
            self.cashier_password = "cashier123"
            
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
        
        def test_cashier_login_and_access(self):
            """
            Test Case: Valid Cashier Login and Access Check
            
            Description: Test whether a user with the 'cashier' role can successfully 
            log in and access cashier-specific areas (like POS) but not manager or 
            admin areas (like Create Product, Employee Management).
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
                
                username_input.send_keys(self.cashier_username)
                password_input.send_keys(self.cashier_password)
                
                credentials_entered = (username_input.get_attribute("value") == self.cashier_username and 
                                    len(password_input.get_attribute("value")) > 0)
                
                self.log_step(
                    2, 
                    "Enter valid cashier username and password",
                    f"Credentials entered: {self.cashier_username}/cashier123",
                    "Credentials entered successfully" if credentials_entered else "Failed to enter credentials",
                    credentials_entered
                )
                
                login_button = driver.find_element(By.CSS_SELECTOR, ".submit-button")
                login_button.click()
                
                try:
                    dashboard_loaded = WebDriverWait(driver, 10).until(
                        EC.any_of(
                            EC.url_contains("/dashboard"),
                            EC.url_contains("/pos")
                        )
                    )
                    
                    login_success = True
                    current_url = driver.current_url
                    
                    self.log_step(
                        3, 
                        "Click the Login/Sign In button",
                        "Login is successful. User is navigated to the main dashboard (or POS page depending on default config)",
                        f"User successfully navigated to {current_url}",
                        login_success
                    )
                except:
                    login_success = False
                    self.log_step(
                        3, 
                        "Click the Login/Sign In button",
                        "Login is successful. User is navigated to the main dashboard (or POS page)",
                        "Login failed or redirection did not occur",
                        False
                    )
                    raise Exception("Login failed")
                
            
                sidebar = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "sidebar-container")))
                
                dashboard_link_present = len(driver.find_elements(By.XPATH, "//a[contains(@href, '/dashboard')]")) > 0
                products_link_present = len(driver.find_elements(By.XPATH, "//div[contains(text(), 'Products')]")) > 0
                pos_link_present = len(driver.find_elements(By.XPATH, "//a[contains(@href, '/pos')]")) > 0
                
                create_product_absent = len(driver.find_elements(By.XPATH, "//div[contains(text(), 'Create Product')]")) == 0
                employee_mgmt_absent = len(driver.find_elements(By.XPATH, "//div[contains(text(), 'Employee Management')]")) == 0
                
                sidebar_check_passed = (dashboard_link_present and products_link_present and pos_link_present and 
                                    create_product_absent and employee_mgmt_absent)
                
                self.log_step(
                    4, 
                    "Check the sidebar navigation",
                    "Sidebar is visible. Contains 'Dashboard', 'Products'. Does not contain options like 'Employee Management'",
                    f"Dashboard link: {'Present' if dashboard_link_present else 'Missing'}, " +
                    f"Products link: {'Present' if products_link_present else 'Missing'}, " +
                    f"POS link: {'Present' if pos_link_present else 'Missing'}, " +
                    f"Create Product: {'Absent as expected' if create_product_absent else 'Present (ERROR)'}, " +
                    f"Employee Management: {'Absent as expected' if employee_mgmt_absent else 'Present (ERROR)'}",
                    sidebar_check_passed
                )
                
                pos_link = driver.find_element(By.XPATH, "//a[contains(@href, '/pos')]")
                pos_link.click()
                
                try:
                    pos_page_loaded = WebDriverWait(driver, 10).until(
                        EC.visibility_of_element_located((By.CSS_SELECTOR, ".pos-app-container"))
                    )
                    pos_title_present = len(driver.find_elements(By.XPATH, "//span[contains(text(), 'Point of Sale')]")) > 0
                    pos_nav_success = pos_page_loaded is not None and pos_title_present
                    
                    self.log_step(
                        5, 
                        "Click on the 'POS' sidebar option",
                        "User is successfully navigated to the Point of Sale page",
                        "POS page loaded successfully" if pos_nav_success else "POS page did not load correctly",
                        pos_nav_success
                    )
                except:
                    self.log_step(
                        5, 
                        "Click on the 'POS' sidebar option",
                        "User is successfully navigated to the Point of Sale page",
                        "Failed to navigate to POS page or POS page elements not found",
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