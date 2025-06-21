import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/ProductModel.js';
import Order from '../models/OrderModel.js';
import User from '../models/UserModel.js';
import { getOrdersForUser } from './OrderController.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const SYSTEM_INSTRUCTION = `
You are ShopBot, a helpful and friendly e-commerce customer support assistant for "MyAwesomeShop".
Your primary goal is to assist users with:
1.  **Order Tracking:** Provide status updates for specific orders (requires an order ID).
2.  **Displaying User's Orders:** List recent orders for a logged-in user (requires user identification).
3.  **Abandoned Cart Recovery:** Remind users about items in their cart and encourage checkout.
4.  **Product Details & Reviews:** Offer information and summarized reviews for a specific product (requires a product ID or clear product name).
5.  **General FAQs:** Answer questions about shipping, returns, payment methods, and promotions.
6.  **Handover to Human Support:** If you cannot help, politely direct them to human support.

**IMPORTANT RULES:**
-   **Strictly stay on topic.** Do NOT answer questions about general knowledge, current events, personal opinions, coding, or any non-e-commerce related matters.
-   If a query is outside your scope, politely state: "I'm sorry, I can only assist with inquiries related to MyAwesomeShop's products, orders, and services. For other questions, please contact our human support team at support@myawesomeshop.com or call us at +1-800-123-4567."
-   Keep responses concise, clear, and directly address the user's need.
-   When providing product or order details, always refer to the specific information you are given.
-   Assume the user is interacting with the chatbot on the website, so direct them to relevant pages if possible.
`
export const replyChatBot = async (req,res) => {
    const {message, userId} = req.body;
    if(!message){
        return res.status(400).json({message: "Please provide a message"});
    }
    try {
        let botReply = "";
        let contextData ="";
        const inputMessage = message.toLowerCase();
        if(inputMessage.includes('track order') || inputMessage.match(/order (\w+)/i)){
            const orderIdMatch = inputMessage.match(/(\w+)/);
            const orderId = orderIdMatch ? orderIdMatch[1] : null;
            if(orderId){
                const order = await Order.findById(orderId);
                if(order){
                    const itemTitles = order.items.map(item => `${item.quantity}x ${item.title}`).join(', ');
                    contextData = `Order ID: ${order._id}, Status: ${order.status}, 
                    Total Amount: $${order.totalAmount}, Order Date: ${new Date(order.orderDate).toLocaleDateString()}.
                     Items: ${itemTitles}. ItemTitle: ${item.title} Shipping Address: ${order.shippingAddress}.`;
                }
                else{
                    botReply = `I couldn't find an order with ID #${orderId}. Please double-check the ID or contact support.`;
                }
                }
                else{
                    botReply = "Please provide your order ID so I can track it for you (e.g., 'Track order #12345abc').";
                }
            
        } else if(inputMessage.includes('my order') || inputMessage.includes('my purchase history') || inputMessage.includes('ordered')){
            if(userId){
                const userOrders = await Order.find({userId: userId}).sort({ orderDate: -1 }).limit(5);
                if(userOrders.length > 0){
                    contextData = `User's recent orders: ${userOrders.map(order => {
                        const itemNames = order.items.map(item => item.name).join(', ');
                        return `Order #${order._id} for ${itemNames} (Total: $${order.totalAmount}, Status: ${order.status})`;
                    }).join('; ')}.`;
                }
                else{
                    botReply = "You don't seem to have any recent orders";
                }
            } else {
                botReply = "To view your orders, please log in to your account on our website.";
            }
        } else if(inputMessage.includes('my cart') || inputMessage.includes('abandoned cart')){
            if(userId){
                console.log("My cart Items")
            }
            else{
                botReply = "To check your cart, please log in to your account.";
            }
        } else if (inputMessage.includes('return policy')) {
            botReply = "Our return policy allows returns within 30 days of purchase for a full refund. Items must be unused and in original packaging. You can find full details on our website's 'Returns & Refunds' page.";
        } else if (inputMessage.includes('shipping cost')) {
            botReply = "Shipping costs vary based on your location and the shipping method selected. Standard shipping is free on orders over $50. You can see the exact cost at checkout.";
        } else if (inputMessage.includes('payment methods')) {
            botReply = "We accept all major credit cards (Visa, MasterCard, Amex, Discover), PayPal, and Google Pay.";
        } else if (inputMessage.includes('hello') || message.toLowerCase() === 'hi') {
            botReply = "Hello there! How can I help you today regarding MyAwesomeShop's products or your orders?";
        }

        if(!botReply){
            let fullPrompt = `${SYSTEM_INSTRUCTION}\n\n`;
            if(contextData){
                fullPrompt += `Relevant data from our system: ${contextData}\n\n`;
            }
            fullPrompt += `User's message: ${message}`;
            let chatHistory = [];
            chatHistory.push({role: "user", parts : [{text: fullPrompt}]});
            const payload = { contents: chatHistory};
            const apiKey = process.env.GEMINI_API_KEY;

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl,{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                botReply = result.candidates[0].content.parts[0].text;
            } else {
                botReply = "I'm sorry, I couldn't fully understand that request. Please try rephrasing or contact our human support team.";
            }
        }
        res.status(200).json({reply: botReply})
    } catch (error) {
        console.log("error",error);
        res.status(500).json({message: "An error occured during response"});
    }
}