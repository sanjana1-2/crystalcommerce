import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, cartTotal, cartSavings, clearCart, showToast } = useCart();
  const [loading, setLoading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const shippingCharge = cartTotal >= 499 ? 0 : 40;
  const totalAmount = cartTotal + shippingCharge;

  // Load Razorpay script and key
  useEffect(() => {
    const loadRazorpay = async () => {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      // Get Razorpay key
      try {
        const res = await api.get('/payment/key');
        setRazorpayKey(res.data.key);
      } catch (error) {
        console.error('Error loading Razorpay key:', error);
      }
    };
    loadRazorpay();
  }, []);

  const validateAddress = () => {
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      showToast('Please fill all address fields', 'error');
      return false;
    }
    if (address.phone.length !== 10) {
      showToast('Please enter valid 10-digit phone number', 'error');
      return false;
    }
    if (address.pincode.length !== 6) {
      showToast('Please enter valid 6-digit pincode', 'error');
      return false;
    }
    return true;
  };

  // Handle Razorpay Payment
  const handleOnlinePayment = async () => {
    if (!validateAddress()) return;

    try {
      setLoading(true);
      
      // Create Razorpay order
      const { data } = await api.post('/payment/create-order', {
        shippingAddress: address
      });

      const options = {
        key: razorpayKey,
        amount: data.amount * 100,
        currency: data.currency,
        name: data.name || 'ShopKart',
        description: data.description || 'Order Payment',
        order_id: data.orderId,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: address
            });

            if (verifyRes.data.success) {
              await clearCart();
              showToast('Payment successful! Order placed.', 'success');
              navigate('/orders');
            }
          } catch (error) {
            showToast('Payment verification failed', 'error');
          }
        },
        prefill: data.prefill || {
          name: address.name,
          email: user?.email || '',
          contact: address.phone
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true
        },
        theme: {
          color: '#2874f0',
          backdrop_color: 'rgba(0,0,0,0.5)'
        },
        modal: {
          ondismiss: function() {
            showToast('Payment cancelled', 'info');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      showToast(error.response?.data?.message || 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle COD
  const handleCOD = async () => {
    if (!validateAddress()) return;

    try {
      setLoading(true);
      await api.post('/orders', {
        shippingAddress: address,
        paymentMethod: 'cod'
      });
      
      await clearCart();
      showToast('Order placed successfully!', 'success');
      navigate('/orders');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'online' || paymentMethod === 'upi') {
      handleOnlinePayment();
    } else {
      handleCOD();
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Address Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-bold text-gray-800 mb-4">📍 Delivery Address</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="input-field"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="input-field"
                    placeholder="House no., Building, Street, Area"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="input-field"
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="input-field"
                    placeholder="State"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="input-field"
                    placeholder="6-digit pincode"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-bold text-gray-800 mb-4">💳 Payment Method</h2>
              
              <div className="space-y-3">
                {[
                  { value: 'online', label: 'UPI / Cards / Net Banking / Wallets', icon: '💳', desc: 'Pay with UPI QR, Cards, Net Banking' },
                  { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' }
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === method.value ? 'border-primary bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-primary"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <span className="font-medium block">{method.label}</span>
                      <span className="text-sm text-gray-500">{method.desc}</span>
                    </div>
                    {method.value === 'online' && (
                      <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={item.product?.images?.[0] || 'https://via.placeholder.com/50'}
                      alt=""
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{(item.product?.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Savings</span>
                  <span>−₹{cartSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className={shippingCharge === 0 ? 'text-green-600' : ''}>
                    {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-4 mt-4 border-t font-bold text-lg">
                <span>Total</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-secondary py-4 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </>
                ) : paymentMethod === 'online' ? (
                  <>💳 Pay ₹{totalAmount.toLocaleString()}</>
                ) : (
                  <>📦 Place Order (COD)</>
                )}
              </button>

              <div className="text-xs text-gray-500 text-center mt-4 space-y-2">
                <p>🔒 Secured by Razorpay</p>
                <div className="bg-blue-50 p-3 rounded-lg text-left">
                  <p className="font-medium text-blue-800 mb-1">Test Payment Info:</p>
                  <p>• UPI: Use any UPI app to scan QR</p>
                  <p>• Cards: 4111 1111 1111 1111</p>
                  <p>• CVV: Any 3 digits, Expiry: Any future date</p>
                  <p>• Net Banking: Select any bank for testing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
