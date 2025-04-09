


// To whoever is reading this. i have added starter code that you need to use. (scrum master moment)
// we need to show the Tas, that were was a certain level of agreeement on how to implement the frontend. + we need this for future pages
// besides the card you dont need to use any more bootstrap. https://react-bootstrap.github.io/docs/components/cards
// You can use as much html as u want within the card.


// if you are facing an issue, feel free to text me. i will probably be extremely confused/unhelpful 
// but its free and whats there to loose besides my respect for you. 
// delete this after reading.



import React, { useState } from 'react';
import './inventory.css';  // Ensure your CSS path is correct
import Sidebar from '../components/sidebar';  // Ensure the sidebar import path is correct

// Import images for all products
import sodaImage from '../images/soda.jpeg';  // Soda Can image
import chocolateImage from '../images/chocolate.jpeg';  // Chocolate Bar image (update path if needed)
import milkImage from '../images/milk.jpg';  // Milk Carton image (update path if needed)

const products = [
  {
    id: 1,
    name: 'Soda Can',
    photo: sodaImage,  // Use the imported image for the Soda Can
    details: {
      type: 'Drink',
      brand: 'FizzUp',
      price: '₹35',
      weight: '330ml',
      barcode: 'ABC1234567890',
      qty: 50,  // Added quantity for product
    }
  },
  {
    id: 2,
    name: 'Chocolate Bar',
    photo: chocolateImage,  // Use the imported image for Chocolate Bar
    details: {
      type: 'Snack',
      brand: 'ChocoLuxe',
      price: '₹50',
      weight: '100g',
      barcode: 'XYZ9876543210',
      qty: 30,  // Added quantity for product
    }
  },
  {
    id: 3,
    name: 'Milk Carton',
    photo: milkImage,  // Use the imported image for Milk Carton
    details: {
      type: 'Dairy',
      brand: 'MilkyWay',
      price: '₹25',
      weight: '500ml',
      barcode: 'LMN4561237890',
      qty: 20,  // Added quantity for product
    }
  },
];

const Inventory = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredProducts.map((product) => (
                <tr key={product.id} className="product-row">
                  <td className="py-2">{product.id}</td>
                  <td className="py-2 inventory-photo">
                    {/* Display the photo */}
                    {product.photo && (
                      <img src={product.photo} alt={product.name} className="product-img" />
                    )}
                  </td>
                  <td className="py-2">{product.name}</td>
                  <td className="py-2">{product.details.type}</td>
                  <td className="py-2">{product.details.barcode}</td>
                  <td className="py-2">{product.details.price}</td>
                  <td className="py-2">{product.details.qty}</td>
                  <td className="py-2">
                    <button
                      className="eye-button"
                      onClick={() => setSelectedProduct(product)}
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  src={selectedProduct.photo}
                  alt={selectedProduct.name}
                  style={{ width: '204px', height: '183px', objectFit: 'cover' }}  // Center image and ensure correct dimensions
                />
              </div>

              <div className="popup-text-container bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-2 gap-8 mb-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Type</span>
                    <span>{selectedProduct.details.type}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Product Code</span>
                    <span>{selectedProduct.id}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Product</span>
                    <span>{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Brand</span>
                    <span>{selectedProduct.details.brand}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Category</span>
                    <span>{selectedProduct.details.type}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Price</span>
                    <span>{selectedProduct.details.price}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Stock</span>
                    <span>{selectedProduct.details.qty}</span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <span>{selectedProduct.details.barcode}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
