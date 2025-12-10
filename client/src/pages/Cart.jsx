import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

const Cart = () => {
  const { cart, cartTotal, cartSavings, updateQuantity, removeFromCart, loading, showToast } = useCart();
  const [generatingLink, setGeneratingLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
          <span className="text-7xl mb-6 block">🛒</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty!</h2>
          <p className="text-gray-500 mb-6">Add items to get started</p>
          <Link to="/" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      </div>
    );
  }

  const shippingCharge = cartTotal >= 499 ? 0 : 40;
  const totalAmount = cartTotal + shippingCharge;

  const generateCartPaymentLink = async () => {
    try {
      setGeneratingLink(true);
      const response = await api.post('/payment/generate-cart-link', {
        shippingAddress: {
          name: 'Customer',
          phone: '9876543210'
        },
        customerInfo: {
          name: 'Customer',
          email: 'customer@example.com',
          phone: '9876543210'
        }
      });
      
      setPaymentLink(response.data);
      showToast('Payment link generated successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to generate payment link', 'error');
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Payment link copied to clipboard!', 'success');
  };

  const shareLink = (url) => {
    if (navigator.share) {
      navigator.share({
        title: 'Payment Link - ShopKart',
        text: `Payment of ₹${totalAmount} for ${cart.length} items`,
        url: url
      });
    } else {
      copyToClipboard(url);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart ({cart.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const product = item.product;
            if (!product) return null;
            
            const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            
            return (
              <div key={item._id || product._id} className="bg-white rounded-xl p-4 flex gap-4">
                <Link to={`/product/${product._id}`} className="shrink-0">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/100'}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-medium text-gray-800 hover:text-primary line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold">₹{product.price?.toLocaleString()}</span>
                    {discount > 0 && (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.originalPrice?.toLocaleString()}
                        </span>
                        <span className="text-sm text-green-600 font-medium">{discount}% off</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(product._id, item.quantity - 1)}
                        className="w-8 h-8 hover:bg-gray-100 font-bold"
                      >−</button>
                      <span className="w-10 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(product._id, item.quantity + 1)}
                        className="w-8 h-8 hover:bg-gray-100 font-bold"
                      >+</button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="text-gray-400 hover:text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-gray-900">
                    ₹{(product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4 pb-4 border-b">Price Details</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Price ({cart.length} items)</span>
                <span>₹{(cartTotal + cartSavings).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>−₹{cartSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charges</span>
                <span className={shippingCharge === 0 ? 'text-green-600' : ''}>
                  {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between py-4 mt-4 border-t border-dashed font-bold text-lg">
              <span>Total Amount</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>

            {cartSavings > 0 && (
              <div className="bg-green-50 text-green-700 text-center py-2 rounded-lg text-sm mb-4">
                🎉 You save ₹{cartSavings.toLocaleString()} on this order
              </div>
            )}

            <div className="space-y-3">
              <Link to="/checkout" className="block w-full btn-secondary text-center py-4">
                Proceed to Checkout
              </Link>

              <div className="text-center text-gray-500 text-sm">OR</div>

              <button
                onClick={generateCartPaymentLink}
                disabled={generatingLink}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingLink ? 'Generating...' : '🔗 Generate Payment Link'}
              </button>
            </div>

            {paymentLink && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Payment Link Generated!</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={paymentLink.paymentLink}
                      readOnly
                      className="flex-1 px-2 py-1 border border-green-300 rounded text-xs bg-white"
                    />
                    <button
                      onClick={() => copyToClipboard(paymentLink.paymentLink)}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => shareLink(paymentLink.paymentLink)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => window.open(paymentLink.paymentLink, '_blank')}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-4">
              🔒 Safe and Secure Payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
