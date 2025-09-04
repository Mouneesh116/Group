import React, { useState, useEffect } from 'react';
import './OrderList.css';
import OrderCard from '../OrderCard/OrderCard';
import axios from 'axios';
import { toast } from 'react-toastify';
 
const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/orders/getOrders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
       
        let fetchedOrders = response.data.orders || [];
 
        // Sort orders from most recent to oldest (descending order by date)
        fetchedOrders.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA; // For descending order (most recent first)
        });
        console.log('Fetched and sorted orders:', fetchedOrders);
        setOrders(fetchedOrders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Error fetching orders');
        setLoading(false);
      }
    };
 
    fetchOrders();
  }, []);
 
  // --- UPDATED handleOrderChange FUNCTION ---
  // This function now correctly receives 'newStatus' and updates the item's status in the state.
  const handleOrderChange = (orderId, productId, newStatus) => {
    console.log('Order Change Callback Triggered:', { orderId, productId, newStatus });
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        // Find the specific overall order by its 'id'
        if (order.id === orderId) {
          // Create a new array of items, updating the status of the affected item
          const updatedItems = order.items.map((item) => {
            if (item.productId === productId) {
              // Update the status of the specific item with the newStatus
              return { ...item, status: newStatus };
            }
            return item;
          });
 
          // Return the updated order with its items
          return { ...order, items: updatedItems };
        }
        return order; // Return unchanged orders
      })
    );
  };
 
  if (loading) {
    return <p>Loading orders...</p>;
  }
 
  if (error) {
    return <p>Error: {error}</p>;
  }
 
  return (
    <div className="order-list">
      {orders.length > 0 ? (
  orders.map((order) =>
    order.items.map((item, index) => {
      // ✅ Normalize product id for keys and props
      const pid = (item?.productId && typeof item.productId === 'object')
        ? item.productId._id
        : item?.productId;

      // If still falsy, create a fallback to avoid "undefined"
      const safeProductId = pid || `missing-${index}`;

      // Build a stable, unique key: orderId + productId (+ index as tie-breaker)
      const key = `${String(order.id)}-${String(safeProductId)}-${index}`;

      return (
        <OrderCard
          key={key}
          order={order}
          productId={safeProductId}
          title={item.title}
          price={item.price}
          quantity={item.quantity}
          initialItemStatus={order.status}
          imageUrl={item.image}       // ← already coming from your API
          onOrderChange={handleOrderChange}
        />
      );
    })
  )
) : (
  <p>No orders found.</p>
)}

    </div>
  );
};
 
export default OrderList;