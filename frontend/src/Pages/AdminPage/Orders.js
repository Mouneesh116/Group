// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import "./Orders.css"; // Assuming your CSS file is here
// import useDebounce from "../../hooks/useDebounce"; // Adjust path if your hooks folder is elsewhere

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const ordersPerPage = 10;

//   // Filter states
//   const [statusFilter, setStatusFilter] = useState("");

//   // Raw input state for product search (user types here)
//   const [productSearchInput, setProductSearchInput] = useState("");
//   // Debounced value for product search (this will be used in API call)
//   const debouncedProductSearchTerm = useDebounce(productSearchInput, 500); // 500ms delay

//   // Raw input state for general search (user types here)
//   const [generalSearchInput, setGeneralSearchInput] = useState("");
//   // Debounced value for general search (this will be used in API call)
//   const debouncedGeneralSearchTerm = useDebounce(generalSearchInput, 500); // 500ms delay

//   const [dateFrom, setDateFrom] = useState("");
//   const [dateTo, setDateTo] = useState("");

//   // Sorting states
//   const [sortBy, setSortBy] = useState("orderDate");
//   const [sortOrder, setSortOrder] = useState("desc"); // Default to newest first

//   const statusOptions = [
//     "Pending",
//     "Processing",
//     "Shipped",
//     "Delivered",
//     "Cancelled",
//     "Refunded",
//   ];

//   // --- Effects to trigger API call when debounced values change ---
//   // This useEffect updates the actual filter state (actualProductSearchTerm)
//   // when the debounced value changes, which in turn triggers fetchOrders.
//   useEffect(() => {
//     if (productSearchInput.length > 0 && debouncedProductSearchTerm === "") {
//       // If user types, then deletes, and debounced is empty, still trigger fetch
//       // Or if initial render and it's empty, prevent initial fetch
//       setProductSearchInput(""); // ensure initial state is clear
//     }
//     // Only update and trigger fetch if the debounced term is different
//     // to avoid unnecessary fetches on initial load or non-changes
//     if (
//       debouncedProductSearchTerm !== null &&
//       debouncedProductSearchTerm !== productSearchInput
//     ) {
//       setCurrentPage(1); // Reset page on new search
//     }
//   }, [debouncedProductSearchTerm]);

//   useEffect(() => {
//     if (generalSearchInput.length > 0 && debouncedGeneralSearchTerm === "") {
//       setGeneralSearchInput("");
//     }
//     if (
//       debouncedGeneralSearchTerm !== null &&
//       debouncedGeneralSearchTerm !== generalSearchInput
//     ) {
//       setCurrentPage(1); // Reset page on new search
//     }
//   }, [debouncedGeneralSearchTerm]);

//   // --- API Call Function ---
//   const fetchOrders = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.warn("No token found, user might not be logged in.");
//         setError("Authentication required. Please log in.");
//         setLoading(false);
//         return;
//       }

//       const params = {
//         page: currentPage,
//         limit: ordersPerPage,
//         sortBy,
//         sortOrder,
//       };

//       if (statusFilter) params.status = statusFilter;
//       if (debouncedProductSearchTerm)
//         params.productName = debouncedProductSearchTerm;
//       if (dateFrom) params.dateFrom = dateFrom;
//       if (dateTo) params.dateTo = dateTo;
//       if (debouncedGeneralSearchTerm)
//         params.searchTerm = debouncedGeneralSearchTerm;

//       console.log("Fetching orders with params:", params); // Log params for debugging

//       const response = await axios.get(
//         `${process.env.REACT_APP_BACKEND_URL}/api/orders/getAllOrders`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           params,
//         }
//       );

//       if (response.status === 200) {
//         setOrders(response.data.orders || []);
//         setTotalPages(Math.ceil(response.data.totalOrders / ordersPerPage));
//       } else {
//         console.error("Failed to fetch orders:", response.statusText);
//         setError("Failed to load orders.");
//       }
//     } catch (err) {
//       console.error("Error fetching orders:", err);
//       setError(
//         err.response?.data?.message ||
//           err.message ||
//           "An unexpected error occurred."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [
//     currentPage,
//     ordersPerPage,
//     sortBy,
//     sortOrder,
//     statusFilter,
//     debouncedProductSearchTerm,
//     dateFrom,
//     dateTo,
//     debouncedGeneralSearchTerm,
//   ]);

//   // This useEffect will re-run fetchOrders whenever any of its dependencies change.
//   // The debounced search terms are now direct dependencies.
//   useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   // --- Handlers ---
//   const handleSort = (column) => {
//     if (sortBy === column) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortBy(column);
//       setSortOrder("desc");
//     }
//     setCurrentPage(1); // Always go to first page on sort change
//   };

//   const handleStatusUpdate = async (orderId, newStatus) => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
      
//       const response = await axios.put(
//         `${process.env.REACT_APP_BACKEND_URL}/api/orders/updateStatus/${orderId}`,
//         { status: newStatus },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.status === 200) {
//         setOrders((prevOrders) =>
//           prevOrders.map((order) =>
//             order._id === orderId ? { ...order, status: newStatus } : order
//           )
//         );
//         console.log(`Order ${orderId} status updated to ${newStatus}`);
//       } else {
//         setError(`Failed to update order status: ${response.statusText}`);
//       }
//     } catch (err) {
//       console.error("Error updating order status:", err);
//       setError(
//         err.response?.data?.message ||
//           err.message ||
//           "An unexpected error occurred during status update."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Render ---
//   if (loading && orders.length === 0) {
//     return <p className="adminorder-loading-message">Loading orders...</p>;
//   }

//   return (
//     <div className="adminorder-card adminorder-orders-view">
//       <h3>Order Management</h3>

//       {/* Filters and Search Section */}
//       <div className="adminorder-filters-section">
//         <input
//           type="text"
//           placeholder="Search Order ID, User ID, Address..."
//           value={generalSearchInput} // Bind to raw input state
//           onChange={(e) => setGeneralSearchInput(e.target.value)} // Update raw input state
//           className="adminorder-search-input"
//         />

//         <select
//           value={statusFilter}
//           onChange={(e) => {
//             setStatusFilter(e.target.value);
//             setCurrentPage(1); // Reset page on filter change
//           }}
//           className="adminorder-filter-select"
//         >
//           <option value="">All Statuses</option>
//           {statusOptions.map((status) => (
//             <option key={status} value={status}>
//               {status}
//             </option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder="Filter by Product Name..."
//           value={productSearchInput} // Bind to raw input state
//           onChange={(e) => setProductSearchInput(e.target.value)} // Update raw input state
//           className="adminorder-filter-input"
//         />

//         <label htmlFor="dateFrom" className="adminorder-visually-hidden">
//           Order Date From:
//         </label>
//         <input
//           type="date"
//           id="dateFrom"
//           placeholder="Order date from"
//           value={dateFrom}
//           onChange={(e) => {
//             setDateFrom(e.target.value);
//             setCurrentPage(1); // Reset page on date filter change
//           }}
//           className="adminorder-filter-date"
//           title="Order Date From"
//         />
//         <label htmlFor="dateTo" className="adminorder-visually-hidden">
//           Order Date To:
//         </label>
//         <input
//           type="date"
//           id="dateTo"
//           value={dateTo}
//           onChange={(e) => {
//             setDateTo(e.target.value);
//             setCurrentPage(1); // Reset page on date filter change
//           }}
//           className="adminorder-filter-date"
//           title="Order Date To"
//         />

//         {/* Sorting Controls */}
//         <div className="adminorder-sort-controls">
//           <label htmlFor="sortBy">Sort By:</label>
//           <select
//             id="sortBy"
//             value={sortBy}
//             onChange={(e) => handleSort(e.target.value)}
//           >
//             <option value="orderDate">Order Date</option>
//             <option value="totalAmount">Total Amount</option>
//             <option value="_id">Order ID</option>
//             <option value="status">Status</option>
//           </select>
//           <button
//             onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
//           >
//             {sortOrder === "asc" ? "Asc ⬆" : "Desc ⬇"}
//           </button>
//         </div>
//       </div>

//       {error && <p className="adminorder-error-message">{error}</p>}

//       {/* Orders Cards Container */}
//       <div className="adminorder-orders-cards-container">
//         {orders.length > 0
//           ? orders.map((order) => (
//               <div key={order._id.$oid || order._id} className="order-card">
//                 <div className="adminorder-order-card-left">
//                   <div className="adminorder-order-icon">📦</div>
//                   <div className="adminorder-order-items-list">
//                     {order.items && order.items.length > 0 ? (
//                       order.items.map((item, index) => (
//                         <p
//                           key={item._id?.$oid || item._id || index}
//                           className="adminorder-item-detail"
//                         >
//                           {item.title} x {item.quantity}
//                         </p>
//                       ))
//                     ) : (
//                       <p>No items listed</p>
//                     )}
//                   </div>
//                   <div className="adminorder-customer-info">
//                     {/* Access userId.$oid if it's an object, otherwise direct */}
//                     <p>
//                       <strong>Customer:</strong>{" "}
//                       {order.userId?.username ||
//                         order.userId?.$oid ||
//                         order.userId ||
//                         "N/A"}
//                     </p>
//                     <p className="adminorder-shipping-address">{order.shippingAddress}</p>
//                   </div>
//                 </div>

//                 <div className="adminorder-order-card-right">
//                   <p>
//                     <strong>Items:</strong>{" "}
//                     {order.items ? order.items.length : 0}
//                   </p>
//                   <p className="adminorder-order-total">
//                     <strong>Total:</strong> $
//                     {order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
//                   </p>
//                   <p>
//                     <strong>Method:</strong> COD
//                   </p>
//                   {/* MODIFIED HERE: Correctly access orderDate from the $date property */}
//                   {/* <p>
//                     <strong>Date:</strong>{' '}
//                     {order.orderDate && typeof order.orderDate === 'object' && order.orderDate.$date
//                         ? new Date(order.orderDate.$date).toLocaleDateString()
//                         : 'N/A'
//                     }
//                 </p> */}
//                   <p>
//                     <strong>Date:</strong>{" "}
//                     {order.orderDate // Checks if order.orderDate exists (as a string, Date object, or number)
//                       ? new Date(order.orderDate).toLocaleDateString() // Directly convert the string to Date
//                       : "N/A"}
//                   </p>

//                   <div className="adminorder-order-status-control">
//                     <label
//                       htmlFor={`status-${order._id.$oid || order._id}`}
//                       className="adminorder-visually-hidden"
//                     >
//                       Order Status
//                     </label>
//                     <select
//                       id={`status-${order._id.$oid || order._id}`}
//                       value={order.status}
//                       onChange={(e) =>
//                         handleStatusUpdate(
//                           order._id.$oid || order._id,
//                           e.target.value
//                         )
//                       }
//                       className={`adminorder-status-dropdown adminorder-status-${order.status.toLowerCase()}`}
//                     >
//                       {statusOptions.map((status) => (
//                         <option key={status} value={status}>
//                           {status}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             ))
//           : !loading && (
//               <p className="adminorder-no-orders-message">
//                 No orders found matching your criteria.
//               </p>
//             )}
//       </div>

//       {/* Pagination Controls */}
//       {totalPages > 1 && (
//         <div className="adminorder-pagination-controls">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1 || loading}
//           >
//             Previous
//           </button>
//           <span>
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }
//             disabled={currentPage === totalPages || loading}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Orders;





import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Orders.css";
import useDebounce from "../../hooks/useDebounce";
import Modal from 'react-modal'; // Import React Modal for the OTP popup
import { toast } from 'react-toastify'; // Assuming Toastify is already set up
import 'react-toastify/dist/ReactToastify.css';
 
// Set the app element for React Modal
Modal.setAppElement('#root');
 
const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
 
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ordersPerPage = 10;
 
    // Filter states
    const [statusFilter, setStatusFilter] = useState("");
 
    // Search states
    const [productSearchInput, setProductSearchInput] = useState("");
    const debouncedProductSearchTerm = useDebounce(productSearchInput, 500);
 
    const [generalSearchInput, setGeneralSearchInput] = useState("");
    const debouncedGeneralSearchTerm = useDebounce(generalSearchInput, 500);
 
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
 
    // Sorting states
    const [sortBy, setSortBy] = useState("orderDate");
    const [sortOrder, setSortOrder] = useState("desc");
 
    // OTP Modal states
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [currentOrderIdForOtp, setCurrentOrderIdForOtp] = useState(null);
    const [currentOrderEmailForOtp, setCurrentOrderEmailForOtp] = useState(''); // To show user email
    const [otpInput, setOtpInput] = useState('');
    const [deliveryOtpToken, setDeliveryOtpToken] = useState(''); // Token from backend for OTP validation
    const [isGeneratingOtp, setIsGeneratingOtp] = useState(false); // Loading state for OTP generation
 
    const statusOptions = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Return Requested", // Add if you handle this admin side
        "Returned & Refunded" // Add if you handle this admin side
    ];
 
    useEffect(() => {
        if (debouncedProductSearchTerm !== null) {
            setCurrentPage(1);
        }
    }, [debouncedProductSearchTerm]);
 
    useEffect(() => {
        if (debouncedGeneralSearchTerm !== null) {
            setCurrentPage(1);
        }
    }, [debouncedGeneralSearchTerm]);
 
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("No token found, user might not be logged in.");
                setError("Authentication required. Please log in.");
                setLoading(false);
                return;
            }
 
            const params = {
                page: currentPage,
                limit: ordersPerPage,
                sortBy,
                sortOrder,
            };
 
            if (statusFilter) params.status = statusFilter;
            if (debouncedProductSearchTerm) params.productName = debouncedProductSearchTerm;
            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;
            if (debouncedGeneralSearchTerm) params.searchTerm = debouncedGeneralSearchTerm;
 
            console.log("Fetching orders with params:", params);
 
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/orders/getAllOrders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    params,
                }
            );
 
            if (response.status === 200) {
                setOrders(response.data.orders || []);
                setTotalPages(Math.ceil(response.data.totalOrders / ordersPerPage));
            } else {
                console.error("Failed to fetch orders:", response.statusText);
                setError("Failed to load orders.");
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(
                err.response?.data?.message || err.message || "An unexpected error occurred."
            );
        } finally {
            setLoading(false);
        }
    }, [
        currentPage, ordersPerPage, sortBy, sortOrder, statusFilter,
        debouncedProductSearchTerm, dateFrom, dateTo, debouncedGeneralSearchTerm,
    ]);
 
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
 
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
        setCurrentPage(1);
    };
 
    // New function to initiate OTP generation
    const initiateOtpGeneration = async (orderId, orderEmail) => {
        setIsGeneratingOtp(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Authentication required. Please log in.");
                setIsGeneratingOtp(false);
                return;
            }
 
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/orders/generate-delivery-otp`,
                { orderId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
 
            if (response.status === 200) {
                toast.success("OTP sent to customer's email. Please ask for it.");
                setDeliveryOtpToken(response.data.deliveryOtpToken); // Store the token
                setCurrentOrderIdForOtp(orderId);
                setCurrentOrderEmailForOtp(orderEmail);
                setIsOtpModalOpen(true); // Open the OTP input modal
            } else {
                toast.error(response.data.message || "Failed to send OTP.");
            }
        } catch (err) {
            console.error("Error generating OTP:", err);
            toast.error(err.response?.data?.message || err.message || "An error occurred while generating OTP.");
        } finally {
            setIsGeneratingOtp(false);
        }
    };
 
    // Modified handleStatusUpdate
    const handleStatusUpdate = async (orderId, oldStatus, newStatus, customerEmail) => {
        // If changing from Shipped to Delivered, trigger OTP flow
        if (oldStatus.toLowerCase() === 'shipped' && newStatus.toLowerCase() === 'delivered') {
            initiateOtpGeneration(orderId, customerEmail);
            return; // Prevent direct status update
        }
 
        // For all other status changes, proceed normally
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/orders/updateStatus/${orderId}`,
                { status: newStatus }, // Only send new status for non-OTP changes
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
 
            if (response.status === 200) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        (order._id.$oid || order._id) === orderId ? { ...order, status: newStatus } : order
                    )
                );
                toast.success(`Order ${orderId} status updated to ${newStatus}`);
                console.log(`Order ${orderId} status updated from ${oldStatus} to ${newStatus}`);
            } else {
                setError(`Failed to update order status: ${response.statusText}`);
                toast.error(response.data.message || "Failed to update order status.");
            }
        } catch (err) {
            console.error("Error updating order status:", err);
            setError(err.response?.data?.message || err.message || "An unexpected error occurred during status update.");
            toast.error(err.response?.data?.message || "Error updating status.");
        } finally {
            setLoading(false);
        }
    };
 
    // Function to handle OTP submission in the modal
    const handleSubmitOtp = async () => {
        setLoading(true); // Set loading for OTP verification
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Authentication required. Please log in.");
                setLoading(false);
                return;
            }
 
            // Call the same updateStatus endpoint, but now with OTP details
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/orders/updateStatus/${currentOrderIdForOtp}`,
                { status: 'Delivered', userOtp: otpInput, deliveryOtpToken: deliveryOtpToken },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
 
            if (response.status === 200) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        (order._id.$oid || order._id) === currentOrderIdForOtp
                            ? { ...order, status: 'Delivered' }
                            : order
                    )
                );
                toast.success("Order status successfully updated to Delivered!");
                setIsOtpModalOpen(false); // Close modal
                setOtpInput(''); // Clear OTP input
                setDeliveryOtpToken(''); // Clear token
                setCurrentOrderIdForOtp(null);
                setCurrentOrderEmailForOtp('');
            } else {
                toast.error(response.data.message || "OTP verification failed. Please try again.");
            }
        } catch (err) {
            console.error("Error verifying OTP:", err);
            toast.error(err.response?.data?.message || err.message || "An error occurred during OTP verification.");
        } finally {
            setLoading(false);
        }
    };
 
    // Determine if the dropdown should be disabled
    const isDropdownDisabled = (status) => {
        const disabledStatuses = ["cancelled", "returned & refunded", "delivered"]; // Add 'delivered' here as it's a final state
        return disabledStatuses.includes(status.toLowerCase());
    };
 
    // --- Render ---
    if (loading && orders.length === 0) {
        return <p className="adminorder-loading-message">Loading orders...</p>;
    }
 
    return (
        <div className="adminorder-card adminorder-orders-view">
            <h3>Order Management</h3>
 
            {/* Filters and Search Section */}
            <div className="adminorder-filters-section">
                <input
                    type="text"
                    placeholder="Search Order ID, User ID, Address..."
                    value={generalSearchInput}
                    onChange={(e) => setGeneralSearchInput(e.target.value)}
                    className="adminorder-search-input"
                />
 
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="adminorder-filter-select"
                >
                    <option value="">All Statuses</option>
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
 
                <input
                    type="text"
                    placeholder="Filter by Product Name..."
                    value={productSearchInput}
                    onChange={(e) => setProductSearchInput(e.target.value)}
                    className="adminorder-filter-input"
                />
 
                <label htmlFor="dateFrom" className="adminorder-visually-hidden">
                    Order Date From:
                </label>
                <input
                    type="date"
                    id="dateFrom"
                    placeholder="Order date from"
                    value={dateFrom}
                    onChange={(e) => {
                        setDateFrom(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="adminorder-filter-date"
                    title="Order Date From"
                />
                <label htmlFor="dateTo" className="adminorder-visually-hidden">
                    Order Date To:
                </label>
                <input
                    type="date"
                    id="dateTo"
                    value={dateTo}
                    onChange={(e) => {
                        setDateTo(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="adminorder-filter-date"
                    title="Order Date To"
                />
 
                {/* Sorting Controls */}
                <div className="adminorder-sort-controls">
                    <label htmlFor="sortBy">Sort By:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => handleSort(e.target.value)}
                    >
                        <option value="orderDate">Order Date</option>
                        <option value="totalAmount">Total Amount</option>
                        <option value="_id">Order ID</option>
                        <option value="status">Status</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                        {sortOrder === "asc" ? "Asc ⬆" : "Desc ⬇"}
                    </button>
                </div>
            </div>
 
            {error && <p className="adminorder-error-message">{error}</p>}
 
            {/* Orders Cards Container */}
            <div className="adminorder-orders-cards-container">
                {orders.length > 0
                    ? orders.map((order) => (
                        <div key={order._id.$oid || order._id} className="order-card">
                            <div className="adminorder-order-card-left">
                                <div className="adminorder-order-icon">📦</div>
                                <div className="adminorder-order-items-list">
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item, index) => (
                                            <p
                                                key={item._id?.$oid || item._id || index}
                                                className="adminorder-item-detail"
                                            >
                                                {item.title} x {item.quantity}
                                            </p>
                                        ))
                                    ) : (
                                        <p>No items listed</p>
                                    )}
                                </div>
                                <div className="adminorder-customer-info">
                                    <p>
                                        <strong>Customer:</strong>{" "}
                                        {order.userId?.username ||
                                            order.userId?.email || // Display email if username not available
                                            order.userId?.$oid ||
                                            order.userId ||
                                            "N/A"}
                                    </p>
                                    <p className="adminorder-shipping-address">{order.shippingAddress}</p>
                                </div>
                            </div>
 
                            <div className="adminorder-order-card-right">
                                <p>
                                    <strong>Items:</strong>{" "}
                                    {order.items ? order.items.length : 0}
                                </p>
                                <p className="adminorder-order-total">
                                    <strong>Total:</strong> ₹
                                    {order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
                                </p>
                                <p>
                                    <strong>Method:</strong> COD
                                </p>
                                <p>
                                    <strong>Date:</strong>{" "}
                                    {order.orderDate
                                        ? new Date(order.orderDate).toLocaleDateString()
                                        : "N/A"}
                                </p>
 
                                <div className="adminorder-order-status-control">
                                    <label
                                        htmlFor={`status-${order._id.$oid || order._id}`}
                                        className="adminorder-visually-hidden"
                                    >
                                        Order Status
                                    </label>
                                    <select
                                        id={`status-${order._id.$oid || order._id}`}
                                        value={order.status}
                                        onChange={(e) =>
                                            handleStatusUpdate(
                                                order._id.$oid || order._id,
                                                order.status, // Pass old status
                                                e.target.value, // Pass new status
                                                order.userId?.email || 'N/A' // Pass customer email for OTP
                                            )
                                        }
                                        className={`adminorder-status-dropdown adminorder-status-${order.status.toLowerCase().replace(/\s/g, '-')}`}
                                        disabled={isDropdownDisabled(order.status)}
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))
                    : !loading && (
                        <p className="adminorder-no-orders-message">
                            No orders found matching your criteria.
                        </p>
                    )}
            </div>
 
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="adminorder-pagination-controls">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || loading}
                    >
                        Previous
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages || loading}
                    >
                        Next
                    </button>
                </div>
            )}
 
            {/* OTP Verification Modal */}
            <Modal
                isOpen={isOtpModalOpen}
                onRequestClose={() => setIsOtpModalOpen(false)}
                className="otp-modal"
                overlayClassName="otp-modal-overlay"
            >
                <h2 className="otp-modal-title">Confirm Delivery with OTP</h2>
                <p className="otp-modal-description">
                    An OTP has been sent to the customer's email ({currentOrderEmailForOtp}).
                    Please enter the OTP provided by the customer to mark the order as Delivered.
                </p>
                <input
                    type="text"
                    className="otp-input"
                    placeholder="Enter 6-digit OTP"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    maxLength="6"
                />
                <div className="otp-modal-actions">
                    <button
                        onClick={handleSubmitOtp}
                        className="otp-submit-button"
                        disabled={loading || otpInput.length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify & Deliver'}
                    </button>
                    <button
                        onClick={() => setIsOtpModalOpen(false)}
                        className="otp-cancel-button"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </div>
    );
};
 
export default Orders;