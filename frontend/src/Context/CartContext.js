// import React, { createContext, useState } from 'react';
// import axios from 'axios';
// export const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);

//   const addToCart = (product) => {
//     setCartItems((prevItems) => {
//       const existingItem = prevItems.find((item) => item.id === product.id);
//       if (existingItem) {
//         return prevItems.map((item) =>
//           item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
//         );
//       }
//       return [...prevItems, { ...product, quantity: 1 }];
//     });
//   };

//   return (
//     <CartContext.Provider value={{ cartItems, setCartItems, addToCart }}>
//       {children}
//     </CartContext.Provider>
//   );
// };


















import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

useEffect(()=>{
  const fetchCartItems = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartItems([]);
      return;
    }
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/cart/getItems`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    if (response.status === 200 && response.data.cart) {
      setCartItems(response.data.cart.items || []);
    } else {
      setCartItems([]);
    }
    } catch (error) {
      console.error('Error fetching cart items:', error.message);
        setCartItems([]);
    } finally {
    }
  }
  fetchCartItems();
},[])



  const token = localStorage.getItem('token');
  const addToCart = async (product) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/cart/add`,product,
        {headers: {'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }}
      );
      if(response.status === 200){
        console.log("Product has been added to cart", product);
        setCartItems(response.data.cartItems || []);
        toast.success("Product has been added to cart");

      }
    } catch (error) {
      console.log("Error",error);
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
        toast.error(`Cart Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to add product to cart. Please try again.');
      }
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};