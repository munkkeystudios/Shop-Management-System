import React, { useState, useEffect, useRef } from 'react';
import POSLayout from '../components/POSLayout';
import SearchBar from '../components/pos/searchbarpos.jsx';
import CartTable from '../components/pos/CartTable.js';
import BillTab from '../components/pos/BillTab.js';
import PayButton from '../components/pos/PayButton.js';
import { salesAPI, productsAPI } from '../services/api.js';
import { useSettings } from '../context/SettingsContext';
import { usePOSTheme } from '../context/POSThemeContext';
import { getCategoryColor } from '../utils/categoryColorUtils';
import useCart from '../hooks/useCart';
import { getCurrencySymbol } from '../utils/currencyUtils';
import '../styles/pos.css';
import defaultProductImage from '../images/default-product-image.jpg';

const Pos = () => {
  // Get settings context
  const { settings } = useSettings();
  const { isDarkMode, toggleTheme } = usePOSTheme();
  const currencySymbol = settings?.currencyCode ? getCurrencySymbol(settings.currencyCode) : '₦';

  // State variables
  const [searchedProduct, setSearchedProduct] = useState(null);
  const [billNumber, setBillNumber] = useState('Loading...');
  const [activeBill, setActiveBill] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const billTabRef = useRef(null);

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

  // Fetch products for the product grid
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await productsAPI.getAll();
        const data = response.data?.data || [];
        setProducts(Array.isArray(data) ? data : []);
        setProductsError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductsError('Failed to load products');
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

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
  const buildCartProduct = (product) => {
    const discountRate = product.discountRate || 0;
    const effectivePrice = product.price * (1 - discountRate / 100);

    return {
      id: product._id,
      name: product.name,
      price: product.price,
      discount: discountRate,
      quantity: 1,
      subtotal: effectivePrice,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : '/images/default-product-image.jpg',
    };
  };

  const handleProductTileClick = (product) => {
    if (!product) return;
    const formattedProduct = buildCartProduct(product);
    addToCart(formattedProduct);
  };

  // Payment completion handler
  const handlePaymentComplete = async (newSaleId) => {
    // Reset cart items
    setCartItems([]);

    if (newSaleId) {
      console.log('New sale created with ID:', newSaleId);
      // Store the current bill number before updating
      const previousBillNumber = activeBill || billNumber;

      try {
        // Fetch the latest bill number from the server
        const response = await salesAPI.getLastBillNumber();
        const lastBillNumber = response.data.lastBillNumber;

        // Update the bill number state with the next available number
        const nextBillNumber = lastBillNumber + 1;
        setBillNumber(nextBillNumber);

        // If we have a reference to the BillTab component
        if (billTabRef.current) {
          // Close the completed bill tab
          billTabRef.current.handleTabClose(previousBillNumber);

          // Update all remaining tabs to use the latest bill numbers
          billTabRef.current.updateAllBillNumbers(nextBillNumber);

          // Set the active bill to the next bill number
          setActiveBill(nextBillNumber);
        }
      } catch (error) {
        console.error('Error updating bill numbers after payment:', error);
      }
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

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return defaultProductImage;
  };

  const getStockStatus = (quantity) => {
    if (quantity == null) return 'medium';
    if (quantity <= 5) return 'low';
    if (quantity <= 20) return 'medium';
    return 'high';
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = normalizedSearch
    ? products.filter((product) => {
        const name = product.name?.toLowerCase() || '';
        const barcode = product.barcode?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        return (
          name.includes(normalizedSearch) ||
          barcode.includes(normalizedSearch) ||
          description.includes(normalizedSearch)
        );
      })
    : products;

  const itemsCount = filteredProducts.length || 0;

  return (
    <POSLayout title="Point of Sale" isDarkMode={isDarkMode}>
      <div className={`pos-page ${isDarkMode ? 'dark-mode' : ''}`}>
        {/* Left side: menu + product grid (like the inspiration layout) */}
        <div className="pos-left">
          {/* Search bar row with items count (no menu title or category tabs) */}
          <div className="pos-search-row">
            <div className="pos-right-search">
              <SearchBar
                onProductSearch={handleProductSearch}
                onSearchTextChange={setSearchTerm}
              />
            </div>
            <div className="pos-menu-count">
              Showing {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
            </div>
          </div>

          <div className="pos-right-grid">
            {loadingProducts ? (
              <div className="pos-loading-products">Loading products...</div>
            ) : productsError ? (
              <div className="pos-error-message">{productsError}</div>
            ) : (
              <div className="pos-product-grid">
                {filteredProducts.map((product) => {
                  const available = product.quantity ?? 0;
                  const stockStatus = getStockStatus(available);
                  const categoryColor = getCategoryColor(product);

                  return (
                    <button
                      key={product._id}
                      type="button"
                      className={`pos-product-card pos-product-card-simple ${categoryColor}`}
                      onClick={() => handleProductTileClick(product)}
                    >
                      <div className="pos-product-card-name pos-product-card-name-multiline">
                        {product.name}
                      </div>
                      <div className="pos-product-card-stock-only">
                        <span
                          className={`pos-stock-pill pos-stock-pill-${stockStatus}`}
                        >
                          {available}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right side: customer, cart, and totals / order summary */}
        <div className="pos-right">
          <div className="pos-right-header">
            <div className="pos-right-header-top">
              <div className="pos-customer-select-wrapper">
                <select className="pos-customer-select" defaultValue="walk-in">
                  <option value="walk-in">Walk-in Customer</option>
                </select>
              </div>
              <div className="pos-theme-toggle-wrapper">
                <button 
                  className="pos-theme-toggle-btn" 
                  type="button"
                  onClick={toggleTheme}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  )}
                </button>
              </div>
              <button className="pos-header-plus-btn" type="button">
                +
              </button>
            </div>
            {/* Loyalty and Suspend Sales buttons removed as requested */}
          </div>

          <div className="pos-bill-row">
            <div className="pos-bill-info">
              <span className="pos-bill-label">Bill #{activeBill || billNumber}</span>
            </div>
            <div className="pos-bill-tabs">
              {billNumber !== 'Loading...' && billNumber !== 'Error' ? (
                <BillTab
                  ref={billTabRef}
                  billNumber={activeBill || billNumber}
                  onTabChange={handleTabChange}
                  onTabClose={(closedTab) => {
                    console.log(`Tab ${closedTab} was closed`);
                  }}
                />
              ) : (
                <div className="pos-loading-message">Loading...</div>
              )}
            </div>
          </div>

          <div className="pos-cart-panel">
            <div className="pos-cart-body">
              <CartTable
                cartItems={cartItems}
                handleQuantityChange={updateQuantity}
                handleRemoveItem={removeFromCart}
              />
            </div>
          </div>

          <div className="pos-bottom-bar">
            <div className="pos-bottom-summary">
              <div className="pos-summary-row">
                <span>Discount:</span>
                <span>
                  
                  {currencySymbol}0.00
                </span>
              </div>
              <div className="pos-summary-row">
                <span>VAT:</span>
                <span>{currencySymbol}0.00</span>
              </div>
            </div>
            <div className="pos-bottom-total">
              <div className="pos-total-label">Total</div>
              <div className="pos-total-value">{currencySymbol}{totalPayable.toFixed(2)}</div>
            </div>
            <div className="pos-bottom-payment">
                <div className="pos-pay-button-wrapper">
                  <PayButton
                    cartItems={cartItems}
                    totalPayable={totalPayable}
                    totalQuantity={totalQuantity}
                    billNumber={activeBill || billNumber}
                    updateBillNumber={setBillNumber}
                    onPaymentComplete={handlePaymentComplete}
                    isDarkMode={isDarkMode}
                  />
                </div>
              <button className="pos-reset-button" onClick={resetCart}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </POSLayout>
  );
};

export default Pos;