// import React, { useState, useEffect, useContext } from 'react';
// import './OrderCard.css';
// import axios from 'axios';
// import Modal from 'react-modal'; // Import React Modal
// import { AuthContext } from '../../../Context/AuthContext';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

// // Set the root element for accessibility for React Modal.
// // This is typically the 'div' with id="root" in your public/index.html.
// Modal.setAppElement('#root');

// const OrderCard = ({ order, productId, price, title, onOrderCancel }) => {
//   // Destructure userName from AuthContext
//   const { userName } = useContext(AuthContext);
//   // Get authentication token from localStorage
//   const token = localStorage.getItem('token');

//   // State to store the product image URL for this order item
//   const [orderImg, setOrderImg] = useState('');
//   // State to control the visibility of the review modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   // State for the rating given by the user
//   const [rating, setRating] = useState(0);
//   // State for the review text entered by the user
//   const [review, setReview] = useState('');
//   // State to track the overall status of the order this item belongs to
//   const [orderStatus, setOrderStatus] = useState(order.status || ''); // Initialize with prop status
//   // State to control the disabled state of the cancel button
//   const [isCancelDisabled, setIsCancelDisabled] = useState(false);

//   // useEffect hook to fetch product image and determine initial cancel button state
//   useEffect(() => {
//     // Function to fetch the image URL for the product
//     const fetchImageUrl = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_BACKEND_URL}/api/products/getProductImage/${productId}`,
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         if (response.data && response.data.imageUrl) {
//           setOrderImg(response.data.imageUrl);
//         }
//       } catch (err) {
//         console.error('Error fetching image URL:', err);
//         // Optionally set a placeholder image or handle error visually
//       }
//     };

//     // Logic to set order status and disable cancel button based on order's status
//     // The 'order' prop passed to OrderCard is assumed to be the full order object,
//     // which contains the 'status' field for the entire order.
//     if (order && order.status) {
//       setOrderStatus(order.status); // Set status from the prop
//       // Disable cancel button if status is 'cancelled', 'refunded', or 'delivered'
//       if (['Cancelled', 'Refunded', 'Delivered'].includes(order.status)) { // Using capitalized status values from schema
//         setIsCancelDisabled(true);
//       } else {
//         setIsCancelDisabled(false); // Ensure it's enabled if not in these states
//       }
//     } else if (order && order._id) {
//         // Fallback: If 'order.status' is not immediately available,
//         // fetch it from the backend using the order ID.
//         // This scenario is less likely if parent component always provides full order,
//         // but it adds robustness.
//         const fetchOrderStatusFromBackend = async () => {
//             try {
//                 const response = await axios.get(
//                     `${process.env.REACT_APP_BACKEND_URL}/api/orders/status/${order._id}`,
//                     {
//                         headers: {
//                             'Content-Type': 'application/json',
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );
//                 if (response.data && response.data.orderStatus) {
//                     const fetchedStatus = response.data.orderStatus;
//                     setOrderStatus(fetchedStatus);
//                     if (['Cancelled', 'Refunded', 'Delivered'].includes(fetchedStatus)) {
//                         setIsCancelDisabled(true);
//                     } else {
//                         setIsCancelDisabled(false);
//                     }
//                 }
//             } catch (error) {
//                 console.error('Error fetching order status from backend:', error);
//             }
//         };
//         fetchOrderStatusFromBackend();
//     }

//     // Call fetchImageUrl on component mount or when productId/token changes
//     if (productId && token) {
//       fetchImageUrl();
//     }
//   }, [productId, token, order]); // Add 'order' to dependencies to react to changes in order prop

//   // Handler for cancelling a specific item within an order
//   const handleCancelOrderItem = async (pId) => {
//     // You might want to add a confirmation dialog here instead of window.confirm
//     // For example, a custom modal or toast.
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BACKEND_URL}/api/orders/cancel-item/${order.id}`, // Use order._id here
//         { productId: pId }, // Pass the productId to the backend
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         toast.success('Product removed from order successfully!');
//         // Optionally update the order status for this item if your backend tracks it per item
//         // setOrderStatus('Cancelled'); // If your backend logic cancels the item not the whole order
//         // setIsCancelDisabled(true); // If your backend marks only this item as un-cancellable

//         // Notify the parent component (e.g., UserProfile) to update its list of orders
//         // This is crucial if the total amount or items list needs re-rendering after cancel.
//         if (onOrderCancel) {
//           onOrderCancel(order.id, pId);
//         }
//       } else {
//         toast.error(response.data.message || 'Failed to cancel product.');
//       }
//     } catch (error) {
//       console.error('Error cancelling order item:', error);
//       toast.error(error.response?.data?.message || 'Failed to cancel product. Please try again.');
//     }
//   };

//   // Handler for star clicks in the review modal
//   const handleStarClick = (starValue) => {
//     setRating(starValue);
//   };

//   // Handler for submitting the review
//   const handleReviewSubmit = async () => {
//     // --- New Functionality: Conditionally allow review submission ---
//     if (!['Delivered', 'Refunded'].includes(orderStatus)) { // Using capitalized status values from schema
//       toast.error('You can only review products from delivered or refunded orders.');
//       return; // Prevent API call if status is not appropriate
//     }
//     // --- End New Functionality ---

//     if (rating === 0) {
//         toast.error('Please select a rating before submitting.');
//         return;
//     }
//     if (!review.trim()) {
//         toast.error('Please write a review before submitting.');
//         return;
//     }

//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BACKEND_URL}/api/users/reviews/add/${productId}`,
//         {
//           userName, // User's username (or ID) for the review
//           rating,
//           review,
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.status === 200 || response.status === 201) { // Accept 200 or 201 for success
//         toast.success('Review submitted successfully!');
//         setIsModalOpen(false); // Close modal on success
//         setRating(0); // Reset rating
//         setReview(''); // Reset review text
//       } else {
//         toast.error(response.data.message || 'Failed to submit review.');
//       }
//     } catch (error) {
//       console.error('Error submitting review:', error);
//       toast.error(error.response?.data?.message || 'Error submitting review.');
//     }
//   };

//   // Safely format the order date (from the main order object, not individual item)
//   const orderDate = order && order.date ? new Date(order.date) : null;
//   const formattedDate =
//     orderDate instanceof Date && !isNaN(orderDate)
//       ? orderDate.toLocaleDateString()
//       : 'N/A'; // Changed to 'N/A' for clarity if date is invalid

//   return (
//     <div className="order-card-container">
//       <div className="order-card-main-content">
//         {/* Display product image if available, otherwise a placeholder */}
//         {orderImg ? (
//           <img src={orderImg} alt={title} className="order-card-image" />
//         ) : (
//           <div className="order-card-image-placeholder">No Image</div>
//         )}
//         <div className="order-card-info">
//           <h3 className="order-card-title">{title}</h3>
//           <p className="order-card-detail">
//             <strong>Date:</strong> {formattedDate}
//           </p>
//           <p className="order-card-detail">
//             <strong>Price:</strong> ₹{price ? price.toFixed(2) : '0.00'}
//           </p>
//           <p className="order-card-detail">
//             <strong>Status:</strong> {orderStatus}
//           </p>
//         </div>
//       </div>

//       <div className="order-card-buttons">
//         <button
//           className="order-card-cancel-button"
//           onClick={() => handleCancelOrderItem(productId)} // Pass productId to handler
//           disabled={isCancelDisabled}
//         >
//           {/* Dynamically display button text based on orderStatus */}
//           {orderStatus === 'Cancelled'
//             ? 'Cancelled'
//             : orderStatus === 'Refunded'
//             ? 'Refunded'
//             : orderStatus === 'Delivered'
//             ? 'Delivered'
//             : 'Cancel Order'}
//         </button>
//         <button className="order-card-review-button" onClick={() => setIsModalOpen(true)}>
//           Review
//         </button>
//       </div>

//       {/* React Modal for Review */}
//       <Modal
//         isOpen={isModalOpen}
//         onRequestClose={() => setIsModalOpen(false)}
//         className="order-card-modal"
//         overlayClassName="order-card-modal-overlay"
//       >
//         <h4 className="order-card-modal-title">Leave a Review for {title}</h4>
//         <div className="order-card-rating-stars">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <span
//               key={star}
//               className={`order-card-star ${star <= rating ? 'order-card-star-selected' : ''}`}
//               onClick={() => handleStarClick(star)}
//             >
//               ★
//             </span>
//           ))}
//         </div>
//         <textarea
//           value={review}
//           onChange={(e) => setReview(e.target.value)}
//           placeholder="Write your review here..."
//           className="order-card-review-textarea"
//           rows="4" // Added rows for better textarea appearance
//         />
//         <div className="order-card-modal-buttons">
//           <button className="order-card-post-button" onClick={handleReviewSubmit}>
//             Post Review
//           </button>
//           <button className="order-card-cancel-button modal-button" onClick={() => setIsModalOpen(false)}>
//             Cancel
//           </button>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default OrderCard;







import React, { useState, useEffect, useContext } from 'react';
import './OrderCard.css'; // Make sure this CSS file exists
import axios from 'axios';
import Modal from 'react-modal'; // Import React Modal
import { AuthContext } from '../../../Context/AuthContext'; // Adjust path if needed
import { toast } from 'react-toastify'; // For notifications
import 'react-toastify/dist/ReactToastify.css'; // Toastify CSS
 
// Set the root element for accessibility for React Modal
Modal.setAppElement('#root');
 
const OrderCard = ({ order, productId, price, title, onOrderCancel }) => {
    const { userName } = useContext(AuthContext); // Assuming userName is used for reviews
    const token = localStorage.getItem('token'); // Get auth token from localStorage
 
    // Component states
    const [orderImg, setOrderImg] = useState('');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // State for review modal
    const [rating, setRating] = useState(0); // State for review rating
    const [review, setReview] = useState(''); // State for review text
    const [orderStatus, setOrderStatus] = useState(''); // Current order status
    const [isCancelDisabled, setIsCancelDisabled] = useState(false); // Disable cancel button based on status
    const [isReturnDisabled, setIsReturnDisabled] = useState(false); // Disable return button based on status
 
    // Effect to fetch product image and order status
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
 
        // Prioritize order status from props if available and up-to-date
        // Otherwise, fetch it from the API
        if (order && order.status) {
            setOrderStatus(order.status);
            // Disable cancel if status is final or cannot be cancelled
            if (['cancelled', 'refunded', 'delivered', 'returned & refunded', 'return requested'].includes(order.status.toLowerCase())) {
                setIsCancelDisabled(true);
            } else {
                setIsCancelDisabled(false);
            }
            // Disable return if not delivered or already returned/requested return
            if (order.status.toLowerCase() !== 'delivered' || ['returned & refunded', 'return requested'].includes(order.status.toLowerCase())) {
                setIsReturnDisabled(true);
            } else {
                setIsReturnDisabled(false);
            }
        } else {
            // Fallback to fetch status if not directly available or needs refresh
            const fetchOrderStatus = async () => {
                try {
                    // Ensure order._id is available before making the call
                    if (order && order._id) {
                        const response = await axios.get(
                            `${process.env.REACT_APP_BACKEND_URL}/api/orders/status/${order._id}`,
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                        if (response.data && response.data.orderStatus) {
                            setOrderStatus(response.data.orderStatus);
                            if (['delivered', 'cancelled', 'refunded', 'returned & refunded', 'requested return'].includes(response.data.orderStatus.toLowerCase())) {
                                setIsCancelDisabled(true);
                            } else {
                                setIsCancelDisabled(false);
                            }
                            if (response.data.orderStatus.toLowerCase() !== 'delivered' || ['returned & refunded', 'requested return'].includes(response.data.orderStatus.toLowerCase())) {
                                setIsReturnDisabled(true);
                            } else {
                                setIsReturnDisabled(false);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching order status:', error);
                }
            };
            fetchOrderStatus();
        }
 
        fetchImageUrl();
    }, [productId, token, order]); // Re-run if productId, token, or order object changes
 
    // Handler for cancelling an order item
    const handleCancelOrderItem = async () => {
        // Prevent cancellation if disabled
        if (isCancelDisabled) {
            toast.info('This order cannot be cancelled as it is already ' + orderStatus + '.');
            return;
        }
 
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/orders/cancel-item/${order.id}`, // Use order._id here
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
                setOrderStatus('Cancelled'); // Immediately update UI status
                setIsCancelDisabled(true); // Disable button
                if (onOrderCancel) {
                    onOrderCancel(order.id, productId); // Notify parent component
                }
            }
        } catch (error) {
            console.error('Error cancelling order item:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel product. Please try again.');
        }
    };
 
    // Handler for initiating a return request
    const handleReturnRequest = async () => {
        if (isReturnDisabled) {
            toast.info('This order cannot be returned.');
            return;
        }
 
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/orders/request-return/${order.id}`,
                { productId },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
 
            if (response.status === 200) {
                toast.success('Return request submitted!');
                setOrderStatus('Requested Return'); // Update UI status
                setIsReturnDisabled(true); // Disable button
                setIsCancelDisabled(true); // Also disable cancel once return is requested
            }
        } catch (error) {
            console.error('Error requesting return:', error);
            toast.error(error.response?.data?.message || 'Failed to request return. Please try again.');
        }
    };
 
    // Handler for rating stars in review modal
    const handleStarClick = (starValue) => {
        setRating(starValue);
    };
 
    // Handler for submitting a product review
    const handleReviewSubmit = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/users/reviews/add/${productId}`, // Endpoint for adding reviews
                { userName, rating, review }, // Data to send
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
 
            if (response.status === 200) {
                toast.success('Review submitted successfully!');
                setIsReviewModalOpen(false); // Close modal
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
 
    // Safely format the order date
    const orderDate = order && order.date ? new Date(order.date) : null; // Use order.orderDate
    const formattedDate = orderDate instanceof Date && !isNaN(orderDate) ? orderDate.toLocaleDateString() : 'Invalid Date';
    return (
        <div className="order-card-container">
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
 
            <div className="order-card-buttons">
                {/* Conditionally render the "Return" button if status is 'delivered' */}
                {orderStatus.toLowerCase() === 'delivered' && (
                    <button
                        className="order-card-return-button"
                        onClick={handleReturnRequest}
                        disabled={isReturnDisabled}
                    >
                        Return
                    </button>
                )}
 
                {/* Cancel Order Button */}
                <button
                    className="order-card-cancel-button"
                    onClick={handleCancelOrderItem}
                    disabled={isCancelDisabled}
                >
                    {/* Display status text on the button if cancelled/refunded/delivered/requested return */}
                    {['cancelled', 'returned & refunded', 'delivered', 'requested return'].includes(orderStatus.toLowerCase())
                        ? orderStatus : 'Cancel Order'}
                </button>
 
                {/* Review Button */}
                <button
                    className="order-card-review-button"
                    onClick={() => setIsReviewModalOpen(true)}
                    // Only allow review if the order is delivered
                    disabled={orderStatus.toLowerCase() !== 'delivered'}
                >
                    Review
                </button>
            </div>
 
            {/* React Modal for Product Review */}
            <Modal
                isOpen={isReviewModalOpen}
                onRequestClose={() => setIsReviewModalOpen(false)}
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
                    <button className="order-card-cancel-button modal-button" onClick={() => setIsReviewModalOpen(false)}>
                        Cancel
                    </button>
                </div>
            </Modal>
        </div>
    );
};
 
export default OrderCard;
 