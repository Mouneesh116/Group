import React from 'react';
import './CategoriesRow.css';
import cart1 from "../../Assets/Images/Fashion.jpg";
import cart2 from "../../Assets/Images/electronics.jpg";
import cart3 from "../../Assets/Images/shoes.jpg";
import cart4 from "../../Assets/Images/Beauty.jpg";
import cart5 from "../../Assets/Images/sports.jpg";
import cart6 from "../../Assets/Images/decorate.jpg";
import { Link } from 'react-router-dom';
 
const CategoriesRow = () => {
  const categories = [
    { img: cart1, label: "Fashion" },
    { img: cart2, label: "Electronics" },
    { img: cart3, label: "Shoes" },
    { img: cart4, label: "Beauty" },
    { img: cart5, label: "Sports" },
    { img: cart6, label: "HomeDecor" },
  ];
 
  return (
    <div className="categories-row-container">
      <h2 className="categories-row-title">Shop By Categories</h2>
      <div className="categories-row-list">
        {categories.map((category, index) => (
          <div
            className="categories-row-item"
            key={index}
            style={{ backgroundImage: `url(${category.img})` }}
          >
            <Link to={`/categories/${category.label.toLowerCase()}`} className="categories-row-link">
              <div className="categories-row-label-overlay">
                <p>{category.label}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
 
export default CategoriesRow;
 