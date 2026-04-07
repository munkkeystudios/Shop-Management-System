import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import POSLayout from '../components/POSLayout';
import PayButton from '../components/pos/PayButton.js';
import { salesAPI, productsAPI } from '../services/api.js';
import { useSettings } from '../context/SettingsContext';
import useCart from '../hooks/useCart';
import { getCurrencySymbol } from '../utils/currencyUtils';
import '../styles/pos-slate.css';

const DISPLAY_TAX_RATE = 0.085;

const Pos = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const currencySymbol = settings?.currencyCode ? getCurrencySymbol(settings.currencyCode) : '₦';

  const [billNumber, setBillNumber] = useState('-');
  const [activeBill, setActiveBill] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const {
    cartItems,
    totalPayable,
    totalQuantity,
    addToCart,
    removeFromCart,
    resetCart,
    setCartItems,
  } = useCart();

  useEffect(() => {
    const fetchLastBillNumber = async () => {
      try {
        const response = await salesAPI.getLastBillNumber();
        const lastBillNumber = response.data?.lastBillNumber;
        setBillNumber(lastBillNumber ? lastBillNumber + 1 : 1);
      } catch (error) {
        console.error('Error fetching last bill number:', error);
        setBillNumber('Error');
      }
    };

    fetchLastBillNumber();
  }, []);

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

  useEffect(() => {
    if (billNumber !== '-' && billNumber !== 'Error' && !activeBill) {
      setActiveBill(billNumber);
    }
  }, [billNumber, activeBill]);

  const getCategoryName = (product) => {
    if (typeof product?.category === 'string') return product.category;
    if (product?.category?.name) return product.category.name;
    if (product?.categoryName) return product.categoryName;
    return 'Uncategorized';
  };

  const categories = useMemo(() => {
    const unique = new Set();
    products.forEach((product) => unique.add(getCategoryName(product)));
    return ['all', ...Array.from(unique)];
  }, [products]);

  const categoryCodeMap = useMemo(() => {
    const map = new Map();
    categories
      .filter((category) => category !== 'all')
      .forEach((category, index) => {
        map.set(category, `CAT-${String(index + 1).padStart(2, '0')}`);
      });
    return map;
  }, [categories]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const categoryName = getCategoryName(product);
    const matchesCategory = selectedCategory === 'all' || categoryName === selectedCategory;

    if (!matchesCategory) return false;

    if (!normalizedSearch) return true;

    const name = product.name?.toLowerCase() || '';
    const barcode = product.barcode?.toLowerCase() || '';
    const description = product.description?.toLowerCase() || '';

    return (
      name.includes(normalizedSearch) ||
      barcode.includes(normalizedSearch) ||
      description.includes(normalizedSearch)
    );
  });

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
      description: product.description || '',
    };
  };

  const handleProductTileClick = (product) => {
    if (!product) return;
    addToCart(buildCartProduct(product));
  };

  const handlePaymentComplete = async (newSaleId) => {
    setCartItems([]);

    if (!newSaleId) {
      console.warn('No sale ID was provided after payment completion');
      return;
    }

    try {
      const response = await salesAPI.getLastBillNumber();
      const lastBillNumber = response.data?.lastBillNumber;
      const nextBillNumber = (lastBillNumber || 0) + 1;

      setBillNumber(nextBillNumber);
      setActiveBill(nextBillNumber);
    } catch (error) {
      console.error('Error updating bill numbers after payment:', error);
    }
  };

  const taxAmount = Number((totalPayable * DISPLAY_TAX_RATE).toFixed(2));
  const totalDue = Number((totalPayable + taxAmount).toFixed(2));

  const rightSideType = {
    panel: { fontFamily: 'Manrope, sans-serif' },
    title: {
      fontSize: '2rem',
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1,
      margin: 0,
    },
    orderBadge: {
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    customerText: {
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
    cartTitle: {
      fontSize: '14px',
      fontWeight: 700,
      lineHeight: '1.25',
      letterSpacing: '-0.01em',
      margin: 0,
    },
    cartMeta: {
      fontSize: '10px',
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      lineHeight: '1.3',
    },
    cartAmount: {
      fontSize: '14px',
      fontWeight: 700,
      lineHeight: '1.25',
    },
    remove: {
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
    },
    totalLine: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '1.4',
    },
    totalDueLabel: {
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      lineHeight: 1.1,
    },
    totalDueValue: {
      fontSize: '48px',
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1,
    },
    quickCash: {
      fontSize: '14px',
      fontWeight: 700,
      lineHeight: 1,
    },
    reset: {
      fontSize: '13px',
      fontWeight: 700,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      lineHeight: 1,
    },
  };

  return (
    <POSLayout title="Point of Sale" isDarkMode={false}>
      <div className="slate-pos-root">
        <main className="slate-catalog-stage">
          <header className="slate-header">
            <div className="slate-header-left">
              <h1 className="slate-brand" onClick={() => navigate('/dashboard')}>FinTrack POS</h1>
              <div className="slate-header-divider" />
              <nav className="slate-header-nav" aria-label="Primary POS sections">
                  <button type="button" className="slate-nav-btn slate-nav-btn-active">
                    Catalog
                  </button>
                  <button type="button" className="slate-nav-btn" onClick={() => navigate('/all_products')} aria-label="Go to Inventory">
                    Inventory
                  </button>
                  <button type="button" className="slate-nav-btn" onClick={() => navigate('/sales-report')} aria-label="Go to Sales Report">
                    Reports
                  </button>
              </nav>
            </div>
            <div className="slate-header-right">
              <div className="slate-search-wrap" role="search">
                <span className="slate-search-icon" aria-hidden="true">
                  ⌕
                </span>
                <input
                  className="slate-search-input"
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <button
                type="button"
                className="slate-settings-btn"
                aria-label="General Settings"
                title="General Settings"
                onClick={() => navigate('/settings/general')}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  settings
                </span>
              </button>
            </div>
          </header>

          <div className="slate-category-ribbon">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              const label = category === 'all' ? 'All Items' : category;

              return (
                <button
                  key={category}
                  type="button"
                  className={`slate-category-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <section className="slate-grid-section" aria-label="Product catalog">
            {loadingProducts ? (
              <div className="pos-loading-container">
                <div className="block-pulse-small">
                  <div className="block-small rounded-sm"></div>
                  <div className="block-small rounded-sm"></div>
                  <div className="block-small rounded-sm"></div>
                  <div className="block-small rounded-sm"></div>
                  <div className="block-small rounded-sm"></div>
                  <div className="block-small rounded-sm"></div>
                  <div className="block-small rounded-sm"></div>
                  <div className="block-small rounded-sm"></div>
                  <div className="block-small rounded-sm"></div>
                </div>
              </div>
            ) : productsError ? (
              <div className="slate-state-message slate-state-error">{productsError}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="slate-state-message">No products match your current filters.</div>
            ) : (
              <div className="slate-product-grid">
                {filteredProducts.map((product) => {
                  const productCategory = getCategoryName(product);
                  const categoryCode = categoryCodeMap.get(productCategory) || 'CAT-00';
                  const description = product.description || '—';
                  const price = Number(product.price || 0);

                  return (
                    <button
                      key={product._id}
                      type="button"
                      className="slate-product-card"
                      onClick={() => handleProductTileClick(product)}
                    >
                      <div>
                        <div className="slate-product-top-row">
                          <span className="slate-product-code">{categoryCode}</span>
                          <span className="slate-product-add" aria-hidden="true">
                            <span className="material-symbols-outlined">add_circle</span>
                          </span>
                        </div>
                        <h3 className="slate-product-name">{product.name}</h3>
                        <p className="slate-product-description">{description}</p>
                      </div>
                      <div className="slate-product-footer">
                        <span className="slate-product-price">
                          {currencySymbol}
                          {price.toFixed(2)}
                        </span>
                        <span className="slate-product-accent" aria-hidden="true" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <aside className="slate-checkout-panel" style={rightSideType.panel}>
          <div className="slate-checkout-header">
            <div className="slate-checkout-heading-row">
              <h2 className="slate-checkout-title" style={rightSideType.title}>Current Sale</h2>
              <span className="slate-order-badge" style={rightSideType.orderBadge}>ORDER #{activeBill || billNumber}</span>
            </div>
            
          </div>

          <div className="slate-cart-list" aria-label="Current cart items">
            {cartItems.length === 0 ? (
              <div className="slate-empty-cart">Cart is empty. Click products to add items.</div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="slate-cart-row">
                  <div className="slate-cart-left">
                    <div className="slate-qty-box">x{item.quantity}</div>
                    <div className="slate-cart-meta">
                      <h4 style={rightSideType.cartTitle}>{item.name}</h4>
                      <p style={rightSideType.cartMeta}>{(item.description || 'No note').toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="slate-cart-right">
                    <p style={rightSideType.cartAmount}>
                      {currencySymbol}
                      {Number(item.subtotal || 0).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      className="slate-remove-btn"
                      style={rightSideType.remove}
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="slate-totals-panel">
            <div className="slate-totals-lines">
              <div className="slate-total-line">
                <span style={rightSideType.totalLine}>Subtotal</span>
                <span style={rightSideType.totalLine}>
                  {currencySymbol}
                  {totalPayable.toFixed(2)}
                </span>
              </div>
              <div className="slate-total-line">
                <span style={rightSideType.totalLine}>Tax (8.5%)</span>
                <span style={rightSideType.totalLine}>
                  {currencySymbol}
                  {taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="slate-total-due">
                <span style={rightSideType.totalDueLabel}>Total Due</span>
                <span style={rightSideType.totalDueValue}>
                  {currencySymbol}
                  {totalDue.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="slate-quick-cash-grid">
              <button type="button" className="slate-quick-cash-btn" style={rightSideType.quickCash}>
                {currencySymbol}35
              </button>
              <button type="button" className="slate-quick-cash-btn" style={rightSideType.quickCash}>
                {currencySymbol}40
              </button>
              <button type="button" className="slate-quick-cash-btn" style={rightSideType.quickCash}>
                {currencySymbol}50
              </button>
            </div>

            <div className="slate-action-row">
              <button type="button" className="slate-split-btn" style={rightSideType.reset} onClick={resetCart}>
                Reset ({totalQuantity})
              </button>
              <div className="slate-pay-btn-host">
                <PayButton
                  cartItems={cartItems}
                  totalPayable={totalPayable}
                  totalQuantity={totalQuantity}
                  billNumber={activeBill || billNumber}
                  updateBillNumber={setBillNumber}
                  onPaymentComplete={handlePaymentComplete}
                  isDarkMode={false}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </POSLayout>
  );
};

export default Pos;