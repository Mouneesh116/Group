import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Orders.css";
import useDebounce from "../../hooks/useDebounce";
import Modal from "react-modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

Modal.setAppElement("#root");

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 10;

  // Filters / search
  const [statusFilter, setStatusFilter] = useState("");
  const [productSearchInput, setProductSearchInput] = useState("");
  const debouncedProductSearchTerm = useDebounce(productSearchInput, 500);
  const [generalSearchInput, setGeneralSearchInput] = useState("");
  const debouncedGeneralSearchTerm = useDebounce(generalSearchInput, 500);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("orderDate");
  const [sortOrder, setSortOrder] = useState("desc");

  // OTP modal
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [currentOrderIdForOtp, setCurrentOrderIdForOtp] = useState(null);
  const [currentOrderEmailForOtp, setCurrentOrderEmailForOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");

  const statusOptions = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Refunded",
  ];

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedProductSearchTerm, debouncedGeneralSearchTerm]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
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
      if (debouncedGeneralSearchTerm) params.searchTerm = debouncedGeneralSearchTerm;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await axios.get(
        `http://localhost:8080/api/orders/getAllOrders`,
        { headers: { Authorization: `Bearer ${token}` }, params }
      );

      if (response.status === 200) {
        setOrders(response.data.orders || []);
        setTotalPages(Math.ceil((response.data.totalOrders || 0) / ordersPerPage));
      } else {
        setError("Failed to load orders");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    ordersPerPage,
    sortBy,
    sortOrder,
    statusFilter,
    debouncedProductSearchTerm,
    debouncedGeneralSearchTerm,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Generic status update
  const updateOrderStatus = async (orderId, newStatus, onSuccessMessage) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8080/api/orders/updateStatus/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        toast.success(onSuccessMessage || `Order ${orderId} updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  // Open OTP modal (used when trying to mark Delivered after Shipped)
  const openOtpModal = (orderId, email) => {
    setCurrentOrderIdForOtp(orderId);
    setCurrentOrderEmailForOtp(email || "customer");
    setOtpInput("");
    setIsOtpModalOpen(true);
  };

  // Verify OTP → Delivered
  const handleSubmitOtp = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8080/api/orders/verify-otp/${currentOrderIdForOtp}`,
        { userOtp: otpInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === currentOrderIdForOtp ? { ...o, status: "Delivered" } : o
          )
        );
        toast.success("Order delivered successfully");
        setIsOtpModalOpen(false);
        setOtpInput("");
        setCurrentOrderIdForOtp(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    }
  };

  const handleStatusChange = (order, newStatus) => {
    if (newStatus === "Shipped") {
      updateOrderStatus(
        order._id,
        "Shipped",
        "Order marked as Shipped. OTP sent to customer's email."
      );
      return;
    }

    if (order.status === "Shipped" && newStatus === "Delivered") {
      openOtpModal(order._id, order.userId?.email);
      return;
    }

    updateOrderStatus(order._id, newStatus);
  };

  const isDropdownDisabled = (status) =>
    ["Cancelled", "Refunded", "Delivered"].includes(status);

  if (loading && orders.length === 0) {
    return <p>Loading orders...</p>;
  }

  return (
    <div className="adminorder-card adminorder-orders-view">
      <h3>Order Management</h3>

      {/* You can keep your filters/search UI here (omitted for brevity) */}

      {/* Orders List */}
      <div className="adminorder-orders-cards-container">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div>
              <p>
                <strong>Customer:</strong>{" "}
                {order.userId?.username || order.userId?.email || "N/A"}
              </p>
              <p>
                <strong>Total:</strong> ₹{Number(order.totalAmount || 0).toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
            </div>

            <div>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order, e.target.value)}
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
        ))}
      </div>

      {/* OTP Modal */}
      <Modal
        isOpen={isOtpModalOpen}
        onRequestClose={() => setIsOtpModalOpen(false)}
        className="otp-modal"
        overlayClassName="otp-modal-overlay"
      >
        <h2>Confirm Delivery with OTP</h2>
        <p>
          An OTP was emailed to <b>{currentOrderEmailForOtp}</b> when the order was marked <b>Shipped</b>.
          Enter it below to mark the order as <b>Delivered</b>.
        </p>
        <input
          type="text"
          value={otpInput}
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtpInput(onlyDigits);
          }}
          maxLength="6"
          placeholder="Enter 6-digit OTP"
        />
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button onClick={handleSubmitOtp} disabled={otpInput.length !== 6}>
            Verify & Deliver
          </button>
          <button onClick={() => setIsOtpModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
