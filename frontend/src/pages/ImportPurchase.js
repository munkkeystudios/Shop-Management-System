import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout'; 
import '../styles/importPurchase.css';
import html2pdf from 'html2pdf.js';
import TransactionNotification from './TransactionNotification';
import { useNotifications } from '../context/NotificationContext';
import { FaFileUpload } from 'react-icons/fa';

const ImportPurchase = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    warehouse: '',
    product: '',
    orderTax: '0',
    discount: '0',
    status: 'pending',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [notification, setNotification] = useState({
    show: false,
    data: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const suppliersResponse = await axios.get('/api/suppliers');
        if (suppliersResponse.data.success) {
          setSuppliers(suppliersResponse.data.success ? suppliersResponse.data.data : []);
        }

        try {
          const productsResponse = await axios.get('/api/products');
          if (productsResponse.data.success) {
            setProducts(productsResponse.data.data);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }

        try {
          const warehousesResponse = await axios.get('/api/warehouses');
          if (warehousesResponse.data.success) {
            setWarehouses(warehousesResponse.data.data);
          }
        } catch {
          console.log('Warehouses might not be implemented yet');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading suppliers, products, or warehouses.');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        file.type === 'text/csv' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.xlsx')
      ) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Only CSV, XLS, or XLSX files are allowed.');
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const closeNotification = () => {
    setNotification({ show: false, data: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file to import.');
      return;
    }

    if (!formData.supplier) {
      setError('Please select a supplier.');
      return;
    }

    setLoading(true);
    const submitFormData = new FormData();
    submitFormData.append('file', selectedFile);
    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value);
    });

    try {
      const response = await axios.post('/api/purchases/import', submitFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const purchaseId = response.data.data._id || response.data.data.id;
        const purchaseAmount = response.data.data.totalAmount || 0;
        const itemCount = response.data.data.items?.length || 0;
        const supplierName = suppliers.find(s => s._id === formData.supplier)?.name || 'Unknown Supplier';

        // Add notification to the system
        addNotification(
          'purchase',
          `New purchase imported from ${supplierName} for ${new Intl.NumberFormat('en-US', {
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
            items: response.data.data.items?.map(item => ({
              id: item.product,
              name: products.find(p => p._id === item.product)?.name || 'Unknown',
              price: item.price,
              quantity: item.quantity
            })) || [],
            type: 'purchase'
          }
        });

        // Reset form after successful import
        setFormData({
          date: new Date().toISOString().split('T')[0],
          supplier: '',
          warehouse: '',
          product: '',
          orderTax: '0',
          discount: '0',
          status: 'pending',
          notes: ''
        });
        setSelectedFile(null);
      } else {
        setNotification({
          show: true,
          data: {
            status: 'error',
            message: response.data.message || 'Error importing purchase data.'
          }
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      setNotification({
        show: true,
        data: {
          status: 'error',
          message: error.response?.data?.message || 'Error importing purchase data. Please try again.'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    navigate('/purchases');
  };

  const downloadExample = () => {
    const element = document.getElementById('import-purchase-form');
    html2pdf()
      .from(element)
      .save('import-purchase-example.pdf');
  };

  return (
    <Layout>
      <div className="import-purchase-container">
        <h1>Import Purchase</h1>

        <TransactionNotification
          show={notification.show}
          type="purchase"
          data={notification.data}
          onClose={closeNotification}
        />

        <form onSubmit={handleSubmit} id="import-purchase-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="supplier">Supplier</label>
              <select
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="product">Product</label>
              <select
                id="product"
                name="product"
                value={formData.product}
                onChange={handleInputChange}
              >
                <option value="">Choose Product</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            {warehouses.length > 0 && (
              <div className="form-group">
                <label htmlFor="warehouse">Warehouse</label>
                <select
                  id="warehouse"
                  name="warehouse"
                  value={formData.warehouse}
                  onChange={handleInputChange}
                >
                  <option value="">Choose Warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="orderTax">Order Tax (%)</label>
              <input
                type="number"
                id="orderTax"
                name="orderTax"
                value={formData.orderTax}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="discount">Discount</label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="pending">Pending</option>
                <option value="ordered">Ordered</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="file-upload-section">
            <div
              className="file-drop-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".csv,.xls,.xlsx"
              />
              <div className="file-message">
                {selectedFile ? (
                  <div>
                    <p>Selected file: {selectedFile.name}</p>
                  </div>
                ) : (
                  <div>
                    <span className="upload-icon"><FaFileUpload /></span>
                    <p>Click to upload or drag and drop</p>
                    <p className="small-text">CSV, XLS, or XLSX files are allowed.</p>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="download-sample">
              <button type="button" className="btn-download" onClick={downloadExample}>
                Download Example
              </button>
            </div>
          </div>

          <div className="note-section">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Write a note..."
              rows={3}
            />
          </div>

          <div className="form-buttons">
            <button type="button" className="btn-discard" onClick={handleDiscard}>
              Discard
            </button>
            <button type="submit" className="btn-save-submit" disabled={loading}>
              {loading ? 'Processing...' : 'Save & Submit'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ImportPurchase;