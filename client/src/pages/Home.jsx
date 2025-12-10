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
        // Fallback demo data for when backend is not available
        setCategories([
          { _id: '1', name: 'Mobiles', slug: 'mobiles', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100' },
          { _id: '2', name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100' },
          { _id: '3', name: 'Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100' },
          { _id: '4', name: 'Home', slug: 'home', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100' },
          { _id: '5', name: 'Beauty', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100' }
        ]);
        setFeaturedProducts([
          { _id: '1', name: 'iPhone 15 Pro', price: 159900, originalPrice: 179900, images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'], rating: 4.7, numReviews: 2341 },
          { _id: '2', name: 'Samsung Galaxy S24', price: 134999, originalPrice: 149999, images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'], rating: 4.6, numReviews: 1892 },
          { _id: '3', name: 'MacBook Air M3', price: 134900, originalPrice: 144900, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'], rating: 4.8, numReviews: 1567 },
          { _id: '4', name: 'Sony Headphones', price: 29990, originalPrice: 34990, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], rating: 4.7, numReviews: 5678 }
        ]);
        setAllProducts([
          { _id: '5', name: 'OnePlus 12', price: 64999, originalPrice: 69999, images: ['https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400'], rating: 4.5, numReviews: 3421 },
          { _id: '6', name: 'iPad Pro', price: 41900, originalPrice: 44900, images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400'], rating: 4.7, numReviews: 3456 },
          { _id: '7', name: 'Nike Sneakers', price: 12995, originalPrice: 15995, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], rating: 4.6, numReviews: 5678 },
          { _id: '8', name: 'Levi\'s Jeans', price: 2499, originalPrice: 4299, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'], rating: 4.3, numReviews: 8923 }
        ]);
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
      {/* Demo Notice */}
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
        <p className="text-center">
          🚀 <strong>Demo Mode:</strong> This is a frontend-only demo. Backend features (login, cart, payments) are not functional.
        </p>
      </div>

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
