
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import { salesAPI, productsAPI } from '../services/api'; // Import salesAPI and productsAPI
// import './CreateSale.css'; // Create this CSS file for styling
// import { FaPlus, FaTrash } from 'react-icons/fa';

// const CreateSale = () => {
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({
//         billNumber: '',
//         customerName: '',
//         customerPhone: '',
//         items: [{ productId: '', quantity: 1, price: 0, productDiscountRate: 0 }], // Start with one item row
//         subtotal: 0,
//         discount: 0,
//         tax: 0,
//         total: 0,
//         paymentMethod: 'cash',
//         amountPaid: 0,
//         notes: '',
//     });
//     const [products, setProducts] = useState([]); // To store product list for dropdown
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [success, setSuccess] = useState(null);

//     // Fetch products for the dropdown
//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const response = await productsAPI.getAll({ limit: 1000 }); // Fetch a large number for selection
//                 if (response.data.success) {
//                     setProducts(response.data.data);
//                 } else {
//                     console.error("Failed to fetch products");
//                 }
//             } catch (err) {
//                 console.error("Error fetching products:", err);
//             }
//         };
//         fetchProducts();
//     }, []);

//     // Fetch the next bill number
//     useEffect(() => {
//         const fetchLastBillNumber = async () => {
//             try {
//                 const response = await salesAPI.getLastBillNumber();
//                 const lastBill = response.data.lastBillNumber;
//                 setFormData(prev => ({ ...prev, billNumber: lastBill ? lastBill + 1 : 1 }));
//             } catch (err) {
//                 console.error('Error fetching last bill number:', err);
//                 setError("Could not fetch next bill number. Please enter manually.");
//                 // Allow manual entry if fetch fails
//                 setFormData(prev => ({ ...prev, billNumber: '' }));
//             }
//         };
//         fetchLastBillNumber();
//     }, []);

//     const calculateTotals = (items, discount = formData.discount, taxRate = 0.10) => { // Assuming 10% tax rate
//         const subtotal = items.reduce((sum, item) => {
//              const effectivePrice = item.price * (1 - (item.productDiscountRate || 0) / 100);
//              return sum + (effectivePrice * item.quantity);
//         }, 0);
//         const tax = (subtotal - discount) * taxRate; // Calculate tax after discount
//         const total = subtotal - discount + tax;
//         return {
//             subtotal: parseFloat(subtotal.toFixed(2)),
//             tax: parseFloat(tax.toFixed(2)),
//             total: parseFloat(total.toFixed(2))
//         };
//     };


//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//          let newFormData = { ...formData, [name]: value };

//          if (name === 'discount') {
//             const { subtotal, tax, total } = calculateTotals(formData.items, parseFloat(value || 0));
//             newFormData = { ...newFormData, subtotal, tax, total, amountPaid: total }; // Update amountPaid when total changes
//          } else if (name === 'amountPaid'){
//              newFormData = { ...newFormData, amountPaid: parseFloat(value || 0) };
//          }

//         setFormData(newFormData);
//         setError(null);
//         setSuccess(null);
//     };

//     const handleItemChange = (index, e) => {
//         const { name, value } = e.target;
//         const newItems = [...formData.items];
//         let productDetails = {};

//         if (name === 'productId') {
//             const selectedProduct = products.find(p => p._id === value);
//             if (selectedProduct) {
//                 productDetails = {
//                     price: selectedProduct.price,
//                     // You could fetch/set more details if needed
//                     // productDiscountRate: selectedProduct.discountRate || 0 // Use product's default discount?
//                 };
//             } else {
//                  productDetails = { price: 0 }; // Reset price if product not found
//             }
//              newItems[index] = { ...newItems[index], [name]: value, ...productDetails };
//         } else {
//             newItems[index] = { ...newItems[index], [name]: value };
//         }


//         // Recalculate totals
//         const { subtotal, tax, total } = calculateTotals(newItems);
//         setFormData({ ...formData, items: newItems, subtotal, tax, total, amountPaid: total }); // Update amountPaid when total changes
//     };

//     const addItem = () => {
//         const newItems = [...formData.items, { productId: '', quantity: 1, price: 0, productDiscountRate: 0 }];
//         const { subtotal, tax, total } = calculateTotals(newItems);
//         setFormData({ ...formData, items: newItems, subtotal, tax, total, amountPaid: total });
//     };

//     const removeItem = (index) => {
//         const newItems = formData.items.filter((_, i) => i !== index);
//          if (newItems.length === 0) { // Ensure at least one item row remains
//              newItems.push({ productId: '', quantity: 1, price: 0, productDiscountRate: 0 });
//          }
//         const { subtotal, tax, total } = calculateTotals(newItems);
//         setFormData({ ...formData, items: newItems, subtotal, tax, total, amountPaid: total });
//     };


//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError(null);
//         setSuccess(null);

//         // --- Basic Validation ---
//         if (!formData.billNumber || isNaN(parseInt(formData.billNumber))) {
//             setError("Please enter a valid Bill Number.");
//             setLoading(false);
//             return;
//         }
//         if (formData.items.length === 0 || formData.items.some(item => !item.productId || item.quantity <= 0)) {
//             setError("Please add valid products and quantities to the sale.");
//             setLoading(false);
//             return;
//         }
//          if (formData.amountPaid < 0 || isNaN(formData.amountPaid)) {
//              setError("Amount Paid must be a non-negative number.");
//              setLoading(false);
//              return;
//          }
//          if (formData.discount < 0 || isNaN(formData.discount)) {
//              setError("Discount must be a non-negative number.");
//              setLoading(false);
//              return;
//          }


//         // Prepare data for API
//         const saleData = {
//             billNumber: parseInt(formData.billNumber),
//             customerName: formData.customerName || 'Walk-in Customer',
//             customerPhone: formData.customerPhone || null,
//             // Map frontend items to backend structure
//             items: formData.items.map(item => {
//                  const effectivePrice = item.price * (1 - (item.productDiscountRate || 0) / 100);
//                  return {
//                       product: item.productId,
//                       quantity: parseInt(item.quantity),
//                       price: parseFloat(item.price), // Original price per unit
//                       productDiscountRate: parseFloat(item.productDiscountRate || 0),
//                       effectivePrice: parseFloat(effectivePrice.toFixed(2)), // Price after item discount
//                       subtotal: parseFloat((effectivePrice * item.quantity).toFixed(2)) // Subtotal for the line item
//                  };
//             }),
//             subtotal: formData.subtotal,
//             discount: parseFloat(formData.discount || 0),
//             tax: formData.tax, // Already calculated
//             total: formData.total, // Already calculated
//             paymentMethod: formData.paymentMethod,
//             amountPaid: parseFloat(formData.amountPaid),
//             change: Math.max(0, formData.amountPaid - formData.total), // Calculate change
//             notes: formData.notes,
//         };

//          // Log data being sent
//          console.log("Submitting Sale Data:", saleData);


//         try {
//             const response = await salesAPI.create(saleData);
//             console.log("API Response:", response);
//             if (response.data.success) {
//                 setSuccess(`Sale #${saleData.billNumber} created successfully!`);
//                 // Reset form or navigate away
//                 // navigate('/sales'); // Option 1: Navigate to sales list
//                 setFormData({ // Option 2: Reset form for next sale
//                       billNumber: formData.billNumber + 1, // Increment bill number
//                       customerName: '', customerPhone: '',
//                       items: [{ productId: '', quantity: 1, price: 0, productDiscountRate: 0 }],
//                       subtotal: 0, discount: 0, tax: 0, total: 0,
//                       paymentMethod: 'cash', amountPaid: 0, notes: '',
//                  });
//                  setError(null); // Clear error on success
//             } else {
//                 setError(response.data.message || 'Failed to create sale.');
//             }
//         } catch (err) {
//             console.error('Error creating sale:', err.response || err);
//             setError(err.response?.data?.message || 'An error occurred while creating the sale.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Layout title="Create New Sale">
//             <div className="create-sale-container">
//                 <h1>Create New Sale</h1>

//                 {error && <div className="alert error">{error}</div>}
//                 {success && <div className="alert success">{success}</div>}

//                 <form onSubmit={handleSubmit} className="create-sale-form">
//                     {/* Row 1: Bill#, Customer */}
//                     <div className="form-row">
//                         <div className="form-group">
//                             <label htmlFor="billNumber">Bill Number*</label>
//                             <input
//                                 type="number"
//                                 id="billNumber"
//                                 name="billNumber"
//                                 value={formData.billNumber}
//                                 onChange={handleInputChange}
//                                 required
//                                 readOnly // Make read-only if fetched automatically
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="customerName">Customer Name</label>
//                             <input
//                                 type="text"
//                                 id="customerName"
//                                 name="customerName"
//                                 value={formData.customerName}
//                                 onChange={handleInputChange}
//                                 placeholder="Walk-in Customer"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label htmlFor="customerPhone">Customer Phone</label>
//                             <input
//                                 type="tel"
//                                 id="customerPhone"
//                                 name="customerPhone"
//                                 value={formData.customerPhone}
//                                 onChange={handleInputChange}
//                             />
//                         </div>
//                     </div>

//                     {/* Items Section */}
//                     <h2>Items</h2>
//                     <div className="items-section">
//                         {formData.items.map((item, index) => (
//                             <div key={index} className="item-row">
//                                 <div className="form-group item-product">
//                                      <label>Product*</label>
//                                     <select
//                                         name="productId"
//                                         value={item.productId}
//                                         onChange={(e) => handleItemChange(index, e)}
//                                         required
//                                     >
//                                         <option value="">Select Product</option>
//                                         {products.map(p => (
//                                             <option key={p._id} value={p._id}>
//                                                 {p.name} ({p.barcode}) - ${p.price.toFixed(2)}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div className="form-group item-qty">
//                                      <label>Qty*</label>
//                                     <input
//                                         type="number"
//                                         name="quantity"
//                                         min="1"
//                                         value={item.quantity}
//                                         onChange={(e) => handleItemChange(index, e)}
//                                         required
//                                     />
//                                 </div>
//                                 <div className="form-group item-price">
//                                      <label>Price*</label>
//                                     <input
//                                         type="number"
//                                         name="price"
//                                         min="0"
//                                         step="0.01"
//                                         value={item.price}
//                                         onChange={(e) => handleItemChange(index, e)}
//                                         required
//                                         readOnly // Price is usually set by product selection
//                                     />
//                                 </div>
//                                  <div className="form-group item-discount">
//                                      <label>Discount (%)</label>
//                                      <input
//                                           type="number"
//                                           name="productDiscountRate"
//                                           min="0"
//                                           max="100"
//                                           step="0.01"
//                                           value={item.productDiscountRate || 0}
//                                           onChange={(e) => handleItemChange(index, e)}
//                                           placeholder="0"
//                                      />
//                                  </div>
//                                 <div className="form-group item-subtotal">
//                                     <label>Subtotal</label>
//                                     <span>${(item.price * (1-(item.productDiscountRate||0)/100) * item.quantity).toFixed(2)}</span>
//                                 </div>

//                                 <button
//                                     type="button"
//                                     onClick={() => removeItem(index)}
//                                     className="remove-item-button"
//                                     disabled={formData.items.length <= 1} // Disable remove if only one item
//                                 >
//                                     <FaTrash />
//                                 </button>
//                             </div>
//                         ))}
//                         <button type="button" onClick={addItem} className="add-item-button">
//                             <FaPlus /> Add Item
//                         </button>
//                     </div>

//                     {/* Totals and Payment Section */}
//                      <div className="totals-payment-section">
//                           <div className="totals-summary">
//                               <h3>Summary</h3>
//                               <div className="summary-row"><span>Subtotal:</span> <span>${formData.subtotal.toFixed(2)}</span></div>
//                               <div className="summary-row">
//                                    <span>Order Discount:</span>
//                                    <input
//                                         type="number"
//                                         id="discount"
//                                         name="discount"
//                                         min="0"
//                                         step="0.01"
//                                         value={formData.discount}
//                                         onChange={handleInputChange}
//                                         placeholder="0.00"
//                                    />
//                               </div>
//                               <div className="summary-row"><span>Tax (10%):</span> <span>${formData.tax.toFixed(2)}</span></div>
//                               <div className="summary-row total"><span>Total:</span> <span>${formData.total.toFixed(2)}</span></div>
//                           </div>

//                           <div className="payment-details">
//                                <h3>Payment</h3>
//                                <div className="form-group">
//                                    <label htmlFor="paymentMethod">Payment Method*</label>
//                                    <select
//                                        id="paymentMethod"
//                                        name="paymentMethod"
//                                        value={formData.paymentMethod}
//                                        onChange={handleInputChange}
//                                        required
//                                    >
//                                        <option value="cash">Cash</option>
//                                        <option value="card">Card</option>
//                                        <option value="mobile_payment">Mobile Payment</option>
//                                        <option value="credit">Credit</option>
//                                    </select>
//                                </div>
//                                <div className="form-group">
//                                    <label htmlFor="amountPaid">Amount Paid*</label>
//                                    <input
//                                        type="number"
//                                        id="amountPaid"
//                                        name="amountPaid"
//                                        min="0"
//                                        step="0.01"
//                                        value={formData.amountPaid}
//                                        onChange={handleInputChange}
//                                        required
//                                    />
//                                </div>
//                                 <div className="form-group">
//                                     <label>Change:</label>
//                                     <span>${Math.max(0, formData.amountPaid - formData.total).toFixed(2)}</span>
//                                 </div>
//                           </div>
//                      </div>


//                     {/* Notes Section */}
//                     <div className="form-group form-group-full">
//                         <label htmlFor="notes">Notes</label>
//                         <textarea
//                             id="notes"
//                             name="notes"
//                             value={formData.notes}
//                             onChange={handleInputChange}
//                             rows="3"
//                         ></textarea>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="form-actions">
//                         <button type="submit" disabled={loading} className="submit-button">
//                             {loading ? 'Creating Sale...' : 'Create Sale'}
//                         </button>
//                          <button type="button" onClick={() => navigate('/dashboard')} className="cancel-button">
//                               Cancel
//                          </button>
//                     </div>
//                 </form>
//             </div>
//         </Layout>
//     );
// };

// export default CreateSale;


// pages/CreateSale.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import TransactionNotification from './TransactionNotification';
import './CreateSale.css';

const CreateSale = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customer, setCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    data: null
  });

  useEffect(() => {
    // Fetch available products
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProducts(res.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    fetchProducts();
  }, []);

  const handleAddProduct = (product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    
    if (existingProduct) {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === product.id 
          ? { ...p, quantity: p.quantity + 1 } 
          : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;
    
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId 
        ? { ...p, quantity: parseInt(quantity, 10) } 
        : p
    ));
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => 
      total + (product.price * product.quantity), 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      alert('Please add at least one product to the sale');
      return;
    }
    
    const saleData = {
      products: selectedProducts.map(p => ({
        product: p.id,
        quantity: p.quantity,
        price: p.price,
        productName: p.name
      })),
      customer,
      totalAmount: calculateTotal(),
      paymentMethod
    };
    
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/sales`, saleData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Show success notification
      setNotification({
        show: true,
        data: {
          status: 'success',
          id: res.data._id,
          amount: res.data.totalAmount,
          products: selectedProducts
        }
      });
      
      // Reset form
      setSelectedProducts([]);
      setCustomer('');
      setPaymentMethod('cash');
      
    } catch (error) {
      console.error('Error creating sale:', error);
      
      // Show error notification
      setNotification({
        show: true,
        data: {
          status: 'error',
          message: error.response?.data?.message || 'Failed to create sale'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification({ show: false, data: null });
  };

  return (
    <div className="create-sale-container">
      {/* Transaction notification */}
      <TransactionNotification 
        show={notification.show}
        type="sale"
        data={notification.data}
        onClose={closeNotification}
      />
      
      <h2>Create New Sale</h2>
      
      <div className="sale-form-container">
        <div className="product-selection">
          <h3>Available Products</h3>
          <div className="product-search">
            <input type="text" placeholder="Search products..." />
          </div>
          <div className="product-list">
            {products.map(product => (
              <div key={product.id} className="product-item" onClick={() => handleAddProduct(product)}>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>SKU: {product.sku}</p>
                </div>
                <div className="product-price">
                  ${product.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="sale-form">
          <h3>Sale Details</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Customer</label>
              <input 
                type="text" 
                value={customer} 
                onChange={(e) => setCustomer(e.target.value)} 
                placeholder="Customer name (optional)"
              />
            </div>
            
            <div className="form-group">
              <label>Payment Method</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            
            <div className="selected-products">
              <h4>Selected Products</h4>
              {selectedProducts.length === 0 ? (
                <p className="no-products">No products selected</p>
              ) : (
                <div className="cart-items">
                  {selectedProducts.map(product => (
                    <div key={product.id} className="cart-item">
                      <div className="cart-item-info">
                        <h5>{product.name}</h5>
                        <p>${product.price.toFixed(2)}</p>
                      </div>
                      <div className="cart-item-actions">
                        <input 
                          type="number" 
                          min="1" 
                          value={product.quantity} 
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)} 
                        />
                        <button 
                          type="button" 
                          className="remove-btn"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="sale-summary">
              <div className="total">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || selectedProducts.length === 0}
            >
              {loading ? 'Processing...' : 'Complete Sale'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSale;
