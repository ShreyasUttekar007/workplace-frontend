import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import "../css/travelForm.css";
import localforage from "localforage";
import Dashboard from "./Dashboard";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const RequestTravel = () => {
  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    department: "",
    age: "",
    requestType: "",
    travelDate: "",
    fromLocation: "",
    toLocation: "",
    accommodationStartDate: "",
    accommodationEndDate: "",
    purposeOfTravel: "",
    eventDetails: "",
    eventName: "",
    travelInstructedBy: "",
    eventLocation: "",
    remarks: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Fetch userId and email from localforage on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await localforage.getItem("ID");
        const email = await localforage.getItem("email"); // Fetch email from localforage

        if (userId && email) {
          setFormData((prevData) => ({
            ...prevData,
            userId,
            email, // Set email to formData
          }));
        } else {
          console.error("User ID or Email not found in localforage");
          setError("User ID or Email not found. Please log in again.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
    setDepartments([
      "Soul (Field)",
      "APEX",
      "Campaign",
      "DATA",
      "Directors Team",
      "DMC",
      "Admin",
      "HR",
      "Media",
      "PMU",
      "Political Support Unit",
      "Research",
    ]);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

      const response = await api.post(
        `${API_URL}/travel/travel-record`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { travelCode } = response.data;
      setSuccess(`Travel request submitted! Leave Code: ${travelCode}`);

      // Reset the form fields to initial state
      setFormData({
        userId: formData.userId, // Retain userId
        email: formData.email, // Retain email
        department: "",
        age: "",
        requestType: "",
        travelDate: "",
        fromLocation: "",
        toLocation: "",
        accommodationStartDate: "",
        accommodationEndDate: "",
        purposeOfTravel: "",
        eventDetails: "",
        eventLocation: "",
        remarks: "",
        phoneNumber: "",
        eventName: "",
        travelInstructedBy: "",
      });

      setTimeout(() => {
        setSuccess(false);
        navigate("/travel-request-user-data");
      }, 3000);
    } catch (error) {
      console.error("Error submitting request:", error);
      setError("Failed to submit request.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dashboard />
      <div className="travel-form-container">
        <h2>Travel Request Form</h2>
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label>Department:</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Request Type:</label>
              <select
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                required
              >
                <option value="">Select Request Type</option>
                <option value="Travel + Hotel Accommodation">
                  Travel + Hotel Accommodation
                </option>
                <option value="Only Travel">Only Travel</option>
                <option value="Only Accommodation">Only Accommodation</option>
              </select>
            </div>
            <div>
              <label>Purpose of Travel:</label>
              <select
                name="purposeOfTravel"
                value={formData.purposeOfTravel}
                onChange={handleChange}
                required
              >
                <option value="">Select Purpose</option>
                <option value="Event">Event</option>
                <option value="Research">Research</option>
                <option value="Field visit">Field visit</option>
                <option value="Team meeting">Team meeting</option>
                <option value="Field work">Field work</option>
                <option value="New mapping">New mapping</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Event Name:</label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                required
                placeholder="Enter the Event Name..."
              />
            </div>
            <div>
              <label>Event Location:</label>
              <input
                type="text"
                name="eventLocation"
                value={formData.eventLocation}
                onChange={handleChange}
                placeholder="Enter the Event Location..."
              />
            </div>

            <div>
              <label>Travel Instructed By:</label>
              <input
                type="text"
                name="travelInstructedBy"
                value={formData.travelInstructedBy}
                onChange={handleChange}
                placeholder="Enter the Travel Instructed By..."
              />
            </div>
          </div>

          {formData.requestType !== "Only Accommodation" && (
            <div className="form-row">
              <div>
                <label>Travel Date:</label>
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate}
                  onChange={handleChange}
                  required={formData.requestType !== "Only Accommodation"}
                />
              </div>
              <div>
                <label>From Location:</label>
                <input
                  type="text"
                  name="fromLocation"
                  value={formData.fromLocation}
                  onChange={handleChange}
                  required={formData.requestType !== "Only Accommodation"}
                  placeholder="Enter the Source Location..."
                />
              </div>
              <div>
                <label>To Location:</label>
                <input
                  type="text"
                  name="toLocation"
                  value={formData.toLocation}
                  onChange={handleChange}
                  required={formData.requestType !== "Only Accommodation"}
                  placeholder="Enter the Destination Location..."
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                placeholder="Enter the Age..."
                min="1"
                max="100"
              />
            </div>
            {["Travel + Hotel Accommodation", "Only Accommodation"].includes(
            formData.requestType
          ) && (
            <div className="form-row">
              <div>
                <label>Accommodation Start Date:</label>
                <input
                  type="date"
                  name="accommodationStartDate"
                  value={formData.accommodationStartDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Accommodation End Date:</label>
                <input
                  type="date"
                  name="accommodationEndDate"
                  value={formData.accommodationEndDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}
          </div>

          <label>Event Details:</label>
          <textarea
            name="eventDetails"
            value={formData.eventDetails}
            onChange={handleChange}
            placeholder="Enter the Event Details..."
          />

          <label>Remarks:</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Enter the Remarks..."
          />

          <div className="mailto3">
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RequestTravel;
