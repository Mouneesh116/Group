import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCard.css';

const CategoryCard = ({ image, category }) => {
  return (
    <div className="category-card-container">
      <img src={image} alt={category} className="category-card-image" />
      <div className="category-card-title">
        <span>
          <Link to={`/categories/${category.toLowerCase()}`} className="category-card-link">
            {category}
          </Link>
        </span>
      </div>
    </div>
  );
};

export default CategoryCard;