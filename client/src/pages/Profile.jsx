import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const Profile = () => {
  const { user, logout } = useAuth();
  const { showToast } = useCart();
  const [activeTab, setActiveTab] = useState('profile');
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', street: '', city: '', state: '', pincode: ''
  });

  useEffect(() => {
    if (user?.role === 'seller' || user?.role === 'admin') {
      fetchMyProducts();
    }
    fetchAddresses();
  }, [user]);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products?seller=' + user._id);
      setMyProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/auth/me');
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', profileData);
      showToast('Profile updated successfully!');
    } catch (error) {
      showToast('Error updating profile', 'error');
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/address', newAddress);
      showToast('Address added successfully!');
      setShowAddressForm(false);
      setNewAddress({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
      fetchAddresses();
    } catch (error) {
      showToast('Error adding address', 'error');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      showToast('Product deleted');
      fetchMyProducts();
    } catch (error) {
      showToast('Error deleting product', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-white/80">{user?.email}</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium mt-2 inline-block ${
                user?.role === 'admin' ? 'bg-purple-500' :
                user?.role === 'seller' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          {['profile', 'addresses', ...(user?.role === 'seller' || user?.role === 'admin' ? ['products'] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab === 'profile' && '👤 '}
              {tab === 'addresses' && '📍 '}
              {tab === 'products' && '🏷️ '}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-md">
              <h2 className="text-xl font-bold mb-4">Personal Information</h2>
              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    className="input-field bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input-field"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary">Update Profile</button>
                  <button type="button" onClick={logout} className="btn-secondary">Logout</button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Saved Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="btn-primary text-sm"
                >
                  + Add New Address
                </button>
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="font-bold mb-4">Add New Address</h3>
                  <form onSubmit={addAddress} className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="input-field md:col-span-2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="input-field"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="input-field"
                      required
                    />
                    <div className="md:col-span-2 flex gap-3">
                      <button type="submit" className="btn-primary">Save Address</button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Addresses List */}
              <div className="grid md:grid-cols-2 gap-4">
                {addresses.map((address, index) => (
                  <div key={index} className="border rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{address.name}</h3>
                      {address.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {address.street}, {address.city}<br />
                      {address.state} - {address.pincode}<br />
                      Phone: {address.phone}
                    </p>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <p className="text-gray-500 col-span-2">No addresses saved yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Products Tab (for sellers/admin) */}
          {activeTab === 'products' && (user?.role === 'seller' || user?.role === 'admin') && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">My Products ({myProducts.length})</h2>
                {user?.role === 'admin' && (
                  <p className="text-sm text-gray-600">
                    As admin, you can see all products. Go to Admin Dashboard to manage them.
                  </p>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                </div>
              ) : myProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {myProducts.map((product) => (
                    <div key={product._id} className="relative">
                      <ProductCard product={product} />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
                          title="Delete Product"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">📦</span>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No products yet</h3>
                  <p className="text-gray-500 mb-4">Start selling by adding your first product</p>
                  {user?.role === 'admin' ? (
                    <p className="text-sm text-gray-600">Use the Admin Dashboard to add products</p>
                  ) : (
                    <button className="btn-primary">Add Your First Product</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;