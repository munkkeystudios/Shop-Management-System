import { useState } from 'react';
import { Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { generateReceipt } from './generateReceipt';
import { salesAPI, loansAPI } from '../../services/api';

const PayButton = ({ cartItems, totalPayable, totalQuantity, billNumber, updateBillNumber, onSaleCreated }) => {
  const [show, setShow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // default is always cash
  const [loanNumber, setLoanNumber] = useState(''); // state for loan number
  const [errorMessage, setErrorMessage] = useState(''); // state for error messages

  // global sales tax
  const GST = 0.10;
  const endPayment = Number((totalPayable + GST * totalPayable).toFixed(2));

  const handleClose = () => {
    setShow(false);
    setErrorMessage(''); // Clear error messages when modal is closed
  };
  const handleShow = () => setShow(true);

  const handleTransaction = async () => {
    try {
      // Determine the payment status based on the payment method
      const paymentStatus = paymentMethod === 'loan' ? 'pending' : 'paid';

      // If payment method is loan, validate and update the loan
      if (paymentMethod === 'loan') {
        if (!loanNumber) {
          setErrorMessage('Please enter a loan number.');
          return;
        }

        // Validate loan number with the backend
        const loanResponse = await loansAPI.validateLoan(loanNumber);
        if (!loanResponse.data.valid) {
          setErrorMessage('Invalid loan number. Please try again.');
          return;
        }

        // Extract the loan ID from the response
        const loanId = loanResponse.data.loan._id; // Correctly access the loan ID
        console.log('Loan ID:', loanId);

        // Add loan items and update loan repayment
        const loanItems = cartItems.map((item) => ({
          product: item.id, // Use the product ID
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        }));

        const loanUpdateResponse = await loansAPI.addItems(loanId, loanItems);
        console.log('Loan updated successfully:', loanUpdateResponse.data);
      }

      // Prepare the sale data
      const saleData = {
        billNumber: billNumber,
        customerName: 'Walk in Customer',
        customerPhone: 'N/A',
        items: cartItems.map((item) => {
          const discountRate = item.discount || 0; // Default discount is 0 if not provided
          const effectivePrice = item.price * (1 - discountRate / 100); // Calculate effective price

          return {
            product: item.id, // Use the product ID
            quantity: item.quantity,
            price: item.price, // Include the price of the item
            effectivePrice: Number(effectivePrice.toFixed(2)), // Include the effective price
            subtotal: item.subtotal, // Include the subtotal of the item
          };
        }),
        subtotal: totalPayable,
        discount: 0,
        tax: Number((GST * totalPayable).toFixed(2)),
        total: endPayment,
        paymentMethod,
        amountPaid: paymentMethod === 'loan' ? 0 : endPayment, // If loan, no payment is made upfront
        change: paymentMethod === 'loan' ? 0 : endPayment - totalPayable, // No change for loan payments
        paymentStatus, // Set payment status based on payment method
        notes: 'Thank you for your purchase!',
      };

      // Create the sale via the API
      const response = await salesAPI.create(saleData);
      console.log('Sale created successfully:', response.data);

      // Update the billNumber for the next transaction
      updateBillNumber(billNumber + 1); // Increment the billNumber

      // Call the onSaleCreated callback to refresh the sales table
      if (onSaleCreated) {
        onSaleCreated();
      }

      // Generate the receipt
      generateReceipt({
        ...saleData,
        items: cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          amount: item.subtotal,
        })),
        date: new Date(),
      });

      handleClose();
    } catch (error) {
      console.error('Error during transaction:', error.response?.data?.message || error.message);
      setErrorMessage('An error occurred during the transaction. Please try again.');
    }
  };

  return (
    <>
      <Button variant="success" onClick={handleShow}>
        Pay now
      </Button>

      <Modal show={show} onHide={() => { setPaymentMethod('cash'); handleClose(); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Complete Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && (
            <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
              {errorMessage}
            </Alert>
          )}
          <div className="mb-4">
            <h5>Choose Payment Method</h5>
            <Form>
              <Form.Group>
                <Form.Check
                  type="radio"
                  name="paymentMethod"
                  id="cashPayment"
                  label="Cash Payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  name="paymentMethod"
                  id="cardDebit"
                  label="Card/Debit"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  name="paymentMethod"
                  id="loanPayment"
                  label="Loan Payment"
                  value="loan"
                  checked={paymentMethod === 'loan'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </Form.Group>
            </Form>
          </div>

          {paymentMethod === 'card' && (
            <div className="mb-4">
              <h5>Invoice Number</h5>
              <Form.Control type="text" placeholder="Enter Invoice Number" />
            </div>
          )}

          {paymentMethod === 'loan' && (
            <div className="mb-4">
              <h5>Loan Number</h5>
              <Form.Control
                type="text"
                placeholder="Enter Loan Number - test with 1, 2, 3"
                value={loanNumber}
                onChange={(e) => setLoanNumber(e.target.value)}
              />
            </div>
          )}

          <div className="order-details mb-4">
            <h5>Order Details</h5>
            <Row className="mb-2">
              <Col>Total Products</Col>
              <Col className="text-end">{totalQuantity}</Col>
            </Row>
            <Row className="mb-2">
              <Col>GST</Col>
              <Col className="text-end">10%</Col>
            </Row>
            <Row className="mb-2">
              <Col>Discount</Col>
              <Col className="text-end">0</Col>
            </Row>
            <Row className="mb-2 fw-bold">
              <Col>Total Payable</Col>
              <Col className="text-end">${totalPayable}</Col>
            </Row>
          </div>

          <div className="bg-light p-3 rounded d-flex justify-content-between align-items-center">
            <h5 className="m-0 text-success">Total Payable: ${endPayment}</h5>
            <Button variant="success" onClick={handleTransaction}>
              Complete Transaction
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PayButton;
