import React from 'react';
import { Table } from 'react-bootstrap';
import { FiTrash2 } from 'react-icons/fi';
import QuantityButton from './quantitybutton.js';

const CartTable = ({ cartItems, handleQuantityChange, handleRemoveItem }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th width="320">Product</th>
          <th width="150">Price</th>
          <th width="150">Discount</th>
          <th width="150">Qty</th>
          <th width="150">Subtotal</th>
          <th width="90">Action</th>
        </tr>
      </thead>
      <tbody>
        {cartItems.map(item => (
          <tr key={item.id}>
            <td>
              <div className="product-container">
                <div className="product-image">{item.image}</div>
                <div className="product-info">
                  <div className="product-name">{item.name}</div>
                  <small className="product-id">ID: {item.id}</small>
                </div>
              </div>
            </td>
            <td>${item.price.toFixed(2)}</td>
            <td>{item.discount}%</td>
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
                onClick={() => handleRemoveItem(item.id)}
              />
            </td>
          </tr>
        ))}
        {cartItems.length === 0 && (
          <tr>
            <td colSpan="6" className="empty-cart">No products added yet</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default CartTable;