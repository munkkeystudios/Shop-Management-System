import { useState } from 'react';
import { Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { generateReceipt } from './generateReceipt';
import { salesAPI } from '../../services/api'; // Remove loansAPI if unused
import '../styles/PayButton.css'; // Import the CSS file

const PayButton = ({ cartItems, totalPayable, totalQuantity, billNumber, updateBillNumber, onPaymentComplete }) => {
  const [show, setShow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // default is always cash
  const [loanNumber, setLoanNumber] = useState(''); 
  const [errorMessage, setErrorMessage] = useState(''); 

  const GST = 0.10;
  const endPayment = Number((totalPayable + GST * totalPayable).toFixed(2));

  const handleClose = () => {
    setShow(false);
    setErrorMessage(''); 
  };
  const handleShow = () => setShow(true);

  const handleTransaction = async () => {
    try {
      // Determine the payment status based on the payment method
      const paymentStatus = paymentMethod === 'loan' ? 'pending' : 'paid';

      // Prepare the sale data
      const saleData = {
        billNumber: billNumber,
        customerName: 'Walk in Customer',
        customerPhone: 'N/A',
        items: cartItems.map((item) => {
          const discountRate = item.discount || 0; // Default discount is 0 if not provided
          const effectivePrice = item.price * (1 - discountRate / 100); 

          return {
            product: item.id, 
            quantity: item.quantity,
            price: item.price, 
            effectivePrice: Number(effectivePrice.toFixed(2)), 
            subtotal: item.subtotal, 
          };
        }),
        subtotal: totalPayable,
        discount: 0,
        tax: Number((GST * totalPayable).toFixed(2)),
        total: endPayment,
        paymentMethod,
        amountPaid: paymentMethod === 'loan' ? 0 : endPayment, 
        change: paymentMethod === 'loan' ? 0 : endPayment - totalPayable, 
        paymentStatus, 
        notes: 'Thank you for your purchase!',
        loanNumber: paymentMethod === 'loan' ? loanNumber : null, // Include loanNumber if payment method is loan
      };

      const response = await salesAPI.create(saleData);
      console.log('Sale created successfully:', response.data);
      
      if (response.data && response.data.data && response.data.data._id) {
        // Get the ID of the newly created sale
        const newSaleId = response.data.data._id;
        
        // Update the billNumber for the next transaction
        // This sets up the next bill number but doesn't change the active tab yet
        updateBillNumber(billNumber + 1);
        
        // Generate receipt and other existing functionality...
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
        
        // Call onPaymentComplete with the new sale ID
        if (onPaymentComplete) {
          onPaymentComplete(newSaleId);
        }
        
        handleClose();
      } else {
        console.error('Sale created but no ID returned:', response.data);
        setErrorMessage('Transaction completed but sale tracking failed. Please check sales history.');
      }
    } catch (error) {
      console.error('Error during transaction:', error);
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
          <div className="payment-method-section">
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
            <div className="payment-input-section">
              <h5>Invoice Number</h5>
              <Form.Control type="text" placeholder="Enter Invoice Number" />
            </div>
          )}

          {paymentMethod === 'loan' && (
            <div className="payment-input-section">
              <h5>Loan Number</h5>
              <Form.Control
                type="text"
                placeholder="Enter Loan Number - test with 1, 2, 3"
                value={loanNumber}
                onChange={(e) => setLoanNumber(e.target.value)}
              />
            </div>
          )}

          <div className="order-details">
            <h5>Order Details</h5>
            <Row className="order-details-row">
              <Col>Total Products</Col>
              <Col className="text-end">{totalQuantity}</Col>
            </Row>
            <Row className="order-details-row">
              <Col>GST</Col>
              <Col className="text-end">10%</Col>
            </Row>
            <Row className="order-details-row">
              <Col>Discount</Col>
              <Col className="text-end">0</Col>
            </Row>
            <Row className="order-details-row order-details-total">
              <Col>Total Payable</Col>
              <Col className="text-end">${totalPayable}</Col>
            </Row>
          </div>

          <div className="payment-summary">
            <h5 className="payment-total">Total Payable: ${endPayment}</h5>
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
