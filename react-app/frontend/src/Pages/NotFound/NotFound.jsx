import React from 'react'
import { Link } from 'react-router-dom';
import './NotFound.css';
import { useNavigate } from 'react-router-dom';
export const NotFound = () => {
    const navigate = useNavigate();
    const handleClick = () =>{
        navigate('/');
    }
  return (
    <div className="not-found-container">
        <h1>Page Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <p>Please check the URL or return to the homepage.</p>
        <button onClick={handleClick}>Home</button>
    </div>
  )
}
