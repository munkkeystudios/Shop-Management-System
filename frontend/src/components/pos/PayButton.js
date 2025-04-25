import { useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { generateReceipt } from './generateReceipt';
import { salesAPI, loansAPI } from '../../services/api'; // Use the salesAPI for creating a sale and loansAPI for loan-related API calls

const PayButton = ({ cartItems, totalPayable, totalQuantity, billNumber, updateBillNumber, onSaleCreated }) => {
  const [show, setShow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // default is always cash
  const [loanNumber, setLoanNumber] = useState(''); // state for loan number

  // global sales tax
  const GST = 0.10;
  const endPayment = Number((totalPayable + GST * totalPayable).toFixed(2));

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handlePrintReceipt = async () => {
    try {
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
        amountPaid: endPayment,
        change: 0,
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
      console.error('Error during checkout:', error.response?.data?.message || error.message);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'loan') {
      if (!loanNumber) {
        alert('Please enter a loan number.');
        return;
      }
  
      try {
        // Validate loan number with the backend
        const loanResponse = await loansAPI.validateLoan(loanNumber);
        if (!loanResponse.data.valid) {
          alert('Invalid loan number. Please try again.');
          return;
        }
      } catch (error) {
        console.error('Error validating loan:', error);
        alert('An error occurred while validating the loan. Please try again.');
        return;
      }
    }
  
    // Proceed to generate the receipt
    const transactionData = {
      billNumber,
      tokenType: 'Credit',
      customerName: 'Walk in Customer',
      warehouse: 'WH Multan',
      items: cartItems,
      subtotal: totalPayable,
      discount: 0,
      tax: 0,
      total: totalPayable,
      paymentMethod,
      received: totalPayable,
      returned: 0,
      date: new Date(),
      loanNumber,
    };
  
    generateReceipt(transactionData);
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
            <Button variant="success" onClick={handlePrintReceipt}>
              Print Receipt
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PayButton;
