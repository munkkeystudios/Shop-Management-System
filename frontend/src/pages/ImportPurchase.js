
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Layout from '../components/Layout';
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

  const downloadExample = async () => {
    const element = document.getElementById('import-purchase-form');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('import-purchase-example.pdf');
    } catch (err) {
      console.error('PDF generation error:', err);
    }
  };

  return (
    <Layout>
      <div className="import-purchase-container">
        <h1>Import Purchase</h1>

        <form onSubmit={handleSubmit} id="import-purchase-form">
          {/* -- form fields remain unchanged -- */}

          {/* Note Section */}
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

        <div className="download-example">
          <button type="button" className="btn-download" onClick={downloadExample}>
            Download Example
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ImportPurchase;
