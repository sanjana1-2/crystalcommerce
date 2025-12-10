const { connectDB } = require('../utils/db');
const Category = require('../models/Category');

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
      const categories = await Category.find().sort({ name: 1 });
      return res.json(categories);
    }

    if (req.method === 'POST') {
      const { name, slug, description, image } = req.body;
      const category = new Category({ name, slug, description, image });
      await category.save();
      return res.status(201).json(category);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};