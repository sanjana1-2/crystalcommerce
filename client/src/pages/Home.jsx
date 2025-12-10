import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featuredRes, productsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/featured/list'),
          api.get('/products?limit=8')
        ]);
        setCategories(catRes.data);
        setFeaturedProducts(featuredRes.data);
        setAllProducts(productsRes.data.products);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-indigo-600">
        <div className="absolute inset-0 flex items-center justify-center text-center text-white p-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to ShopKart</h1>
            <p className="text-xl mb-6 text-white/90">Discover amazing products at great prices</p>
            <Link to="/category/electronics" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow group"
            >
              <img
                src={cat.image || 'https://via.placeholder.com/100'}
                alt={cat.name}
                className="w-16 h-16 mx-auto rounded-full object-cover mb-3 group-hover:scale-110 transition-transform"
              />
              <h3 className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
            </Link>
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
      {featuredProducts.length > 0 && (
        <section className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">⚡ Featured Products</h2>
            <Link to="/search" className="text-primary font-medium hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="bg-white rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🛍️ Products For You</h2>
          <Link to="/search" className="text-primary font-medium hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
