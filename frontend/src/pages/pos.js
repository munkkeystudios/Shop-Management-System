import React, { useState, useEffect } from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import POSLayout from '../components/POSLayout';
import SearchBar from '../components/pos/searchbarpos.jsx';
import CartTable from '../components/pos/CartTable.js';
import BillTab from '../components/pos/BillTab.js';
import SalesTable from '../components/pos/SalesTable.js';
import PayButton from '../components/pos/PayButton.js';
import { salesAPI } from '../services/api.js';
import useCart from '../hooks/useCart';
import '../styles/pos.css'; 

const Pos = () => {
  // State variables 
  const [searchedProduct, setSearchedProduct] = useState(null);
  const [billNumber, setBillNumber] = useState('Loading...');
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [salesError, setSalesError] = useState(null);
  const [activeBill, setActiveBill] = useState(null);

  const {
    cartItems,
    totalPayable,
    totalQuantity,
    addToCart,
    removeFromCart,
    updateQuantity,
    resetCart,
    setCartItems,
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
          setBillNumber(1);
        }
      } catch (error) {
        console.error('Error fetching last bill number:', error);
        setBillNumber('Error');
      }
    };

    fetchLastBillNumber();
  }, []);

  // Fetch last ten sales 
  const fetchLastTenSales = async () => {
    try {
      setLoadingSales(true);
      const response = await salesAPI.getLastTenSales();
      if (response.data && response.data.data) {
        setSales(response.data.data);
      } else {
        setSales([]);
      }
      setSalesError(null);
    } catch (error) {
      console.error('Error fetching last 10 sales:', error);
      setSalesError('Failed to fetch sales data');
      setSales([]);
    } finally {
      setLoadingSales(false);
    }
  };

  // Fetch sales on component mount 
  useEffect(() => {
    fetchLastTenSales();
  }, []);

  // Add new sale function 
  const addNewSale = async (newSaleId) => {
    if (!newSaleId) {
      console.error('No sale ID provided');
      return;
    }
    
    try {
      const response = await salesAPI.getSale(newSaleId);
      
      if (response.data && response.data.data) {
        setSales(prevSales => {
          const currentSales = Array.isArray(prevSales) ? prevSales : [];
          const updatedSales = [response.data.data, ...currentSales];
          return updatedSales.slice(0, 10);
        });
      }
    } catch (error) {
      console.error('Error fetching new sale:', error);
    }
  };

  // Product search handler 
  const handleProductSearch = (product) => {
    setSearchedProduct(product);
  };

  // Add searched product to cart 
  useEffect(() => {
    if (searchedProduct) {
      addToCart(searchedProduct);
      setSearchedProduct(null);
    }
  }, [searchedProduct, addToCart]);

  // Back button handler 
  const handleBackClick = () => {
    window.history.back();
  };

  // Payment completion handler 
  const handlePaymentComplete = (newSaleId) => {
    setCartItems([]);
    
    if (newSaleId) {
      console.log('New sale created with ID:', newSaleId);
      addNewSale(newSaleId);
      
      setActiveBill(prevBillNumber => {
        if (typeof billNumber === 'number') {
          return billNumber + 1;
        }
        return prevBillNumber;
      });
    } else {
      console.warn('No sale ID was provided after payment completion');
    }
  };

  // Set active bill when bill number is initially loaded 
  useEffect(() => {
    if (billNumber !== 'Loading...' && billNumber !== 'Error' && !activeBill) {
      setActiveBill(billNumber);
    }
  }, [billNumber, activeBill]);

  // Tab change handler 
  const handleTabChange = (selectedBillNumber) => {
    setActiveBill(selectedBillNumber);
  };

  return (
    <POSLayout title="Point of Sale">
      <div className="pos-app-container">
        {/* Left section */}
        <div className="pos-main-content">
          <div className="pos-bill-header">
            <div className="pos-bill-header-content">
              <button className="pos-back-button" onClick={handleBackClick}>
                Back
              </button>
              <span className="pos-bills-label">Recent Bills:</span>
              <div className="pos-bill-tabs-container">
                {billNumber !== 'Loading...' && billNumber !== 'Error' ? (
                  <BillTab 
                    billNumber={activeBill || billNumber}
                    onTabChange={handleTabChange}
                    onTabClose={() => {}}
                  />
                ) : (
                  <div className="pos-loading-message">Loading...</div>
                )}
              </div>
            </div>
          </div>

          <Container className="pos-card-container">
            <div className="pos-search-bar-wrapper">
              <SearchBar onProductSearch={handleProductSearch} />
            </div>

            {/* Products card */}
            <Card className="pos-products-card">
              <Card.Header as="h6" className="pos-products-header">Products</Card.Header>
              <Card.Body className="pos-products-body">
                <CartTable
                  cartItems={cartItems}
                  handleQuantityChange={updateQuantity}
                  handleRemoveItem={removeFromCart}
                />
              </Card.Body>

              <Card.Footer className="pos-products-footer">
                <Button variant="danger" size="sm" onClick={resetCart}>
                  Reset
                </Button>
                <div className="text-end">
                  <div className="pos-pay-value">
                    Total Payable: ${totalPayable.toFixed(2)}
                  </div>
                </div>

                <PayButton
                  cartItems={cartItems}
                  totalPayable={totalPayable}
                  totalQuantity={totalQuantity}
                  billNumber={activeBill || billNumber}
                  updateBillNumber={setBillNumber}
                  onPaymentComplete={handlePaymentComplete}
                />
              </Card.Footer>
            </Card>
          </Container>
        </div>

        {/* Right section */}
        <div className="pos-sales-sidebar">
          <Card>
            <Card.Header className="pos-sales-header">
              Last Sales
            </Card.Header>
            <Card.Body className="pos-sales-body">
              {loadingSales ? (
                <div className="pos-loading-sales">Loading sales...</div>
              ) : salesError ? (
                <div className="pos-error-message">{salesError}</div>
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