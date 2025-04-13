import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from './routes/user.route.js';
import gigRoute from './routes/gig.route.js';
import reviewRoute from './routes/review.route.js';
import orderRoute from './routes/order.route.js';
import conversationRoute from './routes/conversation.route.js';
import messageRoute from './routes/message.route.js';
import authRoute from './routes/auth.route.js';
import adminRoute from './routes/admin.route.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();
mongoose.set('strictQuery', true);

//frontend port number
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth/', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/users', userRoute);
app.use('/api/gigs', gigRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/orders', orderRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/messages', messageRoute);


app.use((err, req, res, next) => {
  const errorStatus = err.status || 500
  const errorMessage = err.message || "Something went wrong"

  return res.status(errorStatus).send(errorMessage);
})
//backend port number
app.listen(8000, () => {
  connect();
  console.log('localserver running');
});

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('database connected');
  } catch (error) {
    console.log(error);
  }
};