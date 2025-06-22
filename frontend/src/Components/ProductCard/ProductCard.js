import React from "react";
import "./ProductCard.css"; // Make sure this path is correct
import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom"; // Ensure Link is imported if it's used

const ProductCard = ({
  image,
  title,
  company,
  prevPrice,
  newPrice,
  reviews,
  color,
  star,
  id,
  category,
}) => {
  // Helper for image error (from DisplayCard, good to have)
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/150x150/cccccc/000000?text=No+Image';
  };

  return (
    <div className="productcard-main-wrapper"> {/* Added a wrapper for potential external spacing needs */}
      <div className="productcard-container">
        <div className="productcard-image-div">
          <img src={image} alt={title} className="productcard-image" onError={handleImageError} />
        </div>
        <div className="productcard-text-div">
          <div className="productcard-text-title-div">
            {/* <Link to={`/categories/${category}/${id}`} className="productcard-title-link">  */}
              <span className="productcard-title">{title}</span>
            {/* </Link> */}
            <span className="productcard-brand-model">{company}</span>
          </div>
          <div className="productcard-price-section">
            <span className="productcard-current-price">₹{newPrice}</span>
            <del className="productcard-prev-price">₹{prevPrice}</del>
            <FaShoppingCart className="productcard-cart-icon" />
          </div>
          <div className="productcard-reviews-section">
            <div className="productcard-star-div">
              {star} {star} {star} {star} {/* Assuming 'star' prop is a single star icon/component */}
            </div>
            <span className="productcard-total-reviews">{reviews} reviews</span> {/* Added 'reviews' text */}
          </div>
          {prevPrice && newPrice && parseFloat(prevPrice) > parseFloat(newPrice) && ( // Conditional rendering for offers
            <div className="productcard-offers-div">
              <span>
                {Math.round(((prevPrice - newPrice) / prevPrice) * 100)}% Off on{" "}
                {company} Products
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;