import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { salesAPI, productsAPI } from '../services/api';
import './CreateSale.css';
import TransactionNotification from './TransactionNotification';
import { useNotifications } from '../context/NotificationContext';

const CUSTOMER_OPTIONS = ['Aiden Blackwell', 'Seraphina Vane', 'Julian Thorne'];

const PAYMENT_OPTIONS = [
    { value: 'card', label: 'Credit Card' },
    { value: 'cash', label: 'Cash' },
    { value: 'loan', label: 'Bank' },
];

const CreateSale = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [formData, setFormData] = useState({
        billNumber: '',
        customerName: '',
        customerPhone: '',
        items: [{ productId: '', quantity: 1, price: 0, productDiscountRate: 0 }],
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        paymentMethod: 'cash',
        amountPaid: 0,
        notes: '',
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [notification, setNotification] = useState({
        show: false,
        data: null
    });

    // Fetch products for the dropdown
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productsAPI.getAll({ limit: 1000 });
                if (response.data.success) {
                    setProducts(response.data.data);
                } else {
                    console.error("Failed to fetch products");
                }
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };
        fetchProducts();
    }, []);

    // Fetch the next bill number
    useEffect(() => {
        const fetchLastBillNumber = async () => {
            try {
                const response = await salesAPI.getLastBillNumber();
                const lastBill = response.data.lastBillNumber;
                setFormData(prev => ({ ...prev, billNumber: lastBill ? lastBill + 1 : 1 }));
            } catch (err) {
                console.error('Error fetching last bill number:', err);
                setError("Could not fetch next bill number. Please enter manually.");
                setFormData(prev => ({ ...prev, billNumber: '' }));
            }
        };
        fetchLastBillNumber();
    }, []);

    const calculateTotals = (items, discount = formData.discount, taxRate = 0.10) => {
        const subtotal = items.reduce((sum, item) => {
             const effectivePrice = item.price * (1 - (item.productDiscountRate || 0) / 100);
             return sum + (effectivePrice * item.quantity);
        }, 0);
        const tax = (subtotal - discount) * taxRate;
        const total = subtotal - discount + tax;
        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
         let newFormData = { ...formData, [name]: value };

         if (name === 'discount') {
            const { subtotal, tax, total } = calculateTotals(formData.items, parseFloat(value || 0));
            newFormData = { ...newFormData, subtotal, tax, total, amountPaid: total };
         } else if (name === 'amountPaid'){
             newFormData = { ...newFormData, amountPaid: parseFloat(value || 0) };
         }

        setFormData(newFormData);
        setError(null);
        setSuccess(null);
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        let productDetails = {};

        if (name === 'productId') {
            const selectedProduct = products.find(p => p._id === value);
            if (selectedProduct) {
                productDetails = {
                    price: selectedProduct.price,
                };
            } else {
                 productDetails = { price: 0 };
            }
             newItems[index] = { ...newItems[index], [name]: value, ...productDetails };
        } else {
            newItems[index] = { ...newItems[index], [name]: value };
        }

        const { subtotal, tax, total } = calculateTotals(newItems);
        setFormData({ ...formData, items: newItems, subtotal, tax, total, amountPaid: total });
    };

    const addItem = () => {
        const newItems = [...formData.items, { productId: '', quantity: 1, price: 0, productDiscountRate: 0 }];
        const { subtotal, tax, total } = calculateTotals(newItems);
        setFormData({ ...formData, items: newItems, subtotal, tax, total, amountPaid: total });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
         if (newItems.length === 0) {
             newItems.push({ productId: '', quantity: 1, price: 0, productDiscountRate: 0 });
         }
        const { subtotal, tax, total } = calculateTotals(newItems);
        setFormData({ ...formData, items: newItems, subtotal, tax, total, amountPaid: total });
    };

    const closeNotification = () => {
        setNotification({ show: false, data: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!formData.billNumber || isNaN(parseInt(formData.billNumber))) {
            setError("Please enter a valid Bill Number.");
            setLoading(false);
            return;
        }
        if (formData.items.length === 0 || formData.items.some(item => !item.productId || item.quantity <= 0)) {
            setError("Please add valid products and quantities to the sale.");
            setLoading(false);
            return;
        }
         if (formData.amountPaid < 0 || isNaN(formData.amountPaid)) {
             setError("Amount Paid must be a non-negative number.");
             setLoading(false);
             return;
         }
         if (formData.discount < 0 || isNaN(formData.discount)) {
             setError("Discount must be a non-negative number.");
             setLoading(false);
             return;
         }

        const saleData = {
            billNumber: parseInt(formData.billNumber),
            customerName: formData.customerName || 'Walk-in Customer',
            customerPhone: formData.customerPhone || null,
            items: formData.items.map(item => {
                 const effectivePrice = item.price * (1 - (item.productDiscountRate || 0) / 100);
                 return {
                      product: item.productId,
                      quantity: parseInt(item.quantity),
                      price: parseFloat(item.price),
                      productDiscountRate: parseFloat(item.productDiscountRate || 0),
                      effectivePrice: parseFloat(effectivePrice.toFixed(2)),
                      subtotal: parseFloat((effectivePrice * item.quantity).toFixed(2))
                 };
            }),
            subtotal: formData.subtotal,
            discount: parseFloat(formData.discount || 0),
            tax: formData.tax,
            total: formData.total,
            paymentMethod: formData.paymentMethod,
            amountPaid: parseFloat(formData.amountPaid),
            change: Math.max(0, formData.amountPaid - formData.total),
            notes: formData.notes,
        };

        try {
            const response = await salesAPI.create(saleData);
            console.log("API Response:", response);
            if (response.data.success) {
                const saleId = response.data.data._id;
                const saleAmount = response.data.data.total;
                const productCount = formData.items.length;

                // Add notification to the system
                addNotification(
                    'sale',
                    `New sale created for ${new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(saleAmount)} with ${productCount} ${productCount === 1 ? 'product' : 'products'}`,
                    saleId
                );

                // Show success notification
                setNotification({
                    show: true,
                    data: {
                        status: 'success',
                        id: saleId,
                        amount: saleAmount,
                        products: formData.items.map(item => ({
                            id: item.productId,
                            name: products.find(p => p._id === item.productId)?.name || 'Unknown',
                            price: item.price,
                            quantity: item.quantity
                        }))
                    }
                });

                // Reset form
                setFormData({
                      billNumber: formData.billNumber + 1,
                      customerName: '', customerPhone: '',
                      items: [{ productId: '', quantity: 1, price: 0, productDiscountRate: 0 }],
                      subtotal: 0, discount: 0, tax: 0, total: 0,
                      paymentMethod: 'cash', amountPaid: 0, notes: '',
                 });
            } else {
                setNotification({
                    show: true,
                    data: {
                        status: 'error',
                        message: response.data.message || 'Failed to create sale'
                    }
                });
            }
        } catch (err) {
            console.error('Error creating sale:', err.response || err);
            setNotification({
                show: true,
                data: {
                    status: 'error',
                    message: err.response?.data?.message || 'An error occurred while creating the sale.'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout title="Create New Sale">
            <main className="slate-sale-main">
                <div className="slate-sale-shell">
                    <TransactionNotification
                        show={notification.show}
                        type="sale"
                        data={notification.data}
                        onClose={closeNotification}
                    />

                    <header className="slate-sale-header">
                        <div className="slate-sale-heading-wrap">
                            <p className="products-text-2">New Transaction</p>
                            <h1>Bill #{formData.billNumber || '—'}</h1>
                        </div>

                        <div className="slate-customer-grid">
                            <div className="slate-field-block">
                                <label htmlFor="customerName">Customer Name</label>
                                <div className="slate-ghost-input-wrap">
                                    <select
                                        id="customerName"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Customer</option>
                                        {CUSTOMER_OPTIONS.map((customer) => (
                                            <option key={customer} value={customer}>
                                                {customer}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="slate-field-block">
                                <label htmlFor="customerPhone">Customer Phone</label>
                                <div className="slate-ghost-input-wrap">
                                    <input
                                        type="tel"
                                        id="customerPhone"
                                        name="customerPhone"
                                        value={formData.customerPhone}
                                        onChange={handleInputChange}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                        </div>
                    </header>

                    {error && <div className="slate-alert error">{error}</div>}
                    {success && <div className="slate-alert success">{success}</div>}

                    <form onSubmit={handleSubmit} className="slate-sale-form">
                        <div className="slate-sale-grid">
                            <section className="slate-items-column">
                                <div className="slate-items-table-shell">
                                    <table className="slate-items-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th className="center">Qty</th>
                                                <th className="right">Price</th>
                                                <th className="right">Disc (%)</th>
                                                <th className="right">Subtotal</th>
                                                <th />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.items.map((item, index) => {
                                                const lineSubtotal = item.price * (1 - (item.productDiscountRate || 0) / 100) * item.quantity;

                                                return (
                                                    <tr key={index} className={index === 1 ? 'active' : ''}>
                                                        <td>
                                                            <select
                                                                name="productId"
                                                                value={item.productId}
                                                                onChange={(e) => handleItemChange(index, e)}
                                                                required
                                                            >
                                                                <option value="">Select Product</option>
                                                                {products.map((product) => (
                                                                    <option key={product._id} value={product._id}>
                                                                        {product.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="center">
                                                            <input
                                                                type="number"
                                                                name="quantity"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(index, e)}
                                                                required
                                                                className="slate-small-input"
                                                            />
                                                        </td>
                                                        <td className="right">${Number(item.price || 0).toFixed(2)}</td>
                                                        <td className="right">
                                                            <input
                                                                type="number"
                                                                name="productDiscountRate"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={item.productDiscountRate || 0}
                                                                onChange={(e) => handleItemChange(index, e)}
                                                                className="slate-small-input slate-small-input-right"
                                                            />
                                                        </td>
                                                        <td className="right strong">${lineSubtotal.toFixed(2)}</td>
                                                        <td className="right">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(index)}
                                                                className="slate-delete-btn"
                                                                disabled={formData.items.length <= 1}
                                                                aria-label="Remove item"
                                                            >
                                                                <span className="material-symbols-outlined">delete_outline</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <button type="button" onClick={addItem} className="slate-add-item-btn">
                                    <span className="material-symbols-outlined">add</span>
                                    Add Line Item
                                </button>

                                <div className="slate-notes-wrap">
                                    <label htmlFor="notes">Transaction Notes</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder="Enter special delivery instructions or material specifications..."
                                    />
                                </div>
                            </section>

                            <aside className="slate-summary-column">
                                <div className="slate-summary-card">
                                    <h2>Summary</h2>
                                    <div className="slate-summary-list">
                                        <div>
                                            <span>Subtotal</span>
                                            <strong>${formData.subtotal.toFixed(2)}</strong>
                                        </div>
                                        <div className="slate-discount-row">
                                            <span>Order Discount</span>
                                            <div className="slate-discount-input-wrap">
                                                <input
                                                    type="number"
                                                    id="discount"
                                                    name="discount"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.discount}
                                                    onChange={handleInputChange}
                                                />
                                                <strong className="error">-${Number(formData.discount || 0).toFixed(2)}</strong>
                                            </div>
                                        </div>
                                        <div>
                                            <span>Tax (10%)</span>
                                            <strong>${formData.tax.toFixed(2)}</strong>
                                        </div>
                                        <div className="slate-total-due-row">
                                            <span>Total Due</span>
                                            <strong>${formData.total.toFixed(2)}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="slate-payment-card">
                                    <h2>Payment</h2>

                                    <div className="slate-payment-method-wrap">
                                        <label>Method</label>
                                        <div className="slate-method-buttons">
                                            {PAYMENT_OPTIONS.map((method) => (
                                                <button
                                                    key={method.value}
                                                    type="button"
                                                    className={formData.paymentMethod === method.value ? 'active' : ''}
                                                    onClick={() => {
                                                        setFormData((prev) => ({ ...prev, paymentMethod: method.value }));
                                                        setError(null);
                                                        setSuccess(null);
                                                    }}
                                                >
                                                    {method.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="slate-payment-amount-wrap">
                                        <label htmlFor="amountPaid">Amount Paid</label>
                                        <div className="slate-amount-input-shell">
                                            <span>$</span>
                                            <input
                                                type="number"
                                                id="amountPaid"
                                                name="amountPaid"
                                                min="0"
                                                step="0.01"
                                                value={formData.amountPaid}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="slate-change-row">
                                            <span>Change</span>
                                            <strong>${Math.max(0, formData.amountPaid - formData.total).toFixed(2)}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="slate-sale-actions">
                                    <button type="submit" disabled={loading} className="slate-complete-btn">
                                        <span className="material-symbols-outlined">check_circle</span>
                                        {loading ? 'Creating Sale...' : 'Complete & Create Sale'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate('/dashboard')}
                                        className="slate-cancel-btn"
                                    >
                                        Cancel Transaction
                                    </button>
                                </div>
                            </aside>
                        </div>
                    </form>
                </div>
            </main>
        </Layout>
    );
};

export default CreateSale;








