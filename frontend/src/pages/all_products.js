import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';  // Keeping the sidebar import as is

// Import images
import sodaImage from '../images/soda.jpeg';
import chocolateImage from '../images/chocolate.jpeg';
import milkImage from '../images/milk.jpg';
import defaultProductImage from '../images/default-product-image.jpg';

const Inventory = () => {
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
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header with title and search */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">All Products</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products"
                  className="border border-gray-300 rounded-md px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-md transition duration-200">
                Create New Product
              </button>
            </div>
          </div>

          {/* Products table */}
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600 text-sm">
                    <th className="px-4 py-3 font-medium">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-4 w-4 text-blue-600"
                        checked={selectedItems.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 font-medium">P-Code</th>
                    <th className="px-4 py-3 font-medium">Photo</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Sale Price</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">Loading products...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-red-500">{error}</td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">No products found</td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox" 
                            className="form-checkbox h-4 w-4 text-blue-600"
                            checked={selectedItems.includes(product._id)}
                            onChange={() => toggleSelect(product._id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {product._id.substring(0, 4)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 flex-shrink-0">
                            <img 
                              src={getProductImage(product)} 
                              alt={product.name} 
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {product.category ? product.category.name : 'Uncategorized'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {product.barcode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          ${product.price?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => setSelectedProduct(product)}
                            >
                              👁️
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              🗑️
                            </button>
                            <button className="text-green-600 hover:text-green-800">
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Product Details</h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-xl"
                onClick={() => setSelectedProduct(null)}
              >
                ×
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Product Name</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {selectedProduct.category ? selectedProduct.category.name : 'Uncategorized'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">SKU</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">{selectedProduct.barcode}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Product Code</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">{selectedProduct._id.substring(0, 8)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Sale Price</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">${selectedProduct.price?.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">{selectedProduct.quantity}</p>
                  </div>
                  {selectedProduct.costPrice && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Cost Price</h3>
                      <p className="mt-1 text-lg font-medium text-gray-900">${selectedProduct.costPrice?.toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">{selectedProduct.status || 'Active'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;