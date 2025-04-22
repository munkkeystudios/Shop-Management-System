// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\ImportSale.js ---
// ============================================================================
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { salesAPI } from '../services/api'; // Assuming salesAPI will have import function
import '../styles/importPurchase.css'; // Reuse styles from purchase import
import { FaUpload, FaDownload, FaTimes, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const ImportSale = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [importResults, setImportResults] = useState(null); // To show detailed results
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Basic validation for file type (more robust in backend)
            const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            if (allowedTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
                setSelectedFile(file);
                setError('');
                setSuccess('');
                setImportResults(null);
            } else {
                setError('Invalid file type. Only CSV, XLS, or XLSX files are allowed.');
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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            // Trigger the same validation as handleFileChange
             handleFileChange({ target: { files: [file] } });
            e.dataTransfer.clearData();
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

        setLoading(true);
        setError('');
        setSuccess('');
        setImportResults(null);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // Assuming an importSales function exists in salesAPI
            const response = await salesAPI.importSales(formData);

            if (response.data.success) {
                setSuccess(response.data.message);
                setImportResults({
                     totalProcessed: response.data.totalProcessed,
                     successCount: response.data.successCount,
                     errorCount: response.data.errorCount,
                     errors: response.data.errors || []
                 });
                 setSelectedFile(null); // Clear file input after successful import
                 if (fileInputRef.current) {
                     fileInputRef.current.value = ""; // Reset file input visually
                 }
            } else {
                setError(response.data.message || 'Import failed.');
                setImportResults({ // Show errors even if overall success is false
                     totalProcessed: response.data.totalProcessed || 0,
                     successCount: response.data.successCount || 0,
                     errorCount: response.data.errorCount || 0,
                     errors: response.data.errors || []
                 });
            }
        } catch (err) {
            console.error('Import error:', err.response || err);
            setError(err.response?.data?.message || 'An error occurred during import.');
            // Set results even on catch if the server might have sent partial data
             if (err.response?.data) {
                 setImportResults({
                     totalProcessed: err.response.data.totalProcessed || 0,
                     successCount: err.response.data.successCount || 0,
                     errorCount: err.response.data.errorCount || 0,
                     errors: err.response.data.errors || []
                 });
             }
        } finally {
            setLoading(false);
        }
    };

    const handleDiscard = () => {
        navigate('/sales'); // Navigate back to sales list or dashboard
    };

    const downloadExample = () => {
        // Trigger backend download endpoint
        window.location.href = '/api/import/sales/sample';
    };

    return (
        <Layout title="Import Sales">
            <div className="import-purchase-container"> {/* Reusing purchase import styles */}
                <h1>Import Sales Data</h1>
                <p>Upload a CSV or Excel file with sales information. Ensure it matches the required format.</p>

                <div className="download-sample">
                    <button type="button" className="btn-download" onClick={downloadExample}>
                        <FaDownload /> Download Sample Template
                    </button>
                     <p className="sample-info">Sample includes required columns: `billNumber`, `createdAt`, `items` (format: "ID:QTY:PRICE;ID:QTY:PRICE"), `total`, `subtotal`, `discount`, `tax`, `amountPaid`. Optional: `customerName`, `customerPhone`, `customerEmail`, `paymentMethod`, `paymentStatus`, `notes`.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="file-upload-section">
                        <div
                            className={`file-drop-area ${selectedFile ? 'has-file' : ''}`}
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
                                        <FaUpload className="upload-icon-large" />
                                        <p>Selected file: <strong>{selectedFile.name}</strong></p>
                                        <p className="small-text">Click or drop another file to replace.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <FaUpload className="upload-icon-large" />
                                        <p>Click to upload or drag and drop</p>
                                        <p className="small-text">CSV, XLS, or XLSX files allowed.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && <div className="alert error import-alert"><FaExclamationTriangle /> {error}</div>}
                    {success && <div className="alert success import-alert"><FaCheckCircle /> {success}</div>}

                     {importResults && (
                          <div className="import-results">
                               <h4>Import Summary:</h4>
                               <p>Total Rows Processed: {importResults.totalProcessed}</p>
                               <p>Successfully Imported: {importResults.successCount}</p>
                               <p>Errors: {importResults.errorCount}</p>
                               {importResults.errorCount > 0 && (
                                    <div className="import-errors-details">
                                         <h5>Errors:</h5>
                                         <ul>
                                              {importResults.errors.slice(0, 10).map((err, index) => ( // Show first 10 errors
                                                   <li key={index}>Row {err.row || 'N/A'}: {err.error} {err.item ? `(Data: ${JSON.stringify(err.item).substring(0,100)}...)` : ''}</li>
                                              ))}
                                               {importResults.errors.length > 10 && <li>... and {importResults.errors.length - 10} more errors.</li>}
                                         </ul>
                                    </div>
                               )}
                          </div>
                     )}


                    <div className="form-buttons import-buttons">
                        <button type="button" className="btn-discard" onClick={handleDiscard} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save-submit" disabled={loading || !selectedFile}>
                            {loading ? <><FaSpinner className="spinner" /> Processing...</> : 'Import Sales'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default ImportSale;
