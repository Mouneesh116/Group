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
app.use(morgan("dev"))

// const cs = "mongodb://localhost:27017/compassdb";
// const localConnectionString = "mongodb://localhost:27017/"
mongoose.connect(mongoUri).then(() => {
        console.log("Connected to MongoDB database");
    })
    .catch((error) => {
        // console.log("Mongo URI:", process.env.MONGO_URI_CONNECTION_STRING);
        console.error("Error connecting to MongoDB:", error.message);
    });

app.use('/', ProductRoute);
app.use('/', OrderRoute);
app.use('/', UserRoute);
app.use('/', CartRoute);
app.use('/',ChatBotRoute);
app.use('/', AddressRoute);
app.use('/', wishListRoute);
app.use('/', ReviewRoute);
app.use('/', AdminRoute);
app.use('/', PasswordResetRoute);
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
})
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});