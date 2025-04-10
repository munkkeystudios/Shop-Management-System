import { useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { generateReceipt } from './generateReceipt';
import { salesAPI } from '../../services/api'; // Use the salesAPI for creating a sale

// the content of the Modal is mostly bootstrap because i plan on changing it in the future.

const PayButton = ({ cartItems, totalPayable, totalQuantity, billNumber, updateBillNumber }) => {
  const [show, setShow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // default is always cash

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
        items: cartItems.map((item) => ({
          product: item.id, // Use the product ID
          quantity: item.quantity,
          price: item.price, // Include the price of the item
          subtotal: item.subtotal, // Include the subtotal of the item
        })),
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
              <Form.Control type="text" placeholder="Enter Invoice Number" />
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
