import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './WishList.css';
import { WishListContext } from '../../../Context/WishListContext';


const Wishlist = ({ wishlist }) => {
  const { removeFromWishlist } = useContext(WishListContext);
  const handleRemoveFromWishlist = (itemId) => {
    // Call the removeFromWishlist function passed as a prop
    removeFromWishlist(itemId);
  };

  return (
    <div className="wishlist">
      <h2 className="wishlist-title">Wishlist</h2>
      {wishlist && Array.isArray(wishlist) && wishlist.length > 0 ? (
        <div className="wishlist-list">
          {wishlist.map((item) => (
            <div key={item._id || item.id} className="wishlist-item-container">
              <Link
                to={`/categories/${item.category}/${item._id}`}
                className="wishlist-item-link"
              > 
                <div className="wishlist-item-main-content"> {/* New wrapper for image and description */}
                  <img
                    src={item.imageUrl || item.img}
                    alt={item.name || item.title || 'Product Image'}
                    className="wishlist-image"
                  />
                  <div className="wishlist-info"> {/* Renamed from wishlist-desc for consistency with OrderCard */}
                    <h3 className="wishlist-item-title">{item.name || item.title}</h3>
                    <p className="wishlist-item-detail"> {/* Consistent class name */}
                      <strong>Category:</strong> {item.category}
                    </p>
                    <p className="wishlist-item-detail"> {/* Consistent class name */}
                      <strong>Price:</strong> <span className="wishlist-item-price">₹{item.newPrice}</span>
                      {item.prevPrice && (
                        <span className="wishlist-item-price-strike">
                          &nbsp;&nbsp;<strike>₹{item.prevPrice}</strike>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
              <div className="wishlist-item-buttons"> {/* New wrapper for buttons (if multiple were desired) */}
                <button
                  className="wishlist-remove-button"
                  onClick={() => handleRemoveFromWishlist(item._id || item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="wishlist-empty">
          <p>Your wishlist is empty.</p>
        </div>
      )}
    </div>
  );
};

export default Wishlist;