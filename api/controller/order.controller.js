import createError from '../utils/createError.js';
import Order from '../models/order.model.js';
import Gig from '../models/gig.model.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay instance outside of the route handlers
let razorpay;
try {
  const key_id = process.env.RAZORPAY_API_KEY;
  const key_secret = process.env.RAZORPAY_API_SECRET;
  
  console.log('Checking Razorpay credentials:', {
    key_id_present: !!key_id,
    key_secret_present: !!key_secret,
    key_id_preview: key_id ? `${key_id.substring(0, 8)}...` : 'missing'
  });

  if (!key_id || !key_secret) {
    throw new Error('Razorpay API credentials are missing');
  }

  // Validate key format
  if (!key_id.startsWith('rzp_') || key_id.length < 20) {
    throw new Error('Invalid Razorpay API key format');
  }

  razorpay = new Razorpay({
    key_id,
    key_secret,
  });

  // Test the Razorpay connection
  razorpay.orders.all()
    .then(() => {
      console.log('✅ Razorpay connection test successful');
    })
    .catch((error) => {
      console.error('❌ Razorpay connection test failed:', error.message);
      razorpay = null; // Reset the instance if connection fails
    });

} catch (error) {
  console.error('❌ Razorpay initialization error:', error.message);
  razorpay = null;
}

// Keep track of orders being processed to prevent duplicates
const processingOrders = new Map();

// Clear stale processing orders every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of processingOrders.entries()) {
    if (now - timestamp > 30000) { // Remove entries older than 30 seconds
      processingOrders.delete(key);
    }
  }
}, 300000);

export const createOrder = async (req, res, next) => {
  const orderKey = `${req.userId}_${req.params.id}`;
  
  try {
    // Check for existing incomplete order first
    const existingOrder = await Order.findOne({
      gigId: req.params.id,
      buyerId: req.userId,
      isCompleted: false
    });

    if (existingOrder) {
      return res.status(200).send({
        orderId: existingOrder.payment_intent,
        amount: existingOrder.price * 100,
        currency: 'INR',
        title: existingOrder.title
      });
    }

    // Check if this order is already being processed
    if (processingOrders.has(orderKey)) {
      return res.status(409).send({ message: 'Order is being processed, please wait...' });
    }

    // Mark this order as being processed
    processingOrders.set(orderKey, Date.now());

    // Find gig
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return next(createError(404, 'Gig not found'));
    }

    // Validate price
    if (!gig.price || gig.price <= 0) {
      return next(createError(400, 'Invalid gig price'));
    }

    // Prevent sellers from purchasing their own gigs
    if (gig.userId === req.userId) {
      return next(createError(403, 'You cannot purchase your own gig'));
    }

    // Create Razorpay order
    const amount = Math.round(gig.price * 100);
    const options = {
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-8)}_${req.userId.slice(-4)}`,
    };
    
    if (!razorpay) {
      return next(createError(500, 'Payment system is not properly configured'));
    }

    const razorpayOrder = await razorpay.orders.create(options);

    // Create order in database
    const newOrder = new Order({
      gigId: gig._id,
      img: gig.cover,
      title: gig.title,
      buyerId: req.userId,
      sellerId: gig.userId,
      price: gig.price,
      payment_intent: razorpayOrder.id,
      isCompleted: false,
    });

    await newOrder.save();

    return res.status(200).send({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      title: gig.title
    });

  } catch (err) {
    console.error('Order creation error:', err);
    next(createError(500, 'Error creating order. Please try again.'));
  } finally {
    // Remove the processing lock
    processingOrders.delete(orderKey);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    if (!req.userId) {
      return next(createError(401, 'Authentication required'));
    }

    const query = req.isSeller 
      ? { sellerId: req.userId, isCompleted: true }  // Sellers only see completed orders
      : { buyerId: req.userId };  // Buyers see all their orders

    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    res.status(200).send(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    next(err);
  }
};

export const confirm = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return next(createError(400, 'Missing required payment information'));
    }

    // Verify payment signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid payment signature', {
        expected: expectedSignature,
        received: razorpay_signature
      });
      return next(createError(400, 'Invalid payment signature!'));
    }

    // Find the order
    const order = await Order.findOne({
      payment_intent: razorpay_order_id,
      isCompleted: false
    });

    if (!order) {
      console.error('Order not found or already completed:', razorpay_order_id);
      return next(createError(404, 'Order not found or already completed'));
    }

    // Update the order status
    order.isCompleted = true;
    order.payment_id = razorpay_payment_id;
    await order.save();

    // Increment the sales count for the gig
    await Gig.findByIdAndUpdate(order.gigId, {
      $inc: { sales: 1 }
    });

    console.log('Payment confirmed for order:', order._id);
    console.log('Sales count incremented for gig:', order.gigId);
    
    res.status(200).send({ message: 'Order has been confirmed and sales count updated', order });
  } catch (err) {
    console.error('Payment confirmation error:', {
      error: err.message,
      stack: err.stack
    });
    next(createError(500, 'Error confirming payment. Please try again.'));
  }
};
