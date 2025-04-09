// import React from 'react';
// import Sidebar from '../components/sidebar';
// import { Card } from 'react-bootstrap';

// // To whoever is reading this. i have added starter code that you need to use. (scrum master moment)
// // we need to show the Tas, that were was a certain level of agreeement on how to implement the frontend. + we need this for future pages
// // besides the card you dont need to use any more bootstrap. https://react-bootstrap.github.io/docs/components/cards
// // You can use as much html as u want within the card.


// // if you are facing an issue, feel free to text me. i will probably be extremely confused/unhelpful 
// // but its free and whats there to loose besides my respect for you. 
// // delete this after reading.

// const CreateProducts = () => {
//   return (
//     <div style={{ display: 'flex' }}>
//       <Sidebar />

//     <Card>
//       <Card.Header>
//         Card Header
//       </Card.Header>
      
//       <Card.Body>
//         This is where all the input forms go
//       </Card.Body>
      
//     </Card>
//     {/* dicard button and submit button are outside of card */}
//     </div>
//   );
// }

// export default CreateProducts;


import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import { Card } from 'react-bootstrap';
import "../styles/topbar.css"; // Import custom styles
import "../styles/product_page.css"; // Import custom styles

const CreateProducts = () => {
  const [formData, setFormData] = useState({
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
    stockAlert: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      productImage: e.target.files[0]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted', formData);
    // Handle form submission here (e.g., send to an API)
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        <Card>
          <Card.Header>Create New Product</Card.Header>
          <Card.Body>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-grid">
                {/* Form Inputs */}
                <div className="form-group">
                  <label htmlFor="warehouse">Select Warehouse</label>
                  <select id="warehouse" name="warehouse" value={formData.warehouse} onChange={handleChange}>
                    <option value="">Select Warehouse</option>
                    <option value="main">Main Warehouse</option>
                    <option value="secondary">Secondary Warehouse</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Product Name" />
                </div>
                <div className="form-group">
                  <label htmlFor="brand">Select Brand</label>
                  <select id="brand" name="brand" value={formData.brand} onChange={handleChange}>
                    <option value="">Select Brand</option>
                    <option value="brand_a">Brand A</option>
                    <option value="brand_b">Brand B</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={formData.category} onChange={handleChange}>
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="subcategory">Subcategory</label>
                  <select id="subcategory" name="subcategory" value={formData.subcategory} onChange={handleChange}>
                    <option value="">Select Subcategory</option>
                    <option value="phones">Phones</option>
                    <option value="tables">Tables</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="group">Group</label>
                  <select id="group" name="group" value={formData.group} onChange={handleChange}>
                    <option value="">Select Group</option>
                    <option value="new">New Arrivals</option>
                    <option value="clearance">Clearance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="supplier">Supplier</label>
                  <select id="supplier" name="supplier" value={formData.supplier} onChange={handleChange}>
                    <option value="">Select Supplier</option>
                    <option value="supplier_x">Supplier X</option>
                    <option value="supplier_y">Supplier Y</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="size">Size</label>
                  <select id="size" name="size" value={formData.size} onChange={handleChange}>
                    <option value="">Select Size</option>
                    <option value="s">Small</option>
                    <option value="m">Medium</option>
                    <option value="l">Large</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <select id="color" name="color" value={formData.color} onChange={handleChange}>
                    <option value="">Select Color</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                  </select>
                </div>

                {/* Description & File Upload */}
                <div className="form-group form-group-span-2">
                  <label htmlFor="description">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Write a note here..."></textarea>
                </div>

                <div className="form-group form-group-span-2 image-uploader">
                  <label htmlFor="product-image">Product Image</label>
                  <input type="file" id="product-image" name="product-image" onChange={handleFileChange} accept="image/svg+xml, image/png, image/jpeg" />
                  <p>Drag & drop or click to upload</p>
                  <p><small>SVG, PNG, JPG (max. 2MB)</small></p>
                </div>

                {/* SKU, Prices, Units, GST, and Quantity */}
                <div className="form-group">
                  <label htmlFor="sku">SKU / Product Code</label>
                  <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g., SKU12345" />
                </div>
                <div className="form-group">
                  <label htmlFor="sale-price">Sale Price</label>
                  <input type="number" id="sale-price" name="sale_price" value={formData.salePrice} onChange={handleChange} placeholder="0.00" step="0.01" />
                </div>
                <div className="form-group">
                  <label htmlFor="purchase-price">Purchase Price</label>
                  <input type="number" id="purchase-price" name="purchase_price" value={formData.purchasePrice} onChange={handleChange} placeholder="0.00" step="0.01" />
                </div>
                <div className="form-group">
                  <label htmlFor="sale-unit">Sale Unit</label>
                  <select id="sale-unit" name="sale_unit" value={formData.saleUnit} onChange={handleChange}>
                    <option value="">Select Unit</option>
                    <option value="piece">Piece</option>
                    <option value="box">Box</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="gst">GST</label>
                  <select id="gst" name="gst" value={formData.gst} onChange={handleChange}>
                    <option value="">Select GST</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="purchase-unit">Purchase Unit</label>
                  <select id="purchase-unit" name="purchase_unit" value={formData.purchaseUnit} onChange={handleChange}>
                    <option value="">Select Unit</option>
                    <option value="piece">Piece</option>
                    <option value="box">Box</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="0" />
                </div>
                <div className="form-group">
                  <label htmlFor="stock-alert">Stock Alert</label>
                  <input type="number" id="stock-alert" name="stock_alert" value={formData.stockAlert} onChange={handleChange} placeholder="e.g., 10" />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="form-buttons">
                <button type="button" className="btn btn-discard">Discard</button>
                <button type="submit" className="btn btn-submit">Save & Submit</button>
              </div>
            </form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default CreateProducts;
