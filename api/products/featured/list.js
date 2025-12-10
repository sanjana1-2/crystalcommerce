const { connectDB } = require('../../utils/db');
const Product = require('../../models/Product');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ rating: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};