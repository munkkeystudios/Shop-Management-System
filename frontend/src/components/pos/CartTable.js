import React from 'react';
import { Table } from 'react-bootstrap';
import { FiTrash2 } from 'react-icons/fi';
import QuantityButton from './quantitybutton.js';
import '../styles/CartTable.css'; 

const CartTable = ({ cartItems, handleQuantityChange, handleRemoveItem }) => {
  return (
    <Table className="cart-table">
      <thead>
        <tr>
          <th width="320">Items</th>
          <th width="120">Price</th>
          <th width="80">Qty</th>
          <th width="140">Subtotal</th>
          <th width="40">
            <FiTrash2 />
          </th>
        </tr>
      </thead>
      <tbody>
        {cartItems.map(item => {
          const discountedPrice = item.price * (1 - item.discount / 100);
          
          return (
            <tr key={item.id} className="cart-item-row">
              <td>
                <div className="product-container">
                  <div className="product-info">
                    <div className="product-name">{item.name}</div>
                  </div>
                </div>
              </td>
              <td>${item.price.toFixed(2)}</td>
              <td>
                <div className="quantity-container">
                  <QuantityButton
                    key={item.id}
                    item={item}
                    handleQuantityChange={handleQuantityChange}
                    handleRemoveItem={handleRemoveItem}  // Add this prop
                  />
                </div>
              </td>
              <td>${item.subtotal.toFixed(2)}</td>
              <td>
                <FiTrash2
                  className="delete-icon"
                  onClick={() => handleRemoveItem(item.id)}
                />
              </td>
            </tr>
          );
        })}
        {cartItems.length === 0 && null}
      </tbody>
    </Table>
  );
};

export default CartTable;