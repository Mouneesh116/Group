import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // Ensure this path is correct relative to WishlistContext.js
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
export const WishListContext = createContext();
 
export const WishListProvider = ({ children }) => {
    const { user, userId, isLoggedIn } = useContext(AuthContext);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(true);
    const [wishlistError, setWishlistError] = useState(null);
    const token = localStorage.getItem('token'); // Get the token from localStorage
 
    const API_BASE_URL = "http://localhost:8080"
 
    // --- useEffect to Fetch User's Wishlist ---
    useEffect(() => {
        const fetchUserWishlist = async () => {
            if (!isLoggedIn || !user || !token) {
                setWishlistItems([]);
                setLoadingWishlist(false);
                return;
            }
 
            setLoadingWishlist(true);
            setWishlistError(null);
            console.log(token);
 
            try {
                const response = await axios.get(`http://localhost:8080/api/users/wishlist/getItems`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
               
                setWishlistItems(response.data.wishlist || []);
            } catch (err) {
                console.error("Error fetching user wishlist:", err);
                if (err.response && err.response.status === 401) {
                    setWishlistError('Unauthorized: Please log in again.');
                } else if (err.response && err.response.data && err.response.data.message) {
                    setWishlistError(`Failed to load wishlist: ${err.response.data.message}`);
                } else {
                    setWishlistError('Failed to load wishlist. Please check your network.');
                }
                setWishlistItems([]);
            } finally {
                setLoadingWishlist(false);
            }
        };
 
        fetchUserWishlist();
    }, [isLoggedIn, user, token]);
 
    // --- Add to Wishlist Function ---
    const addToWishlist = async (product) => {
        if (!isLoggedIn || !user || !token) {
            toast.warn("Please log in to add items to your wishlist.");
            return;
        }
        if (!product || !product._id) {
            toast.error('Invalid product data. Cannot add to wishlist.');
            return;
        }
 
       
 
        try {
            // Send POST request to backend to add product
            console.log(token);
            const response = await axios.post(`${API_BASE_URL}/api/users/wishlist/add/${product._id}`,{}, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            setWishlistItems(response.data.products || []);
            toast.success(`${product.title} added to your wishlist successfully!`);

 
            setWishlistError(null);
 
        } catch (err) {
 
            if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                 toast.error(`Wishlist Error: ${err.response.data.message}`)
            } else {
                toast.error('Failed to add product to wishlist. Please try again.');
                console.log("error in addToWishlist:", err);
            }
           
        }
    };
 
    // --- Remove from Wishlist Function ---
    const removeFromWishlist = async ( productId) => {
        if (!isLoggedIn || !user || !token) {
            toast.warn("Please log in to manage your wishlist.");
            return;
        }
        if (!productId)
            return alert('Product Not Found');
 
 
        try {
            // Send DELETE request to backend to remove product
            const response = await axios.delete(`${API_BASE_URL}/api/users/wishlist/remove/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if(response.status !== 200) {
                throw new Error('Failed to remove product from wishlist');
            }



            console.log(`Product ${productId} removed from backend wishlist. Backend Response:`, response.data);
 
           
            toast.success(`Product removed from wishlist successfully!`);
            setWishlistItems(response.data.products || []); // Assuming backend returns the updated wishlist object with a 'products' array
 
            setWishlistError(null); // Clear any previous errors on success
 
        } catch (err) {
            console.error("Error removing from backend wishlist:", err);
           
 
            if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
                 toast.error(`Wishlist Error: ${err.response.data.message}`);
            } else {
                toast.error('Failed to remove product from wishlist. Please try again.');
            }
            // Optionally, re-fetch the full wishlist to ensure UI is completely synchronized
            // fetchUserWishlist();
        }
    };
 
    // --- Check if Product is in Wishlist ---
    const isProductInWishlist = (productId) => {
        return wishlistItems.some((item) => item._id === productId);
    };
 
    return (
        <WishListContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                isProductInWishlist,
                loadingWishlist,
                wishlistError,
            }}
        >
            {children}
        </WishListContext.Provider>
    );
};
