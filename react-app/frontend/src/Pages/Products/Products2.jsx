


import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Filter from '../../Components/Filter/Filter';
import ProductCard from '../../Components/ProductCard/ProductCard';
import './Products2.css';
 
export const Products2 = () => {
    const { category } = useParams();
    console.log(category)
 
    const [allProductsInCategory, setAllProductsInCategory] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilter, setShowFilter] = useState(false); // New state to manage filter visibility
 
    const [currentFilters, setCurrentFilters] = useState({
        subCategory: null,
        minPrice: null,
        maxPrice: null,
    });
 
    const BACKEND_URL = "http://localhost:8080";
 
    useEffect(() => {
        const fetchProductsByCategory = async () => {
            try {
                setLoading(true);
                setError(null);
                // Make sure your backend correctly returns data with 'category' and 'subCategory' fields
                const response = await axios.get(`http://localhost:8080/api/products?category=${category}`);
                console.log(response.data); // Debugging line to check the response structure
                setAllProductsInCategory(response.data);
            } catch (err) {
                console.error(`Error fetching products for category ${category}:`, err.response?.data || err.message);
                setError(err.response?.data?.message || `Failed to load products for ${category}.`);
            } finally {
                setLoading(false);
            }
        };
 
        fetchProductsByCategory();
    }, [category, BACKEND_URL]);
 
    useEffect(() => {
        let tempFiltered = [...allProductsInCategory];
 
        if (currentFilters.subCategory) {
            tempFiltered = tempFiltered.filter(
                (product) => product.subCategory.toLowerCase() === currentFilters.subCategory.toLowerCase()
            );
        }
 
        if (currentFilters.minPrice !== null || currentFilters.maxPrice !== null) { // Check if minPrice or maxPrice are actually set
            tempFiltered = tempFiltered.filter((product) => {
                const price = parseFloat(product.newPrice);
                const min = currentFilters.minPrice !== null ? parseFloat(currentFilters.minPrice) : -Infinity;
                const max = currentFilters.maxPrice !== null ? parseFloat(currentFilters.maxPrice) : Infinity;
                return price >= min && price <= max;
            });
        }
 
        setFilteredProducts(tempFiltered);
    }, [allProductsInCategory, currentFilters]);
 
    // Ensure subCategories are derived from allProductsInCategory
    const subCategories = [
        ...new Set(
            allProductsInCategory
                .filter(product => product.subCategory) // Filter out products without subCategory
                .map((product) => product.subCategory.toLowerCase())
        ),
    ];
 
    const handleFilter = (filters) => {
        setCurrentFilters((prevFilters) => ({
            ...prevFilters,
            ...filters,
        }));
        // Close filter on mobile after applying filters
        if (window.innerWidth <= 768) { // Adjust breakpoint as needed
            setShowFilter(false);
        }
    };
 
    const toggleFilterVisibility = () => {
        setShowFilter(!showFilter);
    };
 
    if (loading) {
        return <div className="products-p2-main-container">Loading products...</div>;
    }
 
    if (error) {
        return <div className="products-p2-main-container" style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
            <h3>Error: {error}</h3>
            <p>Please ensure your backend server is running and accessible at `{BACKEND_URL}/api/products`.</p>
        </div>;
    }
 
    return (
        <div className="products-p2-main-container">
            {/* Filter Toggle Button for smaller screens */}
            <button className="products-mobile-filter-toggle-button" onClick={toggleFilterVisibility}>
                Filter
            </button>
 
            <div className={`products-filter-container ${showFilter ? 'active' : ''}`}> {/* Add active class based on state */}
                <Filter
                    category={category}
                    subCategories={subCategories}
                    onFilter={handleFilter}
                    onCloseFilter={() => setShowFilter(false)} // Pass prop to close filter from within
                    data={allProductsInCategory}
                />
            </div>
            <div className="products-container">
                <div className="products-row-div">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((item) => (
                            // Use item._id if that's what your backend provides, or item.id if that's consistent
                            <Link className='product-link' to={`/categories/${item.category}/${item._id}`} key={item._id}>
                                <ProductCard
                                    image={item.img}
                                    title={item.title}
                                    company={item.company}
                                    prevPrice={item.prevPrice}
                                    newPrice={item.newPrice}
                                    color={item.color}
                                    star={item.star}
                                    reviews={item.reviews}
                                />
                            </Link>
                        ))
                    ) : (
                        <p>No products found for this category or with the selected filters.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
