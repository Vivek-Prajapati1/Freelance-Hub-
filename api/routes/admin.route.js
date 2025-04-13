import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import User from '../models/user.model.js';
import Gig from '../models/gig.model.js';
import Order from '../models/order.model.js';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import mongoose from 'mongoose';

const router = express.Router();

// Admin middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({ message: 'Not authorized as admin' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGigs = await Gig.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    const totalRevenue = orders.reduce((acc, order) => acc + order.price, 0);

    res.json({
      totalUsers,
      totalGigs,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all gigs
router.get('/gigs', adminAuth, async (req, res) => {
  try {
    const gigs = await Gig.find()
      .populate('userId', 'username email')
      .select('title price userId createdAt');
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent orders
router.get('/recent-orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: 'buyerId',
        select: 'username email'
      })
      .populate({
        path: 'sellerId',
        select: 'username email'
      })
      .select('buyerId sellerId price status payment isCompleted createdAt');
    
    // Transform the data to include proper status
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      price: order.price,
      status: order.isCompleted ? 'Completed' : 
              order.payment ? 'In Progress' : 'Pending',
      createdAt: order.createdAt
    }));

    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    // Also delete user's gigs
    await Gig.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete gig
router.delete('/gigs/:id', adminAuth, async (req, res) => {
  try {
    await Gig.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gig deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create First Admin (only works if no admin exists)
router.post('/register-first-admin', async (req, res) => {
  try {
    // Check if any admin already exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists. Cannot create first admin." });
    }

    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Add email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    // Add password strength validation
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const admin = new Admin({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_KEY,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: "Admin created successfully",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Error details:', error);
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(400).json({ 
        message: "Username or email already exists" 
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_KEY,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all messages
router.get('/messages', adminAuth, async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .populate({
                path: 'buyerId',
                model: 'user',
                select: 'username email'
            })
            .populate({
                path: 'sellerId',
                model: 'user',
                select: 'username email'
            })
            .sort({ updatedAt: -1 })
            .select('_id buyerId sellerId lastMessage readByBuyer readBySeller updatedAt');
        
        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single conversation with messages
router.get('/conversation/:id', adminAuth, async (req, res) => {
    try {
        console.log('Fetching conversation with ID:', req.params.id);

        const conversation = await Conversation.findById(req.params.id)
            .populate('buyerId', 'username email')
            .populate('sellerId', 'username email')
            .lean();
        
        if (!conversation) {
            console.log('Conversation not found for ID:', req.params.id);
            return res.status(404).json({ message: 'Conversation not found' });
        }

        console.log('Found conversation:', conversation);
        res.json(conversation);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid conversation ID format' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get messages for a conversation
router.get('/messages/:id', adminAuth, async (req, res) => {
    try {
        const conversationId = req.params.id;
        console.log('Fetching messages for conversation ID:', conversationId);

        // First verify the conversation exists and get its details
        const conversation = await Conversation.findById(conversationId)
            .populate('buyerId', 'username email')
            .populate('sellerId', 'username email');

        if (!conversation) {
            console.log('Conversation not found');
            return res.status(404).json({ message: 'Conversation not found' });
        }

        console.log('Found conversation:', JSON.stringify(conversation, null, 2));

        // Use the string ID from the conversation model
        const messages = await Message.find({ 
            conversationId: conversation.id  // Use the string ID field
        })
        .populate('userId', 'username email')
        .sort({ createdAt: 1 });

        console.log(`Found ${messages.length} messages for conversation ID:`, conversation.id);
        
        if (messages.length === 0) {
            // Log some diagnostic information
            console.log('No messages found. Conversation details:', {
                mongoId: conversation._id,
                stringId: conversation.id,
                buyerId: conversation.buyerId._id,
                sellerId: conversation.sellerId._id
            });
            
            // Sample some messages to see what's in the database
            const sampleMessages = await Message.find().limit(5);
            console.log('Sample messages in database:', 
                JSON.stringify(sampleMessages.map(m => ({
                    conversationId: m.conversationId,
                    userId: m.userId,
                    desc: m.desc
                })), null, 2)
            );
            
            return res.json([]);
        }

        // Transform messages to include sender role
        const transformedMessages = messages.map(message => {
            const messageObj = message.toObject();
            const isBuyer = messageObj.userId?._id.toString() === conversation.buyerId._id.toString();
            return {
                ...messageObj,
                senderRole: isBuyer ? 'Buyer' : 'Seller'
            };
        });

        console.log(`Successfully transformed ${transformedMessages.length} messages`);
        res.json(transformedMessages);
    } catch (error) {
        console.error('Error details:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid conversation ID format' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router; 