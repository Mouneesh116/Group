// server.js (ESM)
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProductRoute from './routes/ProductRoute.js';
import OrderRoute from './routes/OrderRoute.js';
import UserRoute from './routes/UserRoute.js';
import CartRoute from './routes/CartRoute.js';
import AddressRoute from './routes/AddressRoute.js';
import ChatBotRoute from './routes/ChatBotRoute.js';
import wishListRoute from './routes/WishListRoutes.js';
import ReviewRoute from './routes/ReviewRoute.js';
import AdminRoute from './routes/AdminRoute.js';
import PasswordResetRoute from './routes/PasswordResetRoute.js';
import cors from 'cors';
import User from './models/UserModel.js';
import bcrypt from 'bcrypt';
import morgan from 'morgan';
import crypto from 'crypto';
import Razorpay from 'razorpay';

dotenv.config();
const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
    credentials: true,
}));
const mongoUri = process.env.MONGO_URI_CONNECTION_STRING;
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(morgan("dev"));

// connect to mongodb
mongoose.connect(mongoUri).then(() => {
        console.log("Connected to MongoDB database");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
    });

// app routes
app.use('/', ProductRoute);
app.use('/', OrderRoute);
app.use('/', UserRoute);
app.use('/', CartRoute);
app.use('/', ChatBotRoute);
app.use('/', AddressRoute);
app.use('/', wishListRoute);
app.use('/', ReviewRoute);
app.use('/', AdminRoute);
app.use('/', PasswordResetRoute);

// admin creation endpoint (existing)
app.post('/api/users/admin/create', async (req,res) => {
    try {
        const secretKey = req.body.secretKey;
        if(secretKey !== process.env.ADMIN_SECRET_KEY){
            return res.status(403).json({message: "Unauthorized"});
        }
        const existingAdmin = await User.findOne({role: 'admin'});
        if(existingAdmin){
            return res.status(400).json({message: "Admin already exists"})
        }
        const password = req.body.password;
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password,salt);
        const newAdmin = await User.create({
             username: req.body.username,
             email: req.body.email,
             password: hashedPassword,
             role: 'admin'
        });
        return res.status(200).json({message: "Admin created successfully", admin: newAdmin});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error creating admin" });
    }
});

//
// Razorpay integration
//
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// health check for payments
app.get('/api/payment', (_, res) => res.send('Razorpay Backend OK'));

// Create an order
app.post('/api/create-order', async (req, res) => {
  try {
    // default to 2 INR if not provided (for demo). Expect rupees in request body.
    const { amountInRupees = 2, receiptNotes } = req.body;
    const numeric = Number(amountInRupees);
    if (isNaN(numeric) || numeric <= 0) {
      return res.status(400).json({ error: 'Invalid amountInRupees' });
    }
    const amount = Math.round(numeric * 100); // convert to paise (integer)
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
      notes: Object.assign({ purpose: 'React demo' }, receiptNotes || {})
    });
    res.json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment signature
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest('hex');
    const ok = expected === razorpay_signature;
    if (ok) return res.json({ ok: true });
    return res.status(400).json({ ok: false, error: 'Invalid signature' });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ ok: false, error: 'Verification error' });
  }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
