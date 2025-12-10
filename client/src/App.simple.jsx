import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">ShopKart - Demo</h1>
          <p className="text-blue-200">E-commerce Frontend Demo</p>
        </div>
      </header>

      {/* Demo Notice */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          <p className="text-center">
            🚀 <strong>Demo Mode:</strong> This is a frontend-only demo. Backend features are not functional.
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Welcome to ShopKart</h2>
          <p className="text-xl mb-6">Discover amazing products at great prices</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Shop Now
          </button>
        </div>

        {/* Categories */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Mobiles', 'Electronics', 'Fashion', 'Home', 'Beauty'].map((category) => (
              <div key={category} className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full mb-3"></div>
                <h4 className="font-medium text-gray-800">{category}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* Products */}
        <section className="bg-white rounded-xl p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Featured Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'iPhone 15 Pro', price: '₹1,59,900' },
              { name: 'Samsung Galaxy S24', price: '₹1,34,999' },
              { name: 'MacBook Air M3', price: '₹1,34,900' },
              { name: 'Sony Headphones', price: '₹29,990' }
            ].map((product, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                <h4 className="font-medium text-gray-800 mb-2">{product.name}</h4>
                <p className="text-blue-600 font-bold">{product.price}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;