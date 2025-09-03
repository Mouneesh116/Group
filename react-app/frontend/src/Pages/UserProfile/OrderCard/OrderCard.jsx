import React, { useState, useEffect, useContext } from 'react';
import './OrderCard.css';
import axios from 'axios';
import Modal from 'react-modal';
import { AuthContext } from '../../../Context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Accessibility for React Modal
Modal.setAppElement('#root');

const OrderCard = ({ order, productId, price, title, onOrderChange, quantity, initialItemStatus }) => {
  const { userName } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  const [orderImg, setOrderImg] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [orderStatus, setOrderStatus] = useState(initialItemStatus);
  const [isCancelDisabled, setIsCancelDisabled] = useState(false);
  const [isReturnDisabled, setIsReturnDisabled] = useState(false);

  // Fetch product image & set button states
  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/products/getProductImage/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data?.imageUrl) {
          setOrderImg(response.data.imageUrl);
        }
      } catch (err) {
        console.error('Error fetching image URL:', err);
      }
    };

    // Disable buttons based on status
    if (['cancelled', 'refunded', 'delivered', 'returned & refunded', 'return requested'].includes(orderStatus.toLowerCase())) {
      setIsCancelDisabled(true);
    } else {
      setIsCancelDisabled(false);
    }

    if (orderStatus.toLowerCase() !== 'delivered' || ['returned & refunded', 'return requested'].includes(orderStatus.toLowerCase())) {
      setIsReturnDisabled(true);
    } else {
      setIsReturnDisabled(false);
    }

    fetchImageUrl();
  }, [productId, token, orderStatus]);

  // Cancel order item
  const handleCancelOrderItem = async () => {
    if (isCancelDisabled) {
      toast.info(`This order cannot be cancelled (Status: ${orderStatus}).`);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/orders/cancel-item/${order.id}`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success('Product cancelled successfully!');
        setOrderStatus('Cancelled');
        setIsCancelDisabled(true);

        if (onOrderChange) {
          onOrderChange(order.id, productId, 'Cancelled');
        }
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order.');
    }
  };

  // Request return
  const handleReturnRequest = async () => {
    if (isReturnDisabled) {
      toast.info('This product cannot be returned.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/orders/request-return/${order.id}`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success('Return request submitted!');
        setOrderStatus('Return Requested');
        setIsReturnDisabled(true);
        setIsCancelDisabled(true);

        if (onOrderChange) {
          onOrderChange(order.id, productId, 'Return Requested');
        }
      }
    } catch (error) {
      console.error('Error requesting return:', error);
      toast.error(error.response?.data?.message || 'Failed to request return.');
    }
  };

  // Submit review
  const handleReviewSubmit = async () => {
    if (rating === 0 || !review.trim()) {
      toast.error('Please provide both rating and review.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/users/reviews/add/${productId}`,
        { userName, rating, review },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success('Review submitted successfully!');
        setIsReviewModalOpen(false);
        setRating(0);
        setReview('');
      } else {
        toast.error(response.data.message || 'Failed to submit review.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Error submitting review.');
    }
  };

  // Format date
  const orderDate = order?.date ? new Date(order.date) : null;
  const formattedDate = orderDate && !isNaN(orderDate) ? orderDate.toLocaleDateString() : 'N/A';

  return (
    <div className="order-card-container">
      <div className="order-card-main-content">
        {orderImg ? (
          <img src={orderImg} alt={title} className="order-card-image" />
        ) : (
          <div className="order-card-image-placeholder">No Image</div>
        )}

        <div className="order-card-info">
          <h3 className="order-card-title">{title}</h3>
          <p><strong>Date:</strong> {formattedDate}</p>
          <p><strong>Price:</strong> ₹{price}</p>
          <p><strong>Quantity:</strong> {quantity}</p>
          <p><strong>Status:</strong> {orderStatus}</p>
          <p><strong>Total Price:</strong> ₹{price * quantity}</p>
        </div>
      </div>

      <div className="order-card-buttons">
        {orderStatus.toLowerCase() === 'delivered' && (
          <button
            className="order-card-return-button"
            onClick={handleReturnRequest}
            disabled={isReturnDisabled}
          >
            Return
          </button>
        )}

        <button
          className="order-card-cancel-button"
          onClick={handleCancelOrderItem}
          disabled={isCancelDisabled}
        >
          {['cancelled', 'returned & refunded', 'delivered', 'return requested'].includes(orderStatus.toLowerCase())
            ? orderStatus
            : 'Cancel Order'}
        </button>

        <button
          className="order-card-review-button"
          onClick={() => setIsReviewModalOpen(true)}
          disabled={orderStatus.toLowerCase() !== 'delivered'}
        >
          Review
        </button>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onRequestClose={() => setIsReviewModalOpen(false)}
        className="order-card-modal"
        overlayClassName="order-card-modal-overlay"
      >
        <h4 className="order-card-modal-title">Leave a Review for {title}</h4>
        <div className="order-card-rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`order-card-star ${star <= rating ? 'order-card-star-selected' : ''}`}
              onClick={() => setRating(star)}
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
            Post Review
          </button>
          <button className="order-card-cancel-button modal-button" onClick={() => setIsReviewModalOpen(false)}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderCard;
