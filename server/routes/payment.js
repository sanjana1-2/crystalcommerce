const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET
});

// Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals
    let itemsTotal = 0;
    cart.items.forEach(item => {
      itemsTotal += item.product.price * item.quantity;
    });

    const shippingCharge = itemsTotal >= 499 ? 0 : 40;
    const totalAmount = itemsTotal + shippingCharge;

    // Create Razorpay order with UPI and QR support
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: 'SK_' + Date.now(),
      payment_capture: 1,
      notes: {
        userId: req.user._id.toString(),
        customerName: req.user.name,
        customerEmail: req.user.email
      }
    });

    res.json({
      orderId: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_API_KEY,
      name: 'ShopKart',
      description: 'Order Payment',
      prefill: {
        name: req.user.name,
        email: req.user.email,
        contact: shippingAddress?.phone || ''
      }
    });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ message: 'Payment initialization failed', error: error.message });
  }
});

// Verify payment and create order
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Get cart and create order
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals
    let itemsTotal = 0;
    const orderItems = cart.items.map(item => {
      itemsTotal += item.product.price * item.quantity;
      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images[0] || '',
        price: item.product.price,
        quantity: item.quantity
      };
    });

    const shippingCharge = itemsTotal >= 499 ? 0 : 40;
    const totalAmount = itemsTotal + shippingCharge;

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      itemsTotal,
      shippingCharge,
      totalAmount,
      status: 'confirmed'
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    await Cart.findOneAndDelete({ user: req.user._id });

    res.json({ success: true, order });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// Generate payment link
router.post('/generate-link', auth, async (req, res) => {
  try {
    const { amount, description, customerInfo } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Validate and clean phone number
    let phoneNumber = customerInfo?.phone || '9876543210';
    // Remove any non-digit characters
    phoneNumber = phoneNumber.replace(/\D/g, '');
    // Ensure it's 10 digits and not all same digits
    if (phoneNumber.length !== 10 || /^(\d)\1{9}$/.test(phoneNumber)) {
      phoneNumber = '9876543210'; // Default valid phone
    }

    // Create Razorpay payment link
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      accept_partial: false,
      description: description || 'Payment for ShopKart Order',
      customer: {
        name: customerInfo?.name || req.user.name,
        email: customerInfo?.email || req.user.email,
        contact: phoneNumber
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      notes: {
        userId: req.user._id.toString(),
        generatedBy: req.user.name,
        type: 'payment_link'
      },
      callback_url: `${process.env.CLIENT_URL || 'http://localhost:3001'}/payment-success`,
      callback_method: 'get'
    });

    res.json({
      success: true,
      paymentLink: paymentLink.short_url,
      paymentLinkId: paymentLink.id,
      amount: amount,
      description: description || 'Payment for ShopKart Order'
    });
  } catch (error) {
    console.error('Payment link generation error:', error);
    res.status(500).json({ message: 'Failed to generate payment link', error: error.message });
  }
});

// Generate payment link for cart
router.post('/generate-cart-link', auth, async (req, res) => {
  try {
    const { shippingAddress, customerInfo } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals
    let itemsTotal = 0;
    cart.items.forEach(item => {
      itemsTotal += item.product.price * item.quantity;
    });

    const shippingCharge = itemsTotal >= 499 ? 0 : 40;
    const totalAmount = itemsTotal + shippingCharge;

    // Create description with cart items
    const itemNames = cart.items.map(item => `${item.product.name} (${item.quantity}x)`).join(', ');
    const description = `ShopKart Order: ${itemNames}`;

    // Validate and clean phone number
    let phoneNumber = customerInfo?.phone || shippingAddress?.phone || '9876543210';
    phoneNumber = phoneNumber.replace(/\D/g, '');
    if (phoneNumber.length !== 10 || /^(\d)\1{9}$/.test(phoneNumber)) {
      phoneNumber = '9876543210'; // Default valid phone
    }

    // Create Razorpay payment link
    const paymentLink = await razorpay.paymentLink.create({
      amount: totalAmount * 100, // Amount in paise
      currency: 'INR',
      accept_partial: false,
      description: description.length > 255 ? description.substring(0, 252) + '...' : description,
      customer: {
        name: customerInfo?.name || req.user.name,
        email: customerInfo?.email || req.user.email,
        contact: phoneNumber
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      notes: {
        userId: req.user._id.toString(),
        cartId: cart._id.toString(),
        shippingAddress: JSON.stringify(shippingAddress),
        type: 'cart_payment_link'
      },
      callback_url: `${process.env.CLIENT_URL || 'http://localhost:3001'}/payment-success`,
      callback_method: 'get'
    });

    res.json({
      success: true,
      paymentLink: paymentLink.short_url,
      paymentLinkId: paymentLink.id,
      amount: totalAmount,
      itemsTotal,
      shippingCharge,
      description: description.length > 255 ? description.substring(0, 252) + '...' : description,
      itemCount: cart.items.length
    });
  } catch (error) {
    console.error('Cart payment link generation error:', error);
    res.status(500).json({ message: 'Failed to generate payment link for cart', error: error.message });
  }
});

// Handle payment link success callback
router.get('/link-success/:paymentLinkId', async (req, res) => {
  try {
    const { paymentLinkId } = req.params;
    const { razorpay_payment_id, razorpay_payment_link_id, razorpay_payment_link_reference_id, razorpay_payment_link_status, razorpay_signature } = req.query;

    if (razorpay_payment_link_status === 'paid') {
      // Verify signature
      const sign = razorpay_payment_link_id + '|' + razorpay_payment_link_reference_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
        .update(sign)
        .digest('hex');

      if (razorpay_signature === expectedSign) {
        // Payment successful - redirect to success page
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/payment-success?payment_id=${razorpay_payment_id}&link_id=${paymentLinkId}`);
      } else {
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/payment-failed?reason=signature_mismatch`);
      }
    } else {
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/payment-failed?reason=payment_failed`);
    }
  } catch (error) {
    console.error('Payment link callback error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/payment-failed?reason=server_error`);
  }
});

// Get payment link status
router.get('/link-status/:paymentLinkId', auth, async (req, res) => {
  try {
    const { paymentLinkId } = req.params;
    
    const paymentLink = await razorpay.paymentLink.fetch(paymentLinkId);
    
    res.json({
      success: true,
      status: paymentLink.status,
      amount: paymentLink.amount / 100,
      currency: paymentLink.currency,
      description: paymentLink.description,
      shortUrl: paymentLink.short_url,
      createdAt: paymentLink.created_at,
      expireBy: paymentLink.expire_by
    });
  } catch (error) {
    console.error('Payment link status error:', error);
    res.status(500).json({ message: 'Failed to fetch payment link status', error: error.message });
  }
});

// Get Razorpay key (for frontend)
router.get('/key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_API_KEY });
});

module.exports = router;
