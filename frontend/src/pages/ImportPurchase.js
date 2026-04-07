import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { purchasesAPI } from '../services/api';
import '../styles/importSale.css';
import { useNotifications } from '../context/NotificationContext';

const ImportPurchase = () => {
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
        setSuccess('');
        setImportResults(null);
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

    setLoading(true);
    setError('');
    setSuccess('');
    setImportResults(null);
    const submitFormData = new FormData();
    submitFormData.append('file', selectedFile);

    try {
      const response = await purchasesAPI.importPurchases(submitFormData);

      if (response.data.success) {
        const successCount = response.data.successCount ?? 1;

        addNotification(
          'purchase',
          `Successfully imported ${successCount} ${successCount === 1 ? 'purchase' : 'purchases'}`
        );

        setSuccess(response.data.message || 'Purchase data imported successfully.');
        setImportResults({
          totalProcessed: response.data.totalProcessed ?? successCount,
          successCount,
          errorCount: response.data.errorCount ?? 0,
          errors: response.data.errors || []
        });

        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setError(response.data.message || 'Import failed.');
        setImportResults({
          totalProcessed: response.data.totalProcessed || 0,
          successCount: response.data.successCount || 0,
          errorCount: response.data.errorCount || 0,
          errors: response.data.errors || []
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      setError(error.response?.data?.message || 'Error importing purchase data. Please try again.');
      if (error.response?.data) {
        setImportResults({
          totalProcessed: error.response.data.totalProcessed || 0,
          successCount: error.response.data.successCount || 0,
          errorCount: error.response.data.errorCount || 0,
          errors: error.response.data.errors || []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    navigate('/all_purchases');
  };

  const downloadExample = async () => {
    try {
      const response = await purchasesAPI.downloadImportTemplate();
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'purchase-import-template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.location.href = '/purchases_example.xlsx';
    }
  };

  return (
    <Layout title="Import Purchases">
      <div className="import-sales-page">
        <main className="import-sales-main">
          <header className="import-sales-header">
            <h1>Import Purchase Data</h1>
            <p className="import-sales-subheading">
              Streamline your workflow by uploading bulk purchase records. The system validates incoming
              entries and maps them into your procurement pipeline securely.
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
                    Download our standardized template to ensure purchase imports align with required procurement fields.
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
                  <li><span className="dot" />Supplier Identifier</li>
                  <li><span className="dot" />Product SKU / Item Code</li>
                  <li><span className="dot" />Quantity and Unit Cost</li>
                  <li><span className="dot" />Purchase Date</li>
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
                    {loading ? 'Processing...' : 'Import Purchases'}
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
                <p>Supplier and product identifiers are cross-checked before records are committed.</p>
              </div>
            </div>
            <div className="status-card">
              <span className="material-symbols-outlined" aria-hidden="true">history</span>
              <div>
                <h4>Audit Logging</h4>
                <p>Every import session is logged for procurement review and compliance.</p>
              </div>
            </div>
            <div className="status-card">
              <span className="material-symbols-outlined" aria-hidden="true">security</span>
              <div>
                <h4>Secure Transfer</h4>
                <p>Uploads are encrypted in transit to protect vendor and pricing data.</p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </Layout>
  );
};

export default ImportPurchase;
