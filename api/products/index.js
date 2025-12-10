const { connectDB } = require('../utils/db');
const Product = require('../models/Product');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const { page = 1, limit = 12, category, search, sort } = req.query;
      
      let query = {};
      
      // Category filter
      if (category) {
        query.category = category;
      }
      
      // Search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Sort options
      let sortOption = { createdAt: -1 };
      if (sort === 'price-low') sortOption = { price: 1 };
      if (sort === 'price-high') sortOption = { price: -1 };
      if (sort === 'rating') sortOption = { rating: -1 };
      if (sort === 'name') sortOption = { name: 1 };
      
      const skip = (page - 1) * limit;
      
      const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await Product.countDocuments(query);
      
      return res.json({
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    if (req.method === 'POST') {
      const productData = req.body;
      const product = new Product(productData);
      await product.save();
      return res.status(201).json(product);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};