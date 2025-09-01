import React, { useState, useEffect } from 'react';
import OfferCard from './OfferCard'; // Corrected import to default export
import './OffersSlider.css';
 
// Import your images for each slide.
// IMPORTANT: Replace these paths with actual web-accessible URLs or correct import paths.
// The image from the Fashi example (woman with greens) is not in your Assets,
// so you'll need to find a suitable replacement or use that exact URL if available.
import defaultOfferImage from '../../Assets/Images/offerimage.jpg'; // Placeholder
import phoneImage from '../../Assets/Images/phone.png'; // Placeholder if you reuse it
import specialOfferImage from '../../Assets/Images/specialoffer.jpg'; // Placeholder
 
export const OffersSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
 
  // Placeholder URLs for smaller images.
 
  const fashiWomanImagePlaceholder = 'https://blog-cdn.el.olx.com.pk/wp-content/uploads/2024/03/08135305/fashion-accessories-business-1024x576.jpg';
 
  const slidesData = [
    {
      offerMainImage: fashiWomanImagePlaceholder,
      smallText: 'BABY KIDS',
      title: 'Black Friday',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
      buttonText: 'SHOP NOW',
      buttonLink: '/shop/black-friday',
      saleBadgeText: 'SALE 50%'
    },
    {
      offerMainImage: 'https://i.pinimg.com/736x/e6/ef/54/e6ef5499733f9a062582738bb81d05b0.jpg',
      smallText: 'BIG DEALS',
      title: 'Summer Collection',
      description: 'Cozy up with our new arrivals. Discover warmth and style for the season ahead.',
      buttonText: 'EXPLORE NOW',
      buttonLink: '/shop/winter',
      saleBadgeText: 'NEW!'
    },
    {
      offerMainImage: specialOfferImage,
      smallText: 'LIMITED TIME',
      title: 'Special Offer',
      description: 'Don\'t miss out on exclusive discounts. Grab your favorites before they\'re gone!',
      buttonText: 'GET OFFER',
      buttonLink: '/shop/special-offer',
      saleBadgeText: '25% OFF'
    },
    {
      offerMainImage: phoneImage,
      smallText: 'GADGETS',
      title: 'Tech Extravaganza',
      description: 'Upgrade your tech with our latest gadgets. Smart choices for smart living.',
      buttonText: 'BROWSE TECH',
      buttonLink: '/shop/tech',
      saleBadgeText: 'FLASH SALE'
    },
  ];
 
  const totalSlides = slidesData.length;
 
  // Auto-slide functionality
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
    }, 3000); // Change slide every 3 seconds
 
    return () => clearInterval(slideInterval); // Cleanup interval on component unmount
  }, [totalSlides]);
 
  // Manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
 
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };
 
  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };
 
  return (
    <div className="offers-slider-main-container"> {/* Prefixed class */}
      <div className="offers-slider-container"> {/* Prefixed class */}
        <div
          className="offers-slider-slides"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {slidesData.map((slide, index) => (
            <div className="offers-slider-slide" key={index}> {/* Prefixed class */}
              {/* Pass all slide data as props to OfferCard */}
              <OfferCard
                offerMainImage={slide.offerMainImage}
                smallText={slide.smallText}
                title={slide.title}
                description={slide.description}
                buttonText={slide.buttonText}
                saleBadgeText={slide.saleBadgeText}
                buttonLink={slide.buttonLink}
              />
            </div>
          ))}
        </div>
        <div className="offers-slider-nav-buttons"> {/* Prefixed class */}
          <button className="offers-slider-nav-button" id="prev" onClick={prevSlide}> {/* Prefixed class */}
            &#10094;
          </button>
          <button className="offers-slider-nav-button" id="next" onClick={nextSlide}> {/* Prefixed class */}
            &#10095;
          </button>
        </div>
        <div className="offers-slider-dots-container"> {/* Prefixed class */}
          {slidesData.map((_, index) => (
            <span
              key={index}
              className={`offers-slider-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};
