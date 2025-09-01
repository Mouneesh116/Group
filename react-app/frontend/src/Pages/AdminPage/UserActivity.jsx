import React, { useEffect, useState } from 'react';
import './UserActivity.css';
import axios from 'axios';

const UserActivity = () => {
  const [usersActivity, setUsersActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const fetchAllUsersActivity = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `http://localhost:8080/api/users/activity`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsersActivity(response.data);
      } catch (error) {
        console.error('Error fetching all users activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsersActivity();
  }, []);

  const handleUserSelection = (event) => {
    setSelectedUserId(event.target.value);
  };

  const filteredUsers = selectedUserId
    ? usersActivity.filter((user) => user.userId === selectedUserId)
    : usersActivity;

  if (loading) {
    return <div className="user-activity-loading">Loading all users' activity...</div>;
  }

  return (
    <div className="user-activity-container">
      <h2 className="user-activity-title">All Users' Activity</h2>

      <div className="user-activity-selection">
        <label htmlFor="user-activity-select" className="user-activity-label">Select a User:</label>
        <select
          id="user-activity-select"
          value={selectedUserId || ''}
          onChange={handleUserSelection}
          className="user-activity-select"
        >
          <option value="">All Users</option>
          {usersActivity.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <div key={user.userId} className="user-activity-card">
            <h3 className="user-activity-section-title">User: {user.name}</h3>
            <p className="user-activity-text"><strong>Email:</strong> {user.email}</p>
            <p className="user-activity-text"><strong>Account Created At:</strong> {new Date(user.createdAt).toLocaleString()}</p>

            <div className="user-activity-recent-searches">
              <h4 className="user-activity-subtitle">Recent Searches</h4>
              {user.recentSearches.length > 0 ? (
                <ul className="user-activity-list">
                  {user.recentSearches.map((search, index) => (
                    <li key={index} className="user-activity-list-item">{search}</li>
                  ))}
                </ul>
              ) : (
                <p className="user-activity-text">No recent searches found.</p>
              )}
            </div>

            <div className="user-activity-purchased-products">
              <h4 className="user-activity-subtitle">Purchased Products</h4>
              {user.purchasedProducts.length > 0 ? (
                <ul className="user-activity-list">
                  {user.purchasedProducts.map((product) => (
                    <li key={product._id} className="user-activity-list-item">
                      <img src={product.img} alt={product.title} className="user-activity-image" />
                      <p className="user-activity-text">{product.title}</p>
                      <p className="user-activity-text">Price: ₹{product.price}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="user-activity-text">No purchased products found.</p>
              )}
            </div>

            <div className="user-activity-cart-products">
              <h4 className="user-activity-subtitle">Products in Cart</h4>
              {user.cartProducts.length > 0 ? (
                <ul className="user-activity-list">
                  {user.cartProducts.map((product) => (
                    <li key={product._id} className="user-activity-list-item">
                      <img src={product.img} alt={product.title} className="user-activity-image" />
                      <p className="user-activity-text">{product.title}</p>
                      <p className="user-activity-text">Price: ₹{product.price}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="user-activity-text">No products in cart.</p>
              )}
            </div>

            <div className="user-activity-wishlist-products">
              <h4 className="user-activity-subtitle">Products in Wishlist</h4>
              {user.wishlistProducts.length > 0 ? (
                <ul className="user-activity-list">
                  {user.wishlistProducts.map((product) => (
                    <li key={product._id} className="user-activity-list-item">
                      <img src={product.img} alt={product.title} className="user-activity-image" />
                      <p className="user-activity-text">{product.title}</p>
                      <p className="user-activity-text">Price: ₹{product.price}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="user-activity-text">No products in wishlist.</p>
              )}
            </div>

            <div className="user-activity-reviews">
              <h4 className="user-activity-subtitle">Reviews Submitted</h4>
              {user.reviews.length > 0 ? (
                <ul className="user-activity-list">
                  {user.reviews.map((review) => (
                    <li key={review._id} className="user-activity-list-item">
                      <p className="user-activity-text"><strong>Product:</strong> {review.productTitle}</p>
                      <p className="user-activity-text"><strong>Rating:</strong> {review.rating} ★</p>
                      <p className="user-activity-text"><strong>Review:</strong> {review.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="user-activity-text">No reviews submitted.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="user-activity-text">No user activity found.</p>
      )}
    </div>
  );
};

export default UserActivity;