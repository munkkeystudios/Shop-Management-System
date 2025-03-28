import React from 'react';
import { useState } from 'react';
import { Container, Row, Col, Form, Table, Button,Card } from 'react-bootstrap';



const Pos = () => {
    const [products, setProducts] = useState([
        {
          id: 1,
          name: "Sweat shirt",
          price: 249.99,
          discount: 0,
          quantity: 1,
          subtotal: 249.99
        },
        {
          id: 2,
          name: "Red Hoodie",
          price: 329.50,
          discount: 20,
          quantity: 2,
          subtotal: 659.00
        },
        {
          id: 3,
          name: "Skinny jeans",
          price: 129.99,
          discount: 10,
          quantity: 3,
          subtotal: 389.97
        }
      ]);

  return (

    <Container className="card-container">

          <div className="search-bar-container">
            <div className="search-bar">
              <Form.Control 
                type="text" 
                placeholder="Scan/Search Product by Code" 
              />
            </div>
            </div>
            
            {/* main content ie Product details card */}
            <Card style={{ width: '75%', maxWidth: '1200px' }}>
            <Card.Header as="h5" > Products</Card.Header>
            <Card.Body>

            
            <Table  striped bordered hover>
              <thead>
                <tr>
                  <th width="320">Product</th>
                  <th width="150">Price</th>
                  <th width="150">Discount</th>
                  {/* TODO: NEED TO DESIGN A CUSTOM BUTTON FROM BOOTSTRAP 5, CANNOT FIND ONE ALREADY MADE */}
                  <th width="150">Qty</th>
                  <th width="150">Subtotal</th>
                  
                  <th width="90">Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Placeholder rows added here */}
                {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.discount}%</td>
                  <td>{product.quantity}</td>
                  <td>${(product.price * product.quantity * (1 - product.discount / 100)).toFixed(2)}</td>
                  <td className="text-center">
                    {/* TODO: ADD GARBAGE BIN ICON HERE (install fontawesome npm,), AND ADD FUNCTIONALITY */}
                    <Button 
                      size="sm" 
                      variant="secondary"
                    >
                        bin
                      {/* <FontAwesomeIcon icon="fa-solid fa-trash-can" size={16} /> */}
                    </Button>
                  </td>
                </tr>
              ))}
              </tbody>
            </Table>
            
            </Card.Body>
        
        <Card.Footer className="end-transaction-    row">
            
            <Button variant="outline-secondary" size="lg">
                Reset
                </Button>
              <div className="text-end">
                <div className="pay-value">
                  Total Payable: $1,000.00
                </div>
                <Button variant="success">Pay Now</Button>
              </div>
            </Card.Footer>
          </Card>
        </Container>
        
  );
};

export default Pos;