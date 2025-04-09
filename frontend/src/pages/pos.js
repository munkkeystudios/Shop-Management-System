import React from 'react';
import { useState, useEffect } from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import SearchBar from '../components/pos/searchbarpos.jsx';
import CartTable from '../components/pos/CartTable.js';
import BillTab from '../components/pos/BillTab.js';
import CreateBillButton from '../components/pos/CreateBillButton.js';
import SalesTable from '../components/pos/SalesTable.js';
import PayButton from '../components/pos/PayButton.js';



const Pos = () => {
  const [searchedProduct, setSearchedProduct] = useState(null); // item found from SearchBar
  const [cartItems, setCartItems] = useState([]); // items in CartTable
  const [totalPayable, setTotalPayable] = useState(0); // total payable (sum of subtotals)
  const [totalQuantity, setTotalQuantity] = useState(0); // total items in cart

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

  // Calculations for quanitity
  const calculateCartQuantity = (cartItems) => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // TODO: Put CartTotal + CalculateCartTotal + calculateCartQuantity into a different script
  const CartTotal = ({ cartItems }) => {
    
    useEffect(() => {
      setTotalPayable(calculateCartTotal(cartItems));
      setTotalQuantity(calculateCartQuantity(cartItems)); // TODO: Find a better place to calculate TotalQuantity
    }, [cartItems]); 
  
    return (
      <div className="text-end">
        <div className="pay-value">
          Total Payable: ${totalPayable.toFixed(2)}
        </div>
      </div>
    );

  };

  

  

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh' }}>
      
      {/* left section */}
      <div className="main-content" style={{ flex: '1', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div className="bill-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #dee2e6',
          paddingBottom: '10px'
        }}>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              fontWeight: 'bold',
              marginRight: '15px'
            }}>
              Recent Bills:
            </span>

            <BillTab />
          </div>

          <div>
            <CreateBillButton />
          </div>
        </div>

        <Container className="card-container" style={{ padding: '0', margin: '0', maxWidth: '100%' }}>
          <Card style={{ width: '100%', maxWidth: '1200px' }}>
            <Card.Body>
              <div>
                <SearchBar onProductSearch={handleProductSearch} />
              </div>
            </Card.Body>
          </Card>

          {/* main content ie Product details card */}
          <Card style={{ width: '100%', maxWidth: '1200px' }}>
            <Card.Header as="h5" > Products</Card.Header>
            <Card.Body>

              <CartTable
                cartItems={cartItems}
                handleQuantityChange={handleQuantityChange}
                handleRemoveItem={handleRemoveItem}
              />

            </Card.Body>

            <Card.Footer className="d-flex justify-content-between align-items-center">

              <Button variant="danger"
                onClick={() => {
                  if (cartItems.length > 0) {
                    setCartItems([]);
                  }
                }}
              >
                Reset
              </Button>
              <CartTotal cartItems={cartItems} />

              {/* TODO:  launch bootstrap modal here for accessing payment option  */}
              < PayButton
                cartItems={cartItems}
                totalPayable={totalPayable}
                totalQuantity={totalQuantity}
              />

            </Card.Footer>
          </Card>

        </Container>
      </div>

      {/* right section */}
      <div className="sales-sidebar" style={{
        width: '400px',
        borderLeft: '1px solid #dee2e6',
        padding: '20px',
        backgroundColor: '#fff'
      }}>
        <Card>
          <Card.Header style={{ backgroundColor: '#f8f9fa', padding: '10px 15px' }}>Last Sales</Card.Header>
          <Card.Body style={{ padding: '0' }}>
            <SalesTable />
          </Card.Body>
        </Card>
      </div>

    </div>

  );
};

export default Pos;