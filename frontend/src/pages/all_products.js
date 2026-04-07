import React, { useState, useEffect, useCallback } from 'react';
import { FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNotifications } from '../context/NotificationContext';
import Layout from '../components/Layout';
import { productsAPI } from '../services/api';
import { getCurrencySymbol } from '../utils/currencyUtils';
import ProductLabel from '../components/ProductLabel';
import { generateBarcodeUrl, handleBarcodeError } from '../utils/barcodeUtils';
import './all_products.css';

// Import images
import sodaImage from '../images/soda.jpeg';
import chocolateImage from '../images/chocolate.jpeg';
import milkImage from '../images/milk.jpg';
import defaultProductImage from '../images/default-product-image.jpg';

const AllProducts = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const currencySymbol = settings?.currencyCode ? getCurrencySymbol(settings.currencyCode) : '$';
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showProductLabel, setShowProductLabel] = useState(false);
  const { addNotification } = useNotifications();

  // Handle escape key press to close modals
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape') {
      if (selectedProduct) {
        setSelectedProduct(null);
        document.body.style.overflow = 'auto';
      }
      if (isEditModalOpen) {
        setIsEditModalOpen(false);
        document.body.style.overflow = 'auto';
      }
      if (isDeleteConfirmOpen) {
        setIsDeleteConfirmOpen(false);
        document.body.style.overflow = 'auto';
      }
      if (showProductLabel) {
        setShowProductLabel(false);
        document.body.style.overflow = 'auto';
      }
    }
  }, [selectedProduct, isEditModalOpen, isDeleteConfirmOpen, showProductLabel]);

  // Add event listener for escape key
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleEscapeKey]);

  // Fetch products on component mount or page change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('token');
        console.log('Token in localStorage:', token);

        if (!token) {
          // Redirect to login if not authenticated
          window.location.href = '/login';
          return;
        }

        console.log('Making API call with token:', token.substring(0, 20) + '...');
        console.log('API URL will be:', '/products');
  const response = await productsAPI.getAll();
        console.log('Full Products API Response:', response);
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        console.log('Products array:', response.data.data);
        console.log('Number of products:', response.data.data ? response.data.data.length : 0);

        setProducts(response.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('===== FULL ERROR OBJECT =====');
        console.error('Error:', err);
        console.error('Error status:', err.response?.status);
        console.error('Error response:', err.response?.data);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        console.error('=============================');
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);



  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Products state:', products);
  console.log('Filtered products:', filteredProducts);

  // Helper function to get product image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.name.toLowerCase().includes('soda')) return sodaImage;
    if (product.name.toLowerCase().includes('chocolate')) return chocolateImage;
    if (product.name.toLowerCase().includes('milk')) return milkImage;
    return defaultProductImage;
  };

  const handleCreateProduct = () => {
    if (isAuthenticated()) {
      navigate('/create_products');
    } else {
      navigate('/login');
    }
  };

  // Handle edit button click
  const handleEditClick = (product) => {
    setEditFormData({
      _id: product._id,
      name: product.name,
      barcode: product.barcode,
      description: product.description || '',
      price: product.price,
      quantity: product.quantity,
      category: product.category?._id,
      supplier: product.supplier?._id,
      costPrice: product.costPrice || 0,
      minStockLevel: product.minStockLevel || 0,
      status: product.status || 'active'
    });
    setIsEditModalOpen(true);
    // Add overflow hidden to body to prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  // Handle delete button click
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
    // Add overflow hidden to body to prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  // Handle form input changes for edit modal
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.update(editFormData._id, editFormData);
      // Refresh product list
  const response = await productsAPI.getAll();
      setProducts(response.data.data);
      setIsEditModalOpen(false);
      // Restore body overflow
      document.body.style.overflow = 'auto';
      // Show success message
      setError(null);
      addNotification('product', `Product "${editFormData.name}" has been updated`, editFormData._id);
      // alert('Product updated successfully');
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product. Please try again.');
    }
  };

  // Handle product deletion
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await productsAPI.delete(productToDelete._id);
      // Refresh product list
  const response = await productsAPI.getAll();
      setProducts(response.data.data);
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
      // Restore body overflow
      document.body.style.overflow = 'auto';
      // Show success message
      setError(null);
      const productName = productToDelete?.name || 'Unknown';
      addNotification('product', `Product "${productName}" has been deleted`);
      // alert('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
    }
  };

  const totalInventoryValue = products.reduce(
    (sum, product) => sum + (Number(product.price) || 0) * (Number(product.quantity) || 0),
    0,
  );
  const activeSkus = products.length;
  const outOfStockCount = products.filter((product) => Number(product.quantity) <= 0).length;
  const lowStockCount = products.filter((product) => {
    const qty = Number(product.quantity) || 0;
    const threshold = Number(product.minStockLevel) || 10;
    return qty > 0 && qty <= threshold;
  }).length;

  const formatAmount = (value) => `${currencySymbol}${Number(value || 0).toFixed(2)}`;

  const getStockDotColor = (qty) => {
    const quantity = Number(qty) || 0;
    if (quantity <= 0) return '#9f403d';
    if (quantity <= 10) return '#f59e0b';
    return '#10b981';
  };

  return (
    <Layout title="All Products">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div style={{ backgroundColor: '#f7f9fb', minHeight: 'calc(100vh - 80px)', fontFamily: 'Manrope, sans-serif' }}>
        <main style={{ flex: 1, minHeight: '100vh', background: '#f7f9fb' }}>
{loading ? (
  <div className="products-loading-container">
    <div className="block-pulse">
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
      <div className="block rounded-sm"></div>
    </div>
  </div>
) : (
  <section style={{ padding: '32px', maxWidth: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <p
                  style={{
                    margin: '0 0 4px',
                    color: '#565e74',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontSize: '12px',
                  }}
                >
                  Stock Overview
                </p>
                <h2 style={{ margin: 0, fontSize: '36px', fontWeight: 700, letterSpacing: '-0.025em', color: '#2a3439' }}>
                  All Products
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '12px',
                      transform: 'translateY(-50%)',
                      color: '#717c82',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>search</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Search product SKU or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '320px',
                      backgroundColor: '#f0f4f7',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '12px 16px 12px 40px',
                      fontSize: '14px',
                      outline: 'none',
                      boxShadow: 'rgba(15, 23, 42, 0.06) 0px 1px 2px',
                      color: '#2a3439',
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateProduct}
                  style={{
                    backgroundColor: '#565e74',
                    color: '#f7f7ff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: 'rgba(15, 23, 42, 0.08) 0px 1px 2px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span className="material-symbols-outlined">add</span>
                  Create New Product
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '24px', marginBottom: '48px' }}>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Total Inventory Value
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                  {formatAmount(totalInventoryValue)}
                </p>
              </div>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Active SKUs
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                  {activeSkus.toLocaleString()}
                </p>
              </div>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Out of Stock
                </p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#9f403d' }}>
                  {outOfStockCount}
                </p>
              </div>
              <div style={{ background: '#f0f4f7', padding: '24px', borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#566166', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Low Stock Items
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <p style={{ margin: 0, fontSize: '30px', fontWeight: 900, letterSpacing: '-0.05em', color: '#2a3439' }}>
                    {lowStockCount}
                  </p>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#b45309',
                      background: '#fef3c7',
                      padding: '2px 8px',
                      borderRadius: '2px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
                    Action Required
                  </span>
                </div>
              </div>
            </div>

              <div style={{ background: '#ffffff', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 4fr 2fr 2fr 2fr 2fr',
                    background: '#e8eff3',
                    padding: '16px 24px',
                    columnGap: '12px',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>SKU</div>
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Product Title</div>
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166' }}>Category</div>
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'right' }}>Sale Price</div>
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'right' }}>Quantity</div>
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#566166', textAlign: 'center' }}>Actions</div>
                </div>
                <div>
                  {filteredProducts.map((product, index) => {
                    const isStriped = index % 2 === 1;
                    const qty = Number(product.quantity) || 0;
                    return (
                      <div
                        key={product._id}
                        onClick={() => {
                          setSelectedProduct(product);
                          document.body.style.overflow = 'hidden';
                        }}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 4fr 2fr 2fr 2fr 2fr',
                          padding: '20px 24px',
                          alignItems: 'center',
                          columnGap: '12px',
                          cursor: 'pointer',
                          background: isStriped ? 'rgba(240, 244, 247, 0.3)' : 'transparent',
                        }}
                      >
                        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#566166' }}>{product.barcode || 'N/A'}</div>
                        <div style={{ fontWeight: 700, color: '#2a3439' }}>{product.name}</div>
                        <div style={{ fontSize: '14px', color: '#566166' }}>{product.category?.name || 'Uncategorized'}</div>
                        <div style={{ textAlign: 'right', fontWeight: 700 }}>{formatAmount(product.price)}</div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                            {qty}
                            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: getStockDotColor(qty), display: 'inline-block' }} />
                          </span>
                        </div>
                        <div
                          className="all-products-actions-cell"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            aria-label="View product"
                            onClick={() => {
                              setSelectedProduct(product);
                              document.body.style.overflow = 'hidden';
                            }}
                            className="all-products-action-btn"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                          </button>
                          <button
                            type="button"
                            aria-label="Edit product"
                            onClick={() => handleEditClick(product)}
                            className="all-products-action-btn"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </button>
                          <button
                            type="button"
                            aria-label="Delete product"
                            onClick={() => handleDeleteClick(product)}
                            className="all-products-action-btn all-products-action-btn-delete"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div
          className="products-modal-overlay"
          onClick={() => {
            setSelectedProduct(null);
            document.body.style.overflow = 'auto';
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(100%, 780px)',
              maxHeight: '94vh',
              background: '#ffffff',
              borderRadius: '4px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
              overflow: 'hidden',
              border: '1px solid rgba(169, 180, 185, 0.10)',
            }}
          >
            <div
              style={{
                background: '#f0f4f7',
                padding: '20px 18px',
                borderBottom: '1px solid rgba(169, 180, 185, 0.20)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      background: '#565e74',
                      color: '#f7f7ff',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      borderRadius: '2px',
                      marginBottom: '12px',
                    }}
                  >
                    Standard Product
                  </span>
                  <h1 style={{ margin: '0 0 2px', fontSize: '26px', lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.04em', color: '#2a3439' }}>
                    {selectedProduct.name}
                  </h1>
                  <p style={{ margin: 0, color: '#717c82', fontWeight: 500, letterSpacing: '0.03em' }}>
                    ID: <span style={{ color: '#2a3439' }}>{selectedProduct._id?.substring(0, 10) || 'N/A'}</span>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowProductLabel(true)}
                    style={{
                      background: '#ffffff',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '4px',
                      color: '#566166',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined">print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      document.body.style.overflow = 'auto';
                    }}
                    style={{
                      background: '#ffffff',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '4px',
                      color: '#566166',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '14px' }}>
              <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717c82' }}>Type</label>
                  <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 600, color: '#2a3439' }}>Standard</p>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717c82' }}>Code Product</label>
                  <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 600, color: '#2a3439' }}>{selectedProduct._id?.substring(0, 8) || 'N/A'}</p>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717c82' }}>Brand</label>
                  <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 600, color: '#2a3439' }}>
                    {selectedProduct.brand?.name || selectedProduct.brand || 'N/A'}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717c82' }}>Category</label>
                  <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 600, color: '#2a3439' }}>
                    {selectedProduct.category?.name || 'Uncategorized'}
                  </p>
                </div>
              </div>

              <div style={{ gridColumn: 'span 4', background: '#f0f4f7', padding: '14px', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717c82' }}>Warehouse Location</label>
                  <p style={{ margin: '2px 0 0', fontSize: '18px', lineHeight: 1.2, fontWeight: 700, color: '#2a3439' }}>Warehouse 1 / Shelf A</p>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#565e74' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Main Distribution Hub</span>
                </div>
              </div>

              <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px', padding: '14px 0', borderTop: '1px solid rgba(169, 180, 185, 0.10)', borderBottom: '1px solid rgba(169, 180, 185, 0.10)' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717c82' }}>Cost</label>
                  <p style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 900, color: '#2a3439' }}>{formatAmount(selectedProduct.costPrice)}</p>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717c82' }}>Price</label>
                  <p style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 900, color: '#565e74' }}>{formatAmount(selectedProduct.price)}</p>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717c82' }}>Unit</label>
                  <p style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 900, color: '#2a3439' }}>pc</p>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717c82' }}>Tax Rate</label>
                  <p style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 900, color: '#2a3439' }}>0.0%</p>
                </div>
              </div>

              <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(218, 226, 253, 0.30)', padding: '14px', borderRadius: '4px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a5167' }}>Current Stock</label>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '26px', fontWeight: 900, color: '#565e74' }}>{Number(selectedProduct.quantity) || 0}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#4a5167', textTransform: 'uppercase' }}>units available</span>
                  </div>
                </div>
                <div style={{ height: '44px', width: '44px', borderRadius: '999px', border: '4px solid #565e74', borderTopColor: '#a9b4b9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 900 }}>
                    {Math.min(100, Math.round(((Number(selectedProduct.quantity) || 0) / Math.max(1, Number(selectedProduct.minStockLevel) || 10)) * 100))}%
                  </span>
                </div>
              </div>

              <div style={{ gridColumn: 'span 6', borderLeft: '1px solid rgba(169, 180, 185, 0.25)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717c82', marginBottom: '12px' }}>
                  System Barcode (EAN-13)
                </label>
                <div style={{ background: '#ffffff', padding: '12px', border: '1px solid rgba(169, 180, 185, 0.20)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src={generateBarcodeUrl(selectedProduct.barcode)}
                    alt="Barcode"
                    style={{ width: '160px', height: '44px', objectFit: 'contain' }}
                    onError={handleBarcodeError}
                  />
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', letterSpacing: '0.35em', marginTop: '8px', color: '#2a3439' }}>
                    {selectedProduct.barcode || '0000000000000'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 18px', background: '#f0f4f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  const product = selectedProduct;
                  setSelectedProduct(null);
                  if (product) handleDeleteClick(product);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: '#9f403d', color: '#fff7f6', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '12px', letterSpacing: '0.02em', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                DELETE PRODUCT
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const product = selectedProduct;
                    setSelectedProduct(null);
                    if (product) handleEditClick(product);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: '#d5e3fc', color: '#455367', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '12px', letterSpacing: '0.02em', cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                  EDIT DATA
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductLabel(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', background: '#565e74', color: '#f7f7ff', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '12px', letterSpacing: '0.02em', cursor: 'pointer', boxShadow: '0 10px 20px -10px rgba(86, 94, 116, 0.45)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>print</span>
                  PRINT LABEL
                </button>
              </div>
            </div>

            <div style={{ padding: '10px 18px', display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 700, color: '#a9b4b9', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
              <span>
                Last Updated: {selectedProduct.updatedAt ? new Date(selectedProduct.updatedAt).toLocaleString() : 'N/A'}
              </span>
              <span>Editor: inventory_terminal</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div
          className="products-modal-overlay"
          onClick={() => {
            setIsEditModalOpen(false);
            document.body.style.overflow = 'auto';
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(100%, 780px)',
              maxHeight: '94vh',
              background: '#ffffff',
              borderRadius: '4px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
              overflow: 'hidden',
              border: '1px solid rgba(169, 180, 185, 0.10)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                background: '#f0f4f7',
                padding: '24px 22px',
                borderBottom: '1px solid rgba(169, 180, 185, 0.20)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      background: '#565e74',
                      color: '#f7f7ff',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      borderRadius: '2px',
                      marginBottom: '12px',
                    }}
                  >
                    Action: Edit
                  </span>
                  <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.05em', color: '#2a3439' }}>
                    Edit Product
                  </h1>
                  <p style={{ margin: 0, color: '#717c82', fontWeight: 500, fontSize: '14px', letterSpacing: '0.03em' }}>
                    ID: <span style={{ color: '#2a3439', fontWeight: 700 }}>{editFormData.barcode || editFormData._id?.substring(0, 8) || 'N/A'}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    document.body.style.overflow = 'auto';
                  }}
                  style={{
                    background: '#ffffff',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '4px',
                    color: '#566166',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div style={{ padding: '22px', overflow: 'hidden' }}>
              <form id="editProductForm" onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717c82' }}>Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name || ''}
                      onChange={handleEditFormChange}
                      required
                      style={{ width: '100%', background: '#f0f4f7', border: 'none', borderRadius: '4px', padding: '10px 14px', fontWeight: 600, color: '#2a3439', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717c82' }}>Barcode (EAN-13)</label>
                    <input
                      type="text"
                      name="barcode"
                      value={editFormData.barcode || ''}
                      onChange={handleEditFormChange}
                      required
                      style={{ width: '100%', background: '#f0f4f7', border: 'none', borderRadius: '4px', padding: '10px 14px', fontWeight: 600, color: '#2a3439', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717c82' }}>Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description || ''}
                    onChange={handleEditFormChange}
                    rows={2}
                    style={{ width: '100%', background: '#f0f4f7', border: 'none', borderRadius: '4px', padding: '10px 14px', fontWeight: 600, color: '#2a3439', outline: 'none', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px', padding: '16px 0', borderTop: '1px solid rgba(169, 180, 185, 0.10)', borderBottom: '1px solid rgba(169, 180, 185, 0.10)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717c82' }}>Cost Price</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#717c82', fontWeight: 700 }}>{currencySymbol}</span>
                      <input
                        type="number"
                        name="costPrice"
                        value={editFormData.costPrice || 0}
                        onChange={handleEditFormChange}
                        min="0"
                        step="0.01"
                        style={{ width: '100%', background: '#f0f4f7', border: 'none', borderRadius: '4px', padding: '10px 14px 10px 30px', fontWeight: 900, color: '#2a3439', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717c82' }}>Sale Price</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#565e74', fontWeight: 700 }}>{currencySymbol}</span>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price || 0}
                        onChange={handleEditFormChange}
                        min="0"
                        step="0.01"
                        required
                        style={{ width: '100%', background: '#f0f4f7', border: 'none', borderRadius: '4px', padding: '10px 14px 10px 30px', fontWeight: 900, color: '#565e74', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717c82' }}>Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={editFormData.quantity || 0}
                      onChange={handleEditFormChange}
                      min="0"
                      required
                      style={{ width: '100%', background: '#f0f4f7', border: 'none', borderRadius: '4px', padding: '10px 14px', fontWeight: 900, color: '#2a3439', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717c82' }}>Min Stock Level</label>
                    <input
                      type="number"
                      name="minStockLevel"
                      value={editFormData.minStockLevel || 0}
                      onChange={handleEditFormChange}
                      min="0"
                      style={{ width: '100%', background: '#f0f4f7', border: 'none', borderRadius: '4px', padding: '10px 14px', fontWeight: 900, color: '#2a3439', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717c82' }}>Inventory Status</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        name="status"
                        value={editFormData.status || 'active'}
                        onChange={handleEditFormChange}
                        style={{ width: '100%', background: 'rgba(218, 226, 253, 0.30)', border: 'none', borderRadius: '4px', padding: '10px 14px', fontWeight: 700, color: '#4a5167', appearance: 'none', outline: 'none' }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Archived</option>
                        <option value="out_of_stock">Discontinued</option>
                      </select>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#4a5167' }}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717c82', marginBottom: '12px', textAlign: 'right' }}>
                      System Barcode Preview
                    </label>
                    <div style={{ background: '#ffffff', padding: '10px', border: '1px solid rgba(169, 180, 185, 0.20)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img
                        src={generateBarcodeUrl(editFormData.barcode)}
                        alt="Barcode"
                        style={{ width: '148px', height: '40px', objectFit: 'contain' }}
                        onError={handleBarcodeError}
                      />
                      <span style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.35em', marginTop: '4px', color: '#2a3439' }}>
                        {editFormData.barcode || '000000'}
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div style={{ padding: '16px 22px', background: '#f0f4f7', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  document.body.style.overflow = 'auto';
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#566166',
                  padding: '14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  borderRadius: 0,
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#9f403d'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#566166'; }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editProductForm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 30px', background: '#565e74', color: '#f7f7ff', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '13px', letterSpacing: '0.02em', cursor: 'pointer', boxShadow: '0 10px 20px -10px rgba(86, 94, 116, 0.45)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Label Modal */}
      {showProductLabel && selectedProduct && (
        <ProductLabel
          product={selectedProduct}
          onClose={() => {
            setShowProductLabel(false);
            document.body.style.overflow = 'auto';
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div
          className="products-modal-overlay"
          onClick={() => {
            setIsDeleteConfirmOpen(false);
            document.body.style.overflow = 'auto';
          }}
        >
          <div
            className="products-modal-container delete"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="products-modal-header">
              <div className="products-modal-title">Confirm Delete</div>
              <button
                className="products-modal-close"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  // Restore body overflow
                  document.body.style.overflow = 'auto';
                }}
              >
                <FiX />
              </button>
            </div>
            <div className="products-delete-modal-body">
              <p className="products-delete-modal-message">
                Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="products-delete-modal-buttons">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    // Restore body overflow
                    document.body.style.overflow = 'auto';
                  }}
                  className="products-delete-modal-btn cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="products-delete-modal-btn delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AllProducts;