import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import Dashboard from "./Dashboard";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const UpdateDriverData = () => {
  const { momId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfRequest: "",
    employeePhoneNumber: "",
    cabNumber: "",
    driverName: "",
    driverNumber: "",
    vendor: "",
  });

  // Fetch vendors from API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = await localforage.getItem("token");
        const response = await api.get(`${API_URL}/cab/vendors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVendors(response.data);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    const fetchCabRequest = async () => {
      try {
        const token = await localforage.getItem("token");
        if (!token) {
          setError("User not authenticated. Please log in.");
          return;
        }

        const response = await api.get(`${API_URL}/cab/cab-requests-emails`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const requestData = response.data.cabRequests.find(
          (request) => request._id === momId
        );

        if (!requestData) {
          setError("Cab request not found.");
          return;
        }

        setFormData(requestData);
        setSelectedVendor(requestData.vendor || "");
      } catch (err) {
        console.error("Error fetching cab request data:", err);
        setError("Failed to fetch cab request data.");
      }
    };

    fetchCabRequest();
  }, [momId]);

  const handleVendorChange = async (e) => {
    const vendorValue = e.target.value;
    setSelectedVendor(vendorValue);

    try {
      const token = await localforage.getItem("token");
      await api.put(
        `${API_URL}/cab/update-cab-data/${momId}`,
        { vendor: vendorValue },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFormData((prevData) => ({ ...prevData, vendor: vendorValue }));
    } catch (error) {
      console.error("Error updating vendor", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const token = await localforage.getItem("token");
      await api.put(`${API_URL}/cab/update-cab-data/${momId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Cab request updated successfully!");
      setTimeout(() => {
        setSuccess(false);
        navigate("/cab-dashboard");
      }, 4000);
    } catch (error) {
      console.error("Error updating request:", error);
      setError("Failed to update request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dashboard />
      <div className="travel-form-container">
        <h2>Update Cab Request</h2>
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleUpdate}>
          <div className="form-row">
            <div className="form-group">
              <label>Name:</label>
              <input type="text" name="name" value={formData.name} disabled />
            </div>
            <div className="form-group">
              <label>Employee Phone Number:</label>
              <input
                type="text"
                name="employeePhoneNumber"
                value={formData.employeePhoneNumber}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Date of Request:</label>
              <input
                type="date"
                name="dateOfRequest"
                value={formData.dateOfRequest}
                disabled
              />
            </div>
          </div>
          <div className="form-group">
            <label>Select Vendor:</label>
            <select
              name="vendor"
              value={selectedVendor}
              onChange={handleVendorChange}
            >
              <option value="">Select a Vendor</option>
              {vendors.map((vendor) => (
                <option
                  key={vendor._id}
                  value={`${vendor.vendorLocation} - ${vendor.vendorName} - ${vendor.vendorNumber}`}
                >
                  {vendor.vendorLocation} - {vendor.vendorName} -{" "}
                  {vendor.vendorNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cab Number:</label>
              <input
                type="text"
                name="cabNumber"
                value={formData.cabNumber}
                onChange={handleChange}
                placeholder="Enter Cab Number..."
                required
              />
            </div>
            <div className="form-group">
              <label>Driver Name:</label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                placeholder="Enter Driver Name..."
                required
              />
            </div>
            <div className="form-group">
              <label>Driver Number:</label>
              <input
                type="text"
                name="driverNumber"
                value={formData.driverNumber}
                onChange={handleChange}
                placeholder="Enter Driver Number..."
                required
              />
            </div>
          </div>

          {/* Vendor Selection Dropdown */}

          <div className="mailto3">
            <button type="submit" disabled={loading}>
              {loading
                ? "Sending Details to Employee..."
                : "Send Details to Employee"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UpdateDriverData;
