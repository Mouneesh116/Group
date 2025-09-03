import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import './ContactUs.css'; // Make sure this path is correct relative to your ContactUs.js file
import Footer from '../../Components/Footer/Footer';

import { FaFacebookSquare, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

 
const ContactUs = () => {
    // Basic form submission handler (you'll need a backend to actually send emails)
    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Message sent successfully! (This is a demo. Implement your backend logic.)');
        // In a real application, you would send data to an API endpoint here.
        // e.g., fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
    };
 
    return (
        <div className="contact-us-container">
            {/* Hero Section */}
            <section className="contact-hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Get in Touch With Us</h1>
                    <p className="hero-subtitle">
                        We're here to help! Reach out to us through any of the methods below for inquiries, support, or feedback.
                    </p>
                </div>
            </section>
 
            {/* Contact Info Section */}
            <section className="contact-info-section about-section"> {/* Reusing 'about-section' for consistent padding */}
                <h2 className="section-title">Contact Information</h2>
                <div className="info-cards-grid">
                    <div className="info-card">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="info-icon" />
                        <h3>Our Location</h3>
                        <p>Loyalty methods</p>
                        <p>Hyderabad, Telangana, 500013, India</p>
                    </div>
                    <div className="info-card">
                        <FontAwesomeIcon icon={faPhone} className="info-icon" />
                        <h3>Phone Number</h3>
                        <p>+91 98765 43210</p>
                        <p>Mon - Fri, 9 AM - 6 PM</p>
                    </div>
                    <div className="info-card">
                        <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                        <h3>Email Address</h3>
                        <p>support@yourecommercename.com</p>
                        <p>info@yourecommercename.com</p>
                    </div>
                </div>
            </section>
 
            {/* Contact Form Section (Envelope Design) */}
            <section className="contact-form-section about-section">
                <h2 className="section-title">Send Us a Message</h2>
                <div className="contact-form-content">
                    <div className="form-image-container">
                        {/* Placeholder image - Replace with a relevant image for your brand */}
                        <img src="https://zorbasmedia.com/wp-content/uploads/2022/12/E-comm-%D1%81%D1%82%D0%B0%D1%82%D1%8C%D1%8F.png" alt="Contact Us" className="form-image" />
                    </div>
                    <form className="contact-form envelope-form" onSubmit={handleSubmit}> {/* Added envelope-form class */}
                        <div className="form-group">
                            <label htmlFor="name">Name:</label>
                            <input type="text" id="name" name="name" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" name="email" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="subject">Subject:</label>
                            <input type="text" id="subject" name="subject" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message:</label>
                            <textarea id="message" name="message" rows="4" required></textarea> {/* Reduced rows for compactness */}
                        </div>
                        <button type="submit" className="submit-button envelope-button"> {/* Added envelope-button class */}
                            Send Message
                        </button>
                    </form>
                </div>
            </section>
 
            {/* Map Section */}
            <section className="map-section about-section">
                <h2 className="section-title">Find Us on the Map</h2>
                <div className="map-embed">
                    {/* Replace with your actual Google Maps embed code (iframe) for your specific address */}
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124403.49883582236!2d80.12644265775438!3d13.04754766854128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d0201%3A0x6442340537a718c!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1718617874987!5m2!1sen!2sin"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Our Location on Map"
                    ></iframe>
                </div>
            </section>
 
            {/* Social Media Section */}
            <section className="social-media-section about-section">
                <h2 className="section-title">Connect With Us</h2>
                <div className="social-icons">
                    <a href="https://facebook.com/your_ecommerce" target="_blank" rel="noopener noreferrer">{FaFacebookSquare}</a>
                    <a href="https://twitter.com/your_ecommerce" target="_blank" rel="noopener noreferrer">{FaTwitter}</a>
                    <a href="https://instagram.com/your_ecommerce" target="_blank" rel="noopener noreferrer">{FaInstagram}</a>
                    <a href="https://linkedin.com/company/your_ecommerce" target="_blank" rel="noopener noreferrer">{FaLinkedin}</a>
                </div>
            </section>
            <Footer/>
        </div>
    );
};
 
export default ContactUs;