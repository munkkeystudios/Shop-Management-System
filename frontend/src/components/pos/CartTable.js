import React from 'react';
import { Table } from 'react-bootstrap';
import { FiTrash2 } from 'react-icons/fi';
import QuantityButton from './quantitybutton.js';

const CartTable = ({ cartItems, handleQuantityChange, handleRemoveItem }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th width="300">Product</th>
          <th width="120">Price</th>
          <th width="120">Discount</th>
          <th width="120">Price After Discount</th>
          <th width="100">Qty</th>
          <th width="120">Subtotal</th>
          <th width="60">Action</th>
        </tr>
      </thead>
      <tbody>
        {cartItems.map(item => {
          const discountedPrice = item.price * (1 - item.discount / 100);
          
          return (
            <tr key={item.id}>
              <td>
                <div className="product-container">
                  <div className="product-image">
                    {typeof item.image === 'string' ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          e.target.src = '/images/default-product-image.jpg';
                        }}
                      />
                    ) : (
                      item.image
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-name">{item.name}</div>
                    <small className="product-id">ID: {item.id}</small>
                  </div>
                </div>
              </td>
              <td>${item.price.toFixed(2)}</td>
              <td>{item.discount > 0 ? `${item.discount}%` : '-'}</td>
              <td>${discountedPrice.toFixed(2)}</td>
              <td>
                <div className="quantity-container">
                  <QuantityButton
                    key={item.id}
                    item={item}
                    handleQuantityChange={handleQuantityChange}
                  />
                </div>
              </td>
              <td>${item.subtotal.toFixed(2)}</td>
              <td>
                <FiTrash2
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveItem(item.id)}
                />
              </td>
            </tr>
          );
        })}
        {cartItems.length === 0 && (
          <tr>
            <td colSpan="7" className="empty-cart">No products added yet</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default CartTable;