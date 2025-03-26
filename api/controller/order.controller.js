import createError from '../utils/createError.js';
import Order from '../models/order.model.js';
import Gig from '../models/gig.model.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_API_SECRET) {
  throw new Error('Razorpay API credentials are not properly configured');
}

export const createOrder = async (req, res, next) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_API_SECRET,
    });

    const gig = await Gig.findById(req.params.id);
    if (!gig) return next(createError(404, 'Gig not found'));

    // Prevent sellers from purchasing their own gigs
    if (gig.userId === req.userId) {
      return next(createError(403, 'You cannot purchase your own gig'));
    }

    const options = {
      amount: gig.price * 100, // Convert to paisa (INR)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const newOrder = new Order({
      gigId: gig._id,
      img: gig.cover,
      title: gig.title,
      buyerId: req.userId,
      sellerId: gig.userId,
      price: gig.price,
      payment_intent: order.id,
      isCompleted: false,
    });

    await newOrder.save();

    res.status(200).send({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      ...(req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }),
    });
    res.status(200).send(orders);
  } catch (err) {
    next(err);
  }
};

export const confirm = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Verify payment signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return next(createError(400, 'Invalid payment signature!'));
    }

    const order = await Order.findOneAndUpdate(
      { payment_intent: razorpay_order_id },
      { 
        $set: { 
          isCompleted: true, 
          payment_id: razorpay_payment_id 
        } 
      },
      { new: true }
    );

    if (!order) return next(createError(404, 'Order not found'));

    res.status(200).send({ message: 'Order has been confirmed', order });
  } catch (err) {
    next(err);
  }
};
