// // // // // import React, { useState, useEffect } from 'react';
// // // // // import axios from 'axios';
// // // // // import { toast } from 'react-toastify';

// // // // // const CreatePurchase = () => {
// // // // //   const [loading, setLoading] = useState(false);
// // // // //   const [suppliers, setSuppliers] = useState([]);
// // // // //   const [products, setProducts] = useState([]);
// // // // //   const [warehouses, setWarehouses] = useState([]);
  
// // // // //   const [purchaseData, setPurchaseData] = useState({
// // // // //     date: new Date().toISOString().split('T')[0],
// // // // //     supplier: '',
// // // // //     warehouse: '',
// // // // //     items: [],
// // // // //     totalAmount: 0,
// // // // //     tax: 0,
// // // // //     discount: 0,
// // // // //     status: 'pending',
// // // // //     paymentStatus: 'pending',
// // // // //     notes: ''
// // // // //   });

// // // // //   const [selectedProduct, setSelectedProduct] = useState('');
// // // // //   const [productSearchTerm, setProductSearchTerm] = useState('');
// // // // //   const [filteredProducts, setFilteredProducts] = useState([]);

// // // // //   // Calculate totals
// // // // //   const calculateTotals = (items) => {
// // // // //     const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
// // // // //     const totalAmount = subtotal + Number(purchaseData.tax) - Number(purchaseData.discount);
// // // // //     return { subtotal, totalAmount };
// // // // //   };

// // // // //   // Load initial data
// // // // //   useEffect(() => {
// // // // //     const fetchData = async () => {
// // // // //       try {
// // // // //         setLoading(true);
// // // // //         const [suppliersRes, productsRes, warehousesRes] = await Promise.all([
// // // // //           axios.get('/api/suppliers'),
// // // // //           axios.get('/api/products'),
// // // // //           axios.get('/api/warehouses')
// // // // //         ]);
        
// // // // //         setSuppliers(suppliersRes.data.data || []);
// // // // //         setProducts(productsRes.data.data || []);
// // // // //         setFilteredProducts(productsRes.data.data || []);
// // // // //         setWarehouses(warehousesRes.data.data || []);
// // // // //       } catch (error) {
// // // // //         console.error('Error fetching data:', error);
// // // // //         toast.error('Failed to load required data');
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //     fetchData();
// // // // //   }, []);

// // // // //   // Filter products based on search term
// // // // //   useEffect(() => {
// // // // //     if (productSearchTerm) {
// // // // //       const filtered = products.filter(product => 
// // // // //         product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
// // // // //         (product.barcode && product.barcode.includes(productSearchTerm))
// // // // //       );
// // // // //       setFilteredProducts(filtered);
// // // // //     } else {
// // // // //       setFilteredProducts(products);
// // // // //     }
// // // // //   }, [productSearchTerm, products]);

// // // // //   const handleProductSearch = (e) => {
// // // // //     setProductSearchTerm(e.target.value);
// // // // //   };

// // // // //   const handleInputChange = (e) => {
// // // // //     const { name, value } = e.target;
// // // // //     setPurchaseData(prev => {
// // // // //       const updated = { ...prev, [name]: value };
      
// // // // //       if (name === 'tax' || name === 'discount') {
// // // // //         const { totalAmount } = calculateTotals(prev.items);
// // // // //         return { ...updated, totalAmount };
// // // // //       }
      
// // // // //       return updated;
// // // // //     });
// // // // //   };

// // // // //   const addProductToItems = () => {
// // // // //     if (!selectedProduct) return;
    
// // // // //     const product = products.find(p => p._id === selectedProduct);
// // // // //     if (!product) return;
    
// // // // //     // Check if product already exists in items
// // // // //     const existingItemIndex = purchaseData.items.findIndex(item => item.product === product._id);
    
// // // // //     setPurchaseData(prev => {
// // // // //       let updatedItems;
      
// // // // //       if (existingItemIndex >= 0) {
// // // // //         // Update quantity if product already exists
// // // // //         updatedItems = [...prev.items];
// // // // //         updatedItems[existingItemIndex].quantity += 1;
// // // // //       } else {
// // // // //         // Add new product
// // // // //         updatedItems = [
// // // // //           ...prev.items,
// // // // //           {
// // // // //             product: product._id,
// // // // //             productName: product.name,
// // // // //             quantity: 1,
// // // // //             price: product.cost || product.price || 0,
// // // // //             stock: product.stock || 0
// // // // //           }
// // // // //         ];
// // // // //       }
      
// // // // //       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
// // // // //       return {
// // // // //         ...prev,
// // // // //         items: updatedItems,
// // // // //         totalAmount
// // // // //       };
// // // // //     });
    
// // // // //     // Reset product selection
// // // // //     setSelectedProduct('');
// // // // //     setProductSearchTerm('');
// // // // //   };

// // // // //   const handleQuantityChange = (index, value) => {
// // // // //     const quantity = parseInt(value) || 0;
    
// // // // //     setPurchaseData(prev => {
// // // // //       const updatedItems = [...prev.items];
// // // // //       updatedItems[index].quantity = quantity;
      
// // // // //       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
// // // // //       return {
// // // // //         ...prev,
// // // // //         items: updatedItems,
// // // // //         totalAmount
// // // // //       };
// // // // //     });
// // // // //   };

// // // // //   const handlePriceChange = (index, value) => {
// // // // //     const price = parseFloat(value) || 0;
    
// // // // //     setPurchaseData(prev => {
// // // // //       const updatedItems = [...prev.items];
// // // // //       updatedItems[index].price = price;
      
// // // // //       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
// // // // //       return {
// // // // //         ...prev,
// // // // //         items: updatedItems,
// // // // //         totalAmount
// // // // //       };
// // // // //     });
// // // // //   };

// // // // //   const removeItem = (index) => {
// // // // //     setPurchaseData(prev => {
// // // // //       const updatedItems = prev.items.filter((_, i) => i !== index);
// // // // //       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
// // // // //       return {
// // // // //         ...prev,
// // // // //         items: updatedItems,
// // // // //         totalAmount
// // // // //       };
// // // // //     });
// // // // //   };

// // // // //   const handleSubmit = async (e) => {
// // // // //     e.preventDefault();
    
// // // // //     if (!purchaseData.supplier) {
// // // // //       return toast.error('Please select a supplier');
// // // // //     }
    
// // // // //     if (purchaseData.items.length === 0) {
// // // // //       return toast.error('Please add at least one product');
// // // // //     }
    
// // // // //     try {
// // // // //       setLoading(true);
      
// // // // //       // Format data for API
// // // // //       const formattedData = {
// // // // //         supplier: purchaseData.supplier,
// // // // //         warehouse: purchaseData.warehouse || undefined,
// // // // //         items: purchaseData.items.map(item => ({
// // // // //           product: item.product,
// // // // //           quantity: item.quantity,
// // // // //           price: item.price
// // // // //         })),
// // // // //         totalAmount: purchaseData.totalAmount,
// // // // //         tax: purchaseData.tax,
// // // // //         discount: purchaseData.discount,
// // // // //         date: purchaseData.date,
// // // // //         status: purchaseData.status,
// // // // //         paymentStatus: purchaseData.paymentStatus,
// // // // //         notes: purchaseData.notes
// // // // //       };
      
// // // // //       const response = await axios.post('/api/purchases', formattedData);
      
// // // // //       toast.success('Purchase created successfully');
// // // // //       // Reset form or redirect
// // // // //       setPurchaseData({
// // // // //         date: new Date().toISOString().split('T')[0],
// // // // //         supplier: '',
// // // // //         warehouse: '',
// // // // //         items: [],
// // // // //         totalAmount: 0,
// // // // //         tax: 0,
// // // // //         discount: 0,
// // // // //         status: 'pending',
// // // // //         paymentStatus: 'pending',
// // // // //         notes: ''
// // // // //       });
// // // // //     } catch (error) {
// // // // //       console.error('Error creating purchase:', error);
// // // // //       toast.error(error.response?.data?.message || 'Failed to create purchase');
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   if (loading && !suppliers.length) {
// // // // //     return <div className="flex justify-center p-8">Loading...</div>;
// // // // //   }

// // // // //   return (
// // // // //     <div className="p-4">
// // // // //       <h1 className="text-2xl font-bold mb-6">Create Purchase</h1>
      
// // // // //       <form onSubmit={handleSubmit}>
// // // // //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
// // // // //           {/* Order Date */}
// // // // //           <div>
// // // // //             <label className="block text-sm mb-1">Order Date</label>
// // // // //             <input
// // // // //               type="date"
// // // // //               name="date"
// // // // //               value={purchaseData.date}
// // // // //               onChange={handleInputChange}
// // // // //               className="w-full p-2 border rounded"
// // // // //             />
// // // // //           </div>
          
// // // // //           {/* Supplier Selection */}
// // // // //           <div>
// // // // //             <label className="block text-sm mb-1">Choose Supplier</label>
// // // // //             <select
// // // // //               name="supplier"
// // // // //               value={purchaseData.supplier}
// // // // //               onChange={handleInputChange}
// // // // //               className="w-full p-2 border rounded"
// // // // //             >
// // // // //               <option value="">Select Supplier</option>
// // // // //               {suppliers.map(supplier => (
// // // // //                 <option key={supplier._id} value={supplier._id}>
// // // // //                   {supplier.name}
// // // // //                 </option>
// // // // //               ))}
// // // // //             </select>
// // // // //           </div>
          
// // // // //           {/* Warehouse Selection */}
// // // // //           <div>
// // // // //             <label className="block text-sm mb-1">Choose Warehouse</label>
// // // // //             <select
// // // // //               name="warehouse"
// // // // //               value={purchaseData.warehouse}
// // // // //               onChange={handleInputChange}
// // // // //               className="w-full p-2 border rounded"
// // // // //             >
// // // // //               <option value="">Select Warehouse</option>
// // // // //               {warehouses.map(warehouse => (
// // // // //                 <option key={warehouse._id} value={warehouse._id}>
// // // // //                   {warehouse.name}
// // // // //                 </option>
// // // // //               ))}
// // // // //             </select>
// // // // //           </div>
// // // // //         </div>
        
// // // // //         {/* Product Search and Table */}
// // // // //         <div className="mb-6">
// // // // //           <div className="flex items-center mb-4">
// // // // //             <div className="relative flex-grow mr-2">
// // // // //               <input
// // // // //                 type="text"
// // // // //                 placeholder="Search/Scan Product by Code or Name"
// // // // //                 value={productSearchTerm}
// // // // //                 onChange={handleProductSearch}
// // // // //                 className="w-full p-2 border rounded pl-8"
// // // // //               />
// // // // //               <svg
// // // // //                 className="absolute left-2 top-2.5 h-4 w-4 text-gray-500"
// // // // //                 fill="none"
// // // // //                 stroke="currentColor"
// // // // //                 viewBox="0 0 24 24"
// // // // //                 xmlns="http://www.w3.org/2000/svg"
// // // // //               >
// // // // //                 <path
// // // // //                   strokeLinecap="round"
// // // // //                   strokeLinejoin="round"
// // // // //                   strokeWidth="2"
// // // // //                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
// // // // //                 ></path>
// // // // //               </svg>
// // // // //             </div>
            
// // // // //             {filteredProducts.length > 0 && productSearchTerm && (
// // // // //               <div className="absolute z-10 mt-1 bg-white border rounded shadow max-h-60 overflow-auto">
// // // // //                 {filteredProducts.map(product => (
// // // // //                   <div
// // // // //                     key={product._id}
// // // // //                     className="p-2 hover:bg-gray-100 cursor-pointer"
// // // // //                     onClick={() => {
// // // // //                       setSelectedProduct(product._id);
// // // // //                       setProductSearchTerm(product.name);
// // // // //                       addProductToItems();
// // // // //                     }}
// // // // //                   >
// // // // //                     {product.name} {product.barcode && `(${product.barcode})`}
// // // // //                   </div>
// // // // //                 ))}
// // // // //               </div>
// // // // //             )}
// // // // //           </div>
          
// // // // //           {/* Products Table */}
// // // // //           <div className="overflow-x-auto">
// // // // //             <table className="w-full border-collapse">
// // // // //               <thead>
// // // // //                 <tr className="bg-gray-50">
// // // // //                   <th className="p-2 text-left">#</th>
// // // // //                   <th className="p-2 text-left">Product</th>
// // // // //                   <th className="p-2 text-right">Net Unit Price</th>
// // // // //                   <th className="p-2 text-right">Stock</th>
// // // // //                   <th className="p-2 text-right">Qty</th>
// // // // //                   <th className="p-2 text-right">Discount</th>
// // // // //                   <th className="p-2 text-right">Tax</th>
// // // // //                   <th className="p-2 text-right">Subtotal</th>
// // // // //                   <th className="p-2"></th>
// // // // //                 </tr>
// // // // //               </thead>
// // // // //               <tbody>
// // // // //                 {purchaseData.items.length === 0 ? (
// // // // //                   <tr>
// // // // //                     <td colSpan="9" className="p-4 text-center text-gray-500">
// // // // //                       No data available
// // // // //                     </td>
// // // // //                   </tr>
// // // // //                 ) : (
// // // // //                   purchaseData.items.map((item, index) => (
// // // // //                     <tr key={index} className="border-t">
// // // // //                       <td className="p-2">{index + 1}</td>
// // // // //                       <td className="p-2">{item.productName}</td>
// // // // //                       <td className="p-2 text-right">
// // // // //                         <input
// // // // //                           type="number"
// // // // //                           min="0"
// // // // //                           step="0.01"
// // // // //                           value={item.price}
// // // // //                           onChange={(e) => handlePriceChange(index, e.target.value)}
// // // // //                           className="w-24 p-1 border rounded text-right"
// // // // //                         />
// // // // //                       </td>
// // // // //                       <td className="p-2 text-right">{item.stock}</td>
// // // // //                       <td className="p-2 text-right">
// // // // //                         <input
// // // // //                           type="number"
// // // // //                           min="1"
// // // // //                           value={item.quantity}
// // // // //                           onChange={(e) => handleQuantityChange(index, e.target.value)}
// // // // //                           className="w-16 p-1 border rounded text-right"
// // // // //                         />
// // // // //                       </td>
// // // // //                       <td className="p-2 text-right">0.00</td>
// // // // //                       <td className="p-2 text-right">0.00</td>
// // // // //                       <td className="p-2 text-right">
// // // // //                         {(item.price * item.quantity).toFixed(2)}
// // // // //                       </td>
// // // // //                       <td className="p-2">
// // // // //                         <button
// // // // //                           type="button"
// // // // //                           onClick={() => removeItem(index)}
// // // // //                           className="text-red-500 hover:text-red-700"
// // // // //                         >
// // // // //                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
// // // // //                             <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
// // // // //                           </svg>
// // // // //                         </button>
// // // // //                       </td>
// // // // //                     </tr>
// // // // //                   ))
// // // // //                 )}
// // // // //               </tbody>
// // // // //             </table>
// // // // //           </div>
// // // // //         </div>
        
// // // // //         {/* Totals and Notes */}
// // // // //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // // // //           <div>
// // // // //             <div className="mb-4">
// // // // //               <label className="block text-sm mb-1">Notes</label>
// // // // //               <textarea
// // // // //                 name="notes"
// // // // //                 value={purchaseData.notes}
// // // // //                 onChange={handleInputChange}
// // // // //                 className="w-full p-2 border rounded"
// // // // //                 rows="4"
// // // // //                 placeholder="Write notes..."
// // // // //               ></textarea>
// // // // //             </div>
            
// // // // //             <div className="grid grid-cols-2 gap-4">
// // // // //               <div>
// // // // //                 <label className="block text-sm mb-1">Order Tax</label>
// // // // //                 <input
// // // // //                   type="number"
// // // // //                   name="tax"
// // // // //                   min="0"
// // // // //                   step="0.01"
// // // // //                   value={purchaseData.tax}
// // // // //                   onChange={handleInputChange}
// // // // //                   className="w-full p-2 border rounded"
// // // // //                   placeholder="0.00"
// // // // //                 />
// // // // //               </div>
              
// // // // //               <div>
// // // // //                 <label className="block text-sm mb-1">Discount</label>
// // // // //                 <input
// // // // //                   type="number"
// // // // //                   name="discount"
// // // // //                   min="0"
// // // // //                   step="0.01"
// // // // //                   value={purchaseData.discount}
// // // // //                   onChange={handleInputChange}
// // // // //                   className="w-full p-2 border rounded"
// // // // //                   placeholder="0.00"
// // // // //                 />
// // // // //               </div>
              
// // // // //               <div>
// // // // //                 <label className="block text-sm mb-1">Status</label>
// // // // //                 <select
// // // // //                   name="status"
// // // // //                   value={purchaseData.status}
// // // // //                   onChange={handleInputChange}
// // // // //                   className="w-full p-2 border rounded"
// // // // //                 >
// // // // //                   <option value="pending">Pending</option>
// // // // //                   <option value="received">Received</option>
// // // // //                   <option value="ordered">Ordered</option>
// // // // //                   <option value="cancelled">Cancelled</option>
// // // // //                 </select>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
          
// // // // //           <div>
// // // // //             <div className="bg-gray-50 p-4 rounded">
// // // // //               <div className="flex justify-between mb-2">
// // // // //                 <span>Order Tax:</span>
// // // // //                 <span>${parseFloat(purchaseData.tax).toFixed(2)}</span>
// // // // //               </div>
// // // // //               <div className="flex justify-between mb-2">
// // // // //                 <span>Discount:</span>
// // // // //                 <span>${parseFloat(purchaseData.discount).toFixed(2)}</span>
// // // // //               </div>
// // // // //               <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
// // // // //                 <span>Grand Total:</span>
// // // // //                 <span>${purchaseData.totalAmount.toFixed(2)}</span>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
        
// // // // //         <div className="mt-6">
// // // // //           <button
// // // // //             type="submit"
// // // // //             className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
// // // // //             disabled={loading}
// // // // //           >
// // // // //             {loading ? 'Submitting...' : 'Submit'}
// // // // //           </button>
// // // // //         </div>
// // // // //       </form>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default CreatePurchase;

// // // // import React, { useState, useEffect } from 'react';
// // // // import axios from 'axios';
// // // // import { toast } from 'react-toastify';
// // // // import Layout from "../components/Layout";


// // // // const CreatePurchase = () => {
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [suppliers, setSuppliers] = useState([]);
// // // //   const [products, setProducts] = useState([]);
// // // //   const [warehouses, setWarehouses] = useState([]);
  
// // // //   const [purchaseData, setPurchaseData] = useState({
// // // //     date: new Date().toISOString().split('T')[0],
// // // //     supplier: '',
// // // //     warehouse: '',
// // // //     items: [],
// // // //     totalAmount: 0,
// // // //     tax: 0,
// // // //     discount: 0,
// // // //     status: 'pending',
// // // //     paymentStatus: 'pending',
// // // //     notes: ''
// // // //   });

// // // //   const [selectedProduct, setSelectedProduct] = useState('');
// // // //   const [productSearchTerm, setProductSearchTerm] = useState('');
// // // //   const [filteredProducts, setFilteredProducts] = useState([]);

// // // // //   Calculate totals
// // // //   const calculateTotals = (items) => {
// // // //     const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
// // // //     const totalAmount = subtotal + Number(purchaseData.tax) - Number(purchaseData.discount);
// // // //     return { totalAmount };
// // // //   };

// // // //   // Load initial data
// // // //   useEffect(() => {
// // // //     const fetchData = async () => {
// // // //       try {
// // // //         setLoading(true);
// // // //         const [suppliersRes, productsRes, warehousesRes] = await Promise.all([
// // // //           axios.get('/api/suppliers'),
// // // //           axios.get('/api/products'),
// // // //           axios.get('/api/warehouses')
// // // //         ]);
        
// // // //         setSuppliers(suppliersRes.data.data || []);
// // // //         setProducts(productsRes.data.data || []);
// // // //         setFilteredProducts(productsRes.data.data || []);
// // // //         setWarehouses(warehousesRes.data.data || []);
// // // //       } catch (error) {
// // // //         console.error('Error fetching data:', error);
// // // //         toast.error('Failed to load required data');
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     fetchData();
// // // //   }, []);

// // // //   // Filter products based on search term
// // // //   useEffect(() => {
// // // //     if (productSearchTerm) {
// // // //       const filtered = products.filter(product => 
// // // //         product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
// // // //         (product.barcode && product.barcode.includes(productSearchTerm))
// // // //       );
// // // //       setFilteredProducts(filtered);
// // // //     } else {
// // // //       setFilteredProducts(products);
// // // //     }
// // // //   }, [productSearchTerm, products]);

// // // //   const handleProductSearch = (e) => {
// // // //     setProductSearchTerm(e.target.value);
// // // //   };

// // // //   const handleInputChange = (e) => {
// // // //     const { name, value } = e.target;
// // // //     setPurchaseData(prev => {
// // // //       const updated = { ...prev, [name]: value };
      
// // // //       if (name === 'tax' || name === 'discount') {
// // // //         const { totalAmount } = calculateTotals(prev.items);
// // // //         return { ...updated, totalAmount };
// // // //       }
      
// // // //       return updated;
// // // //     });
// // // //   };

// // // //   const addProductToItems = () => {
// // // //     if (!selectedProduct) return;
    
// // // //     const product = products.find(p => p._id === selectedProduct);
// // // //     if (!product) return;
    
// // // //     // Check if product already exists in items
// // // //     const existingItemIndex = purchaseData.items.findIndex(item => item.product === product._id);
    
// // // //     setPurchaseData(prev => {
// // // //       let updatedItems;
      
// // // //       if (existingItemIndex >= 0) {
// // // //         // Update quantity if product already exists
// // // //         updatedItems = [...prev.items];
// // // //         updatedItems[existingItemIndex].quantity += 1;
// // // //       } else {
// // // //         // Add new product
// // // //         updatedItems = [
// // // //           ...prev.items,
// // // //           {
// // // //             product: product._id,
// // // //             productName: product.name,
// // // //             quantity: 1,
// // // //             price: product.cost || product.price || 0,
// // // //             stock: product.stock || 0
// // // //           }
// // // //         ];
// // // //       }
      
// // // //       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
// // // //       return {
// // // //         ...prev,
// // // //         items: updatedItems,
// // // //         totalAmount
// // // //       };
// // // //     });
    
// // // //     // Reset product selection
// // // //     setSelectedProduct('');
// // // //     setProductSearchTerm('');
// // // //   };

// // // //   const handleQuantityChange = (index, value) => {
// // // //     const quantity = parseInt(value) || 0;
    
// // // //     setPurchaseData(prev => {
// // // //       const updatedItems = [...prev.items];
// // // //       updatedItems[index].quantity = quantity;
      
// // // //       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
// // // //       return {
// // // //         ...prev,
// // // //         items: updatedItems,
// // // //         totalAmount
// // // //       };
// // // //     });
// // // //   };

// // // //   const handlePriceChange = (index, value) => {
// // // //     const price = parseFloat(value) || 0;
    
// // // //     setPurchaseData(prev => {
// // // //       const updatedItems = [...prev.items];
// // // //       updatedItems[index].price = price;
      
// // // //       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
// // // //       return {
// // // //         ...prev,
// // // //         items: updatedItems,
// // // //         totalAmount
// // // //       };
// // // //     });
// // // //   };

// // // //   const removeItem = (index) => {
// // // //     setPurchaseData(prev => {
// // // //       const updatedItems = prev.items.filter((_, i) => i !== index);
// // // //       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
// // // //       return {
// // // //         ...prev,
// // // //         items: updatedItems,
// // // //         totalAmount
// // // //       };
// // // //     });
// // // //   };

// // // //   const handleSubmit = async (e) => {
// // // //     e.preventDefault();
    
// // // //     if (!purchaseData.supplier) {
// // // //       return toast.error('Please select a supplier');
// // // //     }
    
// // // //     if (purchaseData.items.length === 0) {
// // // //       return toast.error('Please add at least one product');
// // // //     }
    
// // // //     try {
// // // //       setLoading(true);
      
// // // //       // Format data for API
// // // //       const formattedData = {
// // // //         supplier: purchaseData.supplier,
// // // //         warehouse: purchaseData.warehouse || undefined,
// // // //         items: purchaseData.items.map(item => ({
// // // //           product: item.product,
// // // //           quantity: item.quantity,
// // // //           price: item.price
// // // //         })),
// // // //         totalAmount: purchaseData.totalAmount,
// // // //         tax: purchaseData.tax,
// // // //         discount: purchaseData.discount,
// // // //         date: purchaseData.date,
// // // //         status: purchaseData.status,
// // // //         paymentStatus: purchaseData.paymentStatus,
// // // //         notes: purchaseData.notes
// // // //       };
      
// // // //       const response = await axios.post('/api/purchases', formattedData);
      
// // // //       toast.success('Purchase created successfully');
// // // //       // Reset form or redirect
// // // //       setPurchaseData({
// // // //         date: new Date().toISOString().split('T')[0],
// // // //         supplier: '',
// // // //         warehouse: '',
// // // //         items: [],
// // // //         totalAmount: 0,
// // // //         tax: 0,
// // // //         discount: 0,
// // // //         status: 'pending',
// // // //         paymentStatus: 'pending',
// // // //         notes: ''
// // // //       });
// // // //     } catch (error) {
// // // //       console.error('Error creating purchase:', error);
// // // //       toast.error(error.response?.data?.message || 'Failed to create purchase');
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   if (loading && !suppliers.length) {
// // // //     return (
// // // //       <Layout>
// // // //         <div className="flex justify-center p-8">Loading...</div>
// // // //       </Layout>
// // // //     );
// // // //   }


// // // //   return (
// // // //     <Layout>
// // // //     <div className="p-4">
// // // //       <h1 className="text-2xl font-bold mb-6">Create Purchase</h1>
      
// // // //       <form onSubmit={handleSubmit}>
// // // //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
// // // //           {/* Order Date */}
// // // //           <div>
// // // //             <label className="block text-sm mb-1">Order Date</label>
// // // //             <input
// // // //               type="date"
// // // //               name="date"
// // // //               value={purchaseData.date}
// // // //               onChange={handleInputChange}
// // // //               className="w-full p-2 border rounded"
// // // //             />
// // // //           </div>
          
// // // //           {/* Supplier Selection */}
// // // //           <div>
// // // //             <label className="block text-sm mb-1">Choose Supplier</label>
// // // //             <select
// // // //               name="supplier"
// // // //               value={purchaseData.supplier}
// // // //               onChange={handleInputChange}
// // // //               className="w-full p-2 border rounded"
// // // //             >
// // // //               <option value="">Select Supplier</option>
// // // //               {suppliers.map(supplier => (
// // // //                 <option key={supplier._id} value={supplier._id}>
// // // //                   {supplier.name}
// // // //                 </option>
// // // //               ))}
// // // //             </select>
// // // //           </div>
          
// // // //           {/* Warehouse Selection */}
// // // //           <div>
// // // //             <label className="block text-sm mb-1">Choose Warehouse</label>
// // // //             <select
// // // //               name="warehouse"
// // // //               value={purchaseData.warehouse}
// // // //               onChange={handleInputChange}
// // // //               className="w-full p-2 border rounded"
// // // //             >
// // // //               <option value="">Select Warehouse</option>
// // // //               {warehouses.map(warehouse => (
// // // //                 <option key={warehouse._id} value={warehouse._id}>
// // // //                   {warehouse.name}
// // // //                 </option>
// // // //               ))}
// // // //             </select>
// // // //           </div>
// // // //         </div>
        
// // // //         {/* Product Search and Table */}
// // // //         <div className="mb-6">
// // // //           <div className="flex items-center mb-4">
// // // //             <div className="relative flex-grow mr-2">
// // // //               <input
// // // //                 type="text"
// // // //                 placeholder="Search/Scan Product by Code or Name"
// // // //                 value={productSearchTerm}
// // // //                 onChange={handleProductSearch}
// // // //                 className="w-full p-2 border rounded pl-8"
// // // //               />
// // // //               <svg
// // // //                 className="absolute left-2 top-2.5 h-4 w-4 text-gray-500"
// // // //                 fill="none"
// // // //                 stroke="currentColor"
// // // //                 viewBox="0 0 24 24"
// // // //                 xmlns="http://www.w3.org/2000/svg"
// // // //               >
// // // //                 <path
// // // //                   strokeLinecap="round"
// // // //                   strokeLinejoin="round"
// // // //                   strokeWidth="2"
// // // //                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
// // // //                 ></path>
// // // //               </svg>
// // // //             </div>
            
// // // //             {filteredProducts.length > 0 && productSearchTerm && (
// // // //               <div className="absolute z-10 mt-1 bg-white border rounded shadow max-h-60 overflow-auto">
// // // //                 {filteredProducts.map(product => (
// // // //                   <div
// // // //                     key={product._id}
// // // //                     className="p-2 hover:bg-gray-100 cursor-pointer"
// // // //                     onClick={() => {
// // // //                       setSelectedProduct(product._id);
// // // //                       setProductSearchTerm(product.name);
// // // //                       addProductToItems();
// // // //                     }}
// // // //                   >
// // // //                     {product.name} {product.barcode && `(${product.barcode})`}
// // // //                   </div>
// // // //                 ))}
// // // //               </div>
// // // //             )}
// // // //           </div>
          
// // // //           {/* Products Table */}
// // // //           <div className="overflow-x-auto">
// // // //             <table className="w-full border-collapse">
// // // //               <thead>
// // // //                 <tr className="bg-gray-50">
// // // //                   <th className="p-2 text-left">#</th>
// // // //                   <th className="p-2 text-left">Product</th>
// // // //                   <th className="p-2 text-right">Net Unit Price</th>
// // // //                   <th className="p-2 text-right">Stock</th>
// // // //                   <th className="p-2 text-right">Qty</th>
// // // //                   <th className="p-2 text-right">Discount</th>
// // // //                   <th className="p-2 text-right">Tax</th>
// // // //                   <th className="p-2 text-right">Subtotal</th>
// // // //                   <th className="p-2"></th>
// // // //                 </tr>
// // // //               </thead>
// // // //               <tbody>
// // // //                 {purchaseData.items.length === 0 ? (
// // // //                   <tr>
// // // //                     <td colSpan="9" className="p-4 text-center text-gray-500">
// // // //                       No data available
// // // //                     </td>
// // // //                   </tr>
// // // //                 ) : (
// // // //                   purchaseData.items.map((item, index) => (
// // // //                     <tr key={index} className="border-t">
// // // //                       <td className="p-2">{index + 1}</td>
// // // //                       <td className="p-2">{item.productName}</td>
// // // //                       <td className="p-2 text-right">
// // // //                         <input
// // // //                           type="number"
// // // //                           min="0"
// // // //                           step="0.01"
// // // //                           value={item.price}
// // // //                           onChange={(e) => handlePriceChange(index, e.target.value)}
// // // //                           className="w-24 p-1 border rounded text-right"
// // // //                         />
// // // //                       </td>
// // // //                       <td className="p-2 text-right">{item.stock}</td>
// // // //                       <td className="p-2 text-right">
// // // //                         <input
// // // //                           type="number"
// // // //                           min="1"
// // // //                           value={item.quantity}
// // // //                           onChange={(e) => handleQuantityChange(index, e.target.value)}
// // // //                           className="w-16 p-1 border rounded text-right"
// // // //                         />
// // // //                       </td>
// // // //                       <td className="p-2 text-right">0.00</td>
// // // //                       <td className="p-2 text-right">0.00</td>
// // // //                       <td className="p-2 text-right">
// // // //                         {(item.price * item.quantity).toFixed(2)}
// // // //                       </td>
// // // //                       <td className="p-2">
// // // //                         <button
// // // //                           type="button"
// // // //                           onClick={() => removeItem(index)}
// // // //                           className="text-red-500 hover:text-red-700"
// // // //                         >
// // // //                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
// // // //                             <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
// // // //                           </svg>
// // // //                         </button>
// // // //                       </td>
// // // //                     </tr>
// // // //                   ))
// // // //                 )}
// // // //               </tbody>
// // // //             </table>
// // // //           </div>
// // // //         </div>
        
// // // //         {/* Totals and Notes */}
// // // //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // // //           <div>
// // // //             <div className="mb-4">
// // // //               <label className="block text-sm mb-1">Notes</label>
// // // //               <textarea
// // // //                 name="notes"
// // // //                 value={purchaseData.notes}
// // // //                 onChange={handleInputChange}
// // // //                 className="w-full p-2 border rounded"
// // // //                 rows="4"
// // // //                 placeholder="Write notes..."
// // // //               ></textarea>
// // // //             </div>
            
// // // //             <div className="grid grid-cols-2 gap-4">
// // // //               <div>
// // // //                 <label className="block text-sm mb-1">Order Tax</label>
// // // //                 <input
// // // //                   type="number"
// // // //                   name="tax"
// // // //                   min="0"
// // // //                   step="0.01"
// // // //                   value={purchaseData.tax}
// // // //                   onChange={handleInputChange}
// // // //                   className="w-full p-2 border rounded"
// // // //                   placeholder="0.00"
// // // //                 />
// // // //               </div>
              
// // // //               <div>
// // // //                 <label className="block text-sm mb-1">Discount</label>
// // // //                 <input
// // // //                   type="number"
// // // //                   name="discount"
// // // //                   min="0"
// // // //                   step="0.01"
// // // //                   value={purchaseData.discount}
// // // //                   onChange={handleInputChange}
// // // //                   className="w-full p-2 border rounded"
// // // //                   placeholder="0.00"
// // // //                 />
// // // //               </div>
              
// // // //               <div>
// // // //                 <label className="block text-sm mb-1">Status</label>
// // // //                 <select
// // // //                   name="status"
// // // //                   value={purchaseData.status}
// // // //                   onChange={handleInputChange}
// // // //                   className="w-full p-2 border rounded"
// // // //                 >
// // // //                   <option value="pending">Pending</option>
// // // //                   <option value="received">Received</option>
// // // //                   <option value="ordered">Ordered</option>
// // // //                   <option value="cancelled">Cancelled</option>
// // // //                 </select>
// // // //               </div>
// // // //             </div>
// // // //           </div>
          
// // // //           <div>
// // // //             <div className="bg-gray-50 p-4 rounded">
// // // //               <div className="flex justify-between mb-2">
// // // //                 <span>Order Tax:</span>
// // // //                 <span>${parseFloat(purchaseData.tax).toFixed(2)}</span>
// // // //               </div>
// // // //               <div className="flex justify-between mb-2">
// // // //                 <span>Discount:</span>
// // // //                 <span>${parseFloat(purchaseData.discount).toFixed(2)}</span>
// // // //               </div>
// // // //               <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
// // // //                 <span>Grand Total:</span>
// // // //                 <span>${purchaseData.totalAmount.toFixed(2)}</span>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </div>
        
// // // //         <div className="mt-6">
// // // //           <button
// // // //             type="submit"
// // // //             className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
// // // //             disabled={loading}
// // // //           >
// // // //             {loading ? 'Submitting...' : 'Submit'}
// // // //           </button>
// // // //         </div>
// // // //       </form>
// // // //     </div>
// // // //     </Layout>
// // // //   );
// // // // };

// // // // export default CreatePurchase;


// // // "use client"

// // // import { useState, useEffect } from "react"
// // // import { Search, Plus, Trash2 } from "lucide-react"
// // // import axios from "axios"
// // // import "../pages/CreatePurchase.css"

// // // const CreatePurchase = () => {
// // //   // State for form data
// // //   const [purchaseItems, setPurchaseItems] = useState([])
// // //   const [supplier, setSupplier] = useState("")
// // //   const [warehouse, setWarehouse] = useState("")
// // //   const [status, setStatus] = useState("pending")
// // //   const [paymentStatus, setPaymentStatus] = useState("pending")
// // //   const [searchTerm, setSearchTerm] = useState("")
// // //   const [tax, setTax] = useState(0)
// // //   const [discount, setDiscount] = useState(0)
// // //   const [totalAmount, setTotalAmount] = useState(0)
// // //   const [notes, setNotes] = useState("")
// // //   const [date, setDate] = useState(new Date().toISOString().split("T")[0])

// // //   // State for data from API
// // //   const [suppliers, setSuppliers] = useState([])
// // //   const [products, setProducts] = useState([])
// // //   const [warehouses, setWarehouses] = useState([])
// // //   const [loading, setLoading] = useState(false)
// // //   const [error, setError] = useState(null)

// // //   // Fetch data on component mount
// // //   useEffect(() => {
// // //     const fetchData = async () => {
// // //       setLoading(true)
// // //       try {
// // //         const [suppliersRes, productsRes, warehousesRes] = await Promise.all([
// // //           axios.get("/api/suppliers"),
// // //           axios.get("/api/products"),
// // //           axios.get("/api/warehouses"),
// // //         ])

// // //         setSuppliers(suppliersRes.data)
// // //         setProducts(productsRes.data)
// // //         setWarehouses(warehousesRes.data)
// // //         setError(null)
// // //       } catch (err) {
// // //         console.error("Error fetching data:", err)
// // //         setError("Failed to load data. Please try again.")
// // //       } finally {
// // //         setLoading(false)
// // //       }
// // //     }

// // //     fetchData()
// // //   }, [])

// // //   const addNewRow = () => {
// // //     setPurchaseItems([
// // //       ...purchaseItems,
// // //       {
// // //         id: Date.now(),
// // //         product: "",
// // //         price: 0,
// // //         stock: 0,
// // //         quantity: 0,
// // //         discount: 0,
// // //         tax: 0,
// // //         subtotal: 0,
// // //       },
// // //     ])
// // //   }

// // //   const removeRow = (id) => {
// // //     setPurchaseItems(purchaseItems.filter((item) => item.id !== id))
// // //     calculateTotals()
// // //   }

// // //   const handleItemChange = (id, field, value) => {
// // //     const updatedItems = purchaseItems.map((item) => {
// // //       if (item.id === id) {
// // //         const updatedItem = { ...item, [field]: value }

// // //         // Recalculate subtotal when price, quantity, discount or tax changes
// // //         if (["price", "quantity", "discount", "tax"].includes(field)) {
// // //           const price = field === "price" ? value : updatedItem.price
// // //           const quantity = field === "quantity" ? value : updatedItem.quantity
// // //           const itemDiscount = field === "discount" ? value : updatedItem.discount
// // //           const itemTax = field === "tax" ? value : updatedItem.tax

// // //           const subtotal = price * quantity - itemDiscount + itemTax
// // //           updatedItem.subtotal = subtotal
// // //         }

// // //         return updatedItem
// // //       }
// // //       return item
// // //     })

// // //     setPurchaseItems(updatedItems)
// // //     calculateTotals()
// // //   }

// // //   const calculateTotals = () => {
// // //     const itemsTotal = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0)
// // //     setTotalAmount(itemsTotal - discount + tax)
// // //   }

// // //   // Get product details when a product is selected
// // //   const handleProductSelect = async (id, productId) => {
// // //     if (!productId) return

// // //     try {
// // //       const product = products.find((p) => p._id === productId)
// // //       if (product) {
// // //         handleItemChange(id, "product", productId)
// // //         handleItemChange(id, "price", product.cost || 0)
// // //         handleItemChange(id, "stock", product.quantity || 0)
// // //       }
// // //     } catch (err) {
// // //       console.error("Error fetching product details:", err)
// // //     }
// // //   }

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault()

// // //     // Validate required fields
// // //     if (!supplier) {
// // //       setError("Supplier is required")
// // //       return
// // //     }

// // //     if (purchaseItems.length === 0) {
// // //       setError("At least one item is required")
// // //       return
// // //     }

// // //     // Check if all items have product and quantity
// // //     const invalidItems = purchaseItems.filter((item) => !item.product || item.quantity <= 0)
// // //     if (invalidItems.length > 0) {
// // //       setError("All items must have a product and quantity greater than 0")
// // //       return
// // //     }

// // //     // Prepare data for API
// // //     const purchaseData = {
// // //       supplier,
// // //       date,
// // //       warehouse: warehouse || undefined,
// // //       items: purchaseItems.map((item) => ({
// // //         product: item.product,
// // //         quantity: item.quantity,
// // //         price: item.price,
// // //       })),
// // //       totalAmount,
// // //       tax,
// // //       discount,
// // //       status,
// // //       paymentStatus,
// // //       notes,
// // //     }

// // //     setLoading(true)
// // //     try {
// // //       const response = await axios.post("/api/purchases", purchaseData)
// // //       alert("Purchase created successfully!")
// // //       // Reset form or redirect
// // //       resetForm()
// // //       setError(null)
// // //     } catch (err) {
// // //       console.error("Error creating purchase:", err)
// // //       setError(err.response?.data?.message || "Failed to create purchase. Please try again.")
// // //     } finally {
// // //       setLoading(false)
// // //     }
// // //   }

// // //   const resetForm = () => {
// // //     setPurchaseItems([])
// // //     setSupplier("")
// // //     setWarehouse("")
// // //     setStatus("pending")
// // //     setPaymentStatus("pending")
// // //     setSearchTerm("")
// // //     setTax(0)
// // //     setDiscount(0)
// // //     setTotalAmount(0)
// // //     setNotes("")
// // //     setDate(new Date().toISOString().split("T")[0])
// // //   }

// // //   // Filter products based on search term
// // //   const filteredProducts = searchTerm
// // //     ? products.filter(
// // //         (product) =>
// // //           product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// // //           (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase())),
// // //       )
// // //     : products

// // //   return (
// // //     <div className="create-purchase-container">
// // //       <h1 className="page-title">Create Purchase</h1>

// // //       {error && <div className="error-message">{error}</div>}

// // //       <form onSubmit={handleSubmit}>
// // //         <div className="selectors-row">
// // //           <div className="selector">
// // //             <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="form-select" required>
// // //               <option value="" disabled>
// // //                 Choose Supplier
// // //               </option>
// // //               {suppliers.map((sup) => (
// // //                 <option key={sup._id} value={sup._id}>
// // //                   {sup.name}
// // //                 </option>
// // //               ))}
// // //             </select>
// // //           </div>

// // //           <div className="selector">
// // //             <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="form-select">
// // //               <option value="">Choose Warehouse</option>
// // //               {warehouses.map((wh) => (
// // //                 <option key={wh._id} value={wh._id}>
// // //                   {wh.name}
// // //                 </option>
// // //               ))}
// // //             </select>
// // //           </div>

// // //           <div className="selector">
// // //             <input
// // //               type="date"
// // //               value={date}
// // //               onChange={(e) => setDate(e.target.value)}
// // //               className="form-select"
// // //               required
// // //             />
// // //           </div>
// // //         </div>

// // //         <div className="search-container">
// // //           <div className="search-box">
// // //             <Search className="search-icon" size={18} />
// // //             <input
// // //               type="text"
// // //               placeholder="Search Product By Code or Name"
// // //               value={searchTerm}
// // //               onChange={(e) => setSearchTerm(e.target.value)}
// // //               className="search-input"
// // //             />
// // //           </div>
// // //           <button type="button" className="add-button" onClick={addNewRow}>
// // //             <Plus size={18} />
// // //           </button>
// // //         </div>

// // //         <div className="table-container">
// // //           <table className="items-table">
// // //             <thead>
// // //               <tr>
// // //                 <th className="action-column">*</th>
// // //                 <th>Product</th>
// // //                 <th>Unit Price</th>
// // //                 <th>Stock</th>
// // //                 <th>Qty</th>
// // //                 <th>Discount</th>
// // //                 <th>Tax</th>
// // //                 <th>Subtotal</th>
// // //               </tr>
// // //             </thead>
// // //             <tbody>
// // //               {purchaseItems.length > 0 ? (
// // //                 purchaseItems.map((item) => (
// // //                   <tr key={item.id}>
// // //                     <td className="action-column">
// // //                       <button type="button" className="remove-button" onClick={() => removeRow(item.id)}>
// // //                         <Trash2 size={16} />
// // //                       </button>
// // //                     </td>
// // //                     <td>
// // //                       <select
// // //                         value={item.product}
// // //                         onChange={(e) => handleProductSelect(item.id, e.target.value)}
// // //                         className="table-select"
// // //                         required
// // //                       >
// // //                         <option value="">Select Product</option>
// // //                         {filteredProducts.map((product) => (
// // //                           <option key={product._id} value={product._id}>
// // //                             {product.name} {product.code ? `(${product.code})` : ""}
// // //                           </option>
// // //                         ))}
// // //                       </select>
// // //                     </td>
// // //                     <td>
// // //                       <input
// // //                         type="number"
// // //                         value={item.price}
// // //                         onChange={(e) => handleItemChange(item.id, "price", Number.parseFloat(e.target.value) || 0)}
// // //                         className="table-input"
// // //                         min="0"
// // //                         step="0.01"
// // //                         required
// // //                       />
// // //                     </td>
// // //                     <td>
// // //                       <input type="number" value={item.stock} className="table-input" readOnly />
// // //                     </td>
// // //                     <td>
// // //                       <input
// // //                         type="number"
// // //                         value={item.quantity}
// // //                         onChange={(e) => handleItemChange(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
// // //                         className="table-input"
// // //                         min="1"
// // //                         required
// // //                       />
// // //                     </td>
// // //                     <td>
// // //                       <input
// // //                         type="number"
// // //                         value={item.discount}
// // //                         onChange={(e) => handleItemChange(item.id, "discount", Number.parseFloat(e.target.value) || 0)}
// // //                         className="table-input"
// // //                         min="0"
// // //                         step="0.01"
// // //                       />
// // //                     </td>
// // //                     <td>
// // //                       <input
// // //                         type="number"
// // //                         value={item.tax}
// // //                         onChange={(e) => handleItemChange(item.id, "tax", Number.parseFloat(e.target.value) || 0)}
// // //                         className="table-input"
// // //                         min="0"
// // //                         step="0.01"
// // //                       />
// // //                     </td>
// // //                     <td>
// // //                       <input type="number" value={item.subtotal.toFixed(2)} className="table-input" readOnly />
// // //                     </td>
// // //                   </tr>
// // //                 ))
// // //               ) : (
// // //                 <tr>
// // //                   <td colSpan={8} className="no-data">
// // //                     No data available
// // //                   </td>
// // //                 </tr>
// // //               )}
// // //             </tbody>
// // //           </table>
// // //         </div>

// // //         <div className="summary-container">
// // //           <div className="summary-row">
// // //             <span className="summary-label">Order Tax</span>
// // //             <span className="summary-value">
// // //               ${" "}
// // //               <input
// // //                 type="number"
// // //                 value={tax}
// // //                 onChange={(e) => {
// // //                   setTax(Number.parseFloat(e.target.value) || 0)
// // //                   calculateTotals()
// // //                 }}
// // //                 className="summary-input"
// // //                 min="0"
// // //                 step="0.01"
// // //               />
// // //             </span>
// // //           </div>

// // //           <div className="summary-row">
// // //             <span className="summary-label">Discount</span>
// // //             <span className="summary-value">
// // //               ${" "}
// // //               <input
// // //                 type="number"
// // //                 value={discount}
// // //                 onChange={(e) => {
// // //                   setDiscount(Number.parseFloat(e.target.value) || 0)
// // //                   calculateTotals()
// // //                 }}
// // //                 className="summary-input"
// // //                 min="0"
// // //                 step="0.01"
// // //               />
// // //             </span>
// // //           </div>

// // //           <div className="summary-row">
// // //             <span className="summary-label">Grand Total</span>
// // //             <span className="summary-value">$ {totalAmount.toFixed(2)}</span>
// // //           </div>
// // //         </div>

// // //         <div className="order-tax-row">
// // //           <div className="status-label">Status</div>
// // //           <div className="status-select">
// // //             <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select" required>
// // //               <option value="received">Received</option>
// // //               <option value="pending">Pending</option>
// // //               <option value="ordered">Ordered</option>
// // //               <option value="cancelled">Cancelled</option>
// // //             </select>
// // //           </div>

// // //           <div className="status-label">Payment</div>
// // //           <div className="status-select">
// // //             <select
// // //               value={paymentStatus}
// // //               onChange={(e) => setPaymentStatus(e.target.value)}
// // //               className="form-select"
// // //               required
// // //             >
// // //               <option value="paid">Paid</option>
// // //               <option value="pending">Pending</option>
// // //               <option value="partial">Partial</option>
// // //             </select>
// // //           </div>
// // //         </div>

// // //         <div className="note-container">
// // //           <textarea
// // //             placeholder="Write a note..."
// // //             className="note-textarea"
// // //             value={notes}
// // //             onChange={(e) => setNotes(e.target.value)}
// // //           ></textarea>
// // //         </div>

// // //         <div className="submit-container">
// // //           <button type="submit" className="submit-button" disabled={loading}>
// // //             {loading ? "Submitting..." : "Submit"}
// // //           </button>
// // //         </div>
// // //       </form>
// // //     </div>
// // //   )
// // // }

// // // export default CreatePurchase





// // "use client"

// // import { useState, useEffect } from "react"
// // import { Search, Plus, Trash2 } from "lucide-react"
// // import axios from "axios"
// // import "../pages/CreatePurchase.css"
// // import { useNavigate } from "react-router-dom"

// // const CreatePurchase = () => {
// //   const navigate = useNavigate()
// //   // State for form data
// //   const [purchaseItems, setPurchaseItems] = useState([])
// //   const [error, setError] = useState(null)
// //   const [loading, setLoading] = useState(false)

// //   // State for form data and API responses
// //   const [suppliers, setSuppliers] = useState([])
// //   const [products, setProducts] = useState([])
// //   const [warehouses, setWarehouses] = useState([])

// //   const [supplier, setSupplier] = useState("")
// //   const [warehouse, setWarehouse] = useState("")
// //   const [status, setStatus] = useState("pending")
// //   const [paymentStatus, setPaymentStatus] = useState("pending")
// //   const [searchTerm, setSearchTerm] = useState("")
// //   const [tax, setTax] = useState(0)
// //   const [discount, setDiscount] = useState(0)
// //   const [totalAmount, setTotalAmount] = useState(0)
// //   const [notes, setNotes] = useState("")
// //   const [date, setDate] = useState(new Date().toISOString().split("T")[0])

// //   // Fetch data and authentication check on component mount
// //   useEffect(() => {
// //     const checkAuthentication = () => {
// //       const token = localStorage.getItem("token")
// //       if (!token) {
// //         setError("You must be logged in to access this page")
// //         navigate("/login")
// //       } else {
// //         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
// //       }
// //     }

// //     const fetchData = async () => {
// //       setLoading(true)
// //       try {
// //         const [suppliersRes, productsRes, warehousesRes] = await Promise.all([
// //           axios.get("/api/suppliers"),
// //           axios.get("/api/products"),
// //           axios.get("/api/warehouses"),
// //         ])
// //         setSuppliers(suppliersRes.data)
// //         setProducts(productsRes.data)
// //         setWarehouses(warehousesRes.data)
// //       } catch (err) {
// //         setError("Failed to load data. Please try again.")
// //       } finally {
// //         setLoading(false)
// //       }
// //     }

// //     checkAuthentication()
// //     fetchData()
// //   }, [navigate])

// //   // Adding a new purchase row
// //   const addNewRow = () => {
// //     setPurchaseItems([...purchaseItems, { id: Date.now(), product: "", price: 0, stock: 0, quantity: 0, discount: 0, tax: 0, subtotal: 0 }])
// //   }

// //   // Handle changes in purchase items
// //   const handleItemChange = (id, field, value) => {
// //     const updatedItems = purchaseItems.map((item) => {
// //       if (item.id === id) {
// //         const updatedItem = { ...item, [field]: value }

// //         if (["price", "quantity", "discount", "tax"].includes(field)) {
// //           const price = field === "price" ? value : updatedItem.price
// //           const quantity = field === "quantity" ? value : updatedItem.quantity
// //           const itemDiscount = field === "discount" ? value : updatedItem.discount
// //           const itemTax = field === "tax" ? value : updatedItem.tax

// //           const subtotal = price * quantity - itemDiscount + itemTax
// //           updatedItem.subtotal = subtotal
// //         }

// //         return updatedItem
// //       }
// //       return item
// //     })

// //     setPurchaseItems(updatedItems)
// //     calculateTotals()
// //   }

// //   // Calculate total amount of the purchase
// //   const calculateTotals = () => {
// //     const itemsTotal = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0)
// //     setTotalAmount(itemsTotal - discount + tax)
// //   }

// //   // Handle product selection from the product list
// //   const handleProductSelect = async (id, productId) => {
// //     if (!productId) return

// //     try {
// //       const product = products.find((p) => p._id === productId)
// //       if (product) {
// //         handleItemChange(id, "product", productId)
// //         handleItemChange(id, "price", product.cost || 0)
// //         handleItemChange(id, "stock", product.quantity || 0)
// //       }
// //     } catch (err) {
// //       setError("Error fetching product details.")
// //     }
// //   }

// //   // Handle the form submission
// //   const handleSubmit = async (e) => {
// //     e.preventDefault()

// //     if (!supplier) {
// //       setError("Supplier is required")
// //       return
// //     }

// //     if (purchaseItems.length === 0) {
// //       setError("At least one item is required")
// //       return
// //     }

// //     const invalidItems = purchaseItems.filter((item) => !item.product || item.quantity <= 0)
// //     if (invalidItems.length > 0) {
// //       setError("All items must have a product and quantity greater than 0")
// //       return
// //     }

// //     const purchaseData = {
// //       supplier,
// //       date,
// //       warehouse: warehouse || undefined,
// //       items: purchaseItems.map((item) => ({
// //         product: item.product,
// //         quantity: item.quantity,
// //         price: item.price,
// //       })),
// //       totalAmount,
// //       tax,
// //       discount,
// //       status,
// //       paymentStatus,
// //       notes,
// //     }

// //     setLoading(true)
// //     try {
// //       const token = localStorage.getItem("token")
// //       if (!token) {
// //         setError("You must be logged in to create a purchase")
// //         navigate("/login")
// //         return
// //       }

// //       const response = await axios.post("/api/purchases", purchaseData, {
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //         },
// //       })

// //       alert("Purchase created successfully!")
// //       resetForm()
// //     } catch (err) {
// //       if (err.response?.status === 401) {
// //         setError("Your session has expired. Please log in again.")
// //         localStorage.removeItem("token")
// //         navigate("/login")
// //       } else {
// //         setError(err.response?.data?.message || "Failed to create purchase. Please try again.")
// //       }
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const resetForm = () => {
// //     setPurchaseItems([])
// //     setSupplier("")
// //     setWarehouse("")
// //     setStatus("pending")
// //     setPaymentStatus("pending")
// //     setSearchTerm("")
// //     setTax(0)
// //     setDiscount(0)
// //     setTotalAmount(0)
// //     setNotes("")
// //     setDate(new Date().toISOString().split("T")[0])
// //   }

// //   const filteredProducts = searchTerm
// //     ? products.filter(
// //         (product) =>
// //           product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //           (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()))
// //       )
// //     : products

// //   return (
// //     <div className="create-purchase-container">
// //       <h1 className="page-title">Create Purchase</h1>

// //       {error && <div className="error-message">{error}</div>}

// //       <form onSubmit={handleSubmit}>
// //         {/* Form fields here */}
// //       </form>
// //     </div>
// //   )
// // }

// // export default CreatePurchase



// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Layout from '../components/Layout';
// import { FaPlus, FaTrash } from 'react-icons/fa';
// import { purchasesAPI, productsAPI, suppliersAPI } from '../services/api';
// import './CreatePurchase.css';

// const CreatePurchase = () => {
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({
//         supplier: '',
//         items: [{ product: '', quantity: 1, price: 0 }],
//         subtotal: 0,
//         discount: 0,
//         tax: 0,
//         totalAmount: 0,
//         status: 'pending',
//         paymentStatus: 'pending',
//         notes: '',
//     });
//     const [products, setProducts] = useState([]);
//     const [suppliers, setSuppliers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [success, setSuccess] = useState(null);

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

//     const calculateTotals = (items, discount = formData.discount, tax = formData.tax) => {
//         const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//         const total = subtotal - discount + tax;
        
//         return {
//             subtotal: parseFloat(subtotal.toFixed(2)),
//             totalAmount: parseFloat(total.toFixed(2))
//         };
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         let newFormData = { ...formData, [name]: value };

//         if (name === 'discount' || name === 'tax') {
//             const { subtotal, totalAmount } = calculateTotals(
//                 formData.items, 
//                 name === 'discount' ? parseFloat(value || 0) : formData.discount,
//                 name === 'tax' ? parseFloat(value || 0) : formData.tax
//             );
//             newFormData = { ...newFormData, subtotal, totalAmount };
//         }

//         setFormData(newFormData);
//         setError(null);
//         setSuccess(null);
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

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError(null);
//         setSuccess(null);

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
//             tax: parseFloat(formData.tax || 0),
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
//                 setSuccess("Purchase created successfully!");
//                 // Reset form for next purchase
//                 setFormData({
//                     supplier: '',
//                     items: [{ product: '', quantity: 1, price: 0 }],
//                     subtotal: 0,
//                     discount: 0,
//                     tax: 0,
//                     totalAmount: 0,
//                     status: 'pending',
//                     paymentStatus: 'pending',
//                     notes: '',
//                 });
//             } else {
//                 setError(response.data.message || 'Failed to create purchase.');
//             }
//         } catch (err) {
//             console.error('Error creating purchase:', err.response || err);
//             setError(err.response?.data?.message || 'An error occurred while creating the purchase.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Layout title="Create New Purchase">
//             <div className="create-purchase-container">
//                 <h1>Create New Purchase</h1>

//                 {error && <div className="alert error">{error}</div>}
//                 {success && <div className="alert success">{success}</div>}

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
//                                         {products.map(p => (
//                                             <option key={p._id} value={p._id}>
//                                                 {p.name} {p.barcode ? `(${p.barcode})` : ''} - ${p.price?.toFixed(2) || '0.00'}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div className="form-group item-qty">
//                                     <label>Qty*</label>
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
//                                 <div className="form-group item-subtotal">
//                                     <label>Subtotal</label>
//                                     <span>${(item.price * item.quantity).toFixed(2)}</span>
//                                 </div>

//                                 <button
//                                     type="button"
//                                     onClick={() => removeItem(index)}
//                                     className="remove-item-button"
//                                     disabled={formData.items.length <= 1}
//                                 >
//                                     <FaTrash />
//                                 </button>
//                             </div>
//                         ))}
//                         <button type="button" onClick={addItem} className="add-item-button">
//                             <FaPlus /> Add Item
//                         </button>
//                     </div>

//                     {/* Totals Section */}
//                     <div className="totals-payment-section">
//                         <div className="totals-summary">
//                             <h3>Summary</h3>
//                             <div className="summary-row">
//                                 <span>Subtotal:</span>
//                                 <span>${formData.subtotal.toFixed(2)}</span>
//                             </div>
//                             <div className="summary-row">
//                                 <span>Discount:</span>
//                                 <input
//                                     type="number"
//                                     id="discount"
//                                     name="discount"
//                                     min="0"
//                                     step="0.01"
//                                     value={formData.discount}
//                                     onChange={handleInputChange}
//                                     placeholder="0.00"
//                                 />
//                             </div>
//                             <div className="summary-row">
//                                 <span>Tax:</span>
//                                 <input
//                                     type="number"
//                                     id="tax"
//                                     name="tax"
//                                     min="0"
//                                     step="0.01"
//                                     value={formData.tax}
//                                     onChange={handleInputChange}
//                                     placeholder="0.00"
//                                 />
//                             </div>
//                             <div className="summary-row total">
//                                 <span>Total:</span>
//                                 <span>${formData.totalAmount.toFixed(2)}</span>
//                             </div>
//                         </div>
//                     </div>

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
//                             {loading ? 'Creating Purchase...' : 'Create Purchase'}
//                         </button>
//                         <button type="button" onClick={() => navigate('/dashboard')} className="cancel-button">
//                             Cancel
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </Layout>
//     );
// };

// export default CreatePurchase;


// pages/CreatePurchase.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import TransactionNotification from '../components/TransactionNotification';
import './CreatePurchase.css';

const CreatePurchase = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    data: null
  });

  useEffect(() => {
    // Fetch suppliers and products
    const fetchData = async () => {
      try {
        const suppliersRes = await axios.get(`${API_URL}/api/suppliers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const productsRes = await axios.get(`${API_URL}/api/products`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setSuppliers(suppliersRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  const handleAddProduct = () => {
    if (products.length === 0) return;
    
    setSelectedProducts([...selectedProducts, {
      id: '',
      name: '',
      price: 0,
      quantity: 1
    }]);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    
    if (field === 'id') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedProducts[index] = {
          ...updatedProducts[index],
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.cost || 0
        };
      }
    } else {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: field === 'quantity' ? parseInt(value, 10) : value
      };
    }
    
    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => 
      total + (product.price * product.quantity), 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      alert('Please add at least one product to the purchase');
      return;
    }
    
    if (!selectedSupplier) {
      alert('Please select a supplier');
      return;
    }
    
    const purchaseData = {
      products: selectedProducts.map(p => ({
        product: p.id,
        quantity: p.quantity,
        price: p.price,
        productName: p.name
      })),
      supplier: selectedSupplier,
      totalAmount: calculateTotal(),
      paymentMethod
    };
    
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/purchases`, purchaseData, {
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
      setSelectedSupplier('');
      setPaymentMethod('bank');
      
    } catch (error) {
      console.error('Error creating purchase:', error);
      
      // Show error notification
      setNotification({
        show: true,
        data: {
          status: 'error',
          message: error.response?.data?.message || 'Failed to create purchase'
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
    <div className="create-purchase-container">
      {/* Transaction notification */}
      <TransactionNotification 
        show={notification.show}
        type="purchase"
        data={notification.data}
        onClose={closeNotification}
      />
      
      <h2>Create New Purchase</h2>
      
      <div className="purchase-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Supplier Information</h3>
            <div className="form-group">
              <label>Select Supplier</label>
              <select 
                value={selectedSupplier} 
                onChange={(e) => setSelectedSupplier(e.target.value)}
                required
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
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
          </div>
          
          <div className="form-section">
            <div className="section-header">
              <h3>Products</h3>
              <button 
                type="button" 
                className="add-product-btn"
                onClick={handleAddProduct}
              >
                Add Product
              </button>
            </div>
            
            {selectedProducts.length === 0 ? (
              <p className="no-products">No products added</p>
            ) : (
              <div className="product-items">
                {selectedProducts.map((product, index) => (
                  <div key={index} className="product-row">
                    <div className="form-group">
                      <label>Product</label>
                      <select 
                        value={product.id} 
                        onChange={(e) => handleProductChange(index, 'id', e.target.value)}
                        required
                      >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group quantity">
                      <label>Quantity</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={product.quantity} 
                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-group price">
                      <label>Unit Price</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        value={product.price} 
                        onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-group subtotal">
                      <label>Subtotal</label>
                      <div className="subtotal-value">
                        ${(product.price * product.quantity).toFixed(2)}
                      </div>
                    </div>
                    
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="purchase-summary">
            <div className="total">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading || selectedProducts.length === 0 || !selectedSupplier}
          >
            {loading ? 'Processing...' : 'Create Purchase'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchase;