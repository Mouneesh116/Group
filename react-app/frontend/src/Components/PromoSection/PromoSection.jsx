import React from 'react';
import './PromoSection.css'; // Make sure this path is correct
 
const PromoSection = () => {
  return (
    <section className="promosection-hero">
      <div className="promosection-overlay" />
      {/* The content is now directly within the hero, centered */}
      <div className="promosection-hero-content-overlay">
        <h1 className="promosection-hero-title">BIG SUMMER SALE</h1>
        <p className="promosection-hero-subtitle">GET UP TO 50% OFF</p>
        <button className="promosection-hero-button">START SHOPPING</button>
      </div>
    </section>
  );
};
 
export default PromoSection;
