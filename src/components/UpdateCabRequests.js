import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import Dashboard from "./Dashboard";
import { useNavigate, useParams } from "react-router-dom";
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

const API_URL = process.env.REACT_APP_API_URL;

const UpdateCabRequests = () => {
  const { momId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    employeeCode: "",
    email: "",
    dateOfRequest: "",
    employeePhoneNumber: "",
    pickupTime: "",
    pickupLocation: "",
    purpose: "",
    recieverEmail: "",
    recieverName: "",
    startTime: "",
    speedometerStartPhoto: "",
    startingDistance: "",
    endTime: "",
    speedometerEndPhoto: "",
    endKm: "",
    remarks: "",
  });

  useEffect(() => {
    const fetchCabRequest = async () => {
      try {
        const token = await localforage.getItem("token");
        if (!token) {
          setError("User not authenticated. Please log in.");
          return;
        }

        const response = await api.get(
          `${API_URL}/cab/cab-requests`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const requestData = response.data.cabRequests.find(
          (request) => request._id === momId
        );

        if (!requestData) {
          setError("Cab request not found.");
          return;
        }

        const {
          _id,
          userId,
          __v,
          cabNumber,
          driverName,
          driverNumber,
          ...filteredData
        } = requestData;

        setFormData(filteredData);
      } catch (err) {
        console.error("Error fetching cab request data:", err);
        setError("Failed to fetch cab request data.");
      }
    };

    fetchCabRequest();
  }, [momId]);

  const uploadFileToS3 = async (file, folder) => {
    const params = {
      Bucket: "mom-files-data-new",
      Key: `${folder}/${Date.now()}_${file.name}`,
      Body: file,
      ContentType: file.type,
    };

    try {
      const uploadResult = await s3.upload(params).promise();
      return uploadResult.Location;
    } catch (err) {
      console.error("Error uploading file to S3:", err);
      setError("Failed to upload file to S3.");
      return null;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Only PNG, JPEG, and JPG are allowed.");
        return;
      }

      const folder =
        e.target.name === "speedometerStartPhoto"
          ? "start_photos"
          : "end_photos";
      const imageUrl = await uploadFileToS3(file, folder);

      if (imageUrl) {
        setFormData({ ...formData, [e.target.name]: imageUrl });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      if (name === "endTime" && prevData.startTime && value < prevData.startTime) {
        alert("End time cannot be before the start time.");
        return prevData;
      }
      return { ...prevData, [name]: value };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const token = await localforage.getItem("token");
      await api.put(
        `${API_URL}/cab/update-user-cab-data/${momId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Cab request updated successfully!");
      setTimeout(() => {
        setSuccess(false);
        navigate("/cab-request");
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

          <div className="form-row">
            <div className="form-group">
              <label>Pickup Time:</label>
              <input
                type="time"
                name="pickupTime"
                value={formData.pickupTime}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Pickup Location:</label>
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                disabled
              />
            </div>
          </div>

          {/* Editable Fields */}
          <div className="form-row">
            <div className="form-group">
              <label>Start Time:</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Starting (KM):</label>
              <input
                type="number"
                name="startingDistance"
                value={formData.startingDistance}
                onChange={handleChange}
                placeholder="Enter starting distance..."
              />
            </div>
            <div className="form-group">
              <label>Speedometer Start Photo:</label>
              <input
                type="file"
                name="speedometerStartPhoto"
                accept=".png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>End Time:</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Ending (KM):</label>
              <input
                type="number"
                name="endKm"
                value={formData.endKm}
                onChange={handleChange}
                placeholder="Enter ending distance..."
              />
            </div>
            <div className="form-group">
              <label>Speedometer End Photo:</label>
              <input
                type="file"
                name="speedometerEndPhoto"
                accept=".png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Enter remarks..."
          >
            {" "}
          </textarea>
          <div className="mailto3">
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UpdateCabRequests;
