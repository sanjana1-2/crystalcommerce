import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch cart from server
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch cart when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
  const addToCart = async (productId) => {
    if (!user) {
      showToast('Please login to add items to cart', 'error');
      return false;
    }

    try {
      const response = await api.post('/cart/add', { productId });
      setCart(response.data.items || []);
      showToast('Added to cart!');
      return true;
    } catch (error) {
      showToast('Failed to add to cart', 'error');
      return false;
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await api.put('/cart/update', { productId, quantity });
      setCart(response.data.items || []);
    } catch (error) {
      showToast('Failed to update cart', 'error');
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      setCart(response.data.items || []);
      showToast('Removed from cart', 'info');
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Calculate totals
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const cartSavings = cart.reduce((sum, item) => {
    const original = item.product?.originalPrice || item.product?.price || 0;
    const current = item.product?.price || 0;
    return sum + (original - current) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      cart, loading, cartCount, cartTotal, cartSavings,
      addToCart, updateQuantity, removeFromCart, clearCart, fetchCart,
      toast, showToast
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
