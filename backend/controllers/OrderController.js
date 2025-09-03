import mongoose from "mongoose";
import Order from "../models/OrderModel.js";
import User from "../models/UserModel.js";
import Product from "../models/ProductModel.js";
import { sendMail } from "../utils/MailSender.js";

//
// ✅ Create a new order
//
export const createOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount, status, shippingAddress } = req.body;

    if (
      !userId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !shippingAddress ||
      shippingAddress.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Missing required order fields (userId, items, totalAmount, shippingAddress) or invalid data format.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found. Cannot create order for a non-existent user.",
      });
    }

    const newData = {
      userId: new mongoose.Types.ObjectId(userId),
      items: items.map((item) => ({
        productId: new mongoose.Types.ObjectId(item.productId),
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        img: item.img,
      })),
      totalAmount: totalAmount,
      status: status || "Pending",
      orderDate: new Date(),
      shippingAddress,
    };

    const newDocument = await Order.create(newData);

    // send a mail (optional)
    const to = user.email;
    const subject = "Order Confirmation from E-Commerce Platform";
    const text = `Dear ${user.username}, \n\n 
      Your order has been successfully confirmed with the following order details: \n
      Order ID: ${newDocument._id} \n
      Order Date: ${newDocument.orderDate.toISOString()} \n
      Total Amount: $${newDocument.totalAmount} \n
      Status: ${newDocument.status} \n
      Shipping Address: ${newDocument.shippingAddress} \n\n
      Thank you for shopping with us! \n\n
      Best regards, \n
      E-Commerce Platform Team`;

    // await sendMail(to, subject, text);

    console.log("New order created:", newDocument);
    return res
      .status(200)
      .json({ message: "Order created successfully", order: newDocument });
  } catch (error) {
    console.error("Error creating order:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: `Validation Error: ${messages.join(", ")}` });
    }
    return res.status(500).json({
      message: "Internal server error while creating order",
      error: error.message,
    });
  }
};

//
// ✅ Get orders for a specific user
//
export const getOrdersForUser = async (req, res, next) => {
  try {
    const userId = req.user._id; // from auth middleware
    console.log("Fetching orders for user:", userId);

    const orders = await Order.find({ userId }).populate(
      "items.productId",
      "name price images"
    );

    if (!orders || orders.length === 0) {
      return res.status(200).json({ message: "No orders found", orders: [] });
    }

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      date: order.orderDate,
      totalAmount: order.totalAmount,
      status: order.status,
      items: order.items
        .filter((item) => item.productId) // ✅ skip null refs
        .map((item) => ({
          productId: item.productId._id,
          title: item.productId.name,
          quantity: item.quantity,
          price: item.price,
          image:
            item.productId.images && item.productId.images.length > 0
              ? item.productId.images[0]
              : null,
        })),
    }));

    res
      .status(200)
      .json({ message: "Orders fetched successfully", orders: formattedOrders });
  } catch (error) {
    console.error("Error in getOrdersForUser:", error);
    next(error);
  }
};

//
// ✅ Get all orders (admin, with filters, search, pagination)
//
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "orderDate",
      sortOrder = "desc",
      status,
      productName,
      dateFrom,
      dateTo,
      searchTerm,
    } = req.query;

    let query = {};

    if (status) query.status = status;

    if (dateFrom || dateTo) {
      query.orderDate = {};
      if (dateFrom) {
        query.orderDate.$gte = new Date(
          new Date(dateFrom).setUTCHours(0, 0, 0, 0)
        );
      }
      if (dateTo) {
        query.orderDate.$lte = new Date(
          new Date(dateTo).setUTCHours(23, 59, 59, 999)
        );
      }
    }

    if (productName) {
      const matchingProducts = await Product.find({
        title: { $regex: productName, $options: "i" },
      }).select("_id");

      const matchingProductIds = matchingProducts.map((p) => p._id);
      if (matchingProductIds.length > 0) {
        query["items.productId"] = { $in: matchingProductIds };
      } else {
        return res.status(200).json({
          message: "No orders found matching the product name.",
          orders: [],
          totalOrders: 0,
        });
      }
    }

    if (searchTerm) {
      const searchConditions = [];

      if (mongoose.Types.ObjectId.isValid(searchTerm)) {
        searchConditions.push({ _id: new mongoose.Types.ObjectId(searchTerm) });
      }

      searchConditions.push({
        shippingAddress: { $regex: searchTerm, $options: "i" },
      });

      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
      }).select("_id");

      if (matchingUsers.length > 0) {
        const matchingUserIds = matchingUsers.map((u) => u._id);
        searchConditions.push({ userId: { $in: matchingUserIds } });
      }

      if (searchConditions.length > 0) {
        query = { ...query, $or: searchConditions };
      }
    }

    const totalOrders = await Order.countDocuments(query);

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    const validSortFields = ["orderDate", "totalAmount", "status", "_id"];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions.orderDate = -1;
    }

    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "username email");

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
      totalOrders,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return res.status(500).json({
      message: "Error fetching all orders",
      error: error.message,
    });
  }
};

//
// ✅ Update order status (admin)
//
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Refunded",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    console.log(`Order ${orderId} status updated to ${status}.`);
    return res.status(200).json({
      message: "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
};

//
// ✅ Cancel an item in an order
//
export const cancelOrderItem = async (req, res) => {
  try {
    const { id } = req.params; // Order ID
    const { productId } = req.body;

    if (!id || !productId) {
      return res
        .status(400)
        .json({ message: "Order ID and Product ID are required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemIndex = order.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Product not found in the order" });
    }

    const cancelledItem = order.items[itemIndex];
    order.totalAmount -= cancelledItem.price * cancelledItem.quantity;
    order.items.splice(itemIndex, 1);

    if (order.items.length === 0) {
      order.status = "Cancelled";
    }

    await order.save();

    res.status(200).json({
      message: "Product removed from order successfully",
      order,
    });
  } catch (error) {
    console.error("Error cancelling order item:", error);
    res
      .status(500)
      .json({ message: "Failed to cancel order item", error: error.message });
  }
};

//
// ✅ Get single order status
//
export const getOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).select("status");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ orderStatus: order.status });
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(500).json({
      message: "Failed to fetch order status",
      error: error.message,
    });
  }
};
