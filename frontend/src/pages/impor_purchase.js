// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ImportPurchase = () => {
//   const [suppliers, setSuppliers] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [purchaseItems, setPurchaseItems] = useState([]);
//   const [supplierId, setSupplierId] = useState('');
//   const [notes, setNotes] = useState('');

//   useEffect(() => {
//     axios.get('/api/suppliers').then(res => setSuppliers(res.data));
//     axios.get('/api/products').then(res => setProducts(res.data));
//   }, []);

//   const handleAddItem = () => {
//     setPurchaseItems([...purchaseItems, { productId: '', quantity: 1, costPrice: 0 }]);
//   };

//   const handleChange = (index, field, value) => {
//     const updated = [...purchaseItems];
//     updated[index][field] = value;
//     setPurchaseItems(updated);
//   };

//   const handleSubmit = async () => {
//     try {
//       await axios.post('/api/purchases', {
//         supplierId,
//         notes,
//         items: purchaseItems,
//       });
//       alert('Purchase imported successfully!');
//       setSupplierId('');
//       setNotes('');
//       setPurchaseItems([]);
//     } catch (err) {
//       alert('Failed to import purchase.');
//       console.error(err);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Import Purchase</h2>

//       <div className="grid grid-cols-2 gap-4 mb-6">
//         <select
//           className="border p-2 rounded"
//           value={supplierId}
//           onChange={(e) => setSupplierId(e.target.value)}
//         >
//           <option value="">Select Supplier</option>
//           {suppliers.map((s) => (
//             <option key={s.id} value={s.id}>{s.name}</option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder="Notes / Invoice Ref"
//           className="border p-2 rounded"
//           value={notes}
//           onChange={(e) => setNotes(e.target.value)}
//         />
//       </div>

//       {purchaseItems.map((item, idx) => (
//         <div key={idx} className="grid grid-cols-4 gap-4 mb-4">
//           <select
//             className="border p-2 rounded"
//             value={item.productId}
//             onChange={(e) => handleChange(idx, 'productId', e.target.value)}
//           >
//             <option value="">Select Product</option>
//             {products.map((p) => (
//               <option key={p.id} value={p.id}>{p.title}</option>
//             ))}
//           </select>

//           <input
//             type="number"
//             min="1"
//             placeholder="Quantity"
//             className="border p-2 rounded"
//             value={item.quantity}
//             onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
//           />

//           <input
//             type="number"
//             min="0"
//             step="0.01"
//             placeholder="Cost Price"
//             className="border p-2 rounded"
//             value={item.costPrice}
//             onChange={(e) => handleChange(idx, 'costPrice', e.target.value)}
//           />

//           <div className="flex items-center">
//             <span className="text-gray-700 font-semibold">
//               ₹{(item.quantity * item.costPrice).toFixed(2)}
//             </span>
//           </div>
//         </div>
//       ))}

//       <button
//         onClick={handleAddItem}
//         className="bg-gray-100 border border-gray-300 text-sm px-4 py-1 rounded hover:bg-gray-200 mb-6"
//       >
//         + Add Another Product
//       </button>

//       <div className="flex justify-between">
//         <button className="bg-red-500 text-white px-4 py-2 rounded">Discard</button>
//         <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">Save & Submit</button>
//       </div>
//     </div>
//   );
// };

// export default ImportPurchase;


import React, { useEffect, useState } from 'react';

const ImportPurchase = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetch('/api/suppliers')
      .then(res => res.json())
      .then(setSuppliers);

    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setTotalAmount(total);
  }, [items]);

  const addItem = () => {
    setItems([...items, { product: '', quantity: 1, price: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) : value;
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { supplier: selectedSupplier, items, totalAmount, notes };

    const res = await fetch('/api/import-purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (res.ok) {
      alert('Import Purchase Created!');
      setItems([]);
      setNotes('');
      setSelectedSupplier('');
    } else {
      alert('Failed: ' + data.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Import Purchase</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} className="border rounded p-2">
            <option value="">Select Supplier</option>
            {suppliers.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <textarea
            placeholder="Add notes..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="border rounded p-2"
          />
        </div>

        <div>
          <button type="button" onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded mb-2">+ Add Product</button>

          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 mb-2">
              <select value={item.product} onChange={e => handleItemChange(i, 'product', e.target.value)} className="border p-2 rounded">
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>

              <input
                type="number"
                value={item.quantity}
                min="1"
                onChange={e => handleItemChange(i, 'quantity', e.target.value)}
                className="border p-2 rounded"
              />

              <input
                type="number"
                value={item.price}
                min="0"
                onChange={e => handleItemChange(i, 'price', e.target.value)}
                className="border p-2 rounded"
              />

              <div className="flex items-center">{(item.quantity * item.price).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="text-right font-bold text-lg">Total: ₹ {totalAmount.toFixed(2)}</div>

        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Save Import</button>
      </form>
    </div>
  );
};

export default ImportPurchase;
