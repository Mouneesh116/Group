import React from 'react';
import './OurPolicy.css';
 
const OurPolicy = () => {
  return (
    <div className="policy-container">
      <div className="policy-item">
        <div className="policy-icon">🔄</div>
        <p className="policy-title">Easy Exchange Policy</p>
        <p className="policy-description">We offer hassle free exchange policy</p>
      </div>
      <div className="policy-item">
        <div className="policy-icon">↩️</div>
        <p className="policy-title">7 Days Return Policy</p>
        <p className="policy-description">We provide 7 days free return policy</p>
      </div>
      <div className="policy-item">
        <div className="policy-icon">📞</div>
        <p className="policy-title">Best Customer Support</p>
        <p className="policy-description">We provide 24/7 customer support</p>
      </div>
    </div>
  );
};
 
export default OurPolicy;
