import jwt, { decode } from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'; // Optional, but recommended for async error handling
import User from '../models/UserModel.js'; // Adjust path to your User model

// Middleware to protect routes (verify token and attach user to req)
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT_SECRET from .env

            // Find user by ID from token and attach to request (excluding password)
            // console.log(decoded, decoded.user.id);
            req.user = await User.findById(decoded.user.id).select('-password');
            console.log(decoded.user.id, req.user);
            // console.log(req.user);
            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Middleware to check if the user is an admin
const admin = (req, res, next) => {
    // 'protect' middleware must run before 'admin' middleware to ensure req.user exists
    if (req.user && req.user.role === 'admin') { // Assuming your User model has a 'role' field
        next(); // User is an admin, proceed
    } else {
        res.status(403); // Forbidden
        throw new Error('Not authorized as an admin');
    }
};

export { protect, admin };