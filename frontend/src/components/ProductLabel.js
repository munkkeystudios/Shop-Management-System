import React, { useMemo } from 'react';
import { generateBarcodeUrl, handleBarcodeError } from '../utils/barcodeUtils';
import './styles/ProductLabel.css';

const ProductLabel = ({ product, onClose }) => {
  const formattedPrice = useMemo(
    () => `$${Number(product?.price || 0).toFixed(2)}`,
    [product?.price],
  );

  const productName = product?.name || 'Unnamed Product';
  const productBarcode = product?.barcode || '000000000000';
  const productSku = product?.sku || productBarcode;
  const warehouseLabel = product?.warehouseLocation || 'Aisle 4 | Bin 12';

  const handlePrint = () => {
    const printContent = document.getElementById('product-label-preview-card');
    if (!printContent) return;

    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = `Print_${uniqueName}`;
    const printWindow = window.open(windowUrl, windowName, 'height=700,width=900');

    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Print Label</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body {
        font-family: 'Manrope', Arial, sans-serif;
        margin: 0;
        padding: 24px;
        background: #f7f9fb;
      }

      .label-sheet {
        width: 420px;
        margin: 0 auto 16px;
        background: #ffffff;
        border: 1px solid rgba(169, 180, 185, 0.2);
        border-radius: 8px;
        padding: 24px;
        page-break-inside: avoid;
      }

      .label-heading {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.3em;
        font-weight: 700;
        color: #717c82;
        margin-bottom: 4px;
      }

      .product-name {
        font-size: 36px;
        font-weight: 800;
        letter-spacing: -0.05em;
        margin: 0 0 18px;
        color: #0b0f10;
      }

      .price-chip {
        display: inline-block;
        background: #dae2fd;
        border-radius: 4px;
        padding: 8px 16px;
        margin-bottom: 18px;
      }

      .price-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 700;
        color: #4a5167;
        margin-bottom: 2px;
      }

      .product-price {
        font-size: 30px;
        font-weight: 900;
        color: #4a5167;
        letter-spacing: -0.03em;
      }

      .barcode-wrap {
        background: #ffffff;
        border: 1px solid rgba(169, 180, 185, 0.2);
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .barcode-wrap img {
        width: 100%;
        max-width: 280px;
        height: 90px;
        object-fit: contain;
      }

      .barcode-value {
        font-family: monospace;
        font-size: 13px;
        letter-spacing: 0.35em;
        margin-top: 4px;
        color: #0b0f10;
      }

      .meta-row {
        display: flex;
        justify-content: space-between;
        margin-top: 16px;
        gap: 20px;
      }

      .meta-item-label {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: #717c82;
      }

      .meta-item-value {
        font-size: 12px;
        font-weight: 700;
        color: #2a3439;
      }

      .text-right {
        text-align: center;
      }

      @media print {
        body { padding: 0; background: #ffffff; }
        .label-sheet { box-shadow: none; margin: 0 auto 12px; }
      }
    `);
    printWindow.document.write('</style></head><body>');

    printWindow.document.write(`<div class="label-sheet">${printContent.innerHTML}</div>`);

    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Wait for the content to load before printing
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div className="product-label-overlay" onClick={onClose}>
      <div className="product-label-modal" onClick={(e) => e.stopPropagation()}>
        <header className="product-label-modal-header">
          <div className="product-label-title-group">
            <span className="material-symbols-outlined product-label-title-icon">print</span>
            <h3>Print Label</h3>
          </div>
          <button className="product-label-close" onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="product-label-main">
          <div id="product-label-preview-card" className="product-label-preview-card">
            <div className="product-label-version">Label Studio v2.4.1</div>

            <div className="product-label-identification">
              <p className="product-label-caption">Product Description</p>
              <h2>{productName}</h2>
            </div>

            <div className="product-label-price-chip">
              <p className="product-label-price-caption">Unit Price</p>
              <div className="product-label-price-value">{formattedPrice}</div>
            </div>

            <div className="product-label-barcode-shell">
              <img
                src={generateBarcodeUrl(productBarcode)}
                alt="Barcode"
                onError={handleBarcodeError}
              />
              <div className="product-label-barcode-text">{productBarcode}</div>
            </div>

            <div className="product-label-meta-row">
              <div className="product-label-meta-item">
                <p>Warehouse Location</p>
                <span>{warehouseLabel}</span>
              </div>
              <div className="product-label-meta-item right">
                <p>SKU</p>
                <span>{productSku}</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="product-label-footer-actions">
          <button className="product-label-cancel-btn" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="product-label-print-btn" onClick={handlePrint} type="button">
            <span className="material-symbols-outlined">print</span>
            <span>Print Label</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ProductLabel;
