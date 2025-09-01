import React, { useState } from 'react';
import './SignUp.css'; // Import your CSS file for styling
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import shoes from '../../Assets/Images/signup.jpg';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import { useContext } from 'react';
import axios from 'axios';
 const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errors, setErrors] = useState({});
const validateForm = () => {
    const formErrors = {};
    if (!username) {
      formErrors.username = 'Username is required';
    }
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
       
    if (!repeatPassword) {
      formErrors.repeatPassword = 'Repeat password is required';
    } else if (repeatPassword !== password) {
      formErrors.repeatPassword = 'Passwords do not match';
    }
    return formErrors;
  };
  
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const formErrors = validateForm();
  //   if (Object.keys(formErrors).length === 0) {
  //     console.log({ name, email, password });
  //     const formData = {name,email,password};
  //     // localStorage.setItem('formdata',JSON.stringify(formData));
  //     signup(formData);
  //     navigate('/profile');
  //   } else {
  //     setErrors(formErrors);
  //   }
  // };
const handleSubmit2 = async (e) => {
  e.preventDefault();
  const formErrors = validateForm();
  if(Object.keys(formErrors).length === 0){
    const formData = {username,email,password};
    try {
      const response = await axios.post(`http://localhost:8080/api/users/signup`, formData,
        {headers: {'Content-Type': 'application/json'}}
      );
      console.log(response.data);
      navigate('/login');
      
    } catch (error) {
      console.log("Error signing up", error);
      console.log(error);
    }

  }
}
const handleSubmit = async (e) => {
  e.preventDefault();
  const formErrors = validateForm();
  if(Object.keys(formErrors).length === 0){
    const formData = {username, email, password};
    const result = await signup(formData);
    if (result.success) {
      console.log("Signup successful!");
      navigate('/login'); // Redirect to login page after successful signup
    } else {
      setErrors({ email: result.error || 'Signup failed. Please try again.' });
    }
  }

}
 
  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <div className="signup-left">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="signup-form-group">
              
              <div className="signup-input-line">
                <FaUser />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Username"
                />
              </div>
              {errors.name && <p className="signup-error">{errors.name}</p>}
            </div>
 
            <div className="signup-form-group">
             
              <div className="signup-input-line">
                <FaEnvelope />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>
              {errors.email && <p className="signup-error">{errors.email}</p>}
            </div>
 
            <div className="signup-form-group">
              
              <div className="signup-input-line">
                <FaLock />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>
              {errors.password && <p className="signup-error">{errors.password}</p>}
            </div>
 
            <div className="signup-form-group">
              
              <div className="signup-input-line">
                <FaLock />
                <input
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  placeholder="Repeat Password"
                />
              </div>
              {errors.repeatPassword && <p className="signup-error">{errors.repeatPassword}</p>}
            </div>
 
            <button type="submit" className="signup-register-btn">Register</button>
          </form>
          <p className="signup-login-link">
            <span className="signup-have-an-account-already">Have an account already?</span> <a href="/login">Login</a>
          </p>
        </div>
        <div className="signup-right">
          <img src={shoes} alt="Signup" />
        </div>
      </div>
    </div>
  );
};
 
export default SignUp;
