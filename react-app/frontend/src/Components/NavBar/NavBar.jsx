import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faShoppingCart, faBars, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import logo from '../../Assets/Images/logo_fsp.png';
import { CartContext } from '../../Context/CartContext';
import { AuthContext } from '../../Context/AuthContext';
import { useTheme } from '../../Context/ThemeContext';   // ✅ import theme context
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems.length;

  const { isLoggedIn, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();  // ✅ use theme

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter' || event.type === 'click') {
      if (searchQuery.trim()) {
        navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
        handleNavLinkClick();
      }
    }
  };

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      logout();
      toast.success('You have been logged out.');
      navigate('/');
    } else {
      navigate('/login');
    }
    handleNavLinkClick();
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-header-row">
        <div className="navbar-logo">
          <img src={logo} alt="Logo" className="navbar-logo-image" onClick={() => navigate('/')} />
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
              </Link>
            </div>

            {/* ✅ Theme Toggle Button */}
            <div className="navbar-theme-toggle">
              <button onClick={toggleTheme} className="theme-toggle-btn">
                <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
              </button>
            </div>
          </div>
        </div>

        <div className="navbar-hamburger-menu" onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBars} />
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbarmobile-menu-overlay ${isMenuOpen ? 'navbarmobile-menu-open' : ''}`}>
        <div className="navbarmobile-links-group">
          <Link to="/" className={`navbar-nav-link ${location.pathname === '/' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Home</Link>
          <Link to="/categories" className={`navbar-nav-link ${location.pathname === '/categories' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Categories</Link>
          <Link to="/offers" className={`navbar-nav-link ${location.pathname === '/offers' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Offers</Link>
          <Link to="/contact" className={`navbar-nav-link ${location.pathname === '/contact' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>Contact</Link>
          <Link to="/about" className={`navbar-nav-link ${location.pathname === '/about' ? 'navbar-link-active' : ''}`} onClick={handleNavLinkClick}>About Us</Link>
        </div>

        <div className="navbarmobile-search-group">
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

        <div className="navbarmobile-actions-group">
          <span className="navbar-login-link" onClick={handleLoginLogout}>
            {isLoggedIn ? 'Logout' : 'Login'}
          </span>
          <Link to="/cart" className="navbar-cart-link" onClick={handleNavLinkClick}>
            <FontAwesomeIcon icon={faShoppingCart} className="navbar-cart-icon" />
            {cartCount > 0 && <span className="navbar-cart-count">{cartCount}</span>}
          </Link>
          <Link to="/profile" className="navbar-profile-link" onClick={handleNavLinkClick}>
            <FontAwesomeIcon icon={faUser} className="navbar-profile-icon-fa" />
          </Link>

          {/* ✅ Mobile Theme Toggle */}
          <button onClick={toggleTheme} className="theme-toggle-btn">
            <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
