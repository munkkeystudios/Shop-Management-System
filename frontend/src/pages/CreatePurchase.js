
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import { FaPlus, FaTrash } from 'react-icons/fa';
// import { purchasesAPI, productsAPI, suppliersAPI } from '../services/api';
// import './CreatePurchase.css';
// import TransactionNotification from './TransactionNotification';
// import { useNotifications } from '../context/NotificationContext';

// const CreatePurchase = () => {
//     const navigate = useNavigate();
//     const { addNotification } = useNotifications();
//     const [formData, setFormData] = useState({
//         supplier: '',
//         items: [{ product: '', quantity: 1, price: 0 }],
//         subtotal: 0,
//         discount: 0,
//         totalAmount: 0,
//         status: 'pending',
//         paymentStatus: 'pending',
//         notes: '',
//     });
//     const [products, setProducts] = useState([]);
//     const [suppliers, setSuppliers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [notification, setNotification] = useState({
//         show: false,
//         data: null
//     });

//     // Fetch products and suppliers for dropdowns
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const [productsResponse, suppliersResponse] = await Promise.all([
//                     productsAPI.getAll({ limit: 1000 }),
//                     suppliersAPI.getAll()
//                 ]);

//                 if (productsResponse.data.success) {
//                     setProducts(productsResponse.data.data);
//                 }

//                 if (suppliersResponse.data.success) {
//                     setSuppliers(suppliersResponse.data.data);
//                 }
//             } catch (err) {
//                 console.error("Error fetching data:", err);
//                 setError("Failed to load products or suppliers. Please refresh the page.");
//             }
//         };

//         fetchData();
//     }, []);

//     const calculateTotals = (items, discount = formData.discount) => {
//         const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//         const total = subtotal - discount;

//         return {
//             subtotal: parseFloat(subtotal.toFixed(2)),
//             totalAmount: parseFloat(total.toFixed(2))
//         };
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         let newFormData = { ...formData, [name]: value };

//         if (name === 'discount') {
//             const { subtotal, totalAmount } = calculateTotals(
//                 formData.items,
//                 parseFloat(value || 0)
//             );
//             newFormData = { ...newFormData, subtotal, totalAmount };
//         }

//         setFormData(newFormData);
//         setError(null);
//     };

//     const handleItemChange = (index, e) => {
//         const { name, value } = e.target;
//         const newItems = [...formData.items];
//         let productDetails = {};

//         if (name === 'product') {
//             const selectedProduct = products.find(p => p._id === value);
//             if (selectedProduct) {
//                 productDetails = {
//                     price: selectedProduct.cost || selectedProduct.price || 0,
//                 };
//             } else {
//                 productDetails = { price: 0 };
//             }
//             newItems[index] = { ...newItems[index], [name]: value, ...productDetails };
//         } else {
//             newItems[index] = { ...newItems[index], [name]: value };
//         }

//         // Recalculate totals
//         const { subtotal, totalAmount } = calculateTotals(newItems);
//         setFormData({ ...formData, items: newItems, subtotal, totalAmount });
//     };

//     const addItem = () => {
//         const newItems = [...formData.items, { product: '', quantity: 1, price: 0 }];
//         const { subtotal, totalAmount } = calculateTotals(newItems);
//         setFormData({ ...formData, items: newItems, subtotal, totalAmount });
//     };

//     const removeItem = (index) => {
//         const newItems = formData.items.filter((_, i) => i !== index);
//         if (newItems.length === 0) {
//             newItems.push({ product: '', quantity: 1, price: 0 });
//         }
//         const { subtotal, totalAmount } = calculateTotals(newItems);
//         setFormData({ ...formData, items: newItems, subtotal, totalAmount });
//     };

//     const closeNotification = () => {
//         setNotification({ show: false, data: null });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError(null);

//         // Basic validation
//         if (!formData.supplier) {
//             setError("Please select a supplier.");
//             setLoading(false);
//             return;
//         }

//         if (formData.items.length === 0 || formData.items.some(item => !item.product || item.quantity <= 0)) {
//             setError("Please add valid products and quantities to the purchase.");
//             setLoading(false);
//             return;
//         }

//         // Prepare data for API
//         const purchaseData = {
//             supplier: formData.supplier,
//             items: formData.items.map(item => ({
//                 product: item.product,
//                 quantity: parseInt(item.quantity),
//                 price: parseFloat(item.price)
//             })),
//             totalAmount: formData.totalAmount,
//             discount: parseFloat(formData.discount || 0),
//             status: formData.status,
//             paymentStatus: formData.paymentStatus,
//             notes: formData.notes
//         };

//         console.log("Submitting Purchase Data:", purchaseData);

//         try {
//             const response = await purchasesAPI.create(purchaseData);
//             console.log("API Response:", response);

//             if (response.data.success) {
//                 const purchaseId = response.data.data._id;
//                 const purchaseAmount = response.data.data.totalAmount;
//                 const itemCount = formData.items.length;
//                 const supplierName = suppliers.find(s => s._id === formData.supplier)?.name || 'Unknown Supplier';

//                 // Add notification to the system
//                 addNotification(
//                     'purchase',
//                     `New purchase created from ${supplierName} for ${new Intl.NumberFormat('en-US', {
//                         style: 'currency',
//                         currency: 'USD'
//                     }).format(purchaseAmount)} with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`,
//                     purchaseId
//                 );

//                 // Show success notification
//                 setNotification({
//                     show: true,
//                     data: {
//                         status: 'success',
//                         id: purchaseId,
//                         amount: purchaseAmount,
//                         items: formData.items.map(item => ({
//                             id: item.product,
//                             name: products.find(p => p._id === item.product)?.name || 'Unknown',
//                             price: item.price,
//                             quantity: item.quantity
//                         })),
//                         type: 'purchase'
//                     }
//                 });

//                 // Reset form for next purchase
//                 setFormData({
//                     supplier: '',
//                     items: [{ product: '', quantity: 1, price: 0 }],
//                     subtotal: 0,
//                     discount: 0,
//                     totalAmount: 0,
//                     status: 'pending',
//                     paymentStatus: 'pending',
//                     notes: '',
//                 });
//             } else {
//                 setNotification({
//                     show: true,
//                     data: {
//                         status: 'error',
//                         message: response.data.message || 'Failed to create purchase.'
//                     }
//                 });
//             }
//         } catch (err) {
//             console.error('Error creating purchase:', err.response || err);
//             setNotification({
//                 show: true,
//                 data: {
//                     status: 'error',
//                     message: err.response?.data?.message || 'An error occurred while creating the purchase.'
//                 }
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Layout title="Create New Purchase">
//             <div className="create-purchase-container">
//                 {/* Transaction notification */}
//                 <TransactionNotification
//                     show={notification.show}
//                     type="purchase"
//                     data={notification.data}
//                     onClose={closeNotification}
//                 />

//                 <h1>Create New Purchase</h1>

//                 {error && <div className="alert error">{error}</div>}

//                 <form onSubmit={handleSubmit} className="create-purchase-form">
//                     {/* Supplier Selection */}
//                     <div className="form-row">
//                         <div className="form-group">
//                             <label htmlFor="supplier">Supplier*</label>
//                             <select
//                                 id="supplier"
//                                 name="supplier"
//                                 value={formData.supplier}
//                                 onChange={handleInputChange}
//                                 required
//                             >
//                                 <option value="">Select Supplier</option>
//                                 {suppliers.map(supplier => (
//                                     <option key={supplier._id} value={supplier._id}>
//                                         {supplier.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div className="form-group">
//                             <label htmlFor="status">Status</label>
//                             <select
//                                 id="status"
//                                 name="status"
//                                 value={formData.status}
//                                 onChange={handleInputChange}
//                             >
//                                 <option value="pending">Pending</option>
//                                 <option value="received">Received</option>
//                                 <option value="ordered">Ordered</option>
//                                 <option value="cancelled">Cancelled</option>
//                             </select>
//                         </div>

//                         <div className="form-group">
//                             <label htmlFor="paymentStatus">Payment Status</label>
//                             <select
//                                 id="paymentStatus"
//                                 name="paymentStatus"
//                                 value={formData.paymentStatus}
//                                 onChange={handleInputChange}
//                             >
//                                 <option value="pending">Pending</option>
//                                 <option value="paid">Paid</option>
//                                 <option value="partial">Partial</option>
//                             </select>
//                         </div>
//                     </div>

//                     {/* Items Section */}
//                     <h2>Items</h2>
//                     <div className="items-section">
//                         {formData.items.map((item, index) => (
//                             <div key={index} className="item-row">
//                                 <div className="form-group item-product">
//                                     <label>Product*</label>
//                                     <select
//                                         name="product"
//                                         value={item.product}
//                                         onChange={(e) => handleItemChange(index, e)}
//                                         required
//                                     >
//                                         <option value="">Select Product</option>
//                                         {products.map(product => (
//                                             <option key={product._id} value={product._id}>
//                                                 {product.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Quantity*</label>
//                                     <input
//                                         type="number"
//                                         name="quantity"
//                                         min="1"
//                                         value={item.quantity}
//                                         onChange={(e) => handleItemChange(index, e)}
//                                         required
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Price*</label>
//                                     <input
//                                         type="number"
//                                         name="price"
//                                         min="0"
//                                         step="0.01"
//                                         value={item.price}
//                                         onChange={(e) => handleItemChange(index, e)}
//                                         required
//                                     />
//                                 </div>

//                                 <button
//                                     type="button"
//                                     className="remove-item-btn"
//                                     onClick={() => removeItem(index)}
//                                 >
//                                     <FaTrash />
//                                 </button>
//                             </div>
//                         ))}

//                         <button type="button" onClick={addItem} className="add-item-btn">
//                             <FaPlus /> Add Item
//                         </button>
//                     </div>

//                     {/* Totals Section */}
//                     <div className="totals-section">
//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Subtotal</label>
//                                 <input
//                                     type="number"
//                                     name="subtotal"
//                                     value={formData.subtotal}
//                                     disabled
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>Discount</label>
//                                 <input
//                                     type="number"
//                                     name="discount"
//                                     value={formData.discount}
//                                     onChange={handleInputChange}
//                                 />
//                             </div>

//                             <div className="form-group">
//                                 <label>Total Amount</label>
//                                 <input
//                                     type="number"
//                                     name="totalAmount"
//                                     value={formData.totalAmount}
//                                     disabled
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Notes */}
//                     <div className="form-group">
//                         <label htmlFor="notes">Notes</label>
//                         <textarea
//                             name="notes"
//                             value={formData.notes}
//                             onChange={handleInputChange}
//                             rows="3"
//                         />
//                     </div>

//                     <button
//                         type="submit"
//                         className="submit-btn"
//                         disabled={loading}
//                     >
//                         {loading ? "Submitting..." : "Create Purchase"}
//                     </button>
//                 </form>
//             </div>
//         </Layout>
//     );
// };

// export default CreatePurchase;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import { purchasesAPI, productsAPI, suppliersAPI } from '../services/api';
import './CreatePurchase.css';
import TransactionNotification from './TransactionNotification';
import { useNotifications } from '../context/NotificationContext';

const CreatePurchase = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [formData, setFormData] = useState({
        supplier: '',
        // warehouse: '',
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
    // const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({
        show: false,
        data: null
    });
    const [searchQuery, setSearchQuery] = useState('');

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

            //     // Mock warehouse data for now
            //     setWarehouses(
            //         [
            //         { _id: '1', name: 'Main Warehouse' },
            //         { _id: '2', name: 'Secondary Warehouse' },
            //         { _id: '3', name: 'External Storage' }
            //     ]
            // );
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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleAddProductFromSearch = (productId) => {
        const selectedProduct = products.find(p => p._id === productId);
        if (selectedProduct) {
            const newItem = {
                product: selectedProduct._id,
                quantity: 1,
                price: selectedProduct.cost || selectedProduct.price || 0,
                discount: 0,
                tax: 0
            };
            
            const newItems = [...formData.items, newItem];
            const { subtotal, totalAmount } = calculateTotals(newItems);
            
            setFormData({
                ...formData,
                items: newItems,
                subtotal,
                totalAmount
            });
            
            setSearchQuery('');
        }
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

        if (formData.items.length === 0) {
            setError("Please add at least one item to the purchase order.");
            setLoading(false);
            return;
        }

        // Prepare data for API
        const purchaseData = {
            supplier: formData.supplier,
            // warehouse: formData.warehouse,
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
                setFormData({
                    supplier: '',
                    // warehouse: '',
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
            <div className="create-purchase-container">
                {/* Transaction notification */}
                <TransactionNotification
                    show={notification.show}
                    type="purchase"
                    data={notification.data}
                    onClose={closeNotification}
                />

                <h1 className="page-title">Create Purchase</h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Top selectors row */}
                    <div className="selectors-row">
                        <div className="selector">
                            <input 
                                type="date" 
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleInputChange}
                                className="form-select"
                                placeholder="Choose Date"
                            />
                        </div>
                        <div className="selector">
                            <select
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="">Choose Supplier</option>
                                {suppliers.map(supplier => (
                                    <option key={supplier._id} value={supplier._id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* <div className="selector">
                            <select
                                name="warehouse"
                                value={formData.warehouse}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="">Choose Warehouse</option>
                                {warehouses.map(warehouse => (
                                    <option key={warehouse._id} value={warehouse._id}>
                                        {warehouse.name}
                                    </option>
                                ))}
                            </select>
                        </div> */}
                    </div>

                    {/* Search and Add Products */}
                    <div className="search-container">
                        {/* <div className="search-box"> */}
                            {/* <FaSearch className="search-icon" /> */}
                            {/* <input
                                type="text"
                                className="search-input"
                                // placeholder="Search products..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            /> */}
                        {/* </div> */}
                        <button type="button" className="add-button" onClick={addItem}>
                            <FaPlus /> Add
                        </button>
                    </div>

                    {/* Products Table */}
                    <div className="table-container">
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Net Unit Price</th>
                                    <th>Stock</th>
                                    <th>Qty</th>
                                    {/* <th>Discount</th> */}
                                    {/* <th>Tax</th> */}
                                    <th>Subtotal</th>
                                    <th className="action-column"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.items.length > 0 ? (
                                    formData.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select
                                                    name="product"
                                                    value={item.product}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="table-select"
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
                                            <td>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={item.price}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="table-input"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                            </td>
                                            <td>
                                                {products.find(p => p._id === item.product)?.quantity || 0}
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="table-input"
                                                    min="1"
                                                    required
                                                />
                                            </td>
                                            {/* <td>
                                                <input
                                                    type="number"
                                                    name="discount"
                                                    value={item.discount || 0}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="table-input"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </td> */}
                                            {/* <td>
                                                <input
                                                    type="number"
                                                    name="tax"
                                                    value={item.tax || 0}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="table-input"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </td> */}
                                            <td>
                                                ${((item.price * item.quantity) - 
                                                  (item.discount || 0) + 
                                                  ((item.price * item.quantity - (item.discount || 0)) * 
                                                   (item.tax || 0) / 100)).toFixed(2)}
                                            </td>
                                            <td className="action-column">
                                                <button
                                                    type="button"
                                                    className="remove-button"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="no-data">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Order Summary */}
                    <div className="summary-container">
                        <div className="summary-row">
                            <span className="summary-label">Total</span>
                            <span className="summary-value">$ {formData.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Discount</span>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleInputChange}
                                className="summary-input"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Grand Total</span>
                            <span className="summary-value">$ {formData.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Order Tax, Discount, Status */}
                    <div className="order-tax-row">
                        <span className="order-tax-label">Order Tax %:</span>
                        <input
                            type="text"
                            name="tax"
                            value={formData.tax}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Order Tax"
                        />
                        
                        <span className="discount-label">Discount:</span>
                        <input
                            type="text"
                            name="discount"
                            value={formData.discount}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Discount"
                        />
                        
                        <span className="status-label">Status:</span>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="pending">Pending</option>
                            <option value="received">Received</option>
                            <option value="ordered">Ordered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="submit-container">
                        <button 
                            type="submit" 
                            className="submit-button" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading"></span> Processing...
                                </>
                            ) : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CreatePurchase;