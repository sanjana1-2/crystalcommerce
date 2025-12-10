import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        
        // Fetch related products
        if (response.data.category) {
          const relatedRes = await api.get(`/products?category=${response.data.category._id}&limit=4`);
          setRelatedProducts(relatedRes.data.products.filter(p => p._id !== id));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    for (let i = 0; i < quantity; i++) {
      await addToCart(product._id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to={`/category/${product.category?.slug}`} className="hover:text-primary">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-gray-800">{product.name}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                  {discount}% OFF
                </span>
              )}
              <img
                src={product.images?.[selectedImage] || 'https://via.placeholder.com/500'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
              {product.brand && <p className="text-gray-500">Brand: {product.brand}</p>}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <span className="bg-green-600 text-white px-2 py-1 rounded font-semibold flex items-center gap-1">
                {product.rating?.toFixed(1) || '0.0'} ★
              </span>
              <span className="text-gray-500">{product.numReviews || 0} Reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 pb-4 border-b">
              <span className="text-3xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
              {discount > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
                  <span className="text-lg text-green-600 font-semibold">{discount}% off</span>
                </>
              )}
            </div>

            {/* Offers */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-bold text-primary mb-3">🎁 Available Offers</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>🏷️ Bank Offer: 10% off on select bank cards</li>
                <li>🏷️ Special Price: Extra 5% off on prepaid orders</li>
                <li>🏷️ Free Delivery on orders above ₹499</li>
              </ul>
            </div>

            {/* Delivery Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2">🚚 Free Delivery</span>
              <span className="flex items-center gap-2">↩️ 7 Days Return</span>
              <span className="flex items-center gap-2">✓ Genuine Product</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 hover:bg-gray-100 font-bold"
                >−</button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 hover:bg-gray-100 font-bold"
                >+</button>
              </div>
              <span className="text-gray-500 text-sm">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-accent text-white py-4 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🛒 Add to Cart
              </button>
              <button className="flex-1 bg-secondary text-white py-4 rounded-lg font-semibold hover:bg-orange-600">
                ⚡ Buy Now
              </button>
            </div>

            {/* Description */}
            <div className="pt-4 border-t">
              <h3 className="font-bold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications?.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-bold text-gray-800 mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-sm">{spec.key}</span>
                      <p className="font-medium">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
