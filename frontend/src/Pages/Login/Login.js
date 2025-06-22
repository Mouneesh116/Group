import React, { useState, useContext } from 'react'; // Import useContext
import './Login.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import shoes from '../../Assets/Images/login.jpg'; // Import your image here
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const Login = () => {
    const { login, setUserId, setIsLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false); 
    const formData = {
        email: email,
        password: password
    };

    const validateForm = () => {
        const formErrors = {};
        if (!email) {
            formErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            formErrors.email = 'Email is invalid';
        }
        if (!password) {
            formErrors.password = 'Password is required';
        } else if (password.length < 6) {
            formErrors.password = 'Password must be at least 6 characters';
        }
        return formErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        setErrors({}); // Clear previous errors
        setLoading(true); // Set loading state

        if (Object.keys(formErrors).length === 0) {
            try {
                
                const result = await login(formData); 

                if (result.success == true) {
                    setUserId(result.userId);
                    setIsLoggedIn(true);
                    console.log("Login successful!");
                    console.log("User role:", result.role);

                    if (result.role === 'admin') {
                        console.log("Admin navigation done successfully");
                        navigate('/admin'); 
                    } else {
                        navigate('/'); 
                    }
                } else {
                    setErrors({ email: result.error || 'Login failed. Please check your credentials.' });
                }
            } catch (error) {
                console.error("Error during login process:", error);
                setErrors({ email: 'An unexpected error occurred while logging in.' });
            } finally {
                setLoading(false); // Always set loading to false
            }
        } else {
            setErrors(formErrors); // Display form validation errors
            setLoading(false); // Stop loading if form validation fails
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-left">
                    <h2>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="login-form-group">
                            <div className="login-input-line">
                                <FaEnvelope />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your Email"
                                    disabled={loading} // Disable input while loading
                                />
                            </div>
                            {errors.email && <p className="error">{errors.email}</p>}
                        </div>

                        <div className="login-form-group">
                            <div className="login-input-line">
                                <FaLock />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    disabled={loading} // Disable input while loading
                                />
                            </div>
                            {errors.password && <p className="error">{errors.password}</p>}
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <p className="login-signup-link">
                        Don't have an account? <a href="/signup">Sign Up</a>
                    </p>
                    <p className="login-signup-link">
                        Forgot Password <a href="/forgot-password">Reset Password</a>
                    </p>
                </div>
                <div className="login-right">
                    <img src={shoes} alt="Login" />
                </div>
            </div>
            <ToastContainer position='top-right' autoClose={5000}/>
        </div>
    );
};

export default Login;