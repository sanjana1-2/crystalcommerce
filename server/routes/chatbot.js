const express = require('express');
const OpenAI = require('openai');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI (optional - works without API key with fallback)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are ShopKart's helpful AI shopping assistant. You help customers with:
- Finding products and recommendations
- Order tracking and status
- Return and refund policies
- Payment and delivery information
- General shopping queries

Be friendly, helpful, and concise. If you don't know something, say so politely.

Store Policies:
- Free delivery on orders above ₹499
- 7-day easy returns on most products
- Cash on Delivery available
- Secure online payments via UPI, Cards, Net Banking

Always be helpful and guide customers to make informed purchases.`;

// Fallback responses when OpenAI is not available
const getFallbackResponse = async (message, userId) => {
  const lowerMessage = message.toLowerCase();
  
  // Order tracking
  if (lowerMessage.includes('order') && (lowerMessage.includes('track') || lowerMessage.includes('status') || lowerMessage.includes('where'))) {
    if (userId) {
      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(3);
      if (orders.length > 0) {
        const orderInfo = orders.map(o => 
          `Order #${o.trackingId}: ${o.status.toUpperCase()} - ₹${o.totalAmount}`
        ).join('\n');
        return `Here are your recent orders:\n${orderInfo}\n\nNeed help with a specific order?`;
      }
    }
    return "To track your order, please login and visit 'My Orders' section. You can also share your order ID and I'll help you track it.";
  }

  // Product search
  if (lowerMessage.includes('looking for') || lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('show me')) {
    const categories = await Category.find({ isActive: true });
    const categoryNames = categories.map(c => c.name).join(', ');
    return `I can help you find products! We have: ${categoryNames}. What are you looking for specifically? You can also use the search bar above to find products.`;
  }

  // Delivery
  if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
    return "🚚 Delivery Information:\n- Free delivery on orders above ₹499\n- Standard delivery: 3-5 business days\n- Express delivery available in select cities\n- Track your order in real-time from 'My Orders'";
  }

  // Returns
  if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('exchange')) {
    return "↩️ Return Policy:\n- 7-day easy returns on most products\n- Items must be unused and in original packaging\n- Refund processed within 5-7 business days\n- Some categories like innerwear are non-returnable\n\nTo initiate a return, go to 'My Orders' and select the item.";
  }

  // Payment
  if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('cod')) {
    return "💳 Payment Options:\n- Cash on Delivery (COD)\n- UPI (GPay, PhonePe, Paytm)\n- Credit/Debit Cards\n- Net Banking\n- EMI available on select products\n\nAll payments are 100% secure!";
  }

  // Greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! 👋 Welcome to ShopKart! I'm your shopping assistant. How can I help you today?\n\nI can help with:\n- Finding products\n- Order tracking\n- Returns & refunds\n- Payment queries";
  }

  // Default
  return "I'm here to help! You can ask me about:\n- Product recommendations\n- Order tracking\n- Delivery & shipping\n- Returns & refunds\n- Payment options\n\nWhat would you like to know?";
};

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?._id;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let response;

    // Try OpenAI if available
    if (openai) {
      try {
        // Get relevant product info for context
        const products = await Product.find({ isActive: true })
          .select('name price category')
          .limit(20);
        
        const productContext = products.map(p => `${p.name} - ₹${p.price}`).join(', ');

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + `\n\nAvailable products: ${productContext}` },
            { role: 'user', content: message }
          ],
          max_tokens: 300,
          temperature: 0.7
        });

        response = completion.choices[0].message.content;
      } catch (aiError) {
        console.error('OpenAI Error:', aiError.message);
        response = await getFallbackResponse(message, userId);
      }
    } else {
      // Use fallback responses
      response = await getFallbackResponse(message, userId);
    }

    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Chat with auth (for personalized responses)
router.post('/auth', auth, async (req, res) => {
  req.body.userId = req.user._id;
  // Reuse the main chat logic
  const { message } = req.body;
  
  try {
    const response = await getFallbackResponse(message, req.user._id);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
