import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my-orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
          <span className="text-7xl mb-6 block">📦</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet!</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <Link to="/" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl overflow-hidden shadow-sm">
            {/* Order Header */}
            <div className="p-4 bg-gray-50 border-b flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-semibold">{order.trackingId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Placed on</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-bold text-lg">₹{order.totalAmount?.toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Order Items */}
            <div className="p-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 py-3 border-b last:border-0">
                  <img
                    src={item.image || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="font-semibold">₹{item.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Address */}
            <div className="p-4 bg-gray-50 border-t">
              <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
              <p className="text-sm">
                {order.shippingAddress?.name}, {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
