import React from 'react';
import './DisplayCard.css'; 
import { FaStar } from "react-icons/fa";
import { VscWorkspaceTrusted } from "react-icons/vsc";

export const DisplayCard = ({ product }) => {
  const { img, title, company, subCategory, reviews, newPrice, prevPrice } = product;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/150x150/cccccc/000000?text=No+Image'; 
  };

  return (
    <div className="displaycard-main-container">
      <div className="displaycard-container">
        <div className="displaycard-row1">
          <div className="displaycard-image-wrapper">
            <img src={img} alt={title} onError={handleImageError} className="displaycard-image" />
          </div>
        </div>
        <div className="displaycard-row2">
          <div className="displaycard-description">
            <div className="displaycard-title">
              <h2>{title}</h2>
            </div>
            <div className="displaycard-review-rating">
              <div className="displaycard-review-button">
                {reviews || 'N/A'} <FaStar className="displaycard-star-icon" />
              </div>
            </div>
            <div className="displaycard-details">
              <ul>
                <li>
                  <span className="displaycard-company-assured">
                    <VscWorkspaceTrusted className="displaycard-trusted-icon" /> {company} Assured
                  </span>
                </li>
                <li>Category: <span className="displaycard-category-text">{subCategory}</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="displaycard-row3">
          <div className="displaycard-price-section">
            <div className="displaycard-current-price">
              <span className="displaycard-currency-symbol">₹</span>{newPrice}
            </div>
            {prevPrice && parseFloat(prevPrice) > parseFloat(newPrice) && (
              <>
                <del className="displaycard-prev-price">₹{prevPrice}</del>
                <div className="displaycard-discount">
                  (FLAT {Math.round(((prevPrice - newPrice) / prevPrice) * 100)}% OFF)
                </div>
              </>
            )}
          </div>
          <div className="displaycard-order-section">
            <button className="displaycard-order-button">Order Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};
