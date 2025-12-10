import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-primary sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex flex-col">
            <span className="text-2xl font-bold text-white italic">ShopKart</span>
            <span className="text-xs text-yellow-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></span>
              Explore Plus
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="flex bg-white rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-gray-700 focus:outline-none"
              />
              <button type="submit" className="px-4 bg-gray-50 hover:bg-gray-100 text-primary">
                🔍
              </button>
            </div>
          </form>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-white px-3 py-2 rounded hover:bg-white/10"
              >
                <span>👤</span>
                <span className="hidden sm:block">{user ? user.name : 'Login'}</span>
                <span>▼</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                  {user ? (
                    <>
                      <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setShowDropdown(false)}>
                        👤 My Profile
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setShowDropdown(false)}>
                        📦 My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setShowDropdown(false)}>
                          🛠️ Admin Panel
                        </Link>
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={() => { logout(); setShowDropdown(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                      >
                        🚪 Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setShowDropdown(false)}>
                        🔑 Login
                      </Link>
                      <Link to="/register" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setShowDropdown(false)}>
                        📝 Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative flex items-center gap-2 text-white px-3 py-2 rounded bg-white/10 hover:bg-white/20">
              <span>🛒</span>
              <span className="hidden sm:block">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-6 mt-3 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="text-white text-sm whitespace-nowrap hover:text-yellow-300 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
