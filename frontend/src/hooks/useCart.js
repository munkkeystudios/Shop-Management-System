import { useState, useEffect } from 'react';

const useCart = () => {
  const [cartItems, setCart] = useState([]);
  const [totalPayable, setTotalPayable] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  // Add a product to the cart
  const addToCart = (product) => {
    const existingProductIndex = cartItems.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
      // If product exists, update its quantity and subtotal
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingProductIndex].quantity += 1;
      updatedCartItems[existingProductIndex].subtotal =
        updatedCartItems[existingProductIndex].quantity *
        (updatedCartItems[existingProductIndex].price * (1 - updatedCartItems[existingProductIndex].discount / 100));

      setCart(updatedCartItems);
    } else {
      // If product is new, add it to the cart
      const newProduct = {
        ...product,
        quantity: 1,
        subtotal: product.price * (1 - product.discount / 100),
      };
      setCart([...cartItems, newProduct]);
    }
  };

  // Remove an item from the cart
  const removeFromCart = (id) => {
    setCart(cartItems.filter(item => item.id !== id));
  };

  // Update the quantity of an item in the cart
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCartItems = cartItems.map(item => {
      if (item.id === id) {
        const discountedPrice = item.price * (1 - item.discount / 100);
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * discountedPrice,
        };
      }
      return item;
    });

    setCart(updatedCartItems);
  };

  // Calculate total payable and total quantity
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const quantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    setTotalPayable(Number(total.toFixed(2)));
    setTotalQuantity(quantity);
  }, [cartItems]);

  const resetCart = () => {
    setCart([]);
  };

  // Add this new method to directly set cart items
  const setCartItems = (items) => {
    setCart(items);
  };

  return {
    cartItems,
    totalPayable,
    totalQuantity,
    addToCart,
    removeFromCart,
    updateQuantity,
    resetCart,
    setCartItems  // Include the new method in the return object
  };
};

export default useCart;