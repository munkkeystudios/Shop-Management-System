import React from 'react';
import { useState,useEffect } from 'react';
import { Container, Table, Button, Card } from 'react-bootstrap';
// run npm install react-icons --save to get icons for trashbin, search
import { FiTrash2  } from "react-icons/fi";
import SearchBar from '../components/pos/searchbarpos.jsx';
import QuantityButton from '../components/pos/quantitybutton.js';

// TODO : TABLE

const Pos = () => {
  const [searchedProduct, setSearchedProduct] = useState(null); // product found from SearchBar
  const [cartItems, setCartItems] = useState([]); // products in cart/table

  const handleProductSearch = (product) => {
    setSearchedProduct(product);
  };

  // This effect will add the searched product to the cart when it changes
  useEffect(() => {
    if (searchedProduct) {
      // TODO: add an API here, need to update product stock 
      const existingProductIndex = cartItems.findIndex(item => item.id === searchedProduct.id);
      
      if (existingProductIndex !== -1) {
        // If product exists, update its quantity and subtotal
        const updatedCartItems = [...cartItems];
        updatedCartItems[existingProductIndex].quantity += 1;
        // TODO: create a subtotal calculation function 
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

  // TODO:: Add calculateCartTotal and CartTotals into a seperate script 
  // Calculates the total value of all items in the cart 
  const calculateCartTotal = (cartItems) => {
    // Return 0 if cart is null or empty
    if (!cartItems || cartItems.length === 0) {
      return 0;
    }
    
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.subtotal || 0);
    }, 0);
    
    // Round to 2 decimal places
    return Number(total.toFixed(2));
  };

  
  const CartTotal = ({ cartItems }) => {
    const totalPayable = calculateCartTotal(cartItems);
    
    return (
      <div className="text-end">
        <div className="pay-value">
          Total Payable: ${totalPayable.toFixed(2)}
        </div>
      </div>
    );
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

                      <QuantityButton 
                          key={item.id}
                          item={item} 
                          onQuantityChange={handleQuantityChange} 
                        />
                    </div>
                  </td>
                  <td>${item.subtotal.toFixed(2)}</td>
                  <td>
                    <FiTrash2  
                      onClick={() => handleRemoveItem(item.id)}
                    />
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

        <Card.Footer className="d-flex justify-content-between align-items-center">

          <Button variant="outline-secondary"> Reset </Button>
          <CartTotal cartItems={cartItems} />

          {/* TODO:  launch bootstrap modal here for accessing payment option  */}
          <Button variant="success">Pay Now</Button>
          {/* TODO:: DELETE THIS */}
      
        </Card.Footer>
      </Card>
      
    </Container>

  );
};

export default Pos;