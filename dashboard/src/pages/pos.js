import React from 'react';
import { useState } from 'react';
import { Container, Row, Col, Form, Table, Button,Card } from 'react-bootstrap';
// run npm install react-icons --save to get icons for trashbin, search
import SearchBar from '../components/searchbarpos.jsx';

const Pos = () => {
    const [searchedProduct, setSearchedProduct] = useState(null);

    const handleProductSearch = (product) => {
        setSearchedProduct(product);
    };

  return (


    <Container className="card-container">
            <div>
                <SearchBar onProductSearch={handleProductSearch} />
            </div>
            {/* main content ie Product details card */}
            <Card style={{ width: '75%', maxWidth: '1200px' }}>
            <Card.Header as="h5" > Products</Card.Header>
            <Card.Body>


            {searchedProduct && (
                <Card style={{ width: '75%', maxWidth: '1200px' }}>
                    <Card.Header as="h5">Product Details</Card.Header>
                    <Card.Body>
                        <pre>{JSON.stringify(searchedProduct, null, 2)}</pre>
                    </Card.Body>
                </Card>
            )}

            
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