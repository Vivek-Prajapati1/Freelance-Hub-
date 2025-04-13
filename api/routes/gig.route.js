import express from "express";
import {createGig,deleteGig,getGig,getGigs,updateGig} from '../controller/gig.controller.js';
import {verifyToken} from '../middelware/jwt.js'
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post('/', verifyToken, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]), createGig);

router.delete('/:id', verifyToken, deleteGig);
router.get('/single/:id', getGig);
router.get('/', getGigs);

router.put('/:id', verifyToken, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]), updateGig);

export default router;