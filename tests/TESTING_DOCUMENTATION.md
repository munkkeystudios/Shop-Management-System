# Sales Report Export Automated Testing Documentation

## Overview

This document provides comprehensive documentation for the automated testing of the Sales Report Excel and PDF export functionality in the Shop Management System. The tests are designed to validate that users can successfully export sales data in both Excel (CSV) and PDF formats with various filtering options.

## Test Strategy

### Scope

The automated tests focus on the following aspects of the Sales Report export functionality:

1. **UI Validation**: Verifying that export buttons exist and are clickable
2. **Functionality**: Testing the core export functionality for both Excel and PDF formats
3. **Data Integrity**: Ensuring that exported files contain the correct data
4. **Filter Integration**: Validating that date filters and search filters affect the exported data
5. **Error Handling**: Testing how the application handles error scenarios

### Test Environment

- **Browser**: Google Chrome (latest version)
- **Testing Framework**: Python unittest
- **Automation Tool**: Selenium WebDriver
- **PDF Validation**: PyPDF2 library
- **Operating System**: Cross-platform (Windows, macOS, Linux)

### Test Data Requirements

The tests assume the following test data is available in the system:
- Multiple sales records spanning different dates
- Sales with different payment methods (cash, card, loan)
- Sales with different payment statuses (paid, unpaid, pending)
- At least some sales with "Walk in Customer" as the customer name

## Test Cases

### Excel Export Tests

| Test ID | Test Name | Description | Expected Result |
|---------|-----------|-------------|-----------------|
| E1 | test_excel_button_exists | Verify that the Excel export button exists and is clickable | Button is present and enabled |
| E2 | test_excel_export_no_filters | Test Excel export functionality without any date filters | CSV file is downloaded with correct format and content |
| E3 | test_excel_export_with_date_filters | Test Excel export functionality with date filters applied | CSV file is downloaded with data filtered by date range |
| E4 | test_excel_export_with_search_filter | Test Excel export functionality with search filter applied | CSV file is downloaded with data filtered by search term |
| E5 | test_excel_export_error_handling | Test error handling during Excel export | Application displays error message or disables button |

### PDF Export Tests

| Test ID | Test Name | Description | Expected Result |
|---------|-----------|-------------|-----------------|
| P1 | test_pdf_button_exists | Verify that the PDF export button exists and is clickable | Button is present and enabled |
| P2 | test_pdf_export_no_filters | Test PDF export functionality without any date filters | PDF file is downloaded with correct format and content |
| P3 | test_pdf_export_with_date_filters | Test PDF export functionality with date filters applied | PDF file is downloaded with data filtered by date range |
| P4 | test_pdf_export_with_search_filter | Test PDF export functionality with search filter applied | PDF file is downloaded with data filtered by search term |
| P5 | test_pdf_export_error_handling | Test error handling during PDF export | Application displays error message or disables button |
| P6 | test_pdf_content_validation | Test that the PDF content matches the displayed data in the UI | PDF content matches UI data |

## Implementation Details

### Test Structure

The tests are organized into two main classes:
1. `TestSalesReportExcel` - Tests for Excel export functionality
2. `TestSalesReportPDF` - Tests for PDF export functionality

Each class follows this structure:
- `setUp()` - Prepares the test environment (browser, download directory)
- `login()` - Logs into the application
- `navigate_to_sales_report()` - Navigates to the Sales Report page
- Test methods - Individual test cases
- `tearDown()` - Cleans up after each test

### Key Components

1. **WebDriver Setup**:
   ```python
   chrome_options = Options()
   chrome_options.add_argument("--window-size=1920,1080")
   
   prefs = {
       "download.default_directory": self.download_dir,
       "download.prompt_for_download": False,
       "download.directory_upgrade": True,
       "safebrowsing.enabled": False,
       "plugins.always_open_pdf_externally": True  # For PDF tests
   }
   chrome_options.add_experimental_option("prefs", prefs)
   ```

2. **File Download Verification**:
   ```python
   download_complete = False
   start_time = time.time()
   while not download_complete and time.time() - start_time < 10:
       time.sleep(1)
       pdf_files = [f for f in os.listdir(self.download_dir) if f.endswith('.pdf')]
       if pdf_files:
           download_complete = True
   ```

3. **PDF Content Validation**:
   ```python
   with open(file_path, 'rb') as file:
       pdf_reader = PyPDF2.PdfReader(file)
       text = pdf_reader.pages[0].extract_text()
       self.assertIn("Sales Report", text)
   ```

4. **Error Simulation**:
   ```python
   self.driver.execute_script("window.navigator.onLine = false;")
   ```

## Test Execution

### Prerequisites

1. Python 3.8 or higher
2. Required Python packages:
   - selenium==4.10.0
   - webdriver-manager==3.8.6
   - PyPDF2==3.0.1
3. Chrome browser installed
4. Application running and accessible

### Running the Tests

To run all tests:
```
python run_sales_report_tests.py
```

To run specific test suites:
```
python -m unittest test_sales_report_excel.py
python -m unittest test_sales_report_pdf.py
```

### Test Reports

Test reports are generated in the `reports` directory with a timestamp in the filename. Each report includes:
- Test execution details
- Pass/fail status for each test
- Error messages for failed tests
- Summary statistics (total tests, failures, errors, success rate)

## Maintenance Considerations

### Potential Fragility Points

1. **Element Selectors**: If the UI structure changes, XPath or class name selectors may need to be updated
2. **Download Handling**: Browser download behavior may vary across versions
3. **PDF Structure**: If the PDF generation logic changes, content validation may need adjustment
4. **Network Simulation**: The network error simulation is simplified and may not work in all environments

### Recommended Maintenance Practices

1. Review and update tests after UI changes
2. Keep dependencies updated (Selenium, WebDriver, PyPDF2)
3. Run tests regularly as part of CI/CD pipeline
4. Update test data assumptions if the application's data model changes

## Conclusion

The automated tests for Sales Report export functionality provide comprehensive coverage of the core features and edge cases. They validate both the UI interaction and the correctness of the exported data, ensuring that users can reliably export sales data in their preferred format.

By automating these tests, we can:
1. Quickly detect regressions in export functionality
2. Ensure consistent behavior across different browsers and environments
3. Validate both the user interface and the generated files
4. Reduce manual testing effort for repetitive export scenarios
