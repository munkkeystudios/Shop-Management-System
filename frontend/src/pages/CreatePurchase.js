
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { purchasesAPI, productsAPI, suppliersAPI } from '../services/api';
import './CreatePurchase.css';
import TransactionNotification from './TransactionNotification';
import { useNotifications } from '../context/NotificationContext';

const CreatePurchase = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [formData, setFormData] = useState({
        supplier: '',
        items: [{ product: '', quantity: 1, price: 0 }],
        subtotal: 0,
        discount: 0,
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

    const calculateTotals = (items, discount = formData.discount) => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal - discount;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            totalAmount: parseFloat(total.toFixed(2))
        };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };

        if (name === 'discount') {
            const { subtotal, totalAmount } = calculateTotals(
                formData.items,
                parseFloat(value || 0)
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
                const purchaseId = response.data.data._id;
                const purchaseAmount = response.data.data.totalAmount;
                const itemCount = formData.items.length;
                const supplierName = suppliers.find(s => s._id === formData.supplier)?.name || 'Unknown Supplier';

                // Add notification to the system
                addNotification(
                    'purchase',
                    `New purchase created from ${supplierName} for ${new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(purchaseAmount)} with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`,
                    purchaseId
                );

                // Show success notification
                setNotification({
                    show: true,
                    data: {
                        status: 'success',
                        id: purchaseId,
                        amount: purchaseAmount,
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
                                        {products.map(product => (
                                            <option key={product._id} value={product._id}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Quantity*</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, e)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
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

                                <button
                                    type="button"
                                    className="remove-item-btn"
                                    onClick={() => removeItem(index)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}

                        <button type="button" onClick={addItem} className="add-item-btn">
                            <FaPlus /> Add Item
                        </button>
                    </div>

                    {/* Totals Section */}
                    <div className="totals-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Subtotal</label>
                                <input
                                    type="number"
                                    name="subtotal"
                                    value={formData.subtotal}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Discount</label>
                                <input
                                    type="number"
                                    name="discount"
                                    value={formData.discount}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Total Amount</label>
                                <input
                                    type="number"
                                    name="totalAmount"
                                    value={formData.totalAmount}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows="3"
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Create Purchase"}
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default CreatePurchase;
