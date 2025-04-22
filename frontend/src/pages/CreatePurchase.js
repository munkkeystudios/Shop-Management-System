// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const CreatePurchase = () => {
//   const [loading, setLoading] = useState(false);
//   const [suppliers, setSuppliers] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
  
//   const [purchaseData, setPurchaseData] = useState({
//     date: new Date().toISOString().split('T')[0],
//     supplier: '',
//     warehouse: '',
//     items: [],
//     totalAmount: 0,
//     tax: 0,
//     discount: 0,
//     status: 'pending',
//     paymentStatus: 'pending',
//     notes: ''
//   });

//   const [selectedProduct, setSelectedProduct] = useState('');
//   const [productSearchTerm, setProductSearchTerm] = useState('');
//   const [filteredProducts, setFilteredProducts] = useState([]);

//   // Calculate totals
//   const calculateTotals = (items) => {
//     const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//     const totalAmount = subtotal + Number(purchaseData.tax) - Number(purchaseData.discount);
//     return { subtotal, totalAmount };
//   };

//   // Load initial data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [suppliersRes, productsRes, warehousesRes] = await Promise.all([
//           axios.get('/api/suppliers'),
//           axios.get('/api/products'),
//           axios.get('/api/warehouses')
//         ]);
        
//         setSuppliers(suppliersRes.data.data || []);
//         setProducts(productsRes.data.data || []);
//         setFilteredProducts(productsRes.data.data || []);
//         setWarehouses(warehousesRes.data.data || []);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         toast.error('Failed to load required data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Filter products based on search term
//   useEffect(() => {
//     if (productSearchTerm) {
//       const filtered = products.filter(product => 
//         product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
//         (product.barcode && product.barcode.includes(productSearchTerm))
//       );
//       setFilteredProducts(filtered);
//     } else {
//       setFilteredProducts(products);
//     }
//   }, [productSearchTerm, products]);

//   const handleProductSearch = (e) => {
//     setProductSearchTerm(e.target.value);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setPurchaseData(prev => {
//       const updated = { ...prev, [name]: value };
      
//       if (name === 'tax' || name === 'discount') {
//         const { totalAmount } = calculateTotals(prev.items);
//         return { ...updated, totalAmount };
//       }
      
//       return updated;
//     });
//   };

//   const addProductToItems = () => {
//     if (!selectedProduct) return;
    
//     const product = products.find(p => p._id === selectedProduct);
//     if (!product) return;
    
//     // Check if product already exists in items
//     const existingItemIndex = purchaseData.items.findIndex(item => item.product === product._id);
    
//     setPurchaseData(prev => {
//       let updatedItems;
      
//       if (existingItemIndex >= 0) {
//         // Update quantity if product already exists
//         updatedItems = [...prev.items];
//         updatedItems[existingItemIndex].quantity += 1;
//       } else {
//         // Add new product
//         updatedItems = [
//           ...prev.items,
//           {
//             product: product._id,
//             productName: product.name,
//             quantity: 1,
//             price: product.cost || product.price || 0,
//             stock: product.stock || 0
//           }
//         ];
//       }
      
//       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
//       return {
//         ...prev,
//         items: updatedItems,
//         totalAmount
//       };
//     });
    
//     // Reset product selection
//     setSelectedProduct('');
//     setProductSearchTerm('');
//   };

//   const handleQuantityChange = (index, value) => {
//     const quantity = parseInt(value) || 0;
    
//     setPurchaseData(prev => {
//       const updatedItems = [...prev.items];
//       updatedItems[index].quantity = quantity;
      
//       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
//       return {
//         ...prev,
//         items: updatedItems,
//         totalAmount
//       };
//     });
//   };

//   const handlePriceChange = (index, value) => {
//     const price = parseFloat(value) || 0;
    
//     setPurchaseData(prev => {
//       const updatedItems = [...prev.items];
//       updatedItems[index].price = price;
      
//       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
//       return {
//         ...prev,
//         items: updatedItems,
//         totalAmount
//       };
//     });
//   };

//   const removeItem = (index) => {
//     setPurchaseData(prev => {
//       const updatedItems = prev.items.filter((_, i) => i !== index);
//       const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
//       return {
//         ...prev,
//         items: updatedItems,
//         totalAmount
//       };
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!purchaseData.supplier) {
//       return toast.error('Please select a supplier');
//     }
    
//     if (purchaseData.items.length === 0) {
//       return toast.error('Please add at least one product');
//     }
    
//     try {
//       setLoading(true);
      
//       // Format data for API
//       const formattedData = {
//         supplier: purchaseData.supplier,
//         warehouse: purchaseData.warehouse || undefined,
//         items: purchaseData.items.map(item => ({
//           product: item.product,
//           quantity: item.quantity,
//           price: item.price
//         })),
//         totalAmount: purchaseData.totalAmount,
//         tax: purchaseData.tax,
//         discount: purchaseData.discount,
//         date: purchaseData.date,
//         status: purchaseData.status,
//         paymentStatus: purchaseData.paymentStatus,
//         notes: purchaseData.notes
//       };
      
//       const response = await axios.post('/api/purchases', formattedData);
      
//       toast.success('Purchase created successfully');
//       // Reset form or redirect
//       setPurchaseData({
//         date: new Date().toISOString().split('T')[0],
//         supplier: '',
//         warehouse: '',
//         items: [],
//         totalAmount: 0,
//         tax: 0,
//         discount: 0,
//         status: 'pending',
//         paymentStatus: 'pending',
//         notes: ''
//       });
//     } catch (error) {
//       console.error('Error creating purchase:', error);
//       toast.error(error.response?.data?.message || 'Failed to create purchase');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && !suppliers.length) {
//     return <div className="flex justify-center p-8">Loading...</div>;
//   }

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-6">Create Purchase</h1>
      
//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           {/* Order Date */}
//           <div>
//             <label className="block text-sm mb-1">Order Date</label>
//             <input
//               type="date"
//               name="date"
//               value={purchaseData.date}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded"
//             />
//           </div>
          
//           {/* Supplier Selection */}
//           <div>
//             <label className="block text-sm mb-1">Choose Supplier</label>
//             <select
//               name="supplier"
//               value={purchaseData.supplier}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded"
//             >
//               <option value="">Select Supplier</option>
//               {suppliers.map(supplier => (
//                 <option key={supplier._id} value={supplier._id}>
//                   {supplier.name}
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           {/* Warehouse Selection */}
//           <div>
//             <label className="block text-sm mb-1">Choose Warehouse</label>
//             <select
//               name="warehouse"
//               value={purchaseData.warehouse}
//               onChange={handleInputChange}
//               className="w-full p-2 border rounded"
//             >
//               <option value="">Select Warehouse</option>
//               {warehouses.map(warehouse => (
//                 <option key={warehouse._id} value={warehouse._id}>
//                   {warehouse.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
        
//         {/* Product Search and Table */}
//         <div className="mb-6">
//           <div className="flex items-center mb-4">
//             <div className="relative flex-grow mr-2">
//               <input
//                 type="text"
//                 placeholder="Search/Scan Product by Code or Name"
//                 value={productSearchTerm}
//                 onChange={handleProductSearch}
//                 className="w-full p-2 border rounded pl-8"
//               />
//               <svg
//                 className="absolute left-2 top-2.5 h-4 w-4 text-gray-500"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 ></path>
//               </svg>
//             </div>
            
//             {filteredProducts.length > 0 && productSearchTerm && (
//               <div className="absolute z-10 mt-1 bg-white border rounded shadow max-h-60 overflow-auto">
//                 {filteredProducts.map(product => (
//                   <div
//                     key={product._id}
//                     className="p-2 hover:bg-gray-100 cursor-pointer"
//                     onClick={() => {
//                       setSelectedProduct(product._id);
//                       setProductSearchTerm(product.name);
//                       addProductToItems();
//                     }}
//                   >
//                     {product.name} {product.barcode && `(${product.barcode})`}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
          
//           {/* Products Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-50">
//                   <th className="p-2 text-left">#</th>
//                   <th className="p-2 text-left">Product</th>
//                   <th className="p-2 text-right">Net Unit Price</th>
//                   <th className="p-2 text-right">Stock</th>
//                   <th className="p-2 text-right">Qty</th>
//                   <th className="p-2 text-right">Discount</th>
//                   <th className="p-2 text-right">Tax</th>
//                   <th className="p-2 text-right">Subtotal</th>
//                   <th className="p-2"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {purchaseData.items.length === 0 ? (
//                   <tr>
//                     <td colSpan="9" className="p-4 text-center text-gray-500">
//                       No data available
//                     </td>
//                   </tr>
//                 ) : (
//                   purchaseData.items.map((item, index) => (
//                     <tr key={index} className="border-t">
//                       <td className="p-2">{index + 1}</td>
//                       <td className="p-2">{item.productName}</td>
//                       <td className="p-2 text-right">
//                         <input
//                           type="number"
//                           min="0"
//                           step="0.01"
//                           value={item.price}
//                           onChange={(e) => handlePriceChange(index, e.target.value)}
//                           className="w-24 p-1 border rounded text-right"
//                         />
//                       </td>
//                       <td className="p-2 text-right">{item.stock}</td>
//                       <td className="p-2 text-right">
//                         <input
//                           type="number"
//                           min="1"
//                           value={item.quantity}
//                           onChange={(e) => handleQuantityChange(index, e.target.value)}
//                           className="w-16 p-1 border rounded text-right"
//                         />
//                       </td>
//                       <td className="p-2 text-right">0.00</td>
//                       <td className="p-2 text-right">0.00</td>
//                       <td className="p-2 text-right">
//                         {(item.price * item.quantity).toFixed(2)}
//                       </td>
//                       <td className="p-2">
//                         <button
//                           type="button"
//                           onClick={() => removeItem(index)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                             <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                           </svg>
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
        
//         {/* Totals and Notes */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <div className="mb-4">
//               <label className="block text-sm mb-1">Notes</label>
//               <textarea
//                 name="notes"
//                 value={purchaseData.notes}
//                 onChange={handleInputChange}
//                 className="w-full p-2 border rounded"
//                 rows="4"
//                 placeholder="Write notes..."
//               ></textarea>
//             </div>
            
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm mb-1">Order Tax</label>
//                 <input
//                   type="number"
//                   name="tax"
//                   min="0"
//                   step="0.01"
//                   value={purchaseData.tax}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded"
//                   placeholder="0.00"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm mb-1">Discount</label>
//                 <input
//                   type="number"
//                   name="discount"
//                   min="0"
//                   step="0.01"
//                   value={purchaseData.discount}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded"
//                   placeholder="0.00"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm mb-1">Status</label>
//                 <select
//                   name="status"
//                   value={purchaseData.status}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded"
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="received">Received</option>
//                   <option value="ordered">Ordered</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </div>
//             </div>
//           </div>
          
//           <div>
//             <div className="bg-gray-50 p-4 rounded">
//               <div className="flex justify-between mb-2">
//                 <span>Order Tax:</span>
//                 <span>${parseFloat(purchaseData.tax).toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between mb-2">
//                 <span>Discount:</span>
//                 <span>${parseFloat(purchaseData.discount).toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
//                 <span>Grand Total:</span>
//                 <span>${purchaseData.totalAmount.toFixed(2)}</span>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <div className="mt-6">
//           <button
//             type="submit"
//             className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//             disabled={loading}
//           >
//             {loading ? 'Submitting...' : 'Submit'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CreatePurchase;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from "../components/Layout";


const CreatePurchase = () => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  
  const [purchaseData, setPurchaseData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    warehouse: '',
    items: [],
    totalAmount: 0,
    tax: 0,
    discount: 0,
    status: 'pending',
    paymentStatus: 'pending',
    notes: ''
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

//   Calculate totals
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = subtotal + Number(purchaseData.tax) - Number(purchaseData.discount);
    return { totalAmount };
  };

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [suppliersRes, productsRes, warehousesRes] = await Promise.all([
          axios.get('/api/suppliers'),
          axios.get('/api/products'),
          axios.get('/api/warehouses')
        ]);
        
        setSuppliers(suppliersRes.data.data || []);
        setProducts(productsRes.data.data || []);
        setFilteredProducts(productsRes.data.data || []);
        setWarehouses(warehousesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (productSearchTerm) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
        (product.barcode && product.barcode.includes(productSearchTerm))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [productSearchTerm, products]);

  const handleProductSearch = (e) => {
    setProductSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPurchaseData(prev => {
      const updated = { ...prev, [name]: value };
      
      if (name === 'tax' || name === 'discount') {
        const { totalAmount } = calculateTotals(prev.items);
        return { ...updated, totalAmount };
      }
      
      return updated;
    });
  };

  const addProductToItems = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p._id === selectedProduct);
    if (!product) return;
    
    // Check if product already exists in items
    const existingItemIndex = purchaseData.items.findIndex(item => item.product === product._id);
    
    setPurchaseData(prev => {
      let updatedItems;
      
      if (existingItemIndex >= 0) {
        // Update quantity if product already exists
        updatedItems = [...prev.items];
        updatedItems[existingItemIndex].quantity += 1;
      } else {
        // Add new product
        updatedItems = [
          ...prev.items,
          {
            product: product._id,
            productName: product.name,
            quantity: 1,
            price: product.cost || product.price || 0,
            stock: product.stock || 0
          }
        ];
      }
      
      const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
      return {
        ...prev,
        items: updatedItems,
        totalAmount
      };
    });
    
    // Reset product selection
    setSelectedProduct('');
    setProductSearchTerm('');
  };

  const handleQuantityChange = (index, value) => {
    const quantity = parseInt(value) || 0;
    
    setPurchaseData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index].quantity = quantity;
      
      const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
      return {
        ...prev,
        items: updatedItems,
        totalAmount
      };
    });
  };

  const handlePriceChange = (index, value) => {
    const price = parseFloat(value) || 0;
    
    setPurchaseData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index].price = price;
      
      const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
      return {
        ...prev,
        items: updatedItems,
        totalAmount
      };
    });
  };

  const removeItem = (index) => {
    setPurchaseData(prev => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      const { subtotal, totalAmount } = calculateTotals(updatedItems);
      
      return {
        ...prev,
        items: updatedItems,
        totalAmount
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!purchaseData.supplier) {
      return toast.error('Please select a supplier');
    }
    
    if (purchaseData.items.length === 0) {
      return toast.error('Please add at least one product');
    }
    
    try {
      setLoading(true);
      
      // Format data for API
      const formattedData = {
        supplier: purchaseData.supplier,
        warehouse: purchaseData.warehouse || undefined,
        items: purchaseData.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: purchaseData.totalAmount,
        tax: purchaseData.tax,
        discount: purchaseData.discount,
        date: purchaseData.date,
        status: purchaseData.status,
        paymentStatus: purchaseData.paymentStatus,
        notes: purchaseData.notes
      };
      
      const response = await axios.post('/api/purchases', formattedData);
      
      toast.success('Purchase created successfully');
      // Reset form or redirect
      setPurchaseData({
        date: new Date().toISOString().split('T')[0],
        supplier: '',
        warehouse: '',
        items: [],
        totalAmount: 0,
        tax: 0,
        discount: 0,
        status: 'pending',
        paymentStatus: 'pending',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast.error(error.response?.data?.message || 'Failed to create purchase');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !suppliers.length) {
    return (
      <Layout>
        <div className="flex justify-center p-8">Loading...</div>
      </Layout>
    );
  }


  return (
    <Layout>
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Create Purchase</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Order Date */}
          <div>
            <label className="block text-sm mb-1">Order Date</label>
            <input
              type="date"
              name="date"
              value={purchaseData.date}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          {/* Supplier Selection */}
          <div>
            <label className="block text-sm mb-1">Choose Supplier</label>
            <select
              name="supplier"
              value={purchaseData.supplier}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Warehouse Selection */}
          <div>
            <label className="block text-sm mb-1">Choose Warehouse</label>
            <select
              name="warehouse"
              value={purchaseData.warehouse}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(warehouse => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Product Search and Table */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="relative flex-grow mr-2">
              <input
                type="text"
                placeholder="Search/Scan Product by Code or Name"
                value={productSearchTerm}
                onChange={handleProductSearch}
                className="w-full p-2 border rounded pl-8"
              />
              <svg
                className="absolute left-2 top-2.5 h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            
            {filteredProducts.length > 0 && productSearchTerm && (
              <div className="absolute z-10 mt-1 bg-white border rounded shadow max-h-60 overflow-auto">
                {filteredProducts.map(product => (
                  <div
                    key={product._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product._id);
                      setProductSearchTerm(product.name);
                      addProductToItems();
                    }}
                  >
                    {product.name} {product.barcode && `(${product.barcode})`}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Product</th>
                  <th className="p-2 text-right">Net Unit Price</th>
                  <th className="p-2 text-right">Stock</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-right">Discount</th>
                  <th className="p-2 text-right">Tax</th>
                  <th className="p-2 text-right">Subtotal</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {purchaseData.items.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-4 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  purchaseData.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          className="w-24 p-1 border rounded text-right"
                        />
                      </td>
                      <td className="p-2 text-right">{item.stock}</td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          className="w-16 p-1 border rounded text-right"
                        />
                      </td>
                      <td className="p-2 text-right">0.00</td>
                      <td className="p-2 text-right">0.00</td>
                      <td className="p-2 text-right">
                        {(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Totals and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Notes</label>
              <textarea
                name="notes"
                value={purchaseData.notes}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="4"
                placeholder="Write notes..."
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Order Tax</label>
                <input
                  type="number"
                  name="tax"
                  min="0"
                  step="0.01"
                  value={purchaseData.tax}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Discount</label>
                <input
                  type="number"
                  name="discount"
                  min="0"
                  step="0.01"
                  value={purchaseData.discount}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select
                  name="status"
                  value={purchaseData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="received">Received</option>
                  <option value="ordered">Ordered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex justify-between mb-2">
                <span>Order Tax:</span>
                <span>${parseFloat(purchaseData.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Discount:</span>
                <span>${parseFloat(purchaseData.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Grand Total:</span>
                <span>${purchaseData.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
    </Layout>
  );
};

export default CreatePurchase;

