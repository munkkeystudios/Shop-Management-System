import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/sidebar';  // Ensure the sidebar import path is correct

//
import sodaImage from '../images/soda.jpeg';
import chocolateImage from '../images/chocolate.jpeg';
import milkImage from '../images/milk.jpg';
import defaultProductImage from '../images/default-product-image.jpg'; // You might need to add this file

const Inventory = () => {
  //get the state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  //fetching on component mount or page change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        //get token
        const token = localStorage.getItem('token');
        
        if (!token) {
          //not authenticated, redicrect to login
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
  }, [currentPage]); //re fetch/ reload on page change

  //filtering products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0]; //first image of prodcuts to be shown
    }
    if (product.name.toLowerCase().includes('soda')) return sodaImage;
    if (product.name.toLowerCase().includes('chocolate')) return chocolateImage;
    if (product.name.toLowerCase().includes('milk')) return milkImage;
    return defaultProductImage; //fallback to deault img
  };

  return (
    <div className="inventory-page">
      <Sidebar />
      <div className="inventory-content flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <div className="flex items-center space-x-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded">
              POS
            </button>
            <input
              className="border rounded px-4 py-2"
              placeholder="Search"
              type="text"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <span>En</span>
              <i className="fas fa-user-circle text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">All Products</h3>
            <input
              className="search-bar border rounded px-4 py-2"
              placeholder="Search for products"
              type="text"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="create-new-product-button bg-green-500 text-white px-4 py-2 rounded">
              Create New Product
            </button>
          </div>

          <table className="inventory-table w-full">
            <thead>
              <tr>
                <th className="py-2">P-Code</th>
                <th className="py-2">Photo</th>
                <th className="py-2">Title</th>
                <th className="py-2">Category</th>
                <th className="py-2">SKU</th>
                <th className="py-2">Sale Price</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">Loading products...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-red-500">{error}</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">No products found</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="product-row">
                    <td className="py-2">{product._id.substring(0, 6)}</td>
                    <td className="py-2 inventory-photo">
                      <img 
                        src={getProductImage(product)} 
                        alt={product.name} 
                        className="product-img" 
                      />
                    </td>
                    <td className="py-2">{product.name}</td>
                    <td className="py-2">{product.category ? product.category.name : 'Uncategorized'}</td>
                    <td className="py-2">{product.barcode}</td>
                    <td className="py-2">₹{product.price}</td>
                    <td className="py-2">{product.quantity}</td>
                    <td className="py-2">
                      <button
                        className="eye-button"
                        onClick={() => setSelectedProduct(product)}
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 mx-1 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
              >
                Previous
              </button>
              
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 mx-1 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {selectedProduct && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="popup-container bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
              <div className="flex justify-between items-center mb-4">
                <button className="print-button bg-black text-white px-4 py-2 rounded-md flex items-center">
                  <i className="print-label-text fas fa-print mr-2"></i>
                  Print Label
                </button>
                <h2 className="text-2xl font-semibold">Product Details</h2>
                <button
                  className="text-gray-500 text-xl"
                  onClick={() => setSelectedProduct(null)}
                >
                  ×
                </button>
              </div>

              {/* Product Image/Icon Outside the Text Div */}
              <div
                className="product-image-container flex justify-center items-center mb-6"
                style={{ width: '591px', height: '183px' }}
              >
                {/* Product Icon */}
                <img
                  src={getProductImage(selectedProduct)}
                  alt={selectedProduct.name}
                  style={{ width: '204px', height: '183px', objectFit: 'cover' }}
                />
              </div>

              <div className="popup-text-container bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-2 gap-8 mb-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Category</span>
                    <span>{selectedProduct.category ? selectedProduct.category.name : 'Uncategorized'}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Product Code</span>
                    <span>{selectedProduct._id.substring(0, 8)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Product</span>
                    <span>{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Supplier</span>
                    <span>{selectedProduct.supplier ? selectedProduct.supplier.name : 'None'}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Status</span>
                    <span>{selectedProduct.status || 'Active'}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Price</span>
                    <span>₹{selectedProduct.price}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Stock</span>
                    <span>{selectedProduct.quantity}</span>
                  </div>
                  {selectedProduct.costPrice && (
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold">Cost Price</span>
                      <span>₹{selectedProduct.costPrice}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center mt-4">
                <span>{selectedProduct.barcode}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
