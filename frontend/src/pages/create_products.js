import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, Alert } from 'react-bootstrap';
import { useNotifications } from '../context/NotificationContext';
import "../styles/topbar.css";
import "../styles/product_page.css";
import ModernDropdown, { ModernDropdownItem } from '../components/ModernDropdown';
import '../styles/dropdown.css';


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


  const requiredStar = <span style={{ color: 'red' }}>*</span>;

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

  return (
    <Layout title="Create Product">
      <div>
        <Card>
          <Card.Header>Create New Product</Card.Header>
          <Card.Body>
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-grid">
                 <div className="form-group">
                  <label htmlFor="title">Title {requiredStar}</label>
                  <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Product Name" required />
                </div>
                 <div className="form-group">
                  <label htmlFor="sku">SKU / Barcode {requiredStar}</label>
                  <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="Unique Barcode" required />
                </div>

                 <div className="form-group">
                  <label htmlFor="category">Category {requiredStar}</label>
                  <div style={{ width: '100%', position: 'relative' }}>
                    <ModernDropdown
                      title={
                        <div style={{ width: '100%', justifyContent: 'space-between' }}>
                          {formData.category ? 
                            (formData.category === "67f65d2951c326c002d6f0ac" ? "Casual Wear" : 
                             formData.category === "67f65d2951c326c002d6f0ad" ? "Formal Wear" : 
                             formData.category === "67f65d2951c326c002d6f0ae" ? "Sportswear" : "Select Category")
                            : "Select Category"}
                        </div>
                      }
                    >
                      <ModernDropdownItem
                        isActive={formData.category === ""}
                        onClick={() => handleChange({ target: { name: 'category', value: '' } })}
                      >
                        Select Category
                      </ModernDropdownItem>
                      <ModernDropdownItem
                        isActive={formData.category === "67f65d2951c326c002d6f0ac"}
                        onClick={() => handleChange({ target: { name: 'category', value: '67f65d2951c326c002d6f0ac' } })}
                      >
                        Casual Wear
                      </ModernDropdownItem>
                      <ModernDropdownItem
                        isActive={formData.category === "67f65d2951c326c002d6f0ad"}
                        onClick={() => handleChange({ target: { name: 'category', value: '67f65d2951c326c002d6f0ad' } })}
                      >
                        Formal Wear
                      </ModernDropdownItem>
                      <ModernDropdownItem
                        isActive={formData.category === "67f65d2951c326c002d6f0ae"}
                        onClick={() => handleChange({ target: { name: 'category', value: '67f65d2951c326c002d6f0ae' } })}
                      >
                        Sportswear
                      </ModernDropdownItem>
                    </ModernDropdown>
                  </div>
                </div>

                 <div className="form-group">
                  <label htmlFor="supplier">Supplier {requiredStar}</label>
                  <div style={{ width: '100%', position: 'relative' }}>
                    <ModernDropdown
                      title={
                        <div style={{ width: '100%', justifyContent: 'space-between' }}>
                          {formData.supplier ? 
                            (formData.supplier === "67f662e851c326c002d6f0b3" ? "Best Supplies Co." : 
                             formData.supplier === "67f662e851c326c002d6f0b4" ? "Urban Styles Apparel" : 
                             formData.supplier === "67f662e851c326c002d6f0b5" ? "Classic Tailors Ltd." : "Select Supplier")
                            : "Select Supplier"}
                        </div>
                      }
                    >
                      <ModernDropdownItem
                        isActive={formData.supplier === ""}
                        onClick={() => handleChange({ target: { name: 'supplier', value: '' } })}
                      >
                        Select Supplier
                      </ModernDropdownItem>
                      <ModernDropdownItem
                        isActive={formData.supplier === "67f662e851c326c002d6f0b3"}
                        onClick={() => handleChange({ target: { name: 'supplier', value: '67f662e851c326c002d6f0b3' } })}
                      >
                        Best Supplies Co.
                      </ModernDropdownItem>
                      <ModernDropdownItem
                        isActive={formData.supplier === "67f662e851c326c002d6f0b4"}
                        onClick={() => handleChange({ target: { name: 'supplier', value: '67f662e851c326c002d6f0b4' } })}
                      >
                        Urban Styles Apparel
                      </ModernDropdownItem>
                      <ModernDropdownItem
                        isActive={formData.supplier === "67f662e851c326c002d6f0b5"}
                        onClick={() => handleChange({ target: { name: 'supplier', value: '67f662e851c326c002d6f0b5' } })}
                      >
                        Classic Tailors Ltd.
                      </ModernDropdownItem>
                    </ModernDropdown>
                  </div>
                </div>
                

                {/* Note Section */}
                <div className="form-group form-group-span-2">
                  <label htmlFor="description"> Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add details, care instructions, etc."
                  ></textarea>
                </div>


                <div className="form-group form-group-span-2">
                  <label>Product Image</label>
                  <div 
                    className="upload-image-container" 
                    onClick={handleImageClick}
                  >
                    {imagePreview ? (
                      <div className="image-preview-container">
                        <img 
                          src={imagePreview} 
                          alt="Product Preview" 
                          className="image-preview" 
                        />
                        <button 
                          type="button"
                          className="remove-image-btn"
                          onClick={handleRemoveImage}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="upload-icon">📁</div>
                        <div className="upload-text">
                          <strong>Click to upload</strong> or drag and drop your product image
                        </div>
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
                </div>

                <div className="form-group">
                  <label htmlFor="salePrice">Sale Price {requiredStar}</label>
                  <input type="number" id="salePrice" name="salePrice" value={formData.salePrice} onChange={handleChange} placeholder="0.00" required min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label htmlFor="purchasePrice">Purchase Price (Cost)</label>
                  <input type="number" id="purchasePrice" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} placeholder="0.00" min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label htmlFor="discountRate">Discount Rate (%)</label>
                  <input type="number" id="discountRate" name="discountRate" value={formData.discountRate} onChange={handleChange} placeholder="0" min="0" max="100" step="0.01" />
                </div>
                <div className="form-group">
                  <label htmlFor="discountAmount">Discount Amount</label>
                  <input type="number" id="discountAmount" name="discountAmount" value={formData.discountAmount} onChange={handleChange} placeholder="0.00" min="0" step="0.01" />
                </div>
                 <div className="form-group">
                  <label htmlFor="quantity">Quantity {requiredStar}</label>
                  <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="0" required min="0" step="1" />
                </div>
                <div className="form-group">
                  <label htmlFor="gst">Tax Rate (%)</label>
                  <input type="number" id="gst" name="gst" value={formData.gst} onChange={handleChange} placeholder="e.g., 0" min="0" step="0.01"/>
                </div>
                <div className="form-group">
                  <label htmlFor="stockAlert">Min. Stock Alert</label>
                  <input type="number" id="stockAlert" name="stockAlert" value={formData.stockAlert} onChange={handleChange} placeholder="e.g., 5" min="0" step="1"/>
                </div>

              </div>

              <div className="form-buttons">
                <button type="button" className="btn btn-discard" onClick={handleDiscard} disabled={isLoading}>Discard</button>
                <button type="submit" className="btn btn-submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save & Submit'}
                </button>
              </div>
            </form>
          </Card.Body>
        </Card>
      </div>
    </Layout>
  );
}

export default CreateProducts;

