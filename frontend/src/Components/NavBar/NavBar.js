import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css'; // Make sure this path is correct
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faShoppingCart, faBars } from '@fortawesome/free-solid-svg-icons';
import photo from '../../Assets/Images/logo.png'; // Make sure this path is correct
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../Context/CartContext'; // Make sure this path is correct
import { AuthContext } from '../../Context/AuthContext'; // Make sure this path is correct
import { toast } from 'react-toastify'; // Make sure you have react-toastify installed
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for react-toastify
const NavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu open/close
    const { cartItems } = useContext(CartContext);
    const cartCount = cartItems.length;
 
    const { isLoggedIn, logout } = useContext(AuthContext);
 
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
 
    // Function to close the mobile menu after a link is clicked
    const handleNavLinkClick = () => {
        setIsMenuOpen(false);
    };
 
    const handleSearch = (event) => {
        if (event.key === 'Enter' || event.type === 'click') {
            if (searchQuery.trim()) {
                navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                // navigate(`/search?query=${searchQuery.trim()}`);
                setSearchQuery('');
                handleNavLinkClick(); // Close menu after search on mobile
            }
        }
    };
 
    const handleLoginLogout = () => {
        if (isLoggedIn) {
            logout();
            toast.success('You have been logged out.');
            navigate('/'); // Redirect to home after logout
        } else {
            navigate('/login');
        }
        handleNavLinkClick(); // Close menu after login/logout click
    };
 
    return (
        <nav className="navbar-container">
            <div className="navbar-header-row">
                <div className="navbar-logo">
                    <img src={photo} alt="Logo" className="navbar-logo-image" onClick={() => navigate('/')} />
                </div>
 
                <div className="navbar-desktop-group">
                    <div className="navbar-links-group">
                        <Link to="/" className={`navbar-nav-link ${location.pathname === '/' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Home</Link>
                        <Link to="/categories" className={`navbar-nav-link ${location.pathname === '/categories' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Categories</Link>
                        <Link to="/offers" className={`navbar-nav-link ${location.pathname === '/offers' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Offers</Link>
                        <Link to="/contact" className={`navbar-nav-link ${location.pathname === '/contact' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Contact</Link>
                        <Link to="/about" className={`navbar-nav-link ${location.pathname === '/about' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>About Us</Link>
                    </div>
 
                    <div className="navbar-search-section">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="navbar-search-input"
                        />
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="navbar-search-icon-inside"
                            onClick={handleSearch}
                        />
                    </div>
 
                    <div className="navbar-actions-group">
                        <div>
                            <span className="navbar-login-link" onClick={handleLoginLogout}>
                                {isLoggedIn ? 'Logout' : 'Login'}
                            </span>
                        </div>
                        <div className="navbar-cart-section">
                            <Link to="/cart" className="navbar-cart-link" onClick={handleNavLinkClick}>
                                <FontAwesomeIcon icon={faShoppingCart} className="navbar-cart-icon" />
                                {cartCount > 0 && <span className="navbar-cart-count">{cartCount}</span>}
                            </Link>
                        </div>
                        <div className="navbar-profile-section">
                            <Link to="/profile" className="navbar-profile-link" onClick={handleNavLinkClick}>
                                <FontAwesomeIcon icon={faUser} className="navbar-profile-icon-fa" />
                                <span className="navbar-profile-text"></span>
                            </Link>
                        </div>
                    </div>
                </div>
 
                <div className="navbar-hamburger-menu" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faBars} />
                </div>
            </div>
 
            <div className={`navbar-mobile-menu-overlay ${isMenuOpen ? 'navbar-mobile-menu-open' : ''}`}>
                <div className="navbar-mobile-links-group">
                    <Link to="/" className={`navbar-nav-link ${location.pathname === '/' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Home</Link>
                    <Link to="/categories" className={`navbar-nav-link ${location.pathname === '/categories' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Categories</Link>
                    <Link to="/offers" className={`navbar-nav-link ${location.pathname === '/offers' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Offers</Link>
                    <Link to="/contact" className={`navbar-nav-link ${location.pathname === '/contact' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Contact</Link>
                    <Link to="/about" className={`navbar-nav-link ${location.pathname === '/about' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>About Us</Link>
                </div>
 
                <div className="navbar-mobile-search-group">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="navbar-search-input"
                    />
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="navbar-search-icon-inside"
                        onClick={handleSearch}
                    />
                </div>
 
                <div className="navbar-mobile-actions-group">
                    <div>
                        <span className="navbar-login-link" onClick={handleLoginLogout}>
                            {isLoggedIn ? 'Logout' : 'Login'}
                        </span>
                    </div>
                    <div className="navbar-cart-section">
                        <Link to="/cart" className="navbar-cart-link" onClick={handleNavLinkClick}>
                            <FontAwesomeIcon icon={faShoppingCart} className="navbar-cart-icon" />
                            {cartCount > 0 && <span className="navbar-cart-count">{cartCount}</span>}
                        </Link>
                    </div>
                    <div className="navbar-profile-section">
                        <Link to="/profile" className="navbar-profile-link" onClick={handleNavLinkClick}>
                            <FontAwesomeIcon icon={faUser} className="navbar-profile-icon-fa" />
                            <span className="navbar-profile-text"></span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
 
export default NavBar;