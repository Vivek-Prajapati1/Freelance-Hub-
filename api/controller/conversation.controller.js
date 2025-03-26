import Conversation from '../models/conversation.model.js'
import User from '../models/user.model.js'
import createError from '../utils/createError.js';

export const createConversation = async (req, res, next) => {
    const newconversation = new Conversation({
        id: req.isSeller ? req.userId + req.body.to : req.body.to + req.userId,
        sellerId: req.isSeller ? req.userId : req.body.to,
        buyerId: req.isSeller ? req.body.to : req.userId,
        readBySeller: req.isSeller,
        readByBuyer: !req.isSeller,
    });
    try {
        const savedConversation = await newconversation.save();
        res.status(201).send(savedConversation);
    } catch (err) {
        next(err)
    }
}

export const updateConversation = async (req, res, next) => {
    
    try {
        const updatedConversation = await Conversation.findOneAndUpdate(
          { id: req.params.id },
          {
            $set: {
            //   readBySeller: false,
            //   readByBuyer: true,
             ...(req.isSeller ? { readBySeller: true } : { readByBuyer: true }),
             
            },
          },
          { new: true }
        );
    
        res.status(200).send(updatedConversation);
      } catch (err) {
        next(err);
      }
}

export const getSingleConversation = async (req, res, next) => {
    try {
        const conversation = await Conversation.findOne({ id: req.params.id });
        if (!conversation) {
            return next(createError(404, "not found"));
        }

        // Get the other user's information
        const otherUserId = req.isSeller ? conversation.buyerId : conversation.sellerId;
        const otherUser = await User.findById(otherUserId).select('username img');
        
        const conversationWithUserInfo = {
            ...conversation.toObject(),
            otherUser: otherUser ? {
                username: otherUser.username,
                img: otherUser.img
            } : null
        };

        res.status(200).send(conversationWithUserInfo);
    } catch (err) {
        next(err)
    }
}

export const getConversations = async (req, res, next) => {
    try {
        const conversations = await Conversation.find(
            req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }
        ).sort({updatedAt:-1});

        // Get user information for each conversation
        const conversationsWithUserInfo = await Promise.all(
            conversations.map(async (conversation) => {
                const otherUserId = req.isSeller ? conversation.buyerId : conversation.sellerId;
                const otherUser = await User.findById(otherUserId).select('username img');
                return {
                    ...conversation.toObject(),
                    otherUser: otherUser ? {
                        username: otherUser.username,
                        img: otherUser.img
                    } : null
                };
            })
        );

        res.status(200).send(conversationsWithUserInfo);
    } catch (err) {
        next(err)
    }
}
