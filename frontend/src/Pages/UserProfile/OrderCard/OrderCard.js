import React, { useState, useEffect, useContext } from 'react';
import './OrderCard.css';
import axios from 'axios';
import Modal from 'react-modal'; // Import React Modal
import { AuthContext } from '../../../Context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

Modal.setAppElement('#root'); // Set the root element for accessibility

const OrderCard = ({ order, productId, price, title, onOrderCancel }) => {
  const { userName } = useContext(AuthContext);
  const token = localStorage.getItem('token');
  const [orderImg, setOrderImg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal state
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [orderStatus, setOrderStatus] = useState(''); // Track order status
  const [isCancelDisabled, setIsCancelDisabled] = useState(false); // Track cancel button state

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/products/getProductImage/${productId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data && response.data.imageUrl) {
          setOrderImg(response.data.imageUrl);
        }
      } catch (err) {
        console.error('Error fetching image URL:', err);
      }
    };

    // Use order.status directly from props as it seems to be available.
    // If a dedicated API call is needed to *refresh* status, keep fetchOrderStatus.
    // For now, I'm simplifying based on the screenshot showing status within the card.
    if (order && order.status) {
      setOrderStatus(order.status);
      if (['cancelled', 'refunded', 'delivered'].includes(order.status)) { // Check for delivered too
        setIsCancelDisabled(true);
      }
    } else {
        // Fallback for older orders or if status isn't immediately available
        const fetchOrderStatus = async () => {
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_BACKEND_URL}/api/orders/status/${order._id}`, // Use order._id for API call
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.data && response.data.orderStatus) {
              setOrderStatus(response.data.orderStatus);
              if (['delivered', 'cancelled', 'refunded'].includes(response.data.orderStatus)) {
                setIsCancelDisabled(true);
              }
            }
          } catch (error) {
            console.error('Error fetching order status:', error);
          }
        };
        fetchOrderStatus();
    }


    fetchImageUrl();
  }, [productId, token, order]); // Added order to dependencies

  // const handleCancelOrder = async () => {
  //   if (window.confirm('Are you sure you want to cancel this order?')) {
  //     try {
  //       const response = await axios.post(
  //         `${process.env.REACT_APP_BACKEND_URL}/api/orders/cancel-item/${order.id}`,
  //         {
  //           orderId: order.id,
  //           productId: productId,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       if (response.data.success) {
  //         setOrderStatus('cancelled');
  //         setIsCancelDisabled(true);
  //         toast.success('Order item cancelled successfully!');
  //         onOrderCancel(order.id, productId); // Call callback to update parent state
  //         console.log(`${order.id} Order item cancelled successfully!`)
  //       } else {
  //         toast.error(response.data.message || 'Failed to cancel order item.');
  //       }
  //     } catch (err) {
  //       console.error('Error cancelling order:', err);
  //       toast.error(err.response?.data?.message || 'Error cancelling order item.');
  //     }
  //   }
  // };

  const handleCancelOrderItem = async (productId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/orders/cancel-item/${order.id}`,
        { productId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
 
      if (response.status === 200) {
        toast.success('Product removed from order successfully!');
        if (onOrderCancel) {
          onOrderCancel(order.id, productId); // Notify the parent component to remove the order
        }
      }
    } catch (error) {
      console.error('Error cancelling order item:', error);
      toast.error('Failed to cancel product. Please try again.');
    }
  };
  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleReviewSubmit = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/reviews/add/${productId}`, // Assuming this is the correct endpoint for adding reviews
        {
          userName, rating, review
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setIsModalOpen(false); // Close modal on success
        setRating(0); // Reset rating
        setReview(''); // Reset review text
      } else {
        toast.error(response.data.message || 'Failed to submit review.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Error submitting review.');
    }
  };

  // Safely format the date
  const orderDate = order && order.date ? new Date(order.date) : null; // Use order.orderDate
  const formattedDate = orderDate instanceof Date && !isNaN(orderDate) ? orderDate.toLocaleDateString() : 'Invalid Date';


  return (
    <div className="order-card-container">
      {/* New wrapper div for image and info */}
      <div className="order-card-main-content">
        {orderImg && (
          <img src={orderImg} alt={title} className="order-card-image" />
        )}
        <div className="order-card-info">
          <h3 className="order-card-title">{title}</h3>
          <p className="order-card-detail">
            <strong>Date:</strong> {formattedDate}
          </p>
          <p className="order-card-detail">
            <strong>Price:</strong> ₹{price}
          </p>
          <p className="order-card-detail">
            <strong>Status:</strong> {orderStatus}
          </p>
        </div>
      </div>

      <div className="order-card-buttons"> {/* New wrapper for buttons */}
        <button
          className="order-card-cancel-button"
          onClick={()=>handleCancelOrderItem(productId)}
          disabled={isCancelDisabled}
        >
          {orderStatus === 'cancelled'
            ? 'Cancelled'
            : orderStatus === 'refunded'
            ? 'Refunded'
            : orderStatus === 'delivered' // Added delivered check here
            ? 'Delivered'
            : 'Cancel Order'}
        </button>
        <button className="order-card-review-button" onClick={() => setIsModalOpen(true)}>
          Review
        </button>
      </div>

      {/* React Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="order-card-modal"
        overlayClassName="order-card-modal-overlay"
      >
        <h4 className="order-card-modal-title">Leave a Review</h4>
        <div className="order-card-rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`order-card-star ${star <= rating ? 'order-card-star-selected' : ''}`}
              onClick={() => handleStarClick(star)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review here..."
          className="order-card-review-textarea"
        />
        <div className="order-card-modal-buttons">
          <button className="order-card-post-button" onClick={handleReviewSubmit}>
            Post
          </button>
          <button className="order-card-cancel-button modal-button" onClick={() => setIsModalOpen(false)}> {/* Added modal-button class */}
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderCard;