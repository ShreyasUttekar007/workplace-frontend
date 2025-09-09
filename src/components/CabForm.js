import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import Dashboard from "./Dashboard";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";

const API_URL = process.env.REACT_APP_API_URL;

const CabForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cabRequests, setCabRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedAddOnPersons, setSelectedAddOnPersons] = useState([]);
  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    dateOfRequest: "",
    employeePhoneNumber: "",
    pickupTime: "",
    pickupLocation: "",
    purpose: "",
    addOnPerson: [],
  });


  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await localforage.getItem("ID");
        const email = await localforage.getItem("email");
        if (userId && email) {
          setFormData((prevData) => ({ ...prevData, userId, email }));
          fetchCabRequests(userId);
        } else {
          setError("User ID or Email not found. Please log in again.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
    fetchEmployees();
  }, []);

  const fetchCabRequests = async (userId) => {
    try {
      const token = await localforage.getItem("token");
      const response = await api.get(
        `${API_URL}/cab/cab-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCabRequests(response.data.cabRequests);
    } catch (error) {
      console.error("Error fetching cab requests:", error);
      setError("Failed to load cab requests.");
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = await localforage.getItem("token");
      const response = await api.get(
        `${API_URL}/cab/employees/soul-field`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOnChange = (selectedOptions) => {
    setSelectedAddOnPersons(selectedOptions);
    setFormData({
      ...formData,
      addOnPerson: selectedOptions.map((option) => ({
        employeeName: option.label,
        employeePhoneNumber: option.phone,
        employeeEmail: option.email,
      })),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const token = await localforage.getItem("token");
      if (!formData.userId) {
        throw new Error("Missing userId in the request body");
      }
      await api.post(`${API_URL}/cab/cab-record`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Cab request submitted!");
      setFormData({
        userId: formData.userId,
        email: formData.email,
        dateOfRequest: "",
        employeePhoneNumber: "",
        pickupTime: "",
        pickupLocation: "",
        purpose: "",
        addOnPerson: [],
      });
      setSelectedAddOnPersons([]);
      fetchCabRequests(formData.userId);
    } catch (error) {
      console.error("Error submitting request:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to submit request.");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteIntervention = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record?"
    );
    if (!confirmDelete) return;

    try {
      const token = await localforage.getItem("token");
      const response = await api.delete(
        `${API_URL}/cab/delete-cab-request/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        alert("Record deleted successfully!");
        setCabRequests((prevData) =>
          prevData.filter((data) => data._id !== id)
        );
      }
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to delete record. Please try again."
      );
    }
  };

  return (
    <>
      <Dashboard />
      <div className="travel-form-container" style={{ maxWidth: "600px" }}>
        <h2>Cab Request Form</h2>
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Date of Request:
              <input
                type="date"
                name="dateOfRequest"
                onChange={handleChange}
                value={formData.dateOfRequest}
                required
                min={new Date().toISOString().split("T")[0]} // Prevent past dates
              />
            </label>
            <label>
              Purpose:
              <input
                type="text"
                name="purpose"
                placeholder="Purpose"
                onChange={handleChange}
                value={formData.purpose}
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Pickup Time:
              <input
                type="time"
                name="pickupTime"
                onChange={handleChange}
                value={formData.pickupTime}
                required
                min={
                  formData.dateOfRequest ===
                  new Date().toISOString().split("T")[0]
                    ? new Date()
                        .toLocaleTimeString("en-GB", { hour12: false })
                        .slice(0, 5) // Blocks past times if today is selected
                    : ""
                }
              />
            </label>
            <label>
              Pickup Location:
              <input
                type="text"
                name="pickupLocation"
                placeholder="Pickup Location"
                onChange={handleChange}
                value={formData.pickupLocation}
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Add-On Persons:
              <Select
                options={employees.map((emp) => ({
                  label: emp.employeeName,
                  value: emp.employeeEmail,
                  phone: emp.employeePhoneNumber,
                  email: emp.employeeEmail,
                }))}
                isMulti
                value={selectedAddOnPersons}
                onChange={handleAddOnChange}
                maxMenuHeight={150}
                placeholder="Select up to 3 employees"
                isSearchable
                closeMenuOnSelect={false}
                isOptionDisabled={() => selectedAddOnPersons.length >= 3}
              />
            </label>
          </div>
          <div className="mailto3">
            <button type="submit" disabled={loading}>
              {loading ? "Requesting a Cab..." : "Request Cab"}
            </button>
          </div>
        </form>
      </div>
      <div
        className="intervention-table"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <h3>Previous Cab Requests</h3>
        <table>
          <thead>
            <tr>
              <th>Cab Request Code</th>
              <th>Requested By</th>
              <th>Date</th>
              <th>Pickup Time</th>
              <th>Pickup Location</th>
              <th>Purpose</th>
              <th>Cab Number</th>
              <th>Driver Name</th>
              <th>Driver Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cabRequests.length > 0 ? (
              cabRequests.map((request) => (
                <tr key={request._id}>
                  <td style={{ textAlign: "center" }}>
                    {request.cabRequestCode}
                  </td>
                  <td style={{ textAlign: "center" }}>{request.name}</td>
                  <td style={{ textAlign: "center" }}>
                    {request.dateOfRequest}
                  </td>
                  <td style={{ textAlign: "center" }}>{request.pickupTime}</td>
                  <td style={{ textAlign: "center" }}>
                    {request.pickupLocation}
                  </td>
                  <td style={{ textAlign: "center" }}>{request.purpose}</td>
                  <td style={{ textAlign: "center" }}>{request.cabNumber}</td>
                  <td style={{ textAlign: "center" }}>{request.driverName}</td>
                  <td style={{ textAlign: "center" }}>
                    {request.driverNumber}
                  </td>
                  <td>
                    <div className="action-icons-div">
                      {request.cabNumber ? (
                        <Link
                          to={`/update-cab-request/${request._id}`}
                          style={{
                            textDecoration: "none",
                            padding: "5px 0px",
                            color: "#008cff",
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} size="1x" />
                        </Link>
                      ) : (
                        <span
                          style={{
                            textDecoration: "none",
                            padding: "5px 0px",
                            color: "#ccc",
                            cursor: "not-allowed",
                          }}
                          title="Cannot update until cab number is assigned"
                        >
                          <FontAwesomeIcon icon={faEdit} size="1x" />
                        </span>
                      )}
                      <FontAwesomeIcon
                        onClick={() => handleDeleteIntervention(request._id)}
                        icon={faTrash}
                        size="1x"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No cab requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CabForm;
