import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaFileExcel, FaFilePdf, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/sidebar';
import './all_products.css';

// Import images
import sodaImage from '../images/soda.jpeg';
import chocolateImage from '../images/chocolate.jpeg';
import milkImage from '../images/milk.jpg';
import defaultProductImage from '../images/default-product-image.jpg';

const Inventory = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        
        const response = await axios.get(`/api/products?page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
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

  // Handle checkbox selection
  const toggleSelect = (productId) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter(id => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  // Handle select all checkbox
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredProducts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredProducts.map(product => product._id));
    }
  };

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

  return (
    <div className="products-main-container">
      <Sidebar />
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
                      <th>
                        <input 
                          type="checkbox" 
                          className="products-checkbox"
                          onChange={toggleSelectAll}
                          checked={selectedItems.length === filteredProducts.length}
                        />
                      </th>
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
                        <td>
                          <input 
                            type="checkbox" 
                            className="products-checkbox"
                            checked={selectedItems.includes(product._id)}
                            onChange={() => toggleSelect(product._id)}
                          />
                        </td>
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
                          <div className="products-action-buttons">
                            <button 
                              className="products-action-button"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <FaEye />
                            </button>
                            <button className="products-action-button">
                              <FaEdit />
                            </button>
                            <button className="products-action-button">
                              <FaTrash />
                            </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-[671px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <span className="bg-black text-white text-xs px-2 py-0.5 rounded">Print Label</span>
                <span className="text-base">Product Details</span>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedProduct(null)}
              >
                ×
              </button>
            </div>

            {/* Image Section */}
            <div className="bg-gray-50 flex justify-center items-center" style={{ height: '183px' }}>
              <img
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.name}
                style={{ width: '204px', height: '183px', objectFit: 'contain' }}
              />
            </div>

            {/* Details Section */}
            <div className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Type</span>
                  <span>Single</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Code Product</span>
                  <span>{selectedProduct._id.substring(0, 8)}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Product</span>
                  <span>{selectedProduct.name}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Brand</span>
                  <span>{selectedProduct.brand || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Category</span>
                  <span>{selectedProduct.category ? selectedProduct.category.name : 'Uncategorized'}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Cost</span>
                  <span>${selectedProduct.costPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Warehouse</span>
                  <span>Warehouse 1</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Price</span>
                  <span>${selectedProduct.price?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Unit</span>
                  <span>Pc</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>0.00%</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Stock</span>
                  <span>{selectedProduct.quantity || '0'}</span>
                </div>
              </div>

              {/* Barcode Section */}
              <div className="mt-4 pt-4 border-t flex justify-center">
                <div className="text-center">
                  <svg className="w-32 h-12" viewBox="0 0 100 30">
                    <rect x="10" y="5" width="80" height="20" fill="#fff" stroke="#ddd" />
                    <text x="50" y="28" textAnchor="middle" fontSize="8">
                      {selectedProduct.barcode || '000000000000'}
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;