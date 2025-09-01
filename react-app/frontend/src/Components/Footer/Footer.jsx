import { CiFacebook } from "react-icons/ci";
import { RiTwitterXFill, RiYoutubeLine } from "react-icons/ri";
import { FaInstagram } from "react-icons/fa6";
import './Footer.css';
 
const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-sections">
                <div className="footer-column">
                    <h5>About</h5>
                    <a href="#">Contact Us</a>
                    <a href="#">About Us</a>
                    <a href="#">Careers</a>
                    <a href="#">E-Commerce Stories</a>
                    <a href="#">Press</a>
                    <a href="#">Corporate Info</a>
                </div>
                <div className="footer-column">
                    <h5>Help</h5>
                    <a href="#">Payments</a>
                    <a href="#">Shipping</a>
                    <a href="#">Cancellations</a>
                    <a href="#">Returns</a>
                    <a href="#">FAQs</a>
                </div>
                <div className="footer-column">
                    <h5>Policies</h5>
                    <a href="#">Returns & Cancellations</a>
                    <a href="#">Terms of Use</a>
                    <a href="#">Security</a>
                    <a href="#">Privacy</a>
                    <a href="#">&copy; E-Commerce.com</a>
                </div>
                <div className="footer-column">
                    <h5>Social</h5>
                    <div className="footer-social-icons">
                        <a href="#"><CiFacebook /></a>
                        <a href="#"><RiTwitterXFill /></a>
                        <a href="#"><RiYoutubeLine /></a>
                        <a href="#"><FaInstagram /></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>
                    E-Commerce Internet Pvt. Ltd., Embassy Tech Village, Bengaluru, 560103, Karnataka, India
                </p>
            </div>
        </footer>
    );
};
 
export default Footer;
