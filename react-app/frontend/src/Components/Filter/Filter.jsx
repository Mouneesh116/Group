
import React, { useState, useEffect } from "react";
import "./Filter.css";
 
const Filter = ({ category, subCategories, onFilter, onCloseFilter, data }) => {
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [priceRanges, setPriceRanges] = useState([]);
 
  // Calculate price ranges dynamically based on the current category
  useEffect(() => {
    const calculatePriceRanges = () => {
      const filteredData = data.filter(item => item.category === category);
      const prices = filteredData.map(item => parseFloat(item.newPrice));
 
      if (prices.length === 0) {
        setPriceRanges([{ label: "All", min: null, max: null }]);
        return;
      }
 
      const maxPriceOverall = Math.max(...prices);
 
      // Define sensible thresholds. Adjust as needed.
      const ranges = [{ label: "All", min: null, max: null }];
 
      if (maxPriceOverall < 1000) {
        ranges.push(
          { label: "Under ₹100", min: 0, max: 99 },
          { label: "₹100 - ₹250", min: 100, max: 250 },
          { label: "₹251 - ₹500", min: 251, max: 500 },
          { label: "Over ₹500", min: 501, max: null }
        );
      } else if (maxPriceOverall < 10000) {
        ranges.push(
          { label: "Under ₹1000", min: 0, max: 999 },
          { label: "₹1001 - ₹2500", min: 1000, max: 2500 },
          { label: "₹2501 - ₹5000", min: 2501, max: 5000 },
          { label: "₹5001 - ₹7500", min: 5001, max: 7500 },
          { label: "Over ₹7500", min: 7501, max: null }
        );
      } else {
        ranges.push(
          { label: "Under ₹10000", min: 0, max: 9999 },
          { label: "₹10000 - ₹25000", min: 10000, max: 25000 },
          { label: "₹25001 - ₹50000", min: 25001, max: 50000 },
          { label: "₹50001 - ₹100000", min: 50001, max: 100000 },
          { label: "Over ₹100000", min: 100001, max: null }
        );
      }
      setPriceRanges(ranges);
    };
 
    calculatePriceRanges();
    setSelectedPriceRange("All"); // Reset price range selection when category changes
  }, [category, data]);
 
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
  };
 
  const handleClose = () => {
    // Clear filters + close sidebar
    handleClearFilters();
    if (onCloseFilter) onCloseFilter();
  };
 
  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3 className="filter-title">FILTER</h3>
        <button className="filter-close-button" onClick={handleClose}>
          ✕
        </button>
      </div>
 
      <div className="filter-section">
        <h4>SUB CATEGORY</h4>
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
