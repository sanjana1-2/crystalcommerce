const { connectDB } = require('../utils/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shopkart.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const admin = new User({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      phone: '1234567890',
      role: 'admin'
    });
    await admin.save();

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Mobiles', slug: 'mobiles', description: 'Smartphones & Accessories', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100' },
      { name: 'Electronics', slug: 'electronics', description: 'TV, Laptops, Cameras', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100' },
      { name: 'Fashion', slug: 'fashion', description: 'Clothing, Footwear, Watches', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100' },
      { name: 'Home & Furniture', slug: 'home-furniture', description: 'Furniture, Decor, Kitchen', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100' },
      { name: 'Beauty', slug: 'beauty', description: 'Makeup, Skincare, Perfumes', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100' }
    ]);

    const [mobiles, electronics, fashion, home, beauty] = categories;

    // Create sample products
    const products = [
      { name: 'iPhone 15 Pro', description: 'Latest iPhone with A17 Pro chip', price: 159900, originalPrice: 179900, category: mobiles._id, images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'], stock: 25, rating: 4.7, numReviews: 2341, brand: 'Apple', isFeatured: true },
      { name: 'Samsung Galaxy S24', description: 'Premium Android smartphone', price: 134999, originalPrice: 149999, category: mobiles._id, images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'], stock: 30, rating: 4.6, numReviews: 1892, brand: 'Samsung', isFeatured: true },
      { name: 'MacBook Air M3', description: 'Apple MacBook Air with M3 chip', price: 134900, originalPrice: 144900, category: electronics._id, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'], stock: 20, rating: 4.8, numReviews: 1567, brand: 'Apple', isFeatured: true },
      { name: 'Sony WH-1000XM5', description: 'Premium noise cancelling headphones', price: 29990, originalPrice: 34990, category: electronics._id, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], stock: 40, rating: 4.7, numReviews: 5678, brand: 'Sony', isFeatured: true }
    ];

    await Product.insertMany(products);

    res.json({ 
      message: 'Database seeded successfully!',
      stats: {
        users: 1,
        categories: categories.length,
        products: products.length
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};