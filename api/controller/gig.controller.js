import Gig from '../models/gig.model.js';
import createError from '../utils/createError.js';
import multer from 'multer';
import path from 'path';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

export const createGig = async (req, res, next) => {
  if (req.isSeller === false) { 
    return next(createError(403, 'Only Seller Create a Gig')); 
  }

  const newGig = new Gig({
    userId: req.userId,
    ...req.body
  });

  try {
    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (error) {
    next(error);
  }
};

export const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return next(createError(404, 'Gig not found'));
    }
    if (gig.userId !== req.userId) {
      return next(createError(403, 'You can only delete your own gig'));
    }
    await Gig.findByIdAndDelete(req.params.id);
    res.status(200).send('Gig has been deleted');
  } catch (err) {
    next(err);
  }
};

export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return next(createError(404, 'Gig not found'));
    }
    res.status(200).send(gig);
  } catch (err) {
    next(err);
  }
};

export const getGigs = async (req, res, next) => {
  const q = req.query;
  const filters = {
    ...(q.userId && { userId: q.userId }),
    ...(q.cat && { cat: q.cat }),
    ...((q.min || q.max) && {
      price: {
        ...(q.min && { $gte: q.min }),
        ...(q.max && { $lte: q.max }),
      },
    }),
    ...(q.search && { title: { $regex: q.search, $options: "i" } }),
  };
  try {
    const gigs = await Gig.find(filters).sort({ [q.sort]: -1 });
    res.status(200).send(gigs);
  } catch (err) {
    next(err);
  }
};

export const updateGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return next(createError(404, 'Gig not found'));
    }

    // Convert userId to string for comparison
    if (gig.userId.toString() !== req.userId) {
      return next(createError(403, 'You can only update your own gig'));
    }

    // Handle file uploads if present
    const updateData = { ...req.body };
    
    if (req.files) {
      if (req.files.cover) {
        updateData.cover = req.files.cover[0].path;
      }
      if (req.files.images) {
        updateData.images = req.files.images.map(file => file.path);
      }
    }

    // Handle features array
    if (req.body.features) {
      const features = Array.isArray(req.body.features) 
        ? req.body.features 
        : [req.body.features];
      updateData.features = features;
    }

    // Convert string values to numbers where needed
    updateData.deliveryTime = Number(updateData.deliveryTime);
    updateData.rivisonNumber = Number(updateData.rivisonNumber);
    updateData.totalStars = Number(updateData.totalStars);
    updateData.starNumber = Number(updateData.starNumber);
    updateData.sales = Number(updateData.sales);

    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedGig) {
      return next(createError(404, 'Gig not found'));
    }

    res.status(200).json(updatedGig);
  } catch (err) {
    next(err);
  }
};
