import express from 'express';
import { protect, admin } from '../middleware/AuthMiddleware.js';
import {
  createOrder,
  getOrdersForUser,
  getAllOrders,
  updateOrderStatus,
  cancelOrderItem,
  getOrderStatus,
  verifyDeliveryOtp
} from '../controllers/OrderController.js';

const router = express.Router();

// User
router.post('/api/orders/add', createOrder);
router.get('/api/orders/getOrders', protect, getOrdersForUser);

// Admin
router.get('/api/orders/getAllOrders', protect, admin, getAllOrders);
router.put('/api/orders/updateStatus/:orderId', protect, admin, updateOrderStatus);
router.post('/api/orders/cancel-item/:id', protect, cancelOrderItem);
router.get('/api/orders/status/:id', protect, getOrderStatus);
router.get('/api/orders/request-return/:id', protect, requestReturn);
// OTP verify endpoint
router.post('/api/orders/verify-otp/:orderId', protect, admin, verifyDeliveryOtp);

export default router;
