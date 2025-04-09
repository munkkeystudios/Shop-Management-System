import { useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { generateReceipt } from './generateReceipt';

// the content of the Modal is mostly bootstrap because i plan on changing it in the future.


const PayButton = ({ cartItems, totalPayable, totalQuantity }) => {
  const [show, setShow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // default is always cash

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handlePrintReceipt = () => {
    
    const transactionData = {
      receiptNumber: '12336',
      tokenType: 'Credit',
      customerName: 'Walk in Customer',
      warehouse: 'WH Multan',
      items: [
        { name: 'Baggy Pants Zara Men', price: 1200, quantity: 1, amount: 1200 },
        { name: 'Zara Men', price: 1200, quantity: 1, amount: 1200 },
        { name: 'Zara Baby Suit', price: 1200, quantity: 1, amount: 1200 },
        { name: 'Jacket', price: 400, quantity: 1, amount: 400 }
      ],
      subtotal: 4000,
      discount: 0,
      gst: 2000,
      total: 6000,
      paymentMethod: 'Cash Payment',
      received: 10000,
      returned: 4000,
      date: new Date()
    };
    
    // Generate and download receipt
    generateReceipt(transactionData);
    
    handleClose();
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
              </Form.Group>
            </Form>
          </div>

          {paymentMethod === 'card' && (
            <div className="mb-4">
              <h5>Invoice Number</h5>
              <Form.Control
                type="text"
                placeholder="Enter Invoice Number"
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
              {/* TODO: hard coded for now change this later */}
              <Col className="text-end">10%</Col> 
            </Row>
            <Row className="mb-2">
              <Col>Discount</Col>
              {/* TODO: hard coded for now change this later */}
              <Col className="text-end">0</Col>
            </Row>
            <Row className="mb-2 fw-bold">
              <Col>Total Payable</Col>
              <Col className="text-end">${totalPayable}</Col>
            </Row>
          </div>

          <div className="bg-light p-3 rounded d-flex justify-content-between align-items-center">
            <h5 className="m-0 text-success">Total Payable: ${totalPayable}</h5>
            <Button variant="success" onClick={handlePrintReceipt}>
              Print Receipt
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PayButton;
