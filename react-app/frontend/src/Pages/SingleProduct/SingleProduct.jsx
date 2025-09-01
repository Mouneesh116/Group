import React, { useState, useContext, useEffect } from 'react';
import './SingleProduct.css';
import { FaStar } from "react-icons/fa";
import { useParams, useNavigate } from 'react-router-dom';
// import Data from '../../Components/Data/Data';
import { CartContext } from '../../Context/CartContext';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { WishListContext } from '../../Context/WishListContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
 
const SingleProduct = () => {
  const { addToWishlist, removeFromWishlist,isProductInWishlist, loadingWishList } = useContext(WishListContext); // Import WishlistContext methods
  const navigate = useNavigate();
  const { category, id } = useParams(); // Extract the product ID from the URL
  const [mainImage, setMainImage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { isLoggedIn, user, userId} = useContext(AuthContext);
  const [filteredProduct, setFilteredProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('Available Colors'); // State to track selected color
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  // Fetch the product based on the ID
  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/product/reviews/${id}`, {
          headers: {
            'Content-Type': 'application/json',
          }
        })
        const reviews = response.data.reviews || [];
        setUserReviews(reviews);
        console.log("User Reviews", reviews);
      } catch (error) {
        console.log("Error fetching user reviews", error, error.message);
      }
    }
    fetchUserReviews();
    const fetchProductById = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/product/${id}`);
        const data = response.data.product;
        console.log(data);
        setFilteredProduct(data);
        setMainImage(data.img);
        setSelectedColor(data.color);
        const liked = await isProductInWishlist(data._id);
        setIsLiked(liked);
      } catch (error) {
        console.log("Error fetching product by Id", error, error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProductById();
  }, [id]);





  if(loading){
    return <div>Loading...</div>;
  }
 
  // If no product is found, display a fallback message
  if (!filteredProduct) {
    return <div>No product found for this ID</div>;
  }
 
  const token = localStorage.getItem('token');
  const handleLikeToggle = () => {
    if (!filteredProduct) return;
    if (isLiked) {
        removeFromWishlist(filteredProduct._id);
       
 
    } else {
        addToWishlist(filteredProduct);
    }
    // Optimistically toggle local state, WishlistContext will handle backend sync
    setIsLiked(prevIsLiked => !prevIsLiked);
};
  // Handle "Add to Cart" button click
  const handleAddToCart = () => {
    if(isLoggedIn){
      const productDetails = {
        userId : userId,
        items:[
          {
            productId: filteredProduct._id,
            title: filteredProduct.title,
            price: filteredProduct.newPrice,
            img: filteredProduct.img,
            quantityDelta: 1,
          }
        ]
      }
      console.log("Product Details in Single Product", productDetails);
      addToCart(productDetails);
      setShowPopup(true);
    }
    else{
      navigate('/login');
    }
  };
 
  // Handle "Buy Now" button click
  const handleClick = () => {
    if(isLoggedIn){
      const productDetails = {
        userId : user.id,
        items:[
          {
            productId: filteredProduct._id,
            title: filteredProduct.title,
            price: filteredProduct.newPrice,
            img: filteredProduct.img,
            quantityDelta: 1,
            date: filteredProduct.createdAt
          }
        ]
      }
      addToCart(productDetails);
      setTimeout(() => {
        setShowPopup(false);
      }, 1000);
      navigate('/cart');
    }
    else{
      navigate('/');
    }
  };
 
  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color); // Update the selected color
  };
 
  return (
    <div className="singleproduct-app">
      <div className="singleproduct-mainPage">
        {/* Left-hand side: Main Image */}
        <div className="singleproduct-imagePart">
          <div className="singleproduct-mainimg">
            <div className="singleproduct-img">
              {/* Wishlist icon wrapper */}
              <div className="singleproduct-wishlist-icon" onClick={handleLikeToggle}>
                                {isLiked ? (
                                    <FaHeart style={{ color: 'red' }} /> // Filled heart if liked
                                ) : (
                                    <FaRegHeart /> // Outline heart if not liked
                                )}
              </div>
              <img src={mainImage} alt={filteredProduct.title} height="400px" width="425px" />
            </div>
            <div className="singleproduct-options">
              <button id="cart" onClick={handleAddToCart}>Add To Cart</button>
              <button id="buy" onClick={handleClick}>Buy Now</button>
            </div>
          </div>
        </div>
 
        {/* Right-hand side: Product Details */}
        <div className="singleproduct-detailsPart">
          <div className="singleproduct-det-1">
            <div className="singleproduct-product-title">
              <p>{filteredProduct.title}</p>
            </div>
           
            <div className="singleproduct-price-div">
  <h2>
    <span id="price">₹{filteredProduct.newPrice}&nbsp;</span>
    <del id='strike'>₹{filteredProduct.prevPrice}</del>
    <span style={{ color: 'green', marginLeft: '10px', fontSize: '14px' }}>
      (FLAT {Math.round(((filteredProduct.prevPrice - filteredProduct.newPrice) / filteredProduct.prevPrice) * 100)}% OFF)
    </span>
  </h2>
</div>
          </div>
          <div className="singleproduct-description">
            <h3>Product Description</h3>
            <p>Category - {filteredProduct.subCategory}</p>
            <p>{filteredProduct.company} Assured Product</p>
            <div className="singleproduct-color-row">
              <p>{selectedColor}:</p> {/* Display the selected color */}
              <div className="singleproduct-color-options">
                <div className="singleproduct-color-wrapper" onClick={() => handleColorSelect('Red')}>
                  <div className="singleproduct-color-circle" style={{ backgroundColor: 'red' }}></div>
                </div>
                <div className="singleproduct-color-wrapper" onClick={() => handleColorSelect('Green')}>
                  <div className="singleproduct-color-circle" style={{ backgroundColor: 'green' }}></div>
                </div>
                <div className="singleproduct-color-wrapper" onClick={() => handleColorSelect('Yellow')}>
                  <div className="singleproduct-color-circle" style={{ backgroundColor: 'yellow' }}></div>
                </div>
                <div className="singleproduct-color-wrapper" onClick={() => handleColorSelect('Black')}>
                  <div className="singleproduct-color-circle" style={{ backgroundColor: 'black' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="singleproduct-product-details">
            {/* Delivery Section */}
            <div className="singleproduct-delivery">
              <h3>Delivery</h3>
              <p>Delivery by <strong>Tomorrow, 10 AM</strong></p>
              <p>Free delivery for orders above <strong>₹500</strong></p>
            </div>
          </div>
          <div className="singleproduct-lastDetails">
            <h3>Product Details</h3>
            <p>Experience the best quality with Seamless E-Commerce verified products.
            Perfect for enthusiasts looking for premium features.</p>
          </div>
          <div className="singleproduct-product-user-reviews">
  <h3>User Reviews</h3>
  {loading ? (
    <p>Loading reviews...</p>
  ) : userReviews.length > 0 ? (
    userReviews.map((review, index) => (
      <div key={index} className="singleproduct-user-review-card">
        <div className="singleproduct-user-review-header">
          <div className="singleproduct-user-avatar">
            <div className="avatar-placeholder">{review.userName[0]}</div>
          </div>
          <div className="singleproduct-user-info">
            <p className="user-name">{review.userName}</p>
            {/* <p className="review-date">
              {review.reviewDate
                ? new Date(review.reviewDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : "Date not available"}
            </p> */}
          </div>
          <div className="singleproduct-review-rating">
            {[...Array(review.rating)].map((_, i) => (
              <FaStar key={i} style={{ color: '#FFD700' }} />
            ))}
            {[...Array(5 - review.rating)].map((_, i) => (
              <FaStar key={i} style={{ color: '#E0E0E0' }} />
            ))}
          </div>
        </div>
        <div className="singleproduct-user-review-body">
          <p className="review-text">{review.review}</p>
        </div>
      </div>
    ))
  ) : (
    <p>No reviews available for this product.</p>
  )}
</div>
        </div>
      </div>
 
      {/* Popup for Add to Cart */}
      {showPopup && (
        <div className="singleproduct-popup-overlay">
          <div className="singleproduct-popup-card">
            <h2>{filteredProduct.title} is added to cart!</h2>
            <button onClick={() => navigate('/cart')}>Browse Cart</button>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default SingleProduct;
