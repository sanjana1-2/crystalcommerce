import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const Category = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get category info
        const catRes = await api.get(`/categories/${slug}`);
        setCategory(catRes.data);
        
        // Build query params
        let query = `category=${catRes.data._id}`;
        if (sortBy) query += `&sort=${sortBy}`;
        if (priceRange) {
          const [min, max] = priceRange.split('-');
          if (min) query += `&minPrice=${min}`;
          if (max) query += `&maxPrice=${max}`;
        }
        
        // Get products
        const prodRes = await api.get(`/products?${query}`);
        setProducts(prodRes.data.products);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, sortBy, priceRange]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <span className="text-gray-800">{category?.name}</span>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 sticky top-24 space-y-6">
            <h3 className="font-bold text-gray-800 text-lg">Filters</h3>

            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Price Range</h4>
              <div className="space-y-2">
                {[
                  { label: 'All Prices', value: '' },
                  { label: 'Under ₹1,000', value: '0-1000' },
                  { label: '₹1,000 - ₹5,000', value: '1000-5000' },
                  { label: '₹5,000 - ₹20,000', value: '5000-20000' },
                  { label: 'Above ₹20,000', value: '20000-' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceRange === option.value}
                      onChange={() => setPriceRange(option.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => { setSortBy(''); setPriceRange(''); }}
              className="text-primary text-sm hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Products */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{category?.name}</h2>
                <p className="text-gray-500 text-sm">{products.length} products found</p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="p-4">
              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">🔍</span>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-500">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
