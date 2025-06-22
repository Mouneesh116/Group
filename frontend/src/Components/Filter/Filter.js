import React, { useState } from "react";
import "./Filter.css";
 
// ... (rest of your Filter.js code)
 
const Filter = ({ category, subCategories, onFilter, onCloseFilter }) => { // Add onCloseFilter prop
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
 
  const priceRanges = [
    { label: "All", min: null, max: null },
    { label: "Under ₹100", min: 0, max: 100 },
    { label: "₹101 - ₹500", min: 101, max: 500 },
    { label: "₹501 - ₹1000", min: 501, max: 1000 },
    { label: "₹1001 - ₹5000", min: 1001, max: 5000 },
    { label: "Over ₹5000", min: 5001, max: null },
  ];
 
  const handlePriceRangeFilter = (e) => {
    const selectedLabel = e.target.value;
    setSelectedPriceRange(selectedLabel);
 
    const range = priceRanges.find(range => range.label === selectedLabel);
 
    setActiveSubCategory(null);
    onFilter({ minPrice: range.min, maxPrice: range.max, subCategory: null });
  };
 
  const handleSubCategoryFilter = (subCategory) => {
    setActiveSubCategory(subCategory);
    setSelectedPriceRange("All");
    onFilter({ subCategory, minPrice: null, maxPrice: null });
  };
 
  const handleClearFilters = () => {
    setSelectedPriceRange("All");
    setActiveSubCategory(null);
    onFilter({ subCategory: null, minPrice: null, maxPrice: null });
    // If you want clearing filters to also close the filter modal on mobile
    if (onCloseFilter) {
      onCloseFilter();
    }
  };
 
  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3 className="filter-title">FILTER</h3>
        {/* Call onCloseFilter when the close button is clicked */}
        <button className="filter-close-button" onClick={onCloseFilter || handleClearFilters}>
          ✕
        </button>
      </div>
 
      {/* ... rest of your Filter component JSX */}
      <div className="filter-search-bar">
        <input type="text" placeholder="Search Headphone" />
      </div>
 
      {/* <div className="filter-section">
        <h4>LASTEST SEARCH</h4>
        <div className="filter-tags-container">
          <div className="filter-tag">
            <span>TMO BVNHU</span>
            <button className="filter-tag-close">✕</button>
          </div>
          <div className="filter-tag">
            <span>Cable</span>
            <button className="filter-tag-close">✕</button>
          </div>
        </div>
      </div> */}
 
      <div className="filter-section">
        <h4>CATEGORY</h4>
        <div className="filter-buttons">
          {subCategories.map((subCategory, index) => (
            <button
              key={index}
              className={`filter-button ${activeSubCategory === subCategory ? 'active' : ''}`}
              onClick={() => handleSubCategoryFilter(subCategory)}
            >
              {subCategory}
            </button>
          ))}
        </div>
      </div>
 
      <div className="filter-section">
        <h4>SORT BY</h4>
        <div className="filter-buttons">
          <button className="filter-button active">Popularity</button>
          <button className="filter-button">Newest</button>
          <button className="filter-button">Oldest</button>
          <button className="filter-button">High Price</button>
          <button className="filter-button">Low Price</button>
          <button className="filter-button">Reviews</button>
        </div>
      </div>
 
      <div className="filter-section">
        <h4>PRICE RANGE</h4>
        <div className="price-filter">
          <select value={selectedPriceRange} onChange={handlePriceRangeFilter}>
            {priceRanges.map((range, index) => (
              <option key={index} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
 
export default Filter;