# Sales Report Export Tests

This directory contains automated tests for the Sales Report Excel and PDF export functionality.

## Test Cases

### Excel Export Tests
- Test that the Excel export button exists and is clickable
- Test Excel export functionality without any date filters
- Test Excel export functionality with date filters applied
- Test Excel export functionality with search filter applied
- Test error handling during Excel export

### PDF Export Tests
- Test that the PDF export button exists and is clickable
- Test PDF export functionality without any date filters
- Test PDF export functionality with date filters applied
- Test PDF export functionality with search filter applied
- Test error handling during PDF export
- Test that the PDF content matches the displayed data in the UI

## Setup Instructions

1. Install Python 3.8 or higher
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Make sure you have Chrome browser installed
4. Update the base URL in the test files if your application is not running on http://localhost:3000
5. Update the login credentials in the test files to match your test environment

## Running the Tests

To run all tests:
```
python run_sales_report_tests.py
```

To run only Excel export tests:
```
python -m unittest test_sales_report_excel.py
```

To run only PDF export tests:
```
python -m unittest test_sales_report_pdf.py
```

## Test Reports

Test reports are generated in the `reports` directory with a timestamp in the filename.

## Troubleshooting

- If you encounter issues with ChromeDriver, try updating to the latest version:
  ```
  pip install --upgrade webdriver-manager
  ```

- If the tests fail to find elements, check if the class names or XPaths have changed in the application.

- For headless execution (no browser UI), uncomment the `chrome_options.add_argument("--headless")` line in the test files.

## Notes

- These tests are designed to run against a test environment with sample data.
- The tests assume that the application is already running and accessible.
- The tests create a `downloads` directory in the current working directory to store downloaded files.
- The tests clean up downloaded files after each test case.
