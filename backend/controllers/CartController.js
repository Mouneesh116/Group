import express from 'express';
import Cart from '../models/CartModel.js';
import mongoose from 'mongoose';

export const addToCartNotWorking = async (req,res) => {
    try {
        const { userId, userName, items } = req.body;
        
        const { productId, title, price, quantity, img} = items[0];
        const cart = await Cart.findOne({userId});
        if(cart){
            cart.items = cart.items || [];
            const itemIndex = cart.items.findIndex((item)=>{
                return item.productId.toString() === productId
            })
            if(itemIndex > -1){
                cart.items[itemIndex].quantity += 1;
            }
            else{
                cart.items.push({
                    productId: new mongoose.Types.ObjectId(productId),quantity,price,title,img
                })
            }
            await cart.save();
            return res.status(200).json({message: "Item added to the cart", cart});
        }
        else{
            const newCart = new Cart({
                userId,
                userName,
                items:[{productId: new mongoose.Types.ObjectId(productId),quantity,price,title,img}]
            });
            await newCart.save();
            return res.status(200).json({message: "Cart created for the user and the product is added to the cart"});
        }
    } catch (error) {
        res.status(500).json({message: "Error adding to cart", error: error.message})
    }
}

export const addToCart = async (req, res) => {
    try {
        // Destructure necessary fields from the request body
        // We now expect productId, title, price, and quantityDelta (the change amount)
        // const { userId, userName, productId, title, price, quantityDelta, img } = req.body;
        const { items } = req.body;
        const userId = req.user._id; // Assuming userId is available in req.user
        console.log(`${userId} userId from the token in add to cart`);
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items array is missing or empty." });
        }
        const { productId, title, price, quantityDelta, img} = items[0];

        // Basic validation for required fields
        if (!userId || !productId || !title || price === undefined || quantityDelta === undefined || !img) {
            return res.status(400).json({ message: "Missing required fields for cart operation." });
        }

        // Convert productId to ObjectId for Mongoose query
        const productObjectId = new mongoose.Types.ObjectId(productId);

        // Find the user's cart
        let cart = await Cart.findOne({ userId });

        // If a cart exists for the user
        if (cart) {
            cart.items = cart.items || []; // Ensure items array exists

            // Find if the product already exists in the cart
            const itemIndex = cart.items.findIndex(
                (item) => item.productId.toString() === productObjectId.toString()
            );

            // If the item is already in the cart
            if (itemIndex > -1) {
                // Update the quantity
                cart.items[itemIndex].quantity += quantityDelta;

                // If quantity drops to 0 or less, remove the item
                if (cart.items[itemIndex].quantity <= 0) {
                    cart.items.splice(itemIndex, 1); // Remove the item from the array
                }
            } else {
                // If the item is NOT in the cart
                // Only add if quantityDelta is positive (i.e., we are trying to add, not decrease a non-existent item)
                if (quantityDelta > 0) {
                    cart.items.push({
                        productId: productObjectId,
                        quantity: quantityDelta, // Initial quantity is the delta
                        price,
                        title,
                        img,
                    });
                }
            }

            // Save the updated cart
            await cart.save();
            return res.status(200).json({ message: "Cart updated successfully", cart });
        }
        // If no cart exists for the user
        else {
            // Only create a new cart if we are trying to add a positive quantity
            if (quantityDelta > 0) {
                const newCart = new Cart({
                    userId, items: [{ productId: productObjectId, quantity: quantityDelta, price, title, img }],
                });
                await newCart.save();
                return res.status(201).json({ message: "Cart created and product added", cart: newCart }); // 201 Created for new resource
            } else {
                // Cannot decrease/remove from a non-existent cart
                return res.status(404).json({ message: "Cart not found for user, cannot decrease quantity." });
            }
        }
    } catch (error) {
        console.error("Error in addToCart controller:", error); // Log full error for debugging
        res.status(500).json({ message: "Error adding/updating item in cart", error: error.message });
    }
};

export const removeFromCart = async (req,res) => {
    try {
        const { userId,productId } = req.params;
        const cart = await Cart.findOne({userId});
        if(!cart){
            return res.status(404).json({message: "Cart not found"});
        }
        cart.items = cart.items.filter((item)=>{
            return item.productId.toString() !== productId
        });
        await cart.save();
        const savedCart = await Cart.findOne({userId});
        return res.status(200).json({message : "Item removed from cart", savedCart});
    } catch (error) {
        console.log("Error",error);
        res.status(500).json({message: "Error removing item from cart",error: error.message})
    }
}

// export const getCartItems = async (req,res) => {
//     try {
//         const { userId } = req.user._id;        
//         const cart = await Cart.findOne({userId});
//         console.log(cart);
//         if(!cart){
//             return res.status(404).json({message : "Cart is empty because the user has not added anything to cart yet"});
//         }
//         console.log(cart);
//         return res.status(200).json({cart: cart}).json(cart);
//     } catch (error) {
//         console.log("Error getting cart items",error);
//         res.status(500).json({message: "Error getting cart items"});
//     }
// }
export const getCartItems = async (req,res) => {
    try {
        const userId = req.user.id;        
        const cart = await Cart.findOne({userId});
        console.log(cart);
        if(!cart){
            return res.status(200).json({message : "Cart not found for the user because cart is empty", cart: {items: []}});
        }
        console.log(cart);
        return res.status(200).json({cart: cart}).json(cart);
    } catch (error) {
        console.log("Error getting cart items",error);
        res.status(500).json({message: "Error getting cart items"});
    }
}

export const deleteAfterOrdering = async (req,res) => {
    try {
        const { userId } = req.params;
        const deletedCart = await Cart.findOneAndDelete({userId});
        if(!deletedCart){
            return res.status(404).json({message: "Cart not found for the user"});
        }
        console.log("Cart deleted after ordering", deletedCart);
        res.status(200).json({message: "Cart deleted after ordering", deletedCart});
    } catch (error) {
        console.log("Error deleting cart after ordering", error);
        res.status(500).json({message: "Error deleting cart after ordering", error: error.message});
    }
}