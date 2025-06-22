import React, { useState, useEffect } from 'react';
import './OrderList.css';
import OrderCard from '../OrderCard/OrderCard';
import axios from 'axios';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/orders/getOrders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data.orders || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Error fetching orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  const handleOrderCancel = (orderId, productId) => {
    console.log('Order Cancel Callback Triggered:', { orderId, productId });
    setOrders((prevOrders) =>
      prevOrders
        .map((order) =>
          order.id === orderId
            ? {
                ...order,
                items: order.items.filter((item) => item.productId !== productId),
              }
            : order
        )
        .filter((order) => order.items.length > 0) // Remove orders with no items left
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
          order.items.map((item) => (
            <OrderCard
              key={item.productId}
              order={order} // Pass the entire order object
              productId={item.productId}
              price={item.price}
              title={item.title}
              onOrderCancel={handleOrderCancel} // Pass the callback function}
            />
          ))
        )
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
};

export default OrderList;