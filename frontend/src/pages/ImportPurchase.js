

// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Layout from '../components/Layout';
// import '../styles/importPurchase.css';
// import html2pdf from 'html2pdf.js';
// import { useNotifications } from '../context/NotificationContext';

// const ImportPurchase = () => {
//   const { addNotification } = useNotifications();
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [suppliers, setSuppliers] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [formData, setFormData] = useState({
//     date: new Date().toISOString().split('T')[0],
//     supplier: '',
//     warehouse: '',
//     orderTax: '0',
//     discount: '0',
//     status: 'pending',
//     notes: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const suppliersResponse = await axios.get('/api/suppliers');
//         if (suppliersResponse.data.success) {
//           setSuppliers(suppliersResponse.data.data);
//         }

//         try {
//           const warehousesResponse = await axios.get('/api/warehouses');
//           if (warehousesResponse.data.success) {
//             setWarehouses(warehousesResponse.data.data);
//           }
//         } catch {
//           console.log('Warehouses might not be implemented yet');
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setError('Error loading suppliers or warehouses.');
//       }
//     };

//     fetchData();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (
//         file.type === 'text/csv' ||
//         file.type === 'application/vnd.ms-excel' ||
//         file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
//         file.name.endsWith('.csv') ||
//         file.name.endsWith('.xls') ||
//         file.name.endsWith('.xlsx')
//       ) {
//         setSelectedFile(file);
//         setError('');
//       } else {
//         setError('Only CSV, XLS, or XLSX files are allowed.');
//         setSelectedFile(null);
//       }
//     }
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.dataTransfer.files.length > 0) {
//       const file = e.dataTransfer.files[0];
//       handleFileChange({ target: { files: [file] } });
//     }
//   };

//   const handleUploadClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedFile) {
//       setError('Please select a file to import.');
//       return;
//     }

//     if (!formData.supplier) {
//       setError('Please select a supplier.');
//       return;
//     }

//     setLoading(true);
//     const submitFormData = new FormData();
//     submitFormData.append('file', selectedFile);
//     Object.entries(formData).forEach(([key, value]) => {
//       submitFormData.append(key, value);
//     });

//     try {
//       const response = await axios.post('/api/purchases/import', submitFormData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });

//       if (response.data.success) {
//         // Get supplier name for the notification
//         const supplierName = suppliers.find(s => s._id === formData.supplier)?.name || 'Unknown Supplier';

//         // Add notification
//         addNotification(
//           'purchase',
//           `Successfully imported purchase data from ${supplierName}`
//         );

//         alert('Purchase data imported successfully!');
//         navigate('/purchases');
//       } else {
//         setError(response.data.message || 'Error importing purchase data.');
//       }
//     } catch (error) {
//       console.error('Import error:', error);
//       setError(error.response?.data?.message || 'Error importing purchase data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDiscard = () => {
//     navigate('/purchases');
//   };

//   const downloadExample = () => {
//     const element = document.getElementById('import-purchase-form'); // Get the form or section you want to convert into PDF
//     html2pdf()
//       .from(element)
//       .save('import-purchase-example.pdf'); // Specify the file name for the PDF
//   };

//   return (
//     <Layout> {/*  Wrapping everything in Layout */}
//       <div className="import-purchase-container">
//         <h1>Import Purchase</h1>

//         <form onSubmit={handleSubmit} id="import-purchase-form"> {/* Add id to target the form */}
//           <div className="form-row">
//             <div className="form-group">
//               <label htmlFor="date">Date</label>
//               <input
//                 type="date"
//                 id="date"
//                 name="date"
//                 value={formData.date}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="supplier">Supplier</label>
//               <select
//                 id="supplier"
//                 name="supplier"
//                 value={formData.supplier}
//                 onChange={handleInputChange}
//                 required
//               >
//                 <option value="">Choose Supplier</option>
//                 {suppliers.map(supplier => (
//                   <option key={supplier._id} value={supplier._id}>
//                     {supplier.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* <div className="form-group">
//               <label htmlFor="warehouse">Warehouse</label>
//               <select
//                 id="warehouse"
//                 name="warehouse"
//                 value={formData.warehouse}
//                 onChange={handleInputChange}
//               >
//                 <option value="">Choose Warehouse</option>
//                 {warehouses.map(warehouse => (
//                   <option key={warehouse._id} value={warehouse._id}>
//                     {warehouse.name}
//                   </option>
//                 ))}
//               </select>
//             </div> */}
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label htmlFor="orderTax">Order Tax (%)</label>
//               <input
//                 type="number"
//                 id="orderTax"
//                 name="orderTax"
//                 value={formData.orderTax}
//                 onChange={handleInputChange}
//                 placeholder="0"
//                 min="0"
//                 step="0.01"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="discount">Discount</label>
//               <input
//                 type="number"
//                 id="discount"
//                 name="discount"
//                 value={formData.discount}
//                 onChange={handleInputChange}
//                 placeholder="0"
//                 min="0"
//                 step="0.01"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="status">Status</label>
//               <select
//                 id="status"
//                 name="status"
//                 value={formData.status}
//                 onChange={handleInputChange}
//                 required
//               >
//                 <option value="pending">Pending</option>
//                 <option value="ordered">Ordered</option>
//                 <option value="received">Received</option>
//               </select>
//             </div>
//           </div>

//           <div className="file-upload-section">
//             <div
//               className="file-drop-area"
//               onDragOver={handleDragOver}
//               onDrop={handleDrop}
//               onClick={handleUploadClick}
//             >
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 style={{ display: 'none' }}
//                 accept=".csv,.xls,.xlsx"
//               />
//               <div className="file-message">
//                 {selectedFile ? (
//                   <div>
//                     <p>Selected file: {selectedFile.name}</p>
//                   </div>
//                 ) : (
//                   <div>
//                     <span className="upload-icon">📁</span>
//                     <p>Click to upload or drag and drop</p>
//                     <p className="small-text">CSV, XLS, or XLSX files are allowed.</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {error && <p className="error-message">{error}</p>}

//             <div className="download-sample">
//               <button type="button" className="btn-download" onClick={downloadExample}>
//                 Download Example
//               </button>
//             </div>
//           </div>

//           <div className="note-section">
//             <label htmlFor="notes">Notes</label>
//             <textarea
//               id="notes"
//               name="notes"
//               value={formData.notes}
//               onChange={handleInputChange}
//               placeholder="Write a note..."
//               rows={3}
//             />
//           </div>

//           <div className="form-buttons">
//             <button type="button" className="btn-discard" onClick={handleDiscard}>
//               Discard
//             </button>
//             <button type="submit" className="btn-save-submit" disabled={loading}>
//               {loading ? 'Processing...' : 'Save & Submit'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default ImportPurchase;


import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import html2pdf from 'node_modules/html2pdf.js/dist/html2pdf.js';
import '../styles/importPurchase.css';

const ImportPurchase = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    warehouse: '',
    orderTax: '0',
    discount: '0',
    status: 'pending',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const suppliersResponse = await axios.get('/api/suppliers');
        if (suppliersResponse.data.success) {
          // Fixed: setting suppliers data correctly
          setSuppliers(suppliersResponse.data.data);
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
        setError('Error loading suppliers or warehouses.');
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
        alert('Purchase data imported successfully!');
        navigate('/purchases');
      } else {
        setError(response.data.message || 'Error importing purchase data.');
      }
    } catch (error) {
      console.error('Import error:', error);
      setError(error.response?.data?.message || 'Error importing purchase data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    navigate('/purchases');
  };

  const downloadExample = () => {
    // In a real implementation, this would download a template file
    // For now, we'll just use html2pdf as a placeholder
    const element = document.getElementById('import-purchase-form');
    html2pdf()
      .from(element)
      .save('import-purchase-example.pdf');
  };

  return (
    <Layout>
      <div className="import-purchase-container">
        <h1>Import Purchase</h1>

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
                className="select-dropdown"
              >
                <option value="">Choose Supplier</option>
                {Array.isArray(suppliers) && suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="warehouse">Warehouse</label>
              <select
                id="warehouse"
                name="warehouse"
                value={formData.warehouse}
                onChange={handleInputChange}
                className="select-dropdown"
              >
                <option value="">Choose Warehouse</option>
                {Array.isArray(warehouses) && warehouses.map(warehouse => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="orderTax">Order Tax</label>
              <div className="input-with-icon">
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
                <span className="input-icon">%</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="discount">Discount</label>
              <div className="input-with-icon">
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
                <span className="input-icon">$</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="select-dropdown"
              >
                <option value="pending">Pending</option>
                <option value="ordered">Ordered</option>
                <option value="received">Received</option>
              </select>
            </div>
          </div>

          <div className="file-section">
            <div className="file-label">Choose CSV File</div>
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
              
              {selectedFile ? (
                <div className="file-selected">
                  <p>{selectedFile.name}</p>
                </div>
              ) : (
                <div className="file-upload-content">
                  <div className="upload-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#00B44E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16V8" stroke="#00B44E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 12L12 8L16 12" stroke="#00B44E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="upload-text">
                    <p>Click to upload or drag and drop</p>
                    <p className="file-types">CSV, XLSX or XLS files are allowed</p>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="download-example">
              <button type="button" className="btn-download" onClick={downloadExample}>
                Download Example
              </button>
            </div>
          </div>

          <div className="note-section">
            <label htmlFor="notes">Write a note...</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any additional information here..."
              rows={4}
            />
          </div>

          <div className="form-buttons">
            <button type="button" className="btn-discard" onClick={handleDiscard}>
              Discard
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Processing...' : 'Save & Submit'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ImportPurchase;