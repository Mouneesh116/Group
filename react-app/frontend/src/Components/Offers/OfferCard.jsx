import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you might want to link the button
import './OfferCard.css';
 
const OfferCard = ({
  offerMainImage, // URL for the large image (e.g., woman with greens)
  smallText,      // e.g., "BABY KIDS"
  title,          // e.g., "Black friday"
  description,    // e.g., "Lorem ipsum..."
  buttonText,     // e.g., "SHOP NOW"
  saleBadgeText,  // e.g., "SALE 50%"
  buttonLink      // Link for the button
}) => {
  return (
    <div className="offer-card-fashi-offer-banner"> {/* Prefixed class */}
      {/* Left Section: Text Content */}
      <div className="offer-card-fashi-offer-text-content"> {/* Prefixed class */}
        {smallText && <p className="offer-card-fashi-small-text">{smallText}</p>} {/* Prefixed class */}
        <h2 className="offer-card-fashi-title">{title}</h2> {/* Prefixed class */}
        <p className="offer-card-fashi-description">{description}</p> {/* Prefixed class */}
        {buttonText && buttonLink ? (
          <Link to={buttonLink} className="offer-card-fashi-button-link"> {/* Prefixed class */}
            <button className="offer-card-fashi-button">{buttonText}</button> {/* Prefixed class */}
          </Link>
        ) : (
          buttonText && <button className="offer-card-fashi-button">{buttonText}</button>
        )}
      </div>
 
      {/* Right Section: Image and Sale Badge */}
      <div className="offer-card-fashi-offer-image-section" style={{ backgroundImage: `url(${offerMainImage})` }}> {/* Prefixed class */}
        {saleBadgeText && (
          <div className="offer-card-fashi-sale-badge"> {/* Prefixed class */}
            <span>{saleBadgeText.split(' ')[0]}</span> {/* "SALE" */}
            <span>{saleBadgeText.split(' ')[1]}</span> {/* "50%" */}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default OfferCard;
