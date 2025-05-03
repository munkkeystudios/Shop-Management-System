import React, { useRef } from 'react';
import { FaPrint } from 'react-icons/fa';
import './styles/ProductLabel.css';

const ProductLabel = ({ product, onClose }) => {
  const labelRef = useRef(null);

  const handlePrint = () => {
    const printContent = document.getElementById('product-label-content');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = `Print_${uniqueName}`;
    const printWindow = window.open(windowUrl, windowName, 'height=600,width=800');

    printWindow.document.write('<html><head><title>Product Label</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .print-container {
        width: 204px;
        height: 183px;
        border: 1px solid #ccc;
        padding: 10px;
        box-sizing: border-box;
        margin: 20px auto;
        page-break-inside: avoid;
      }
      .product-name {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 15px;
        margin-top: 10px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .product-price {
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        margin: 5px 0;
      }
      .barcode-container {
        text-align: center;
        margin: 15px 0 10px;
      }
      .barcode-container img {
        max-width: 100%;
        height: 60px;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .print-container {
          margin: 0;
          border: none;
        }
      }
    `);
    printWindow.document.write('</style></head><body>');

    // Create multiple copies if needed (for now just one)
    printWindow.document.write('<div class="print-container">');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</div>');

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
      <div className="product-label-container" onClick={(e) => e.stopPropagation()}>
        <div className="product-label-header">
          <h3>Product Label</h3>
          <button className="product-label-close" onClick={onClose}>×</button>
        </div>

        <div className="product-label-content-wrapper">
          <div id="product-label-content" ref={labelRef} className="product-label-content">
            <div className="product-name">{product.name}</div>
            <div className="product-price">${product.price?.toFixed(2) || '0.00'}</div>
            <div className="barcode-container">
              <img
                src={`https://barcodeapi.org/api/code128/${product.barcode || '000000000000'}`}
                alt="Barcode"
              />
            </div>
          </div>
        </div>

        <div className="product-label-actions">
          <button className="product-label-print-btn" onClick={handlePrint}>
            <FaPrint /> Print Label
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductLabel;
