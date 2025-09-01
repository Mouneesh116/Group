import React from 'react'
import NavBar from '../../Components/NavBar/NavBar'
import women from '../../Assets/Images/women.jpg'
import PromoSection from '../../Components/PromoSection/PromoSection'
import CategoriesRow from '../../Components/CategoriesRow/CategoriesRow'
import ProductCard from '../../Components/ProductCard/ProductCard'
// import ListedProducts from '../../Components/ListedProducts/ListedProducts';
import Footer from '../../Components/Footer/Footer'
import { OffersSlider } from '../../Components/Offers/OffersSlider'
import { DisplayCard } from '../../Components/DisplayCard/DisplayCard';
import OurPolicy from '../../Components/OurPolicy/OurPolicy';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="homepage-hero-section">
        <PromoSection/>
      </section>

      {/* Categories Section */}
      <section id="categories" className="homepage-categories-section">
        <CategoriesRow />
      </section>

      {/* Offers Section */}
      <section id="offers" className="homepage-offers-section">
        <OffersSlider />
      </section>
      <section id="ourpolicy" className="homepage-ourpolicy-section">
        <OurPolicy/>
      </section>
      <section id="footer" className="homepage-footer-section">
      <Footer/>
      </section>
    </div>
  );
};

export default HomePage;
