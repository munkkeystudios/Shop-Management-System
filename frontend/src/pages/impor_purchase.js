import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImportPurchase = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    axios.get('/api/suppliers').then(res => setSuppliers(res.data));
    axios.get('/api/products').then(res => setProducts(res.data));
  }, []);

  const handleAddItem = () => {
    setPurchaseItems([...purchaseItems, { productId: '', quantity: 1, costPrice: 0 }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...purchaseItems];
    updated[index][field] = value;
    setPurchaseItems(updated);
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/api/purchases', {
        supplierId,
        notes,
        items: purchaseItems,
      });
      alert('Purchase imported successfully!');
      setSupplierId('');
      setNotes('');
      setPurchaseItems([]);
    } catch (err) {
      alert('Failed to import purchase.');
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Import Purchase</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <select
          className="border p-2 rounded"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
        >
          <option value="">Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Notes / Invoice Ref"
          className="border p-2 rounded"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {purchaseItems.map((item, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-4 mb-4">
          <select
            className="border p-2 rounded"
            value={item.productId}
            onChange={(e) => handleChange(idx, 'productId', e.target.value)}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Quantity"
            className="border p-2 rounded"
            value={item.quantity}
            onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
          />

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Cost Price"
            className="border p-2 rounded"
            value={item.costPrice}
            onChange={(e) => handleChange(idx, 'costPrice', e.target.value)}
          />

          <div className="flex items-center">
            <span className="text-gray-700 font-semibold">
              ₹{(item.quantity * item.costPrice).toFixed(2)}
            </span>
          </div>
        </div>
      ))}

      <button
        onClick={handleAddItem}
        className="bg-gray-100 border border-gray-300 text-sm px-4 py-1 rounded hover:bg-gray-200 mb-6"
      >
        + Add Another Product
      </button>

      <div className="flex justify-between">
        <button className="bg-red-500 text-white px-4 py-2 rounded">Discard</button>
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">Save & Submit</button>
      </div>
    </div>
  );
};

export default ImportPurchase;
