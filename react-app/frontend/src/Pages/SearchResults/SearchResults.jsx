// import React, { useState, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import axios from 'axios'; // Import Axios
// import './SearchResults.css';
// import { DisplayCard } from '../../Components/DisplayCard/DisplayCard';
 
// const SearchResults = () => {
//     const location = useLocation();
//     const query = new URLSearchParams(location.search).get('query');
 
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
 
//     const API_BASE_URL = 'http://localhost:8000';
 
//     useEffect(() => {
//         const fetchSearchResults = async () => {
//             if (!query) {
//                 setProducts([]);
//                 setLoading(false);
//                 setError(null);
//                 return;
//             }
 
//             setLoading(true);
//             setError(null);
 
//             try {
//                 console.log(`[Frontend] Searching for: "${query}" at ${process.env.REACT_APP_BACKEND_URL}/api/products/search?query=${query}`);
               
//                 // --- Axios change starts here ---
//                 const response = await axios.get(http://localhost:8080/api/products/search`, {
//                     params: {
//                         query: query // Axios automatically handles URL encoding for params
//                     }
//                 });
 
//                 // Axios wraps the actual data in a 'data' property
//                 const data = response.data;
//                 // --- Axios change ends here ---
 
//                 console.log('[Frontend] Search results fetched:', data);
 
//                 if (Array.isArray(data)) {
//                     setProducts(data);
//                 } else {
//                     console.warn('[Frontend] API did not return an array for search results:', data);
//                     setProducts([]);
//                 }
//             } catch (err) {
//                 console.error('[Frontend] Error fetching search results:', err);
//                 // Axios errors have a 'response' property if it's an HTTP error
//                 if (err.response) {
//                     setError(`Failed to load search results: HTTP error! status: ${err.response.status}, message: ${err.response.data.message || err.response.statusText}. Please try again.`);
//                 } else if (err.request) {
//                     setError('Failed to load search results: No response received from server. Please check your network connection.');
//                 } else {
//                     setError(`Failed to load search results: ${err.message}. Please try again.`);
//                 }
//                 setProducts([]);
//             } finally {
//                 setLoading(false);
//             }
//         };
 
//         fetchSearchResults();
//     }, [query, process.env.REACT_APP_BACKEND_URL]);
 
//     return (
//         <div className="search-results-main-container">
//             <h2>Search Results for "{query || '...'}"</h2>
//             <div className="search-results-container">
//                 {loading ? (
//                     <p style={{ textAlign: 'center', width: '100%' }}>Loading search results...</p>
//                 ) : error ? (
//                     <p style={{ color: 'red', textAlign: 'center', width: '100%' }}>{error}</p>
//                 ) : products.length > 0 ? (
//                     <div className="search-results-grid">
//                         {products.map((product) => (
//                             <Link className="search-results-productcard-link" to={`/categories/${product.category}/${product._id || product.id}`} key={product._id || product.id}>
//                                 <DisplayCard
//                                     product={product}
//                                 />
//                             </Link>
//                         ))}
//                     </div>
//                 ) : (
//                     <p style={{ textAlign: 'center', width: '100%' }}>No products found for your search.</p>
//                 )}
//             </div>
//         </div>
//     );
// };
 
// export default SearchResults;
 


import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css'; // Make sure this path is correct
import { DisplayCard } from '../../Components/DisplayCard/DisplayCard'; // Make sure this path is correct
 
const SearchResults = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('query');
 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
 
    // API_BASE_URL is not used, process.env.REACT_APP_BACKEND_URL is used directly
    // const API_BASE_URL = 'http://localhost:8000'; 
 
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) {
                setProducts([]);
                setLoading(false);
                setError(null);
                return;
            }
 
            setLoading(true);
            setError(null);
 
            try {
                console.log(`[Frontend] Searching for: "${query}" at ${process.env.REACT_APP_BACKEND_URL}/api/products/search?query=${query}`);
                
                const response = await axios.get(`http://localhost:8080/api/products/search`, {
                    params: {
                        query: query
                    }
                });
 
                const data = response.data;
 
                console.log('[Frontend] Search results fetched:', data);
 
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    console.warn('[Frontend] API did not return an array for search results:', data);
                    setProducts([]);
                }
            } catch (err) {
                console.error('[Frontend] Error fetching search results:', err);
                if (err.response) {
                    setError(`Failed to load search results: HTTP error! status: ${err.response.status}, message: ${err.response.data.message || err.response.statusText}. Please try again.`);
                } else if (err.request) {
                    setError('Failed to load search results: No response received from server. Please check your network connection.');
                } else {
                    setError(`Failed to load search results: ${err.message}. Please try again.`);
                }
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
 
        fetchSearchResults();
    }, [query, process.env.REACT_APP_BACKEND_URL]);
 
    return (
        <div className="searchresults-main-container">
            <h2 className="searchresults-header">Search Results for "{query || '...'}"</h2>
            <div className="searchresults-content-area">
                {loading ? (
                    <p className="searchresults-message">Loading search results...</p>
                ) : error ? (
                    <p className="searchresults-error-message">{error}</p>
                ) : products.length > 0 ? (
                    <div className="searchresults-grid">
                        {products.map((product) => (
                            <Link className="searchresults-productcard-link" to={`/categories/${product.category}/${product._id || product.id}`} key={product._id || product.id}>
                                <DisplayCard
                                    product={product}
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="searchresults-message">No products found for your search.</p>
                )}
            </div>
        </div>
    );
};
 
export default SearchResults;