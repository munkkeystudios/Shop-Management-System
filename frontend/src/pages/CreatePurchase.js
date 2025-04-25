

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { purchasesAPI, productsAPI, suppliersAPI } from '../services/api';
import './CreatePurchase.css';
import TransactionNotification from './TransactionNotification';

const CreatePurchase = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        supplier: '',
        items: [{ product: '', quantity: 1, price: 0 }],
        subtotal: 0,
        discount: 0,
        tax: 0,
        totalAmount: 0,
        status: 'pending',
        paymentStatus: 'pending',
        notes: '',
    });
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({
        show: false,
        data: null
    });

    // Fetch products and suppliers for dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsResponse, suppliersResponse] = await Promise.all([
                    productsAPI.getAll({ limit: 1000 }),
                    suppliersAPI.getAll()
                ]);
                
                if (productsResponse.data.success) {
                    setProducts(productsResponse.data.data);
                }
                
                if (suppliersResponse.data.success) {
                    setSuppliers(suppliersResponse.data.data);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load products or suppliers. Please refresh the page.");
            }
        };
        
        fetchData();
    }, []);

    const calculateTotals = (items, discount = formData.discount, tax = formData.tax) => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal - discount + tax;
        
        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            totalAmount: parseFloat(total.toFixed(2))
        };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };

        if (name === 'discount' || name === 'tax') {
            const { subtotal, totalAmount } = calculateTotals(
                formData.items, 
                name === 'discount' ? parseFloat(value || 0) : formData.discount,
                name === 'tax' ? parseFloat(value || 0) : formData.tax
            );
            newFormData = { ...newFormData, subtotal, totalAmount };
        }

        setFormData(newFormData);
        setError(null);
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        let productDetails = {};

        if (name === 'product') {
            const selectedProduct = products.find(p => p._id === value);
            if (selectedProduct) {
                productDetails = {
                    price: selectedProduct.cost || selectedProduct.price || 0,
                };
            } else {
                productDetails = { price: 0 };
            }
            newItems[index] = { ...newItems[index], [name]: value, ...productDetails };
        } else {
            newItems[index] = { ...newItems[index], [name]: value };
        }

        // Recalculate totals
        const { subtotal, totalAmount } = calculateTotals(newItems);
        setFormData({ ...formData, items: newItems, subtotal, totalAmount });
    };

    const addItem = () => {
        const newItems = [...formData.items, { product: '', quantity: 1, price: 0 }];
        const { subtotal, totalAmount } = calculateTotals(newItems);
        setFormData({ ...formData, items: newItems, subtotal, totalAmount });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        if (newItems.length === 0) {
            newItems.push({ product: '', quantity: 1, price: 0 });
        }
        const { subtotal, totalAmount } = calculateTotals(newItems);
        setFormData({ ...formData, items: newItems, subtotal, totalAmount });
    };

    const closeNotification = () => {
        setNotification({ show: false, data: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (!formData.supplier) {
            setError("Please select a supplier.");
            setLoading(false);
            return;
        }

        if (formData.items.length === 0 || formData.items.some(item => !item.product || item.quantity <= 0)) {
            setError("Please add valid products and quantities to the purchase.");
            setLoading(false);
            return;
        }

        // Prepare data for API
        const purchaseData = {
            supplier: formData.supplier,
            items: formData.items.map(item => ({
                product: item.product,
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price)
            })),
            totalAmount: formData.totalAmount,
            tax: parseFloat(formData.tax || 0),
            discount: parseFloat(formData.discount || 0),
            status: formData.status,
            paymentStatus: formData.paymentStatus,
            notes: formData.notes
        };

        console.log("Submitting Purchase Data:", purchaseData);

        try {
            const response = await purchasesAPI.create(purchaseData);
            console.log("API Response:", response);
            
            if (response.data.success) {
                // Show success notification
                setNotification({
                    show: true,
                    data: {
                        status: 'success',
                        id: response.data.data._id,
                        amount: response.data.data.totalAmount,
                        items: formData.items.map(item => ({
                            id: item.product,
                            name: products.find(p => p._id === item.product)?.name || 'Unknown',
                            price: item.price,
                            quantity: item.quantity
                        })),
                        type: 'purchase'
                    }
                });
                
                // Reset form for next purchase
                setFormData({
                    supplier: '',
                    items: [{ product: '', quantity: 1, price: 0 }],
                    subtotal: 0,
                    discount: 0,
                    tax: 0,
                    totalAmount: 0,
                    status: 'pending',
                    paymentStatus: 'pending',
                    notes: '',
                });
            } else {
                setNotification({
                    show: true,
                    data: {
                        status: 'error',
                        message: response.data.message || 'Failed to create purchase.'
                    }
                });
            }
        } catch (err) {
            console.error('Error creating purchase:', err.response || err);
            setNotification({
                show: true,
                data: {
                    status: 'error',
                    message: err.response?.data?.message || 'An error occurred while creating the purchase.'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Create New Purchase">
            <div className="create-purchase-container">
                {/* Transaction notification */}
                <TransactionNotification 
                    show={notification.show}
                    type="purchase"
                    data={notification.data}
                    onClose={closeNotification}
                />
                
                <h1>Create New Purchase</h1>

                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleSubmit} className="create-purchase-form">
                    {/* Supplier Selection */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="supplier">Supplier*</label>
                            <select
                                id="supplier"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(supplier => (
                                    <option key={supplier._id} value={supplier._id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="pending">Pending</option>
                                <option value="received">Received</option>
                                <option value="ordered">Ordered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="paymentStatus">Payment Status</label>
                            <select
                                id="paymentStatus"
                                name="paymentStatus"
                                value={formData.paymentStatus}
                                onChange={handleInputChange}
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="partial">Partial</option>
                            </select>
                        </div>
                    </div>

                    {/* Items Section */}
                    <h2>Items</h2>
                    <div className="items-section">
                        {formData.items.map((item, index) => (
                            <div key={index} className="item-row">
                                <div className="form-group item-product">
                                    <label>Product*</label>
                                    <select
                                        name="product"
                                        value={item.product}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    >
                                        <option value="">Select Product</option>
                                        {products.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} {p.barcode ? `(${p.barcode})` : ''} - ${p.price?.toFixed(2) || '0.00'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group item-qty">
                                    <label>Qty*</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    />
                                </div>
                                <div className="form-group item-price">
                                    <label>Price*</label>
                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        step="0.01"
                                        value={item.price}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    />
                                </div>
                                <div className="form-group item-subtotal">
                                    <label>Subtotal</label>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="remove-item-button"
                                    disabled={formData.items.length <= 1}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addItem} className="add-item-button">
                            <FaPlus /> Add Item
                        </button>
                    </div>

                    {/* Totals Section */}
                    <div className="totals-payment-section">
                        <div className="totals-summary">
                            <h3>Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>${formData.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Discount:</span>
                                <input
                                    type="number"
                                    id="discount"
                                    name="discount"
                                    min="0"
                                    step="0.01"
                                    value={formData.discount}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="summary-row">
                                <span>Tax:</span>
                                <input
                                    type="number"
                                    id="tax"
                                    name="tax"
                                    min="0"
                                    step="0.01"
                                    value={formData.tax}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>${formData.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="form-group form-group-full">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows="3"
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions">
                        <button type="submit" disabled={loading} className="submit-button">
                            {loading ? 'Creating Purchase...' : 'Create Purchase'}
                        </button>
                        <button type="button" onClick={() => navigate('/dashboard')} className="cancel-button">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CreatePurchase;
