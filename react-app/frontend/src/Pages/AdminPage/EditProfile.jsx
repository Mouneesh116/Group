import React, { useContext, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import "./EditProfile.css";

const EditProfile = () => {
  const { userId, userName, user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: userName || user?.username || "",
    email: user?.email || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email) {
      toast.error("Both fields are required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:8080/api/users/${userId}/edit-profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success(response.data.message || "Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
