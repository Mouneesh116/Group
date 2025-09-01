import React, { useState } from 'react';
import './ForgotPassword.css';
import { FaEnvelope } from 'react-icons/fa';
import loginImage from '../../Assets/Images/login.jpg'; // Import your image here
import axios from 'axios';



const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Validate OTP, Step 3: Reset password
  const [message, setMessage] = useState(''); // To display backend messages
 
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:8080/api/users/forgot-password`, { email });
      console.log(response.data);
      setMessage(response.data.message); // Display backend message
      localStorage.setItem('resetToken', response.data.token); // Store the token in local storage
      setStep(2); // Move to Step 2
    } catch (error) {
      console.error('Error sending OTP:', error);
      // setMessage(response.data.message); // Display backend message
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message); // Display the backend error message
      } else {
        setMessage('Failed to send OTP. Please try again.'); // Fallback for network or unexpected errors
      }    
    }
  };
 
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('resetToken'); // Retrieve the token from local storage
    try {
      const response = await axios.post(`http://localhost:8080/api/users/validate-otp`, { token, otp});
      console.log(response.data);
      setMessage('OTP validated successfully');
      setStep(3); // Move to Step 3
    } catch (error) {
      console.error('Error validating OTP:', error);
      setMessage('Invalid OTP. Please try again.');
    }
  };
 
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match. Please try again.');
      return;
    }
    const token = localStorage.getItem('resetToken'); // Retrieve the token from local storage
    // console.log('New Password:', newPassword); // Debugging log
    // console.log('Token:', token); // Debugging log
 
    try {
      const response = await axios.post(`http://localhost:8080/api/users/reset-password`, {
        token,
        newPassword
      });
      console.log(response.data);
      setMessage(response.data.message);
      localStorage.removeItem('resetToken'); // Clear the token from local storage
      window.location.href = '/login'; // Redirect to login page
    } catch (error) {
      console.error('Error resetting password:', error);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message); // Display the backend error message
      } else {
        setMessage('Failed to reset password. Please try again.'); // Fallback for network or unexpected errors
      }    }
  };
 
  return (
    <div className="forgotpassword-reset-wrapper">
      <div className="forgotpassword-reset-container">
        <div className="forgotpassword-reset-left">
          {step === 1 && (
            <>
              <h2>Forgot Password</h2>
              {message && <p className="forgotpassword-message">{message}</p>} {/* Display backend message */}
              <form onSubmit={handleEmailSubmit}>
                <div className="forgotpassword-form-group">
                  <div className="forgotpassword-input-line">
                    <FaEnvelope />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your Email"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="forgotpassword-reset-btn">Send OTP</button>
              </form>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Validate OTP</h2>
              {message && <p className="forgotpassword-message">{message}</p>} {/* Display backend message */}
              <form onSubmit={handleOtpSubmit}>
                <div className="forgotpassword-form-group">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                  />
                </div>
                <button type="submit" className="forgotpassword-reset-btn">Validate OTP</button>
              </form>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Reset Password</h2>
              {message && <p className="forgotpassword-message">{message}</p>} {/* Display backend message */}
              <form onSubmit={handleResetSubmit}>
                <div className="forgotpassword-form-group">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter New Password"
                    required
                  />
                </div>
                <div className="forgotpassword-form-group">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    required
                  />
                </div>
                <button type="submit" className="forgotpassword-reset-btn">Reset Password</button>
              </form>
            </>
          )}
        </div>
        <div className="forgotpassword-reset-right">
          <img src={loginImage} alt="Reset Password" />
        </div>
      </div>
    </div>
  );
};
 
export default ForgotPassword;
 