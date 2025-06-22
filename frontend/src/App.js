import './App.css';
import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login';
import SignUp from './Pages/SignUp/SignUp';
import HomePage from './Pages/HomePage/HomePage';
import { NotFound } from './Pages/NotFound/NotFound';
import { DisplayCard } from './Components/DisplayCard/DisplayCard';
import NavBar from './Components/NavBar/NavBar';
import { useContext, useState, useEffect } from 'react';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';
import ProductCard from './Components/ProductCard/ProductCard';
import { Products2 } from './Pages/Products/Products2';
import CategoriesRow from './Components/CategoriesRow/CategoriesRow';
import SingleProduct from './Pages/SingleProduct/SingleProduct';
import Cart from './Pages/Cart/Cart';
import SearchResults from './Pages/SearchResults/SearchResults';
import { CartProvider } from './Context/CartContext';
import UserProfile from './Pages/UserProfile/UserProfile/UserProfile';
import { OffersSlider } from './Components/Offers/OffersSlider';
import Footer from './Components/Footer/Footer';
import { AuthProvider } from './Context/AuthContext';
import { OrderProvider } from './Context/OrderContext';
import AdminDashboard from './Pages/AdminPage/AdminDashboard';
import AdminRoute from './Routes/AdminRoute';
import { AuthContext } from './Context/AuthContext';
import RouteGuard from './Routes/RouteGuard';
import ChatBot from './Pages/ChatBot/ChatBot';
import { WishListProvider } from './Context/WishListContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ContactUs from './Pages/ContactUs/ContactUs';
import AboutUs from './Pages/AboutUs/AboutUs';

const App = () => {
  const { user,role } = useContext(AuthContext);
  return (
    <div className="App">
        <CartProvider>
          <OrderProvider>
            <WishListProvider>
            {role !== "admin" && <NavBar/>}
            {/* <NavBar/> */}
            <RouteGuard/>
            <Routes>
              <>
              <Route path='/admin' 
                element={
                  <AdminRoute>
                  <AdminDashboard/>
                  </AdminRoute>}
                />
              <Route path='' element={<HomePage/>}/>
              <Route path='/login' element={<Login/>} />
              <Route path='/signup' element={<SignUp/>}/>
              <Route path='/forgot-password' element={<ForgotPassword/>}/>
              <Route path='/displayproduct' element={<DisplayCard/>}/>
              <Route path='/categories' element={<CategoriesRow/>}/>
              <Route path='/offers' element={<OffersSlider/>}/>
              <Route path='/contact' element={<ContactUs/>}/>
              <Route path='/categories/:category' element={<Products2/>}/>
              <Route path='/categories/:category/:id' element={<SingleProduct/>}/>
              <Route path='/cart' element={<Cart/>}/>
              <Route path='/search' element={<SearchResults/>}/>
              <Route path='/profile' element={<UserProfile/>}/>
              <Route path='/chat' element={<ChatBot/>}/>
              <Route path='/about' element={<AboutUs/>}/>
              <Route path='*' element={<NotFound/>}/>
              </>
              
            </Routes>
            </WishListProvider>
          </OrderProvider>
        </CartProvider>
        <ToastContainer position='top-center' autoClose={2000}/>
    </div>
  );
}

export default App;
