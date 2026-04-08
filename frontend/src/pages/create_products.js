import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useNotifications } from '../context/NotificationContext';
import "../styles/topbar.css";
import "../styles/product_page.css";

const CATEGORY_OPTIONS = [
  { value: '67f65d2951c326c002d6f0ac', label: 'Casual Wear' },
  { value: '67f65d2951c326c002d6f0ad', label: 'Formal Wear' },
  { value: '67f65d2951c326c002d6f0ae', label: 'Sportswear' }
];

const SUPPLIER_OPTIONS = [
  { value: '67f662e851c326c002d6f0b3', label: 'Best Supplies Co.' },
  { value: '67f662e851c326c002d6f0b4', label: 'Urban Styles Apparel' },
  { value: '67f662e851c326c002d6f0b5', label: 'Classic Tailors Ltd.' }
];

const TAX_OPTIONS = [
  { value: '15', label: 'Standard Rate (15%)' },
  { value: '5', label: 'Reduced Rate (5%)' },
  { value: '0', label: 'Zero Rated (0%)' }
];


const getInitialState = () => ({
    warehouse: '',
    title: '',
    brand: '',
    category: '',
    subcategory: '',
    group: '',
    supplier: '',
    size: '',
    color: '',
    description: '',
    productImage: null,
    sku: '',
    salePrice: '',
    purchasePrice: '',
    saleUnit: '',
    gst: '',
    purchaseUnit: '',
    quantity: '',
    stockAlert: '',
    discountRate: '',
    discountAmount: ''
});


const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const getLabelByValue = (options, value) => {
  const item = options.find((option) => option.value === value);
  return item ? item.label : 'Not selected';
};

const CreateProducts = () => {
  const [formData, setFormData] = useState(getInitialState());
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = React.useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { addNotification } = useNotifications();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      //discount logic
      if (name === 'discountAmount' && value !== '' && newData.salePrice !== '') {
        const salePrice = parseFloat(newData.salePrice);
        const discountAmount = parseFloat(value);
        if (!isNaN(salePrice) && !isNaN(discountAmount) && salePrice > 0) {
          newData.discountRate = ((discountAmount / salePrice) * 100).toFixed(2);
        }
      } else if (name === 'discountRate' && value !== '' && newData.salePrice !== '') {
        const salePrice = parseFloat(newData.salePrice);
        const discountRate = parseFloat(value);
        if (!isNaN(salePrice) && !isNaN(discountRate)) {
          newData.discountAmount = ((salePrice * discountRate) / 100).toFixed(2);
        }
      } else if (name === 'salePrice' && value !== '') {
        if (newData.discountRate !== '') {
          const discountRate = parseFloat(newData.discountRate);
          const salePrice = parseFloat(value);
          if (!isNaN(discountRate) && !isNaN(salePrice)) {
            newData.discountAmount = ((salePrice * discountRate) / 100).toFixed(2);
          }
        } else if (newData.discountAmount !== '') {
          const discountAmount = parseFloat(newData.discountAmount);
          const salePrice = parseFloat(value);
          if (!isNaN(discountAmount) && !isNaN(salePrice) && salePrice > 0) {
            newData.discountRate = ((discountAmount / salePrice) * 100).toFixed(2);
          }
        }
      }

      return newData;
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prevData => ({
          ...prevData,
          productImage: reader.result // Store the base64 data
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiscard = () => {
    setFormData(getInitialState());
    setImagePreview(''); 
    setError('');
    setSuccess('');
    console.log("Form discarded");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const productData = {
      name: formData.title,
      barcode: formData.sku,
      description: formData.description,
      price: formData.salePrice !== '' ? parseFloat(formData.salePrice) : undefined,
      costPrice: formData.purchasePrice !== '' ? parseFloat(formData.purchasePrice) : undefined,
      quantity: formData.quantity !== '' ? parseInt(formData.quantity, 10) : undefined,
      category: formData.category,
      supplier: formData.supplier,
      taxRate: formData.gst !== '' ? parseFloat(formData.gst) : undefined,
      minStockLevel: formData.stockAlert !== '' ? parseInt(formData.stockAlert, 10) : undefined,
      discountRate: formData.discountRate !== '' ? parseFloat(formData.discountRate) : undefined,
      images: formData.productImage ? [formData.productImage] : [] // Add image data
    };

    const requiredFrontendFields = ['title', 'sku', 'salePrice', 'category', 'supplier', 'quantity'];
    const missingFrontendFields = requiredFrontendFields.filter(field => !formData[field]);

    if (missingFrontendFields.length > 0) {
        setError(`Please fill in all required fields marked with *: ${missingFrontendFields.join(', ')}`);
        setIsLoading(false);
        return;
    }

     if (productData.price === undefined || isNaN(productData.price) || productData.price < 0) {
        setError('Sale Price must be a valid non-negative number.'); setIsLoading(false); return;
    }
     if (productData.quantity === undefined || isNaN(productData.quantity) || !Number.isInteger(productData.quantity) || productData.quantity < 0) {
        setError('Quantity must be a valid non-negative integer.'); setIsLoading(false); return;
    }
     if (productData.costPrice !== undefined && (isNaN(productData.costPrice) || productData.costPrice < 0)) {
        setError('Purchase Price must be a valid non-negative number.'); setIsLoading(false); return;
    }
    if (productData.taxRate !== undefined && (isNaN(productData.taxRate) || productData.taxRate < 0)) {
        setError('GST/Tax Rate must be a valid non-negative number.'); setIsLoading(false); return;
    }
    if (productData.minStockLevel !== undefined && (isNaN(productData.minStockLevel) || !Number.isInteger(productData.minStockLevel) || productData.minStockLevel < 0)) {
        setError('Stock Alert must be a valid non-negative integer.'); setIsLoading(false); return;
    }
    if (productData.discountRate !== undefined && (isNaN(productData.discountRate) || productData.discountRate < 0 || productData.discountRate > 100)) {
        setError('Discount Rate must be between 0 and 100.'); setIsLoading(false); return;
    }
    if (!isValidObjectId(productData.category)) {
        setError('Selected Category value is not a valid ID format.'); setIsLoading(false); return;
    }
     if (!isValidObjectId(productData.supplier)) {
        setError('Selected Supplier value is not a valid ID format.'); setIsLoading(false); return;
    }


    try {
      const apiUrl = '/api/products';
      console.log(`Sending POST request to: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const responseData = await response.json();

      if (response.ok) {
        const productName = responseData.data?.name || productData.name;
        setSuccess(`Product "${productName}" created successfully!`);
        const productId = responseData.data?._id;
        addNotification('product', `New product "${productName}" has been created`, productId);
        console.log('Product created:', responseData.data);
        setFormData(getInitialState());
        setImagePreview('');
      } else {
        const errorMsg = responseData.message || `Request failed with status: ${response.status}`;
        setError(`Failed to create product: ${errorMsg}`);
        console.error('API Error:', responseData);
      }
    } catch (err) {
      setError(`An error occurred: ${err.message}. Check network connection and console.`);
      console.error('Submit Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview('');
    setFormData(prevData => ({
      ...prevData,
      productImage: null
    }));
  };

  const handleQuantityDelta = (delta) => {
    setFormData((prevData) => {
      const current = parseInt(prevData.quantity, 10);
      const safeCurrent = Number.isNaN(current) ? 0 : current;
      const next = Math.max(0, safeCurrent + delta);
      return {
        ...prevData,
        quantity: String(next)
      };
    });
  };

  const parsedSalePrice = parseFloat(formData.salePrice);
  const parsedQuantity = parseInt(formData.quantity, 10);
  const parsedTaxRate = parseFloat(formData.gst);

  const inventoryValue = (!Number.isNaN(parsedSalePrice) ? parsedSalePrice : 0) *
    (!Number.isNaN(parsedQuantity) ? parsedQuantity : 0);
  const skuStatus = formData.sku ? 'READY' : 'PENDING';
  const taxDisplay = !Number.isNaN(parsedTaxRate) ? `${parsedTaxRate.toFixed(2)}%` : '0.00%';

  const requiredStar = <span className="required-star">*</span>;

  return (
    <Layout title="Create Product">
      <div className="create-product-template">
        <header className="cp-header">
          <div>
            <h1 className="cp-title">Create Product</h1>
          </div>

          <div className="cp-header-actions">
            <button
              type="button"
              className="cp-btn cp-btn-ghost"
              onClick={handleDiscard}
              disabled={isLoading}
            >
              Discard
            </button>
            <button
              type="submit"
              form="create-product-form"
              className="cp-btn cp-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save & Submit'}
            </button>
          </div>
        </header>

        {error && (
          <div className="cp-alert cp-alert-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss error">✕</button>
          </div>
        )}
        {success && (
          <div className="cp-alert cp-alert-success" role="status">
            <span>{success}</span>
            <button type="button" onClick={() => setSuccess('')} aria-label="Dismiss success">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} id="create-product-form" className="cp-form">
          <div className="cp-grid">
            <div className="cp-main-column">
              <section className="cp-panel">
                <div className="cp-panel-head">
                  <div className="cp-panel-accent" />
                  <h2>Section 01: General Information</h2>
                </div>

                <div className="cp-fields-grid">
                  <div className="cp-field cp-field-span-2">
                    <label htmlFor="title">Title {requiredStar}</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="cp-input-arch"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Industrial Steel Beam - Grade A"
                      required
                    />
                  </div>

                  <div className="cp-field">
                    <label htmlFor="sku">SKU / Barcode {requiredStar}</label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      className="cp-input-arch"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="ST-9982-BLK"
                      required
                    />
                  </div>

                  <div className="cp-field">
                    <label htmlFor="category">Category {requiredStar}</label>
                    <select
                      id="category"
                      name="category"
                      className="cp-input-arch cp-select"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="cp-field">
                    <label htmlFor="supplier">Supplier {requiredStar}</label>
                    <select
                      id="supplier"
                      name="supplier"
                      className="cp-input-arch cp-select"
                      value={formData.supplier}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {SUPPLIER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="cp-field cp-field-span-2">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      className="cp-input-arch"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter technical specifications and product details..."
                      rows="4"
                    />
                  </div>
                </div>
              </section>

              <section className="cp-panel">
                <div className="cp-panel-head">
                  <div className="cp-panel-accent" />
                  <h2>Section 03: Financials</h2>
                </div>

                <div className="cp-financial-grid">
                  <div className="cp-field cp-field-span-2">
                    <label htmlFor="salePrice">Sale Price {requiredStar}</label>
                    <div className="cp-money-wrap">
                      <span>$</span>
                      <input
                        type="number"
                        id="salePrice"
                        name="salePrice"
                        className="cp-input-arch"
                        value={formData.salePrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="cp-field cp-field-span-2">
                    <label htmlFor="purchasePrice">Purchase Price (Cost)</label>
                    <div className="cp-money-wrap">
                      <span>$</span>
                      <input
                        type="number"
                        id="purchasePrice"
                        name="purchasePrice"
                        className="cp-input-arch"
                        value={formData.purchasePrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="cp-field">
                    <label htmlFor="discountRate">Discount Rate (%)</label>
                    <input
                      type="number"
                      id="discountRate"
                      name="discountRate"
                      className="cp-input-arch"
                      value={formData.discountRate}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div className="cp-field">
                    <label htmlFor="discountAmount">Discount Amount</label>
                    <input
                      type="number"
                      id="discountAmount"
                      name="discountAmount"
                      className="cp-input-arch"
                      value={formData.discountAmount}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="cp-field cp-field-span-2">
                    <label htmlFor="gst">Tax Rate (%)</label>
                    <select
                      id="gst"
                      name="gst"
                      className="cp-input-arch cp-select"
                      value={formData.gst}
                      onChange={handleChange}
                    >
                      <option value="">Select Tax Rate</option>
                      {TAX_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
            </div>

            <div className="cp-side-column">
              <section className="cp-panel">
                <div className="cp-panel-head">
                  <div className="cp-panel-accent" />
                  <h2>Section 02: Visual</h2>
                </div>

                <div
                  className="cp-upload-area"
                  onClick={handleImageClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleImageClick();
                    }
                  }}
                >
                  {imagePreview ? (
                    <div className="cp-image-preview-wrap">
                      <img src={imagePreview} alt="Product Preview" className="cp-image-preview" />
                      <button
                        type="button"
                        className="cp-remove-image-btn"
                        onClick={handleRemoveImage}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">cloud_upload</span>
                      <p className="cp-upload-title">Drag and drop image</p>
                      <p className="cp-upload-subtitle">JPG, PNG, WEBP (Max 5MB)</p>
                    </>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    id="productImageInput"
                    name="productImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </section>

              <section className="cp-panel">
                <div className="cp-panel-head">
                  <div className="cp-panel-accent" />
                  <h2>Section 04: Inventory</h2>
                </div>

                <div className="cp-inventory-stack">
                  <div className="cp-field">
                    <label htmlFor="quantity">Quantity {requiredStar}</label>
                    <div className="cp-quantity-wrap">
                      <button type="button" onClick={() => handleQuantityDelta(-1)}>
                        <span className="material-symbols-outlined">remove</span>
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        className="cp-input-arch"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="1"
                        required
                      />
                      <button type="button" onClick={() => handleQuantityDelta(1)}>
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>

                  <div className="cp-field">
                    <label htmlFor="stockAlert">Min. Stock Alert</label>
                    <input
                      type="number"
                      id="stockAlert"
                      name="stockAlert"
                      className="cp-input-arch"
                      value={formData.stockAlert}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                      min="0"
                      step="1"
                    />
                    <p className="cp-help-text">System will notify when stock falls below this value.</p>
                  </div>
                </div>
              </section>

              <div className="cp-summary-box">
                <h3>Summary Preview</h3>
                <div className="cp-summary-list">
                  <div>
                    <span>SKU Status:</span>
                    <strong className={skuStatus === 'READY' ? 'cp-status-ready' : 'cp-status-pending'}>{skuStatus}</strong>
                  </div>
                  <div>
                    <span>Tax Applied:</span>
                    <strong>{taxDisplay}</strong>
                  </div>
                  <div>
                    <span>Inventory Value:</span>
                    <strong>${inventoryValue.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span>Supplier:</span>
                    <strong>{getLabelByValue(SUPPLIER_OPTIONS, formData.supplier)}</strong>
                  </div>
                  <div>
                    <span>Category:</span>
                    <strong>{getLabelByValue(CATEGORY_OPTIONS, formData.category)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="cp-footer-actions">
            <p>All fields marked with * are mandatory for system synchronization.</p>
            <button
              type="button"
              className="cp-btn cp-btn-ghost"
              onClick={handleDiscard}
              disabled={isLoading}
            >
              Discard Changes
            </button>
            <button
              type="submit"
              className="cp-btn cp-btn-primary cp-btn-wide"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save & Submit Product'}
            </button>
          </footer>
        </form>
      </div>
    </Layout>
  );
}

export default CreateProducts;

