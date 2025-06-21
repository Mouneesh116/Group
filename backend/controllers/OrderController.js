import mongoose from 'mongoose'; // Ensure mongoose is imported
import Order from '../models/OrderModel.js';
import User from '../models/UserModel.js';
import Product from '../models/ProductModel.js';
import { sendMail } from '../utils/MailSender.js';
export const createOrder = async (req, res) => {
    try {
        const { userId, items, totalAmount, status, shippingAddress } = req.body;

        if (!userId || !items || !Array.isArray(items) || items.length === 0 || !shippingAddress || shippingAddress.trim() === '') {
            return res.status(400).json({ message: "Missing required order fields (userId, items, totalAmount, shippingAddress) or invalid data format." });
        }

        const user = await User.findById(userId); // Use destructured userId
        if (!user) {
            return res.status(404).json({ message: "User not found. Cannot create order for a non-existent user." });
        }

        

        // If there is no existing user document for storing the orders, create a new one
        const newData = {
            userId: new mongoose.Types.ObjectId(userId), // Ensure userId is an ObjectId
            items: items.map(item => ({
                productId: new mongoose.Types.ObjectId(item.productId), // Ensure productId is an ObjectId
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                img: item.img
            })),
            totalAmount: totalAmount, // Use the provided totalAmount
            status: status || 'Pending', // Default to 'Pending' if not provided
            orderDate: new Date(), // Use current date for orderDate
            shippingAddress: shippingAddress // Directly assign the string
        };

        const newDocument = await Order.create(newData);
        //send a mail to the user about the order creation
        
            const to = user.email
            const subject = 'Order Confirmation from E-Commerce Platform'
            const text = `Dear ${user.username}, \n\n 
            Your order has been successfully confirmed with the following order details: \n
            Order ID: ${newDocument._id} \n
            Order Date: ${newDocument.orderDate.toISOString()} \n
            Total Amount: $${newDocument.totalAmount} \n
            Status: ${newDocument.status} \n
            Shipping Address: ${newDocument.shippingAddress} \n\n
            Thank you for shopping with us! \n\n
            For any queries, please contact our customer care team. \n\n
            Best regards, \n
            E-Commerce Platform Team`
        
        // const mailResponse = await sendMail(to,subject,text);
        // console.log("Mail sent successfully:", mailResponse);
        console.log("New order created:", newDocument);
        return res.status(200).json({ message: "Order created successfully", order: newDocument });


    } catch (error) {
        console.error("Error creating order:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }
        return res.status(500).json({ message: "Internal server error while creating order", error: error.message });
    }
};

// export const getOrders = async (req, res, next) => {
//     try {
//         const { userId } = req.user.id; // Assuming userId is available in req.user
//         console.log(userId);
//         if (!userId) {
//             return res.status(400).json({ message: "User ID is required to fetch orders." });
//         }
//         const orders = await Order.findOne({userId: new mongoose.Types.ObjectId(userId)}) // Ensure userId is an ObjectId;
//         if (!orders || orders.length === 0) {
//             return res.status(200).json({ message: "No orders found", orders: [] });
//         }

//         return res.status(200).json({message: "Orders fetched Successfully",orders: orders });
//     } catch (error) {
//         console.error("Error getting orders:", error);
//         return res.status(500).json({ message: "Error getting orders", error: error.message });
//     }
// };

export const getOrdersForUser = async (req, res, next) => {
    try {
        const userId = req.user._id; // Extract userId from req.user
        console.log('Fetching orders for user:', userId);

        // Fetch orders for the user and populate product details
        const orders = await Order.find({ userId }).populate('items.productId', 'name price images');

        if (!orders || orders.length === 0) {
            return res.status(200).json({ message: "No orders found", orders: [] });
        }

        // Format the response to include necessary fields
        const formattedOrders = orders.map(order => ({
            id: order._id,
            date: order.orderDate,
            totalAmount: order.totalAmount,
            status: order.status,
            items: order.items.map(item => ({
                productId: item.productId._id,
                title: item.productId.name,
                // img: item.productId.img,
                quantity: item.quantity,
                price: item.price,
            })),
        }));

        res.status(200).json({ message: "Orders fetched successfully", orders: formattedOrders });
    } catch (error) {
        console.error("Error in getOrders:", error);
        next(error);
    }
};








export const getAllOrders = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, sortBy = 'orderDate', sortOrder = 'desc',
            status, productName, dateFrom, dateTo, searchTerm
        } = req.query;

        // --- ADD STATEMENT 1 HERE ---
        console.log("------------------------------------------");
        console.log("Backend received query params:");
        console.log("dateFrom:", dateFrom, "dateTo:", dateTo);
        console.log("productName:", productName); // Adding this for later debugging
        console.log("searchTerm:", searchTerm);   // Adding this for later debugging
        console.log("------------------------------------------");

        let query = {}; // This object will build the Mongoose query conditions

        // 1. Filter by Order Status
        if (status) {
            query.status = status;
        }

        // 2. Filter by Date Range (orderDate)
        if (dateFrom || dateTo) {
            query.orderDate = {};
            if (dateFrom) {
                const startDate = new Date(new Date(dateFrom).setUTCHours(0, 0, 0, 0));
                // --- ADD STATEMENT 2 (a) HERE ---
                console.log("Parsed startDate (UTC):", startDate.toISOString());
                query.orderDate.$gte = startDate;
            }
            if (dateTo) {
                const endDate = new Date(new Date(dateTo).setUTCHours(23, 59, 59, 999));
                // --- ADD STATEMENT 2 (b) HERE ---
                console.log("Parsed endDate (UTC):", endDate.toISOString());
                query.orderDate.$lte = endDate;
            }
        }

        // 3. Filter by Product Name (within the 'items' array)
        if (productName) {
            // Find product IDs that match the productName
            const matchingProducts = await Product.find({
                title: { $regex: productName, $options: 'i' } // Case-insensitive regex search
            }).select('_id'); // Only retrieve the _id field

            const matchingProductIds = matchingProducts.map(p => p._id);

            // --- ADD STATEMENT 3 HERE ---
            console.log("Product search term:", productName);
            console.log("Found matching Product IDs:", matchingProductIds);

            if (matchingProductIds.length > 0) {
                // Add a condition to the query to find orders where any item's productId is in the list
                query['items.productId'] = { $in: matchingProductIds };
            } else {
                // If no products match the given productName, then no orders will match either.
                // Return an empty array immediately.
                console.log("No matching product IDs found for the product name filter.");
                return res.status(200).json({ message: "No orders found matching the product name.", orders: [], totalOrders: 0 });
            }
        }

        // 4. General Search Term (Order ID, User's username/email, Shipping Address)
        if (searchTerm) {
            const searchConditions = [];

            // Attempt to search by Order ID if the searchTerm looks like a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(searchTerm)) {
                searchConditions.push({ _id: new mongoose.Types.ObjectId(searchTerm) });
            }

            // Search by Shipping Address (case-insensitive regex)
            searchConditions.push({ shippingAddress: { $regex: searchTerm, $options: 'i' } });

            // Search by User's username or email
            const matchingUsers = await User.find({
                $or: [
                    { username: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } }
                ]
            }).select('_id');

            if (matchingUsers.length > 0) {
                const matchingUserIds = matchingUsers.map(user => user._id);
                searchConditions.push({ userId: { $in: matchingUserIds } });
            }

            if (searchConditions.length > 0) {
                if (Object.keys(query).length > 0) {
                    query = { ...query, $and: [{ $or: searchConditions }] };
                } else {
                    query = { $or: searchConditions };
                }
            } else {
                console.log("No search conditions matched for the general search term.");
                return res.status(200).json({ message: "No orders found for the search term.", orders: [], totalOrders: 0 });
            }
        }

        // --- ADD STATEMENT 4 HERE (Before countDocuments and find) ---
        console.log("------------------------------------------");
        console.log("Final Mongoose query object (used for count and find):", JSON.stringify(query, null, 2));
        console.log("------------------------------------------");

        // Get the total count of orders matching ALL filters BEFORE pagination
        const totalOrders = await Order.countDocuments(query);
        // --- ADD STATEMENT 5 HERE ---
        console.log("Total orders found with criteria (before pagination):", totalOrders);

        // Pagination calculations
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Sorting options
        const sortOptions = {};
        const validSortFields = ['orderDate', 'totalAmount', 'status', '_id'];
        if (validSortFields.includes(sortBy)) {
             sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        } else {
            sortOptions.orderDate = -1;
        }

        // Fetch orders applying all conditions: filters, sorting, skipping, and limiting
        const orders = await Order.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'username email'); // Populate userId and select 'username' and 'email' fields

        // --- ADD STATEMENT 6 HERE ---
        console.log("Number of orders fetched for this page:", orders.length);

        if (!orders || orders.length === 0) {
            console.log("No orders found matching the criteria for this specific request after fetch.");
            return res.status(200).json({ message: "No orders found matching the criteria.", orders: [], totalOrders: 0 });
        }

        // --- ADD STATEMENT 7 HERE (Conditional, only if orders are found) ---
        if (orders.length > 0) {
            console.log("Sample orderDate from first fetched order (DB format):", orders[0].orderDate);
        }
        console.log("Orders fetched successfully with applied filters and pagination.");
        return res.status(200).json({
            message: "Orders fetched successfully",
            orders: orders,
            totalOrders: totalOrders
        });

    } catch (error) {
        console.error("Error fetching all orders:", error);
        return res.status(500).json({ message: "Error fetching all orders", error: error.message });
    }
};
// You will also need a separate route and controller for updating order status:

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body; // New status from frontend

        // Basic validation for status
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status provided." });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true, runValidators: true } // Return the updated document, run schema validators
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found." });
        }

        console.log(`Order ${orderId} status updated to ${status}.`);
        return res.status(200).json({ message: "Order status updated successfully.", order: updatedOrder });

    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ message: "Error updating order status", error: error.message });
    }
};









export const cancelOrderItem = async (req, res) => {
    try {
        const { id } = req.params; // Order ID
        const { productId } = req.body; // Product ID to be removed

        // Validate input
        if (!id || !productId) {
            return res.status(400).json({ message: "Order ID and Product ID are required" });
        }

        // Find the order by ID
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Find the item to be removed
        const itemIndex = order.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in the order" });
        }

        // Adjust the totalAmount by subtracting the price of the cancelled item
        const cancelledItem = order.items[itemIndex];
        order.totalAmount -= cancelledItem.price * cancelledItem.quantity;

        // Remove the item from the items array
        order.items.splice(itemIndex, 1);

        // If all items are cancelled, update the order status to 'Cancelled'
        if (order.items.length === 0) {
            order.status = 'Cancelled';
        }

        // Save the updated order
        await order.save();

        res.status(200).json({
            message: "Product removed from order successfully",
            order,
        });
    } catch (error) {
        console.error("Error cancelling order item:", error);
        res.status(500).json({ message: "Failed to cancel order item", error: error.message });
    }
};








export const getOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from the request parameters

        // Find the order by ID
        const order = await Order.findById(id).select("status");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ orderStatus: order.status });
        console.log(order.status);
        
    } catch (error) {
        console.error("Error fetching order status:", error);
        res.status(500).json({ message: "Failed to fetch order status", error: error.message });
    }
};
