import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { suppliersAPI } from '../services/api';
import '../styles/importSale.css';
import { useNotifications } from '../context/NotificationContext';

const ImportSupplier = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [importResults, setImportResults] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { addNotification } = useNotifications();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
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
            const response = await suppliersAPI.importSuppliers(formData);

            if (response.data.success) {
                const successCount = response.data.successCount || 0;

                addNotification(
                    'import',
                    `Successfully imported ${successCount} ${successCount === 1 ? 'supplier' : 'suppliers'}`
                );

                setSuccess(response.data.message || 'Suppliers imported successfully.');
                setImportResults({
                    totalProcessed: response.data.totalProcessed || 0,
                    successCount,
                    errorCount: response.data.errorCount || 0,
                    errors: response.data.errors || []
                });

                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                setError(response.data.message || 'Import failed.');
                setImportResults({
                    totalProcessed: response.data.totalProcessed || 0,
                    successCount: response.data.successCount || 0,
                    errorCount: response.data.errorCount || 0,
                    errors: response.data.errors || []
                });
            }
        } catch (err) {
            console.error('Supplier import error:', err.response || err);
            setError(err.response?.data?.message || 'An error occurred during import.');

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
        navigate('/supplier');
    };

    const downloadExample = async () => {
        try {
            const response = await suppliersAPI.downloadImportTemplate();
            const blob = new Blob([response.data], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sample_suppliers_import.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error('Template download error:', err);
            setError('Unable to download sample template.');
        }
    };

    return (
        <Layout title="Import Suppliers">
            <div className="import-sales-page">
                <main className="import-sales-main">
                    <header className="import-sales-header">
                        <h1>Import Supplier Data</h1>
                        <p>
                            Streamline onboarding by uploading bulk supplier records. Our system validates each row
                            against registry standards to maintain clean procurement data.
                        </p>
                    </header>

                    {(error || success) && (
                        <div className="import-sales-alerts" role="status">
                            {error && <div className="import-sales-alert import-sales-alert-error">{error}</div>}
                            {success && <div className="import-sales-alert import-sales-alert-success">{success}</div>}
                        </div>
                    )}

                    <div className="import-sales-grid">
                        <div className="import-sales-left-col">
                            <section className="import-sales-card import-sales-template-card">
                                <div>
                                    <span className="material-symbols-outlined import-sales-card-icon" aria-hidden="true">description</span>
                                    <h3>Sample Template</h3>
                                    <p>
                                        Download our standardized supplier template to ensure your vendor data is
                                        correctly formatted for import.
                                    </p>
                                </div>
                                <button type="button" className="import-sales-primary-btn" onClick={downloadExample}>
                                    <span className="material-symbols-outlined" aria-hidden="true">download</span>
                                    Download Template
                                </button>
                            </section>

                            <section className="import-sales-card import-sales-requirements-card">
                                <h3>Required Fields</h3>
                                <ul>
                                    <li><span className="dot" />Supplier Name</li>
                                    <li><span className="dot" />Contact Number</li>
                                    <li><span className="dot" />Address</li>
                                    <li><span className="dot" />Email (Optional)</li>
                                </ul>
                            </section>
                        </div>

                        <div className="import-sales-right-col">
                            <form onSubmit={handleSubmit} className="import-sales-upload-shell">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    accept=".csv,.xls,.xlsx"
                                />

                                <div
                                    className={`import-sales-drop-zone ${selectedFile ? 'has-file' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={handleUploadClick}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleUploadClick();
                                        }
                                    }}
                                >
                                    <div className="upload-icon-wrap">
                                        <span className="material-symbols-outlined" aria-hidden="true">cloud_upload</span>
                                    </div>
                                    <h2>{selectedFile ? 'File selected and ready' : 'Drag and drop files here'}</h2>
                                    <p className="upload-subtext">
                                        {selectedFile
                                            ? selectedFile.name
                                            : 'Supported formats: .CSV, .XLS, .XLSX (Max 15MB)'}
                                    </p>
                                    <div className="upload-or-row">
                                        <div className="line" />
                                        <span>OR</span>
                                        <div className="line" />
                                    </div>
                                    <button type="button" className="browse-btn" onClick={handleUploadClick}>
                                        Browse Local Storage
                                    </button>
                                </div>

                                {importResults && (
                                    <div className="import-sales-results">
                                        <h4>Import Summary</h4>
                                        <p>Total Rows Processed: {importResults.totalProcessed}</p>
                                        <p>Successfully Imported: {importResults.successCount}</p>
                                        <p>Errors: {importResults.errorCount}</p>
                                        {importResults.errorCount > 0 && (
                                            <ul>
                                                {importResults.errors.slice(0, 10).map((err, index) => (
                                                    <li key={index}>Row {err.row || 'N/A'}: {err.error}</li>
                                                ))}
                                                {importResults.errors.length > 10 && (
                                                    <li>... and {importResults.errors.length - 10} more errors.</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                <footer className="import-sales-actions-footer">
                                    <button type="button" className="cancel-btn" onClick={handleDiscard} disabled={loading}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="import-btn" disabled={loading || !selectedFile}>
                                        {loading ? 'Processing...' : 'Import Suppliers'}
                                    </button>
                                </footer>
                            </form>
                        </div>
                    </div>

                    <div className="import-sales-status-row">
                        <div className="status-card">
                            <span className="material-symbols-outlined" aria-hidden="true">info</span>
                            <div>
                                <h4>Automatic Validation</h4>
                                <p>Supplier records are validated for required contact and address structure.</p>
                            </div>
                        </div>
                        <div className="status-card">
                            <span className="material-symbols-outlined" aria-hidden="true">history</span>
                            <div>
                                <h4>Registry Logging</h4>
                                <p>All supplier imports are tracked for procurement and audit visibility.</p>
                            </div>
                        </div>
                        <div className="status-card">
                            <span className="material-symbols-outlined" aria-hidden="true">security</span>
                            <div>
                                <h4>Secure Transfer</h4>
                                <p>Uploads are protected during transit with encrypted ingestion workflows.</p>
                            </div>
                        </div>
                    </div>

                    <div className="import-sales-bg-mark" aria-hidden="true">
                        <span className="material-symbols-outlined">architecture</span>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default ImportSupplier;
