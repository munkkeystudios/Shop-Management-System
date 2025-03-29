import React from 'react';
import { useState,useEffect } from 'react';
import { Container, Table, Button, Card } from 'react-bootstrap';
// run npm install react-icons --save to get icons for trashbin, search
import SearchBar from '../components/searchbarpos.jsx';

const Pos = () => {
  const [searchedProduct, setSearchedProduct] = useState(null); // product found from SearchBar
  const [cartItems, setCartItems] = useState([]); // products in cart/table

  const handleProductSearch = (product) => {
    setSearchedProduct(product);
  };

  // This effect will add the searched product to the cart when it changes
  useEffect(() => {
    if (searchedProduct) {

      const existingProductIndex = cartItems.findIndex(item => item.id === searchedProduct.id);
      
      if (existingProductIndex !== -1) {
        // If product exists, update its quantity and subtotal
        const updatedCartItems = [...cartItems];
        updatedCartItems[existingProductIndex].quantity += 1;
        // TODO: use subtotal calculation function here
        updatedCartItems[existingProductIndex].subtotal = 
          updatedCartItems[existingProductIndex].quantity * 
          (updatedCartItems[existingProductIndex].price * (1 - updatedCartItems[existingProductIndex].discount / 100));
        
        setCartItems(updatedCartItems);
      } else {
        // If product is new, add it to cart
        setCartItems([...cartItems, searchedProduct]);
      }
      
      // Reset searchedProduct after adding to cart
      setSearchedProduct(null);
    }
  }, [searchedProduct])

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) 
      return; 
    
    const updatedCartItems = cartItems.map(item => {
      if (item.id === id) {
        const updatedItem = {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * (item.price * (1 - item.discount / 100))
        };
        return updatedItem;
      }
      return item;
    });
    
    setCartItems(updatedCartItems);
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

          {/* at first this was just for debugging, but i kinda want to do it now. too bad its an additional feature
            like a small notification saying ".... was added" next to the table header 
            just have to make sure feature isn't annoying
          {searchedProduct && (
              <Card style={{ width: '75%', maxWidth: '1200px' }}>
                          <Card.Header as="h5">Product Details</Card.Header>
                          <Card.Body>
                              <pre>{JSON.stringify(searchedProduct, null, 2)}</pre>
                          </Card.Body>
              </Card>
            } */}

         
          <Table striped bordered hover>
            <thead>
              <tr>
                <th width="320">Product</th>
                <th width="150">Price</th>
                <th width="150">Discount</th>
                <th width="150">Qty</th>
                <th width="150">Subtotal</th>
                <th width="90">Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="product-container">
                      <div className="product-image">{item.image}</div>
                      <div className="product-info">
                        <div className="product-name">{item.name}</div>
                        <small className="product-id">ID: {item.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.discount}%</td>
                  <td>
                    <div className="quantity-container">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="quantity-value">{item.quantity}</span>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </td>
                  <td>${item.subtotal.toFixed(2)}</td>
                  <td>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
              {cartItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-cart">No products added yet</td>
                </tr>
              )}
            </tbody>
          </Table>

        </Card.Body>

        <Card.Footer className="end-transaction-row">

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