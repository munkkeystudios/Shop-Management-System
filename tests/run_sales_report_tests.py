import unittest
import os
import sys
import time
from datetime import datetime

# Add the parent directory to the path so we can import the test modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the test modules
from tests.test_sales_report_excel import TestSalesReportExcel
from tests.test_sales_report_pdf import TestSalesReportPDF

def run_tests():
    """Run sales report export tests and generate a report."""
    # Create a test suite
    test_suite = unittest.TestSuite()

    # Add specific test methods to the suite
    test_suite.addTest(TestSalesReportExcel('test_excel_export'))
    test_suite.addTest(TestSalesReportPDF('test_pdf_export'))

    # Create a test runner
    runner = unittest.TextTestRunner(verbosity=2)

    # Create a directory for test reports
    reports_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")
    os.makedirs(reports_dir, exist_ok=True)

    # Generate a timestamp for the report file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = os.path.join(reports_dir, f"sales_report_tests_{timestamp}.txt")

    # Run the tests and capture the output
    print(f"Running sales report export tests...")
    print(f"Results will be saved to: {report_file}")

    start_time = time.time()

    with open(report_file, "w") as f:
        f.write(f"Sales Report Export Tests - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 80 + "\n\n")

        # Redirect stdout to the file
        original_stdout = sys.stdout
        sys.stdout = f

        # Run the tests
        result = runner.run(test_suite)

        # Restore stdout
        sys.stdout = original_stdout

        # Write summary to the file
        f.write("\n" + "=" * 80 + "\n")
        f.write(f"Test Summary:\n")
        f.write(f"  - Run time: {time.time() - start_time:.2f} seconds\n")
        f.write(f"  - Total tests: {result.testsRun}\n")
        f.write(f"  - Failures: {len(result.failures)}\n")
        f.write(f"  - Errors: {len(result.errors)}\n")
        f.write(f"  - Skipped: {len(result.skipped)}\n")
        f.write(f"  - Success rate: {(result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100:.2f}%\n")

    # Print summary to console
    print(f"\nTest Summary:")
    print(f"  - Run time: {time.time() - start_time:.2f} seconds")
    print(f"  - Total tests: {result.testsRun}")
    print(f"  - Failures: {len(result.failures)}")
    print(f"  - Errors: {len(result.errors)}")
    print(f"  - Skipped: {len(result.skipped)}")
    print(f"  - Success rate: {(result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100:.2f}%")

    # Return True if all tests passed, False otherwise
    return len(result.failures) == 0 and len(result.errors) == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
