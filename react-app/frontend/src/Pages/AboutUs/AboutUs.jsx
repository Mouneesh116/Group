import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHeart, faLeaf, faShippingFast, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './AboutUs.css'; // Make sure this path is correct relative to your AboutUs.js file
import Footer from '../../Components/Footer/Footer';
 
const AboutUs = () => {
    return (
        <div className="about-us-container">
            {/* Hero Section - Mimics the top banner with text overlay */}
            <section className="about-hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Discover Our Journey</h1>
                    <p className="hero-subtitle">
                        At Seamless Ecommerce, we believe in
                        bringing quality products directly to you, making sustainable shopping accessible.
                        <br />Explore our story and see what drives us.
                    </p>
                    <a href="#our-mission" className="hero-button">Learn More</a>
                </div>
            </section>
 
            {/* Our Story/Mission Section - Similar to "Quality Service For Quality Homes" section */}
            <section id="our-mission" className="about-section mission-section">
                <h2 className="section-title">Our Mission: Redefining Your Shopping Experience</h2>
                <div className="mission-cards-grid">
                    <div className="mission-card">
                        <FontAwesomeIcon icon={faStar} className="icon-large" />
                        <h3>Quality & Curated Selection</h3>
                        <p>We handpick every item, ensuring it meets our high standards for craftsmanship, durability, and style.</p>
                    </div>
                    <div className="mission-card">
                        <FontAwesomeIcon icon={faHeart} className="icon-large" />
                        <h3>Customer-Centric Approach</h3>
                        <p>Your satisfaction is our priority. We are dedicated to providing seamless service and support at every step.</p>
                    </div>
                    <div className="mission-card">
                        <FontAwesomeIcon icon={faShippingFast} className="icon-large" />
                        <h3>Fast & Reliable Delivery</h3>
                        <p>We strive to get your favorite products to your doorstep quickly and efficiently, every single time.</p>
                    </div>
                </div>
            </section>
 
         
            <section className="about-section values-section">
                <div className="values-content">
                    <div className="values-image-container">
                        <img src="https://catsy.com/blog/wp-content/uploads/2023/04/high-performing-eCommerce-team-1024x576.png" alt="Our Team" className="values-image" />
                    </div>
                    <div className="values-text">
                        <span className="sub-heading">Our Core Beliefs</span>
                        <h2 className="section-title">Driven by Passion, Built on Trust</h2>
                        <ul>
                            <li><FontAwesomeIcon icon={faCheckCircle} className="icon-small" /> Innovation: Constantly seeking new trends and technologies.</li>
                            <li><FontAwesomeIcon icon={faCheckCircle} className="icon-small" /> Integrity: Honest and transparent in all our dealings.</li>
                            <li><FontAwesomeIcon icon={faCheckCircle} className="icon-small" /> Community: Building a vibrant community around shared passions.</li>
                            <li><FontAwesomeIcon icon={faCheckCircle} className="icon-small" /> Excellence: Striving for perfection in every detail.</li>
                        </ul>
                    </div>
                </div>
            </section>
 
            {/* Testimonial Section - Mimics "Our Customer Speak For Us" section */}
            <section className="about-section testimonial-section">
                <h2 className="section-title">What Our Customers Say</h2>
                <div className="testimonial-card">
                    <img src="https://www.litmusworld.com/wp-content/uploads/2018/08/7-key-themes-sm.jpg" alt="Customer Avatar" className="testimonial-avatar" />
                    <p className="testimonial-quote">
                    <b>Seamless Ecommerce</b> has completely changed my online shopping experience! The quality is unparalleled, and their customer service is truly exceptional. I highly recommend them!"
                    </p>
                    <p className="testimonial-author">
                        <b>Jane Doe</b>, Avid Shopper
                    </p>
                </div>
            </section>
 
            {/* Call to Action Section - Similar to newsletter and footer in provided images */}
            <section className="call-to-action-section">
                <div className="cta-content">
                    <h2>Ready to Explore Our Collection?</h2>
                    <p>Dive into a world of unique products and discover your next favorite item.</p>
                    <a href="/" className="cta-button">Shop Now</a>
                </div>
            </section>
            <Footer/>
        </div>
    );
};
 
export default AboutUs;