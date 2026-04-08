import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { purchasesAPI, productsAPI, suppliersAPI } from '../services/api';
import './CreatePurchase.css';
import TransactionNotification from './TransactionNotification';
import { useNotifications } from '../context/NotificationContext';

const CreatePurchase = () => {
    const { addNotification } = useNotifications();
    const [formData, setFormData] = useState({
        supplier: '',
        purchaseDate: '',
        items: [],
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
        const afterDiscount = subtotal - parseFloat(discount || 0);
        const taxAmount = afterDiscount * (parseFloat(tax || 0) / 100);
        const total = afterDiscount + taxAmount;

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

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { product: '', quantity: 1, price: 0, discount: 0, tax: 0 }]
        }));
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        const { subtotal, totalAmount } = calculateTotals(newItems);
        setFormData({ ...formData, items: newItems, subtotal, totalAmount });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        
        if (name === 'product') {
            const selectedProduct = products.find(p => p._id === value);
            if (selectedProduct) {
                newItems[index] = { 
                    ...newItems[index], 
                    [name]: value,
                    price: selectedProduct.cost || selectedProduct.price || 0,
                };
            } else {
                newItems[index] = { ...newItems[index], [name]: value, price: 0 };
            }
        } else {
            newItems[index] = { ...newItems[index], [name]: value };
        }

        const { subtotal, totalAmount } = calculateTotals(newItems);
        setFormData({ ...formData, items: newItems, subtotal, totalAmount });
    };

    const closeNotification = () => {
        setNotification({ show: false, data: null });
    };

    const resetForm = () => {
        setFormData({
            supplier: '',
            purchaseDate: '',
            items: [],
            subtotal: 0,
            discount: 0,
            tax: 0,
            totalAmount: 0,
            status: 'pending',
            paymentStatus: 'pending',
            notes: '',
        });
        setError(null);
    };

    const formatCurrency = (value) => {
        const amount = Number(value) || 0;
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const getProductById = (id) => products.find((product) => product._id === id);

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

        if (formData.items.length === 0) {
            setError("Please add at least one item to the purchase order.");
            setLoading(false);
            return;
        }

        // Prepare data for API
        const purchaseData = {
            supplier: formData.supplier,
            purchaseDate: formData.purchaseDate,
            items: formData.items.map(item => ({
                product: item.product,
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price)
            })),
            totalAmount: formData.totalAmount,
            discount: parseFloat(formData.discount || 0),
            tax: parseFloat(formData.tax || 0),
            status: formData.status,
            paymentStatus: formData.paymentStatus,
            notes: formData.notes
        };

        try {
            const response = await purchasesAPI.create(purchaseData);

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
                resetForm();
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
        <Layout title="Create Purchase">
            <div className="create-purchase-page">
                <TransactionNotification
                    show={notification.show}
                    type="purchase"
                    data={notification.data}
                    onClose={closeNotification}
                />

                <main className="architect-main">
                    <div className="architect-header">
                        <div>
                            <h1>New Purchase Order</h1>
                        </div>

                        <div className="header-actions">
                            <button type="button" className="btn-discard" onClick={resetForm}>
                                Discard
                            </button>
                            <button type="button" className="btn-submit" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Saving...' : 'Save & Submit'}
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-message architect-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="architect-grid">
                            <div className="architect-left">
                                <section className="architect-card">
                                    <h2>Supplier & Logistics</h2>
                                    <div className="supplier-grid">
                                        <div className="gs-input-group">
                                            <label>Choose Supplier</label>
                                            <div style={{position:'relative'}}>
                                                <select
                                                    name="supplier"
                                                    value={formData.supplier}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="gs-select"
                                                >
                                                    <option value="">Select a registered vendor...</option>
                                                    {suppliers.map((supplier) => (
                                                        <option key={supplier._id} value={supplier._id}>
                                                            {supplier.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="material-symbols-outlined gs-select-icon">expand_more</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label>Order Date</label>
                                            <div className="field-wrap">
                                                <input
                                                    type="date"
                                                    name="purchaseDate"
                                                    value={formData.purchaseDate}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                <span className="material-symbols-outlined">calendar_today</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="architect-card table-card">
                                    <div className="section-head">
                                        <h2>Purchase Items</h2>
                                    </div>

                                    <div className="purchase-table-wrap">
                                        <table className="purchase-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th className="num">Net Unit Price</th>
                                                    <th className="num">Current Stock</th>
                                                    <th className="num">Quantity</th>
                                                    <th className="num">Subtotal</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.items.length > 0 ? (
                                                    formData.items.map((item, index) => {
                                                        const selectedProduct = getProductById(item.product);
                                                        const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);

                                                        return (
                                                            <tr key={index}>
                                                                <td>
                                                                    <div className="gs-input-group" style={{marginBottom:0}}>
                                                                        <label style={{display:'none'}}>Product</label>
                                                                        <div style={{position:'relative'}}>
                                                                            <select
                                                                                name="product"
                                                                                value={item.product}
                                                                                onChange={(e) => handleItemChange(index, e)}
                                                                                required
                                                                                className="gs-select"
                                                                            >
                                                                                <option value="">Select Product</option>
                                                                                {products.map((product) => (
                                                                                    <option key={product._id} value={product._id}>
                                                                                        {product.name}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <span className="material-symbols-outlined gs-select-icon">expand_more</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="num">
                                                                    <input
                                                                        type="number"
                                                                        name="price"
                                                                        value={item.price}
                                                                        onChange={(e) => handleItemChange(index, e)}
                                                                        step="0.01"
                                                                        min="0"
                                                                        required
                                                                    />
                                                                </td>
                                                                <td className="num">{selectedProduct?.quantity || 0}</td>
                                                                <td className="num">
                                                                    <input
                                                                        type="number"
                                                                        name="quantity"
                                                                        value={item.quantity}
                                                                        onChange={(e) => handleItemChange(index, e)}
                                                                        min="1"
                                                                        required
                                                                    />
                                                                </td>
                                                                <td className="num amount-cell">${formatCurrency(lineTotal)}</td>
                                                                <td className="num action-cell">
                                                                    <button
                                                                        type="button"
                                                                        className="remove-item"
                                                                        onClick={() => removeItem(index)}
                                                                        aria-label="Delete item"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="no-data">No items yet. Add your first product.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <button type="button" className="add-item-row" onClick={addItem}>
                                        <FaPlus />
                                        <span>+ Add Item</span>
                                    </button>
                                </section>

                                <section className="architect-card">
                                    <h2>Additional Details</h2>
                                    <div className="details-grid">
                                        <div>
                                            <label>Order Tax (%)</label>
                                            <input
                                                type="number"
                                                name="tax"
                                                value={formData.tax}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>

                                        <div>
                                            <label>Discount ($)</label>
                                            <input
                                                type="number"
                                                name="discount"
                                                value={formData.discount}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>

                                        <div className="gs-input-group">
                                            <label>Order Status</label>
                                            <div style={{position:'relative'}}>
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    className="gs-select"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="received">Received</option>
                                                    <option value="ordered">Ordered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <span className="material-symbols-outlined gs-select-icon">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <aside className="architect-right">
                                <div className="financial-card">
                                    <h3>Financial Summary</h3>
                                    <div className="summary-lines">
                                        <div>
                                            <span>Subtotal</span>
                                            <span>${formatCurrency(formData.subtotal)}</span>
                                        </div>
                                        <div>
                                            <span>Tax ({Number(formData.tax) || 0}%)</span>
                                            <span>${formatCurrency((formData.subtotal - Number(formData.discount || 0)) * ((Number(formData.tax) || 0) / 100))}</span>
                                        </div>
                                        <div>
                                            <span>Discount</span>
                                            <span>-${formatCurrency(formData.discount)}</span>
                                        </div>
                                    </div>
                                    <div className="grand-total-wrap">
                                        <p>Grand Total</p>
                                        <strong>${formatCurrency(formData.totalAmount)}</strong>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div>
                                        <span className="material-symbols-outlined">info</span>
                                    </div>
                                    <p>
                                        Once submitted, this order will update pending inventory levels and create a corresponding invoice entry in Accounts Payable.
                                    </p>
                                </div>
                            </aside>
                        </div>
                    </form>
                </main>
            </div>
        </Layout>
    );
};

export default CreatePurchase;