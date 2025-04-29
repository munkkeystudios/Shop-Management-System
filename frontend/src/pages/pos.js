import React, { useState, useEffect } from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import POSLayout from '../components/POSLayout';
import SearchBar from '../components/pos/searchbarpos.jsx';
import CartTable from '../components/pos/CartTable.js';
import BillTab from '../components/pos/BillTab.js';
import CreateBillButton from '../components/pos/CreateBillButton.js';
import SalesTable from '../components/pos/SalesTable.js';
import PayButton from '../components/pos/PayButton.js';
import { salesAPI } from '../services/api.js';
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
      <div className="app-container" style={{ 
        display: 'flex', 
        height: 'calc(90vh)', 
        padding: '0',
        margin: '0'
      }}>
        {/* left section */}
        <div className="main-content" style={{ 
          flex: '1', 
          padding: '0', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}>
          <div className="bill-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1%',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '0.5%',
            width: '100%',
            maxWidth: '95%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1%' }}>
              <button
                style={{
                  padding: '0.5% 1%',
                  fontSize: '80%',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
                onClick={handleBackClick}
              >
                Back
              </button>
              <span
                style={{
                  fontWeight: 'bold',
                  marginRight: '1%',
                  fontSize: '90%'
                }}
              >
                Recent Bills:
              </span>
              {billNumber !== 'Loading...' && billNumber !== 'Error' ? (
                <BillTab billNumber={billNumber} />
              ) : (
                <div style={{ fontSize: '85%' }}>Loading...</div>
              )}
            </div>

            <div>
              <CreateBillButton />
            </div>
          </div>

          <Container className="card-container" style={{ 
            padding: '0', 
            margin: '0', 
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: 'calc(85vh)'
          }}>
            <div style={{ 
              width: '100%', 
              maxWidth: '95%',
              marginBottom: '1%',
              padding: '0.75%',
              backgroundColor: '#fff',
              borderRadius: '0.25rem',
              boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
            }}>
              <SearchBar onProductSearch={handleProductSearch} />
            </div>

            {/* main content ie Product details card */}
            <Card style={{ 
              width: '100%', 
              maxWidth: '95%',
              flex: '1',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Card.Header as="h6" style={{ padding: '0.5rem 0.75rem', fontSize: '90%' }}>Products</Card.Header>
              <Card.Body style={{ 
                flex: '1',
                overflowY: 'auto',
                padding: '0.75%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CartTable
                  cartItems={cartItems}
                  handleQuantityChange={updateQuantity}
                  handleRemoveItem={removeFromCart}
                />
              </Card.Body>

              <Card.Footer style={{ 
                padding: '0.5rem 0.75rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <Button variant="danger" size="sm" onClick={resetCart}>
                  Reset
                </Button>
                <div className="text-end">
                  <div className="pay-value" style={{ fontSize: '90%' }}>
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
          width: '25%',
          borderLeft: '1px solid #dee2e6',
          padding: '1%',
          backgroundColor: '#fff'
        }}>
          <Card>
            <Card.Header style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '0.5% 1%',
              fontSize: '85%'
            }}>
              Last Sales
            </Card.Header>
            <Card.Body style={{ padding: '0' }}>
              {loadingSales ? (
                <div style={{ padding: '1%', fontSize: '85%' }}>Loading sales...</div>
              ) : salesError ? (
                <div className="error-message" style={{ padding: '1%', fontSize: '85%' }}>{salesError}</div>
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