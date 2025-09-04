import express from 'express';
import { protect, admin } from '../middleware/AuthMiddleware.js';
const router = express.Router();
import { createOrder } from '../controllers/OrderController.js'
import { getOrdersForUser,getAllOrders, updateOrderStatus, cancelOrderItem, getOrderStatus } from '../controllers/OrderController.js';

router.post('/api/orders/add', createOrder);
router.get('/api/orders/getOrders', protect, getOrdersForUser);
router.get('/api/orders/getAllOrders', protect, admin, getAllOrders);
router.put('/api/orders/updateStatus/:orderId', protect, admin, updateOrderStatus);
router.post("/api/orders/cancel-item/:id", protect, cancelOrderItem);
router.get("/api/orders/status/:id", protect, getOrderStatus);

export default router;