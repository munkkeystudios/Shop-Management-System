import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaPrint } from 'react-icons/fa';
import { FiEdit, FiTrash, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Layout from '../components/Layout';
import { productsAPI } from '../services/api';
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

        if (!token) {
          // Redirect to login if not authenticated
          window.location.href = '/login';
          return;
        }

        const response = await productsAPI.getAll({ page: currentPage });

        setProducts(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);



  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      const response = await productsAPI.getAll({ page: currentPage });
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
      const response = await productsAPI.getAll({ page: currentPage });
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

  return (
    <Layout title="All Products">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="products-frame">
        <div className="products-div-2">
          <div className="products-div-3">
            <div className="products-div-4">
              <div className="products-text-2">All Products</div>
              <div className="products-controls-container">
                <div className="products-search-container">
                  <FaSearch className="products-search-icon" />
                  <input
                    type="text"
                    placeholder="Search this table"
                    className="products-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="products-action-buttons">
                  <button
                    className="products-create-button"
                    onClick={handleCreateProduct}
                  >
                    <FaPlus /> Create New Product
                  </button>
                </div>
              </div>
            </div>

            <div className="products-div-6">
              <div className="products-div-7">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>P-Code</th>
                      <th>Photo</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>SKU</th>
                      <th>Sale Price</th>
                      <th>Qty</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id}>
                        <td>{product.barcode}</td>
                        <td>
                          <div className="products-image-container">
                            <img
                              src={getProductImage(product)}
                              alt={product.name}
                              className="products-image"
                            />
                          </div>
                        </td>
                        <td>{product.name}</td>
                        <td>{product.category ? product.category.name : 'Uncategorized'}</td>
                        <td>{product.barcode}</td>
                        <td>${product.price?.toFixed(2)}</td>
                        <td>{product.quantity}</td>
                        <td>
                          <div className="action-icons">
                            <FiEye
                              className="edit-icon"
                              title="View"
                              onClick={() => {
                                setSelectedProduct(product);
                                // Add overflow hidden to body to prevent background scrolling
                                document.body.style.overflow = 'hidden';
                              }}
                            />
                            <FiEdit
                              className="edit-icon"
                              title="Edit"
                              onClick={() => handleEditClick(product)}
                            />
                            <FiTrash
                              className="delete-icon"
                              title="Delete"
                              onClick={() => handleDeleteClick(product)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="products-pagination-container">
                  <div className="products-pagination-controls">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="products-pagination-button"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="products-pagination-button"
                    >
                      Next
                    </button>
                  </div>
                  <span className="products-page-info">Page {currentPage} of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            className="products-modal-container details"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="products-modal-header">
              <button
                className="products-print-label-btn"
                onClick={() => setShowProductLabel(true)}
              >
                <FaPrint size={12} /> Print Label
              </button>
              <div className="products-modal-title">
                Product Details
              </div>
              <button
                className="products-modal-close"
                onClick={() => {
                  setSelectedProduct(null);
                  // Restore body overflow
                  document.body.style.overflow = 'auto';
                }}
              >
                ×
              </button>
            </div>

            {/* Image Section */}
            <div className="products-modal-image">
              <img
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.name}
              />
            </div>

            {/* Details Section */}
            <div className="products-modal-details">
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Type</div>
                <div className="products-modal-detail-value">Single</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Code Product</div>
                <div className="products-modal-detail-value">{selectedProduct._id.substring(0, 8)}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Product</div>
                <div className="products-modal-detail-value">{selectedProduct.name}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Brand</div>
                <div className="products-modal-detail-value">{selectedProduct.brand || 'N/A'}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Category</div>
                <div className="products-modal-detail-value">{selectedProduct.category ? selectedProduct.category.name : 'Uncategorized'}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Cost</div>
                <div className="products-modal-detail-value">${selectedProduct.costPrice?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Warehouse</div>
                <div className="products-modal-detail-value">Warehouse 1</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Price</div>
                <div className="products-modal-detail-value">${selectedProduct.price?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Unit</div>
                <div className="products-modal-detail-value">Pc</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Tax</div>
                <div className="products-modal-detail-value">0.00%</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Stock</div>
                <div className="products-modal-detail-value">{selectedProduct.quantity || '0'}</div>
              </div>

              {/* Barcode Section */}
              <div className="products-modal-barcode">
                <div className="text-center">
                  <img
                    src={generateBarcodeUrl(selectedProduct.barcode)}
                    alt="Barcode"
                    style={{ width: '120px', height: '30px' }}
                    onError={handleBarcodeError}
                  />
                  <div style={{ fontSize: '11px', marginTop: '2px' }}>
                    {selectedProduct.barcode || '000000000000'}
                  </div>
                </div>
              </div>
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
            className="products-modal-container details"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="products-modal-header">
              <button
                className="products-print-label-btn"
                type="submit"
                form="editProductForm"
              >
                Save Changes
              </button>
              <div className="products-modal-title">
                Edit Product
              </div>
              <button
                className="products-modal-close"
                onClick={() => {
                  setIsEditModalOpen(false);
                  // Restore body overflow
                  document.body.style.overflow = 'auto';
                }}
              >
                ×
              </button>
            </div>

            {/* Image Section */}
            <div className="products-modal-image">
              <img
                src={getProductImage({...editFormData, name: editFormData.name || ''})}
                alt={editFormData.name || 'Product'}
              />
            </div>

            {/* Form as Details */}
            <form id="editProductForm" onSubmit={handleEditSubmit}>
              <div className="products-modal-details">
                <div className="products-modal-detail-row">
                  <div className="products-modal-detail-label">Product Name</div>
                  <div className="products-modal-detail-value">
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name || ''}
                      onChange={handleEditFormChange}
                      className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="products-modal-detail-row">
                  <div className="products-modal-detail-label">Barcode</div>
                  <div className="products-modal-detail-value">
                    <input
                      type="text"
                      name="barcode"
                      value={editFormData.barcode || ''}
                      onChange={handleEditFormChange}
                      className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="products-modal-detail-row">
                  <div className="products-modal-detail-label">Description</div>
                  <div className="products-modal-detail-value">
                    <input
                      type="text"
                      name="description"
                      value={editFormData.description || ''}
                      onChange={handleEditFormChange}
                      className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="products-modal-detail-row">
                  <div className="products-modal-detail-label">Sale Price</div>
                  <div className="products-modal-detail-value">
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price || 0}
                      onChange={handleEditFormChange}
                      className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="products-modal-detail-row">
                  <div className="products-modal-detail-label">Cost Price</div>
                  <div className="products-modal-detail-value">
                    <input
                      type="number"
                      name="costPrice"
                      value={editFormData.costPrice || 0}
                      onChange={handleEditFormChange}
                      className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="products-modal-detail-row">
                  <div className="products-modal-detail-label">Quantity</div>
                  <div className="products-modal-detail-value">
                    <input
                      type="number"
                      name="quantity"
                      value={editFormData.quantity || 0}
                      onChange={handleEditFormChange}
                      className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="products-modal-detail-row">
                  <div className="products-modal-detail-label">Min Stock Level</div>
                  <div className="products-modal-detail-value">
                    <input
                      type="number"
                      name="minStockLevel"
                      value={editFormData.minStockLevel || 0}
                      onChange={handleEditFormChange}
                      className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none"
                      min="0"
                    />
                  </div>
                </div>

                <div className="products-modal-detail-row">
                  <div className="products-modal-detail-label">Status</div>
                  <div className="products-modal-detail-value">
                    <select
                      name="status"
                      value={editFormData.status || 'active'}
                      onChange={handleEditFormChange}
                      className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Barcode Section */}
              <div className="products-modal-barcode">
                <div className="text-center">
                  <img
                    src={generateBarcodeUrl(editFormData.barcode)}
                    alt="Barcode"
                    style={{ width: '120px', height: '30px' }}
                    onError={handleBarcodeError}
                  />
                  <div style={{ fontSize: '11px', marginTop: '2px' }}>
                    {editFormData.barcode || '000000000000'}
                  </div>
                </div>
              </div>
            </form>
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
                ×
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    // Restore body overflow
                    document.body.style.overflow = 'auto';
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
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