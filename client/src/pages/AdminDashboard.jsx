import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import PaymentLinkGenerator from '../components/PaymentLinkGenerator';

const AdminDashboard = () => {
  const { showToast } = useCart();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: '', images: '', stock: '', brand: '', isFeatured: false
  });

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image: '' });

  // Payment link state
  const [showPaymentLinkGenerator, setShowPaymentLinkGenerator] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, productsRes, categoriesRes, usersRes, ordersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/products?limit=100'),
        api.get('/categories'),
        api.get('/admin/users'),
        api.get('/orders/admin/all')
      ]);
      setStats(dashRes.data.stats);
      setOrders(dashRes.data.recentOrders);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data);
      setUsers(usersRes.data);
      setAllOrders(ordersRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    try {
      await api.post('/admin/seed');
      showToast('Data seeded successfully!');
      fetchDashboardData();
    } catch (error) {
      showToast('Error seeding data', 'error');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      showToast('Order status updated');
      fetchDashboardData();
    } catch (error) {
      showToast('Error updating order', 'error');
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      showToast('User role updated');
      fetchDashboardData();
    } catch (error) {
      showToast('Error updating user', 'error');
    }
  };

  // Product CRUD
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        stock: Number(productForm.stock),
        images: productForm.images.split(',').map(url => url.trim()).filter(Boolean)
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, data);
        showToast('Product updated');
      } else {
        await api.post('/products', data);
        showToast('Product created');
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
      resetProductForm();
      fetchDashboardData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving product', 'error');
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category?._id || product.category,
      images: product.images?.join(', ') || '',
      stock: product.stock,
      brand: product.brand || '',
      isFeatured: product.isFeatured
    });
    setShowProductForm(true);
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      showToast('Product deleted');
      fetchDashboardData();
    } catch (error) {
      showToast('Error deleting product', 'error');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '', description: '', price: '', originalPrice: '',
      category: '', images: '', stock: '', brand: '', isFeatured: false
    });
  };

  // Category CRUD
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', categoryForm);
      showToast('Category created');
      setShowCategoryForm(false);
      setCategoryForm({ name: '', description: '', image: '' });
      fetchDashboardData();
    } catch (error) {
      showToast('Error creating category', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🛒 Admin Dashboard</h1>
        <button onClick={seedData} className="btn-primary text-sm">
          🌱 Seed Sample Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['dashboard', 'orders', 'products', 'categories', 'users', 'payment-links'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'dashboard' && '📊 '}
            {tab === 'orders' && '📦 '}
            {tab === 'products' && '🏷️ '}
            {tab === 'categories' && '📁 '}
            {tab === 'users' && '👥 '}
            {tab}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">👥 Total Users</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">🏷️ Total Products</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalProducts || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">📦 Total Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalOrders || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">⏳ Pending Orders</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.pendingOrders || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">💰 Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-gray-800">📦 Recent Orders</h2>
              <button onClick={() => setActiveTab('orders')} className="text-primary text-sm">View All →</button>
            </div>
            <OrdersTable orders={orders} updateOrderStatus={updateOrderStatus} />
          </div>
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-800">📦 All Orders ({allOrders.length})</h2>
          </div>
          <OrdersTable orders={allOrders} updateOrderStatus={updateOrderStatus} />
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-800">🏷️ Products ({products.length})</h2>
            <button
              onClick={() => { setShowProductForm(true); setEditingProduct(null); resetProductForm(); }}
              className="btn-primary text-sm"
            >
              + Add Product
            </button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="font-bold text-xl mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Brand</label>
                      <input
                        type="text"
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Original Price (₹) *</label>
                      <input
                        type="number"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="input-field"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock *</label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="input-field"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URLs (comma separated)</label>
                    <input
                      type="text"
                      value={productForm.images}
                      onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                      className="input-field"
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                      className="accent-primary"
                    />
                    <span>Featured Product</span>
                  </label>
                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    <button type="button" onClick={() => setShowProductForm(false)} className="btn-secondary flex-1">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded object-cover" />
                          <div>
                            <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                            {product.isFeatured && <span className="text-xs text-yellow-600">⭐ Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{product.category?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-medium">₹{product.price?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => editProduct(product)} className="text-blue-600 hover:underline text-sm">Edit</button>
                          <button onClick={() => deleteProduct(product._id)} className="text-red-600 hover:underline text-sm">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-800">📁 Categories ({categories.length})</h2>
            <button onClick={() => setShowCategoryForm(true)} className="btn-primary text-sm">
              + Add Category
            </button>
          </div>

          {/* Category Form Modal */}
          {showCategoryForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="font-bold text-xl mb-4">Add New Category</h3>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category Name *</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="input-field"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      type="text"
                      value={categoryForm.image}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">Add Category</button>
                    <button type="button" onClick={() => setShowCategoryForm(false)} className="btn-secondary flex-1">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat._id} className="bg-white rounded-xl p-4 shadow-sm">
                <img src={cat.image || 'https://via.placeholder.com/100'} alt={cat.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
                <h3 className="font-bold text-center">{cat.name}</h3>
                <p className="text-sm text-gray-500 text-center">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-800">👥 Users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="customer">Customer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Links Tab */}
      {activeTab === 'payment-links' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-800">💳 Payment Link Generator</h2>
            <button
              onClick={() => setShowPaymentLinkGenerator(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
            >
              Generate Payment Link
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Payment Link */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">🚀 Quick Payment Link</h3>
              <p className="text-sm text-gray-600 mb-4">
                Generate a payment link for any amount with custom details.
              </p>
              <button
                onClick={() => setShowPaymentLinkGenerator(true)}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark"
              >
                Create Payment Link
              </button>
            </div>

            {/* Cart Payment Link */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">🛒 Cart Payment Link</h3>
              <p className="text-sm text-gray-600 mb-4">
                Generate payment links for customer carts (requires customer login).
              </p>
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed"
              >
                Available in Cart Page
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8">
            <h3 className="font-medium text-gray-800 mb-4">✨ Payment Link Features</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📱 Multiple Payment Methods</h4>
                <p className="text-sm text-blue-600">UPI, Cards, Net Banking, Wallets</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🔔 Auto Notifications</h4>
                <p className="text-sm text-green-600">SMS & Email notifications to customers</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">📊 Payment Tracking</h4>
                <p className="text-sm text-purple-600">Real-time payment status updates</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Link Generator Modal */}
      {showPaymentLinkGenerator && (
        <PaymentLinkGenerator onClose={() => setShowPaymentLinkGenerator(false)} />
      )}
    </div>
  );
};

// Orders Table Component
const OrdersTable = ({ orders, updateOrderStatus }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Items</th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Payment</th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {orders.map((order) => (
          <tr key={order._id}>
            <td className="px-4 py-3 text-sm font-mono">{order.trackingId}</td>
            <td className="px-4 py-3">
              <p className="text-sm font-medium">{order.user?.name || order.shippingAddress?.name}</p>
              <p className="text-xs text-gray-500">{order.user?.email}</p>
            </td>
            <td className="px-4 py-3 text-sm">{order.items?.length} items</td>
            <td className="px-4 py-3 text-sm font-bold">₹{order.totalAmount?.toLocaleString()}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.paymentMethod?.toUpperCase()} - {order.paymentStatus}
              </span>
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </span>
            </td>
            <td className="px-4 py-3">
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {orders.length === 0 && (
      <div className="text-center py-8 text-gray-500">No orders found</div>
    )}
  </div>
);

export default AdminDashboard;
