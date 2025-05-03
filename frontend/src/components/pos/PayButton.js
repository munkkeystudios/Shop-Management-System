import { useState } from 'react';
import { Button, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { generateReceipt } from './generateReceipt';
import { salesAPI } from '../../services/api';
import '../styles/PayButton.css';

const PayButton = ({ cartItems, totalPayable, totalQuantity, billNumber, updateBillNumber, onPaymentComplete }) => {
  const [show, setShow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loanNumber, setLoanNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const GST = 0.10;
  const endPayment = Number((totalPayable + GST * totalPayable).toFixed(2));
  
  // Calculate change based on cash received
  const cashChange = cashReceived ? Number(cashReceived) - endPayment : 0;

  const handleClose = () => {
    setShow(false);
    setErrorMessage('');
    setValidationErrors({});
    setCashReceived('');
    setCardNumber('');
    setLoanNumber('');
  };
  
  const handleShow = () => setShow(true);

  // Validate form based on payment method
  const validateForm = () => {
    const errors = {};
    
    if (paymentMethod === 'cash') {
      if (!cashReceived || isNaN(cashReceived) || Number(cashReceived) <= 0) {
        errors.cashReceived = 'Please enter a valid amount received';
      } else if (Number(cashReceived) < endPayment) {
        errors.cashReceived = 'Cash received must be equal to or greater than the total amount';
      }
    } else if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
        errors.cardNumber = 'Please enter a valid card number (13-19 digits)';
      }
    } else if (paymentMethod === 'loan') {
      if (!loanNumber || loanNumber.trim() === '') {
        errors.loanNumber = 'Please enter a valid loan number';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update the handleTransaction function to correctly prepare receipt data
  const handleTransaction = async () => {
    try {
      // Validate form before proceeding
      if (!validateForm()) {
        return;
      }
      
      // Determine payment status based on payment method
      let paymentStatus = 'paid';
      if (paymentMethod === 'loan') {
        paymentStatus = 'due';
      }

      // Prepare the sale data
      const saleData = {
        billNumber: billNumber,
        customerName: 'Walk in Customer',
        customerPhone: 'N/A',
        items: cartItems.map((item) => {
          const discountRate = item.discount || 0;
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
        amountPaid: paymentMethod === 'cash' ? Number(cashReceived) : (paymentMethod === 'card' ? endPayment : 0),
        change: paymentMethod === 'cash' ? Math.max(0, Number(cashReceived) - endPayment) : 0,
        paymentStatus,
        notes: `Payment made via ${paymentMethod}. ${paymentMethod === 'loan' ? `Loan #${loanNumber}` : ''}`,
        loanNumber: paymentMethod === 'loan' ? loanNumber : null,
      };

      const response = await salesAPI.create(saleData);
      console.log('Sale created successfully:', response.data);
      
      if (response.data && response.data.data && response.data.data._id) {
        // Get the ID of the newly created sale
        const newSaleId = response.data.data._id;
        
        // Update the billNumber for the next transaction
        updateBillNumber(billNumber + 1);
        
        // Prepare receipt data with correct values for the generateReceipt function
        const receiptData = {
          billNumber: billNumber,
          customerName: 'Walk in Customer',
          warehouse: 'Main Warehouse',
          items: cartItems.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            amount: item.subtotal,
          })),
          subtotal: totalPayable,
          discount: 0,
          tax: Number((GST * totalPayable).toFixed(2)),
          total: endPayment,
          paymentMethod: paymentMethod === 'cash' ? 'Cash Payment' : 
                        (paymentMethod === 'card' ? 'Card/Debit Payment' : 'Loan Payment'),
          received: paymentMethod === 'cash' ? Number(cashReceived) : 
                  (paymentMethod === 'card' ? endPayment : 0),
          returned: paymentMethod === 'cash' ? Math.max(0, Number(cashReceived) - endPayment) : 0,
          paymentStatus: paymentStatus,
          date: new Date(),
        };
        
        generateReceipt(receiptData);
        
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
      
      // More helpful error messages based on error type
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage('Invalid transaction data. Please check all fields and try again.');
        } else if (error.response.status === 404) {
          setErrorMessage('Resource not found. Please check if loan/customer exists in the system.');
        } else if (error.response.status === 500) {
          setErrorMessage('Server error occurred. Please try again or contact support.');
        } else {
          setErrorMessage(`Error: ${error.response.data.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        setErrorMessage('Network error. Please check your connection and try again.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <>
      <Button variant="success" onClick={handleShow}>
        Pay now
      </Button>

      <Modal show={show} onHide={() => { setPaymentMethod('cash'); handleClose(); }} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Complete Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && (
            <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
              {errorMessage}
            </Alert>
          )}
          
          {/* Side-by-side layout container */}
          <div className="payment-layout">
            {/* Left column - Payment methods */}
            <div className="payment-layout-left">
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

                {/* Cash payment input section */}
                {paymentMethod === 'cash' && (
                  <div className="payment-input-section">
                    <h5>Cash Details</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Cash Received</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="Enter amount received"
                        value={cashReceived}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCashReceived(value);
                        }}
                        isInvalid={!!validationErrors.cashReceived}
                        className="no-spinner"
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.cashReceived}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    {/* Cash change box - always visible and updated properly */}
                    <Form.Group className="mb-3">
                      <Form.Label>Cash to Return</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={cashReceived && !isNaN(cashReceived) && Number(cashReceived) > 0
                          ? `$${Math.max(0, (Number(cashReceived) - endPayment)).toFixed(2)}` 
                          : '$0.00'}
                        readOnly
                        className="change-display"
                      />
                    </Form.Group>
                  </div>
                )}

                {/* Card payment input section */}
                {paymentMethod === 'card' && (
                  <div className="payment-input-section">
                    <h5>Card Details</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Card Number</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Enter card number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        isInvalid={!!validationErrors.cardNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.cardNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Row className="mb-3">
                      <Col>
                        <Form.Group>
                          <Form.Label>Expiry Date</Form.Label>
                          <Form.Control type="text" placeholder="MM/YY" />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group>
                          <Form.Label>CVV</Form.Label>
                          <Form.Control type="text" placeholder="CVV" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Loan payment input section */}
                {paymentMethod === 'loan' && (
                  <div className="payment-input-section">
                    <h5>Loan Information</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Loan Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Loan Number"
                        value={loanNumber}
                        onChange={(e) => setLoanNumber(e.target.value)}
                        isInvalid={!!validationErrors.loanNumber}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.loanNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right column - Order details */}
            <div className="payment-layout-right">
              <div className="order-details">
                <h5>Order Details</h5>
                <Row className="order-details-row">
                  <Col>Total Products</Col>
                  <Col className="text-end">{totalQuantity}</Col>
                </Row>
                <Row className="order-details-row">
                  <Col>Subtotal</Col>
                  <Col className="text-end">${totalPayable.toFixed(2)}</Col>
                </Row>
                <Row className="order-details-row">
                  <Col>GST (10%)</Col>
                  <Col className="text-end">${(GST * totalPayable).toFixed(2)}</Col>
                </Row>
                <Row className="order-details-row">
                  <Col>Discount</Col>
                  <Col className="text-end">$0.00</Col>
                </Row>
                <Row className="order-details-row order-details-total">
                  <Col>Total Payable</Col>
                  <Col className="text-end">${endPayment.toFixed(2)}</Col>
                </Row>
              </div>
            </div>
          </div>

          <div className="payment-summary">
            <h5 className="payment-total">Total Payable: ${endPayment.toFixed(2)}</h5>
            <Button 
              variant="success" 
              onClick={handleTransaction}
              disabled={
                (paymentMethod === 'cash' && (!cashReceived || Number(cashReceived) < endPayment)) ||
                (paymentMethod === 'card' && (!cardNumber || cardNumber.length < 13)) ||
                (paymentMethod === 'loan' && !loanNumber)
              }
            >
              Complete Payment
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PayButton;