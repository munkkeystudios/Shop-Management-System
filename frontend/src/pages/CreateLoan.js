import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { loansAPI } from '../services/api';
import Layout from '../components/Layout'; // Import the Layout component

const CreateLoan = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loanData = {
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
      },
      loanAmount,
      notes,
    };

    try {
      const response = await loansAPI.create(loanData);
      alert('Loan created successfully!');
      console.log('Loan created:', response.data);
      // Reset form fields
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerAddress('');
      setLoanAmount('');
      setNotes('');
    } catch (error) {
      console.error('Error creating loan:', error);
      alert('Failed to create loan. Please try again.');
    }
  };

  return (
    <Layout title="Create Loan">
      <Container>
        <h1 className="my-4">Create Loan</h1>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="loanAmount">
                <Form.Label>Loan Amount</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter Loan Amount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <h5 className="mt-4">Customer Details</h5>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="customerName">
                <Form.Label>Customer Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="customerEmail">
                <Form.Label>Customer Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Customer Email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="customerPhone">
                <Form.Label>Customer Phone</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Customer Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="customerAddress">
                <Form.Label>Customer Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Customer Address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="notes" className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter any additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Create Loan
          </Button>
        </Form>
      </Container>
    </Layout>
  );
};

export default CreateLoan;