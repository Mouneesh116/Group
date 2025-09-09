import OpenAI from "openai";
import Product from '../models/ProductModel.js';
import Order from '../models/OrderModel.js';
import User from '../models/UserModel.js';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_INSTRUCTION = `
You are ShopBot, a helpful and friendly e-commerce customer support assistant for "MS Trendzz".
Your primary goal is to assist users with:
1. Order Tracking
2. Displaying User's Orders
3. Abandoned Cart Recovery
4. Product Details & Reviews
5. General FAQs
6. Handover to Human Support

Rules:
- Stay on topic (orders, products, shop services).
- If outside scope, say: "I'm sorry, I can only assist with inquiries related to MyAwesomeShop's products, orders, and services. For other questions, please contact our human support team at support@myawesomeshop.com or call us at +1-800-123-4567."
- Keep responses concise & clear.
`;

export const replyChatBot = async (req, res) => {
  const { message, userId } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Please provide a message" });
  }

  try {
    let botReply = "";
    let contextData = "";
    const inputMessage = message.toLowerCase();

    // -----------------------------
    // Track Specific Order
    // -----------------------------
    if (inputMessage.includes("track order") || inputMessage.match(/order (\w+)/i)) {
      const orderIdMatch = inputMessage.match(/order\s+(\w+)/i);
      const orderId = orderIdMatch ? orderIdMatch[1] : null;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          const itemDetails = order.items.map(item =>
            `${item.title} ($${item.price})`
          ).join(", ");

          contextData = `Order Details:
- Items: ${itemDetails}
- Status: ${order.status}
- Total Amount: $${order.totalAmount}
- Ordered At: ${new Date(order.orderDate).toLocaleDateString()}
- Shipping Address: ${order.shippingAddress}`;
        } else {
          botReply = `I couldn't find an order with ID #${orderId}. Please double-check the ID or contact support.`;
        }
      } else {
        botReply = "Please provide your order ID so I can track it for you (e.g., 'Track order #12345abc').";
      }
    }

    // -----------------------------
    // My Orders (Recent Orders)
    // -----------------------------
    else if (
      inputMessage.includes("my order") ||
      inputMessage.includes("purchase history") ||
      inputMessage.includes("ordered")
    ) {
      if (userId) {
        const userOrders = await Order.find({ userId: userId })
          .sort({ orderDate: -1 })
          .limit(5);

        if (userOrders.length > 0) {
          contextData =
            `Here are your recent orders:\n` +
            userOrders
              .map(order => {
                const itemDetails = order.items
                  .map(item => `${item.title} ($${item.price})`)
                  .join(", ");
                return `
- Items: ${itemDetails}
- Status: ${order.status}
- Total: $${order.totalAmount}
- Ordered At: ${new Date(order.orderDate).toLocaleDateString()}
- Delivery Address: ${order.shippingAddress}
`;
              })
              .join("\n-----------------\n");
        } else {
          botReply = "You don't seem to have any recent orders.";
        }
      } else {
        botReply = "To view your orders, please log in to your account on our website.";
      }
    }

    // -----------------------------
    // Cart Recovery
    // -----------------------------
    else if (inputMessage.includes("my cart") || inputMessage.includes("abandoned cart")) {
      if (userId) {
        console.log("TODO: Fetch cart items here");
      } else {
        botReply = "To check your cart, please log in to your account.";
      }
    }

    // -----------------------------
    // FAQs
    // -----------------------------
    else if (inputMessage.includes("return policy")) {
      botReply = "Our return policy allows returns within 30 days of purchase for a full refund.";
    } else if (inputMessage.includes("shipping cost")) {
      botReply = "Standard shipping is free on orders over $50. Exact costs are shown at checkout.";
    } else if (inputMessage.includes("payment methods")) {
      botReply = "We accept Visa, MasterCard, Amex, Discover, PayPal, and Google Pay.";
    } else if (inputMessage.includes("hello") || message.toLowerCase() === "hi") {
      botReply = "Hello there! How can I help you today regarding MS Trendzz's products or your orders?";
    }

    // -----------------------------
    // If no direct reply → use OpenAI
    // -----------------------------
    if (!botReply) {
      let finalPrompt = `${SYSTEM_INSTRUCTION}\n\n`;
      if (contextData) {
        finalPrompt += `Relevant system data: ${contextData}\n\n`;
      }
      finalPrompt += `User's message: ${message}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: finalPrompt },
        ],
      });

      botReply = completion.choices[0].message.content;
    }

    res.status(200).json({ reply: botReply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ message: "An error occurred during chatbot response." });
  }
};
