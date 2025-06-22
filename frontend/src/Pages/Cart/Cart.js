import React, { useContext, useState, useEffect } from "react";

import "./Cart.css"; // Your existing Cart CSS

import { CartContext } from "../../Context/CartContext"; // Standard import path

import { AuthContext } from "../../Context/AuthContext"; // Standard import path

import { OrderContext } from "../../Context/OrderContext"; // Standard import path

import { useNavigate } from "react-router-dom";

import axios from "axios";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

// Removed: import BuyNowModal from '../../Components/BuyNowModal/BuyNowModal'; // No longer needed

const ShoppingCart = () => {
  const token = localStorage.getItem("token"); // Assuming you store the token in localStorage

  const { orders, setOrders, addOrder } = useContext(OrderContext);

  const navigate = useNavigate();

  const { isLoggedIn, user } = useContext(AuthContext);

  const { cartItems, setCartItems } = useContext(CartContext);

  const [loadingCart, setLoadingCart] = useState(true);

  const [cartError, setCartError] = useState(null); // Removed: const [showBuyNowModal, setShowBuyNowModal] = useState(false); // No longer needed // --- ADDRESS STATES ---

  const [userAddresses, setUserAddresses] = useState([]); // Stores fetched addresses

  const [selectedAddress, setSelectedAddress] = useState(null); // Stores the currently selected address object

  const [showNewAddressForm, setShowNewAddressForm] = useState(false); // Controls visibility of new address form

  const [newAddressInput, setNewAddressInput] = useState({
    // State for new address form inputs

    name: "", // NEW FIELD
    phone: "", // NEW FIELD
    addressLine1: "",

    addressLine2: "",

    city: "",

    state: "",

    pinCode: "",
  });

  const [loadingAddresses, setLoadingAddresses] = useState(true); // Loading state for addresses

  const [addressError, setAddressError] = useState(null); // Error state for addresses // --- END ADDRESS STATES ---

  const currentUserId = user ? user.id : null;

  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"; // Effect to fetch cart items

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartItems([]);

        setLoadingCart(false);

        toast.warn("Please log in to view your cart.");

        navigate("/login");

        return;
      }

      try {
        setLoadingCart(true);

        setCartError(null); // Assuming GET /api/user/cart/getItems/:userId endpoint

        const response = await axios.get(
          `${BACKEND_URL}/api/user/cart/getItems`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token for authentication

              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200 && response.data.cart) {
          console.log(
            "Cart items fetched successfully:",
            response.data.cart.items
          );

          setCartItems(response.data.cart.items); // Correct: set to the items array
        } else {
          console.log(
            "No cart items found or unexpected response:",
            response.data
          );

          setCartItems([]); // Ensure cart is empty if no items are returned
        }
      } catch (error) {
        console.error(
          "Error getting cart items:",
          error.response?.data || error.message
        );

        setCartError(
          error.response?.data?.message || "Failed to load cart items."
        );

        setCartItems([]); // Clear cart on error
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCartItems();
  }, [currentUserId, BACKEND_URL, setCartItems]); // Effect to fetch user addresses

  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!currentUserId) {
        setUserAddresses([]);

        setLoadingAddresses(false);

        return;
      }

      try {
        setLoadingAddresses(true);

        setAddressError(null); // Assuming backend endpoint: GET /api/users/:userId/addresses

        const response = await axios.get(
          `${BACKEND_URL}/api/users/${currentUserId}/addresses`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token for authentication

              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200 && response.data.addresses) {
          setUserAddresses(response.data.addresses);

          if (response.data.addresses.length > 0) {
            setSelectedAddress(response.data.addresses[0]); // Select first address by default
          } else {
            setShowNewAddressForm(true); // Show new address form if no saved addresses
          }
        } else {
          setUserAddresses([]);

          setShowNewAddressForm(true); // Show new address form if no addresses returned
        }
      } catch (error) {
        console.error(
          "Error fetching user addresses:",
          error.response?.data || error.message
        );

        setAddressError(
          error.response?.data?.message || "Failed to load saved addresses."
        );

        setUserAddresses([]);

        setShowNewAddressForm(true); // Fallback to new address form on error
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchUserAddresses();
  }, [currentUserId, BACKEND_URL]); // const updateIncreaseQuantity = async (itemToUpdate) => { //   try { //     if (!currentUserId) { //       alert("Please log in to modify your cart."); //       navigate('/login'); //       return; //     } //     const response = await axios.post(`${BACKEND_URL}/api/users/cart/add`, { //       userId: currentUserId, //       productId: itemToUpdate.productId, //       title: itemToUpdate.title, //       price: itemToUpdate.price, //       img: itemToUpdate.img, //       quantityDelta: 1 //     }); //     if (response.status === 200 && response.data.cart) { //       console.log("Quantity increased successfully:", response.data.cart.items); //       setCartItems(response.data.cart.items); //     } else { //       alert(response.data.message || "Failed to increase quantity."); //     } //   } catch (error) { //     console.error("Error updating the quantity (increase):", error.response?.data || error.message); //     alert(error.response?.data?.message || "An error occurred while increasing quantity."); //   } // }; // const updateDecreaseQuantity = async (itemToUpdate) => { //   if (itemToUpdate.quantity <= 1) { //     removeItem(itemToUpdate.productId); //     return; //   } //   try { //     if (!currentUserId) { //       alert("Please log in to modify your cart."); //       navigate('/login'); //       return; //     } //     const response = await axios.post(`${BACKEND_URL}/api/users/cart/add`, { //       userId: currentUserId, //       productId: itemToUpdate.productId, //       title: itemToUpdate.title, //       price: itemToUpdate.price, //       img: itemToUpdate.img, //       quantityDelta: -1 //     }); //     if (response.status === 200 && response.data.cart) { //       console.log("Quantity decreased successfully:", response.data.cart.items); //       setCartItems(response.data.cart.items); //     } else { //       alert(response.data.message || "Failed to decrease quantity."); //     } //   } catch (error) { //     console.error("Error updating the quantity (decrease):", error.response?.data || error.message); //     alert(error.response?.data?.message || "An error occurred while decreasing quantity."); //   } // };

  if (!token) {
    console.error("No token found in localStorage. Please log in.");

    return (
      <div className="cart-container">Please log in to view your cart.</div>
    );
  }

  const updateIncreaseQuantity = async (itemToUpdate) => {
    try {
      if (!currentUserId) {
        toast.warn("Please log in to modify your cart.");

        navigate("/login");

        return;
      } // MODIFICATION HERE: Wrap itemToUpdate in an 'items' array

      const response = await axios.post(
        `${BACKEND_URL}/api/users/cart/add`,
        {
          userId: currentUserId,

          items: [
            {
              // <--- START: items array

              productId: itemToUpdate.productId,

              title: itemToUpdate.title,

              price: itemToUpdate.price,

              img: itemToUpdate.img,

              quantityDelta: 1, // This is specific to your backend logic
            },
          ], // <--- END: items array
        },

        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token for authentication

            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.cart) {
        console.log(
          "Quantity increased successfully:",
          response.data.cart.items
        );

        setCartItems(response.data.cart.items);
      } else {
        toast.error(response.data.message || "Failed to increase quantity.");
      }
    } catch (error) {
      console.error(
        "Error updating the quantity (increase):",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "An error occurred while increasing quantity."
      );
    }
  };

  const updateDecreaseQuantity = async (itemToUpdate) => {
    if (itemToUpdate.quantity <= 1) {
      removeItem(itemToUpdate.productId);

      return;
    }

    try {
      if (!currentUserId) {
        toast.warn("Please log in to modify your cart.");

        navigate("/login");

        return;
      } // MODIFICATION HERE: Wrap itemToUpdate in an 'items' array

      const response = await axios.post(
        `${BACKEND_URL}/api/users/cart/add`,
        {
          userId: currentUserId,

          items: [
            {
              // <--- START: items array

              productId: itemToUpdate.productId,

              title: itemToUpdate.title,

              price: itemToUpdate.price,

              img: itemToUpdate.img,

              quantityDelta: -1, // This is specific to your backend logic
            },
          ], // <--- END: items array
        },

        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token for authentication

            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.cart) {
        console.log(
          "Quantity decreased successfully:",
          response.data.cart.items
        );

        setCartItems(response.data.cart.items);
      } else {
        alert(response.data.message || "Failed to decrease quantity.");
      }
    } catch (error) {
      console.error(
        "Error updating the quantity (decrease):",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "An error occurred while decreasing quantity."
      );
    }
  };

  const removeItem = async (productIdToRemove) => {
    try {
      if (!currentUserId) {
        alert("Please log in to modify your cart.");

        navigate("/login");

        return;
      }

      const response = await axios.delete(
        `${BACKEND_URL}/api/users/cart/remove/${currentUserId}/${productIdToRemove}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token for authentication

            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.savedCart) {
        console.log(
          "Product removed from cart:",
          response.data.savedCart.items
        );

        toast.success("Product removed from cart successfully.");

        setCartItems(response.data.savedCart.items);
      } else {
        toast.error(
          response.data.message || "Failed to remove product from cart."
        );
      }
    } catch (error) {
      console.error(
        "Error removing product from cart:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "An error occurred while removing product."
      );
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const subtotal = calculateSubtotal();

  const tax = subtotal * 0.175;

  const total = subtotal + tax; // This function now directly handles order confirmation and placement

  const handleConfirmPurchase = async () => {
    if (!isLoggedIn) {
      toast.warn("Please log in to proceed with your purchase.");

      navigate("/login");

      return;
    } else if (cartItems.length === 0) {
      toast.warning(
        "Your cart is empty. Please add items before proceeding to purchase."
      );

      return;
    } // Determine which address to use and validate

    let addressToUse = null;

    if (showNewAddressForm) {
      addressToUse = newAddressInput;
    } else if (selectedAddress) {
      addressToUse = selectedAddress;
    } // Validate address presence and new address form fields // Updated validation to include name and phone

    if (!addressToUse) {
      toast.warn("Please select or enter a shipping address to proceed.");

      return;
    } else if (
      showNewAddressForm &&
      (!newAddressInput.name ||
        !newAddressInput.phone ||
        !newAddressInput.addressLine1 ||
        !newAddressInput.city ||
        !newAddressInput.state ||
        !newAddressInput.pinCode)
    ) {
      toast.warn(
        "Please fill in all required fields for the new shipping address."
      );

      return;
    }

    try {
      const orderPayload = {
        userId: currentUserId,

        items: cartItems.map((item) => ({
          productId: item.productId,

          title: item.title,

          quantity: item.quantity,

          price: item.price,

          img: item.img, // category: item.category, // subCategory: item.subCategory,
        })),

        totalAmount: total,

        status: "Pending", // Format the shipping address string for the Order model to include name and phone

        shippingAddress: `${addressToUse.name}, ${addressToUse.phone}, ${
          addressToUse.addressLine1
        }${
          addressToUse.addressLine2 ? ", " + addressToUse.addressLine2 : ""
        }, ${addressToUse.city}, ${addressToUse.state} - ${
          addressToUse.pinCode
        }`,
      };

      console.log(orderPayload);

      const orderResponse = await axios.post(
        `${BACKEND_URL}/api/orders/add`,
        orderPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token for authentication

            "Content-Type": "application/json",
          },
        }
      );

      if (orderResponse.status === 200 || orderResponse.status === 201) {
        console.log("Order placed successfully:", orderResponse.data);

        toast.success("Order placed successfully!"); //send mail to the user on successful order placement // Clear the cart on the backend after successful order placement

        await axios.delete(
          `${BACKEND_URL}/api/users/cart/remove/${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token for authentication

              "Content-Type": "application/json",
            },
          }
        );

        setCartItems([]); // Clear frontend cart

        toast.success(
          "Thank you for your purchase! Your order has been placed."
        );

        navigate("/profile");
      } else {
        toast.error(orderResponse.data.message || "Failed to place order.");
      }
    } catch (error) {
      console.error(
        "Error placing order:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "An error occurred while placing your order."
      );
    }
  }; // Handler for new address input changes

  const handleNewAddressInputChange = (e) => {
    const { name, value } = e.target;

    setNewAddressInput((prev) => ({ ...prev, [name]: value }));

    setSelectedAddress(null); // Deselect any saved address when typing a new one
  }; // Handler for selecting a saved address

  const handleSelectSavedAddress = (address) => {
    setSelectedAddress(address);

    setShowNewAddressForm(false); // Hide new address form if a saved one is selected // Clear new address form inputs when a saved address is selected

    setNewAddressInput({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pinCode: "",
    });
  }; // Optional: Function to save a newly entered address to the user's profile

  const handleSaveNewAddress = async () => {
    if (!currentUserId) {
      toast.warn("Please log in to save addresses.");

      return;
    } // Validate newAddressInput fields (ensure they match your backend model's required fields)

    if (
      !newAddressInput.name ||
      !newAddressInput.phone ||
      !newAddressInput.addressLine1 ||
      !newAddressInput.city ||
      !newAddressInput.state ||
      !newAddressInput.pinCode
    ) {
      toast.warning(
        "Please fill in all required address fields before saving."
      );

      return;
    }

    try {
      // Payload directly matches backend model names

      const addressPayload = {
        name: newAddressInput.name, // NEW FIELD
        phone: newAddressInput.phone, // NEW FIELD
        addressLine1: newAddressInput.addressLine1,

        addressLine2: newAddressInput.addressLine2,

        city: newAddressInput.city,

        pinCode: newAddressInput.pinCode,

        state: newAddressInput.state,
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/users/addresses/add/${currentUserId}`,
        addressPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token for authentication

            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 && response.data.addresses) {
        setUserAddresses(response.data.addresses);

        setSelectedAddress(
          response.data.addresses[response.data.addresses.length - 1]
        );

        setShowNewAddressForm(false);

        setNewAddressInput({
          name: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          pinCode: "",
        });

        alert("Address saved successfully!");
      } else {
        toast.error(response.data.message || "Failed to save address.");
      }
    } catch (error) {
      console.error(
        "Error saving new address:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "An error occurred while saving the address."
      );
    }
  }; // New function to go back to saved addresses view

  const handleGoBackToSavedAddresses = () => {
    setShowNewAddressForm(false); // Hide the new address form // Optionally, re-select the first address if available, or clear selection

    if (userAddresses.length > 0) {
      setSelectedAddress(userAddresses[0]);
    } else {
      setSelectedAddress(null);
    } // Clear new address input fields

    setNewAddressInput({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pinCode: "",
    });
  };

  if (loadingCart || loadingAddresses) {
    return <div className="cart-container">Loading cart and addresses...</div>;
  }

  if (cartError || addressError) {
    return (
      <div
        className="cart-container"
        style={{ color: "red", textAlign: "center", padding: "20px" }}
      >
         <h3>Error: {cartError || addressError}</h3>     {" "}
        <p>
          Please ensure your backend server is running and you are logged in.
        </p>
        {" "}
      </div>
    );
  }

  return (
    <div className="shoppingcart-container">
       <h1>Shopping Cart</h1>{" "}
      {cartItems.length > 0 ? (
        <div>
          {" "}
          {cartItems.map((item) => (
            <div key={item.productId} className="shoppingcart-item">
              {" "}
              <img
                src={item.img}
                alt={item.title}
                className="shoppingcart-item-image"
              />
              {" "}
              <div className="shoppingcart-item-details">
                <h3>{item.title}</h3>{" "}
                <p>Price: ₹{item.price}</p>{" "}
              </div>
              {" "}
              <div className="shoppingcart-item-actions">
                {" "}
                <div className="shoppingcart-quantity-controls">
                  {" "}
                  <button
                    className="shoppingcart-quantity-button"
                    onClick={() => updateDecreaseQuantity(item)}
                  >
                     - {" "}
                  </button>
                  {" "}
                  <input
                    type="number"
                    className="shoppingcart-quantity-input"
                    value={item.quantity}
                    readOnly
                  />
                  {" "}
                  <button
                    className="shoppingcart-quantity-button"
                    onClick={() => updateIncreaseQuantity(item)}
                  >
                     + {" "}
                  </button>
                  {" "}
                </div>
                {" "}
                <button
                  className="shoppingcart-remove-button"
                  onClick={() => removeItem(item.productId)}
                >
                 Remove {" "}
                </button>
                {" "}
              </div>
              {" "}
            </div>
          ))}
          {/* --- SHIPPING ADDRESS SECTION --- */}{" "}
          <div className="shoppingcart-shipping-address-section">
           <h2>Shipping Address</h2>{" "}
            {/* Display Saved Addresses if available and not showing new form */}
            {" "}
            {userAddresses.length > 0 && !showNewAddressForm ? (
              <div className="shoppingcart-saved-addresses">
                 <h3>Select a Saved Address:</h3>
               {" "}
                {userAddresses.map((addr, index) => (
                  <label key={index} className="shoppingcart-address-option">
                    {" "}
                    <input
                      type="radio"
                      name="shippingAddress" // Updated checked comparison to include name and phone
                      checked={
                        selectedAddress &&
                        selectedAddress.name === addr.name &&
                        selectedAddress.phone === addr.phone &&
                        selectedAddress.addressLine1 === addr.addressLine1 &&
                        selectedAddress.city === addr.city &&
                        selectedAddress.pinCode === addr.pinCode &&
                        selectedAddress.state === addr.state
                      }
                      onChange={() => handleSelectSavedAddress(addr)}
                    />
                   {" "}
                    <div className="shoppingcart-address-details">
                    {" "}
                      <p>
                        <strong>{addr.name}</strong>
                      </p>{" "}
                      {/* Display Name */}{" "}
                      <p>{addr.phone}</p>  {/* Display Phone */}
                      <p>{addr.addressLine1}</p>
                      {" "}
                      {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                      {" "}
                      <p>
                        {addr.city}, {addr.state} - {addr.pinCode}
                      </p>
                      {" "}
                    </div>
                    {" "}
                  </label>
                ))}
               {" "}
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="shoppingcart-add-new-address-btn"
                >
                   Use a Different Address              
                  {" "}
                </button>
                {" "}
              </div>
            ) : null}
            {/* New Address Input Form (conditionally rendered) */} 
            {" "}
            {(userAddresses.length === 0 || showNewAddressForm) && (
              <div className="shoppingcart-new-address-form">
                {" "}
                <h3>
                  {" "}
                  {userAddresses.length > 0 && (
                    <span
                      className="shoppingcart-back-arrow"
                      onClick={handleGoBackToSavedAddresses}
                      title="Go back to saved addresses"
                    >
                       ← 
                      {" "}
                    </span>
                  )}
                  {" "}
                  {userAddresses.length > 0
                    ? "Enter New Address:"
                    : "Enter Your Address:"}
                  {" "}
                </h3>
                {" "}
                <input
                  type="text"
                  name="name" // NEW FIELD
                  placeholder="Full Name"
                  value={newAddressInput.name}
                  onChange={handleNewAddressInputChange}
                  className="shoppingcart-address-input"
                />
                {" "}
                <input
                  type="tel" // Use type="tel" for phone numbers
                  name="phone" // NEW FIELD
                  placeholder="Phone Number"
                  value={newAddressInput.phone}
                  onChange={handleNewAddressInputChange}
                  className="shoppingcart-address-input"
                />
                {" "}
                <input
                  type="text"
                  name="addressLine1"
                  placeholder="Address Line 1"
                  value={newAddressInput.addressLine1}
                  onChange={handleNewAddressInputChange}
                  className="shoppingcart-address-input"
                />
                {" "}
                <input
                  type="text"
                  name="addressLine2"
                  placeholder="Address Line 2 (Optional)"
                  value={newAddressInput.addressLine2}
                  onChange={handleNewAddressInputChange}
                  className="shoppingcart-address-input"
                />
                {" "}
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={newAddressInput.city}
                  onChange={handleNewAddressInputChange}
                  className="shoppingcart-address-input"
                />{" "}
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={newAddressInput.state}
                  onChange={handleNewAddressInputChange}
                  className="shoppingcart-address-input"
                />
                {" "}
                <input
                  type="text"
                  name="pinCode"
                  placeholder="Pin Code"
                  value={newAddressInput.pinCode}
                  onChange={handleNewAddressInputChange}
                  className="shoppingcart-address-input"
                />
                {" "}
                {showNewAddressForm && (
                  <button
                    onClick={handleSaveNewAddress}
                    className="shoppingcart-save-address-btn"
                  >
                    Save This Address
                  </button>
                )}
                {" "}
              </div>
            )}
            {" "}
          </div>
          {/* --- END SHIPPING ADDRESS SECTION --- */}        {" "}
          <div className="shoppingcart-summary">
            {" "}
            <div className="shoppingcart-summary-row">
               <span>Subtotal:</span>{" "}
              <span>₹{subtotal.toFixed(2)}</span> {" "}
            </div>
            {" "}
            <div className="shoppingcart-summary-row">
             <span>Tax:</span>{" "}
              <span>₹{tax.toFixed(2)}</span>{" "}
            </div>
           {" "}
            <div className="shoppingcart-summary-row">
              <span>Total:</span>{" "}
              <span>₹{total.toFixed(2)}</span>{" "}
            </div>
            {" "}
            <div className="shoppingcart-buy-now">
              {" "}
              <button
                className="shoppingcart-buy-now-button"
                onClick={handleConfirmPurchase}
              >
                Place Order {" "}
              </button>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
    {" "}
    </div>
  );
};

export default ShoppingCart;
