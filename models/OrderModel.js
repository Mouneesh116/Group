import express from 'express';
import mongoose from 'mongoose';

const OrderSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            title:{
                type: String,
                required: true
            },
            quantity:{
                type: Number,
                required: true,
                min: 1
            },
            price:{
                type: Number,
                required: true
            }
        }
    ],
    totalAmount:{
        type: Number,
        required: true
    },
    status: { 
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
        default: 'Pending'
      },
    orderDate: { // Date the order was placed
        type: Date,
        default: Date.now,
        required: true
      },
      shippingAddress: { // Details of where the order is shipped
        type: String,
        required: true
      }
    
    
},{timestamps: true})

const Order = mongoose.model("Order", OrderSchema);
export default Order;