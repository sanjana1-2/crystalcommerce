import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product._id);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            {discount}% OFF
          </span>
        )}
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-primary text-white py-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Add to Cart
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            {product.rating?.toFixed(1) || '0.0'} ★
          </span>
          <span className="text-gray-400 text-sm">({product.numReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
          {discount > 0 && (
            <>
              <span className="text-sm text-gray-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
              <span className="text-sm text-green-600 font-medium">{discount}% off</span>
            </>
          )}
        </div>

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
