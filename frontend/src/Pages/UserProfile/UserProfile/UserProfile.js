import React, { useContext } from 'react';
import PersonalInfo from '../PersonalInfo/PersonalInfo';
import Wishlist from '../WishList/WishList';
import OrderList from '../OrderList/OrderList';
import './UserProfile.css';

// Import your AuthContext and WishlistContext
import { AuthContext } from '../../../Context/AuthContext';
import { WishListContext } from '../../../Context/WishListContext';


const UserProfile = () => {
    // Get user from AuthContext
    const { user } = useContext(AuthContext);
    console.log("user in user profile", user);

    // Get wishlist items and loading/error states from WishlistContext
    const { wishlistItems, loadingWishlist, wishlistError } = useContext(WishListContext);

    if (!user) {
        return <p>Please log in to view your profile</p>;
    }

    return (
        <div className="user-profile">
            <div className="user-profile-main-content">
                {/* Personal Info at the top */}
                {/* Updated class name to prevent potential conflicts */}
                <div className="user-profile-personal-info-wrapper">
                    <PersonalInfo user={user} />
                </div>

                {/* Wishlist and Orders below, side-by-side */}
                <div className="user-profile-secondary-sections">
                    <div className="user-profile-wishlist-section">
                        {loadingWishlist ? (
                            <p>Loading wishlist...</p>
                        ) : wishlistError ? (
                            <p>Error loading wishlist: {wishlistError.message}</p>
                        ) : (
                            <Wishlist wishlist={wishlistItems} />
                        )}
                    </div>

                    <div className="user-profile-orders-section">
                        <h2 className="user-profile-orders-title">Previous Orders</h2>
                        <div className="user-profile-orders-list">
                            <OrderList userId={user.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;