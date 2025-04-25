import React, { useState, useEffect } from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import POSLayout from '../components/POSLayout';
import SearchBar from '../components/pos/searchbarpos.jsx';
import CartTable from '../components/pos/CartTable.js';
import BillTab from '../components/pos/BillTab.js';
import CreateBillButton from '../components/pos/CreateBillButton.js';
import SalesTable from '../components/pos/SalesTable.js';
import PayButton from '../components/pos/PayButton.js';
import { productsAPI, salesAPI } from '../services/api.js';
import useCart from '../hooks/useCart';

const Pos = () => {
  const [searchedProduct, setSearchedProduct] = useState(null); // item found from SearchBar
  const [billNumber, setBillNumber] = useState('Loading...'); // Default placeholder value
  const [sales, setSales] = useState([]); // State to store sales data
  const [loadingSales, setLoadingSales] = useState(true); // Loading state for sales
  const [salesError, setSalesError] = useState(null); // Error state for sales

  const {
    cartItems,
    totalPayable,
    totalQuantity,
    addToCart,
    removeFromCart,
    updateQuantity,
    resetCart,
  } = useCart();

  // Fetch the last bill number
  useEffect(() => {
    const fetchLastBillNumber = async () => {
      try {
        const response = await salesAPI.getLastBillNumber();
        const lastBillNumber = response.data.lastBillNumber;

        if (lastBillNumber) {
          setBillNumber(lastBillNumber + 1);
        } else {
          setBillNumber(1); // Start from 1 if no sales exist
        }
      } catch (error) {
        console.error('Error fetching last bill number:', error);
        setBillNumber('Error');
      }
    };

    fetchLastBillNumber();
  }, []);

  // Function to fetch the last 10 sales
  const fetchLastTenSales = async () => {
    try {
      setLoadingSales(true); // Set loading state
      const response = await salesAPI.getLastTenSales();
      setSales(response.data.data); // Update the sales data
      setSalesError(null);
    } catch (error) {
      console.error('Error fetching last 10 sales:', error);
      setSalesError('Failed to fetch sales. Please try again later.');
    } finally {
      setLoadingSales(false); // Reset loading state
    }
  };

  // Fetch the last 10 sales on component mount
  useEffect(() => {
    fetchLastTenSales();
  }, []);

  const handleProductSearch = (product) => {
    setSearchedProduct(product);
  };

  // This effect will add the searched product to the cart when it changes
  useEffect(() => {
    if (searchedProduct) {
      addToCart(searchedProduct);
      setSearchedProduct(null);
    }
  }, [searchedProduct, addToCart]);

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const handleSaleCreated = () => {
    fetchLastTenSales(); 
    resetCart(); 
  };

  return (
    <POSLayout title="Point of Sale">
      <div className="app-container" style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        {/* left section */}
        <div className="main-content" style={{ flex: '1', padding: '0', display: 'flex', flexDirection: 'column' }}>
        <div className="bill-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #dee2e6',
          paddingBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={handleBackClick}
            >
              Back
            </button>
            <span
              style={{
                fontWeight: 'bold',
                marginRight: '16px',
                fontSize: '18px'
              }}
            >
              Recent Bills:
            </span>
            {billNumber !== 'Loading...' && billNumber !== 'Error' ? (
              <BillTab billNumber={billNumber} />
            ) : (
              <div>Loading...</div>
            )}
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
            <Card.Header as="h5"> Products</Card.Header>
            <Card.Body>
              <CartTable
                cartItems={cartItems}
                handleQuantityChange={updateQuantity}
                handleRemoveItem={removeFromCart}
              />
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between align-items-center">
              <Button variant="danger" onClick={resetCart}>
                Reset
              </Button>
              <div className="text-end">
                <div className="pay-value">
                  Total Payable: ${totalPayable.toFixed(2)}
                </div>
              </div>

              <PayButton
                cartItems={cartItems}
                totalPayable={totalPayable}
                totalQuantity={totalQuantity}
                billNumber={billNumber}
                updateBillNumber={setBillNumber}
                onSaleCreated={handleSaleCreated} 
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
            {loadingSales ? (
              <div>Loading sales...</div>
            ) : salesError ? (
              <div className="error-message">{salesError}</div>
            ) : (
              <SalesTable sales={sales} /> 
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
    </POSLayout>
  );
};

export default Pos;