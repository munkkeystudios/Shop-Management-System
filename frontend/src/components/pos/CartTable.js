import React from 'react';
import '../styles/CartTable.css'; 

const CartTable = ({ cartItems, handleRemoveItem, currencySymbol }) => {
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cartItems.map(item => {
        return (
          <div key={item.id} className="flex items-center justify-between group py-1">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold text-xs">
                x{item.quantity}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">
                {currencySymbol}{(item.subtotal).toFixed(2)}
              </p>
              <button 
                className="text-[10px] font-bold text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveItem(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartTable;