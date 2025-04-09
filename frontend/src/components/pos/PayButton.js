import { useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { generateReceipt } from './generateReceipt';

// the content of the Modal is mostly bootstrap because i plan on changing it in the future.


const PayButton = ({ cartItems, totalPayable, totalQuantity }) => {
  const [show, setShow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // default is always cash
  const [billNumber, setBillNumber] = useState('12336'); // TODO: bill Number needs to update
  
  // global sales tax
  const GST = 0.10
  const endPayment = Number((totalPayable + (GST * totalPayable)).toFixed(2));
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handlePrintReceipt = () => {
    
    // TODO: improve the code below, its just me adding things to the handle
    const transactionData = {
      receiptNumber: billNumber,
      customerName: 'Walk in Customer',
      warehouse: 'WH Lahore',
      items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        amount: item.subtotal  //TODO: change attribute of subtotal eventually
      })),
      subtotal: totalPayable,
      discount: 0, // values is hard coded for now
      gst: Number((GST*totalPayable).toFixed(2)),
      total: endPayment,
      paymentMethod: paymentMethod,
      received: '-', // values is hard coded for now
      returned: '-', // values is hard coded for now
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
            <h5 className="m-0 text-success">Total Payable: ${endPayment}</h5>
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
