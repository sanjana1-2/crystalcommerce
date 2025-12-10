import React from 'react';

function App() {
  const categories = [
    { name: 'Mobiles', emoji: '📱' },
    { name: 'Electronics', emoji: '💻' },
    { name: 'Fashion', emoji: '👕' },
    { name: 'Home & Furniture', emoji: '🏠' },
    { name: 'Beauty', emoji: '💄' }
  ];

  const products = [
    { name: 'iPhone 15 Pro', price: '₹1,59,900', originalPrice: '₹1,79,900', rating: '4.7⭐' },
    { name: 'Samsung Galaxy S24', price: '₹1,34,999', originalPrice: '₹1,49,999', rating: '4.6⭐' },
    { name: 'MacBook Air M3', price: '₹1,34,900', originalPrice: '₹1,44,900', rating: '4.8⭐' },
    { name: 'Sony Headphones', price: '₹29,990', originalPrice: '₹34,990', rating: '4.7⭐' },
    { name: 'OnePlus 12', price: '₹64,999', originalPrice: '₹69,999', rating: '4.5⭐' },
    { name: 'iPad Pro', price: '₹41,900', originalPrice: '₹44,900', rating: '4.7⭐' },
    { name: 'Nike Sneakers', price: '₹12,995', originalPrice: '₹15,995', rating: '4.6⭐' },
    { name: 'Levi\'s Jeans', price: '₹2,499', originalPrice: '₹4,299', rating: '4.3⭐' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold italic">ShopKart</h1>
              <span className="text-xs text-yellow-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></span>
                Explore Plus
              </span>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-6">
              <div className="flex bg-white rounded-lg overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  className="flex-1 px-4 py-2.5 text-gray-700 focus:outline-none"
                />
                <button className="px-4 bg-gray-50 hover:bg-gray-100 text-blue-600">
                  🔍
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10">
                <span>👤</span>
                <span className="hidden sm:block">Login</span>
              </button>
              <button className="relative flex items-center gap-2 px-3 py-2 rounded bg-white/10 hover:bg-white/20">
                <span>🛒</span>
                <span className="hidden sm:block">Cart</span>
              </button>
            </div>
          </div>

          {/* Categories Bar */}
          <div className="flex gap-6 mt-3 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className="text-white text-sm whitespace-nowrap hover:text-yellow-300 transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Demo Notice */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
          <p className="text-center">
            🚀 <strong>Demo Mode:</strong> This is a frontend-only demo. Backend features (login, cart, payments) are not functional.
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome to ShopKart</h2>
          <p className="text-xl mb-6 text-white/90">Discover amazing products at great prices</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Shop Now
          </button>
        </div>

        {/* Categories */}
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div key={category.name} className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{category.emoji}</div>
                <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{category.name}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* Promo Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">🚚 Free Delivery</h3>
            <p className="text-white/80">On orders above ₹499</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">↩️ Easy Returns</h3>
            <p className="text-white/80">7 days return policy</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">🔒 Secure Payment</h3>
            <p className="text-white/80">100% secure checkout</p>
          </div>
        </div>

        {/* Featured Products */}
        <section className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">⚡ Featured Products</h3>
            <button className="text-blue-600 font-medium hover:underline">View All →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 4).map((product, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-3 flex items-center justify-center text-gray-500">
                  📱💻👕🎧
                </div>
                <h4 className="font-medium text-gray-800 mb-2 text-sm">{product.name}</h4>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-600 font-bold">{product.price}</span>
                  <span className="text-gray-400 text-sm line-through">{product.originalPrice}</span>
                </div>
                <p className="text-xs text-gray-600">{product.rating}</p>
              </div>
            ))}
          </div>
        </section>

        {/* All Products */}
        <section className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">🛍️ Products For You</h3>
            <button className="text-blue-600 font-medium hover:underline">View All →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(4).map((product, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-3 flex items-center justify-center text-gray-500">
                  📱💻👕🎧
                </div>
                <h4 className="font-medium text-gray-800 mb-2 text-sm">{product.name}</h4>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-600 font-bold">{product.price}</span>
                  <span className="text-gray-400 text-sm line-through">{product.originalPrice}</span>
                </div>
                <p className="text-xs text-gray-600">{product.rating}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white rounded-xl p-6 text-center">
          <h4 className="text-xl font-bold mb-2">ShopKart</h4>
          <p className="text-gray-400 mb-4">Your one-stop shop for everything</p>
          <div className="flex justify-center gap-6 text-sm">
            <button className="hover:text-blue-400">About Us</button>
            <button className="hover:text-blue-400">Contact</button>
            <button className="hover:text-blue-400">Privacy Policy</button>
            <button className="hover:text-blue-400">Terms of Service</button>
          </div>
          <p className="text-gray-500 text-xs mt-4">© 2024 ShopKart. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;