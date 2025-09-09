// Updated LeaveForm Component
import React, { useState, useEffect, useRef } from "react";
import localforage from "localforage";
import api from "../utils/axiosConfig";
import "../css/leaveForm.css";
import Dashboard from "./Dashboard";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

const API_URL = process.env.REACT_APP_API_URL;

const LeaveForm = () => {
  const fileInputRef = useRef(null);
  const allowedDocumentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userId: "",
    receiverEmail: "",
    receiverName: "",
    reportingManagerEmail: "",
    reportingManager: "",
    reportingManagerEmail2: "",
    reportingManager2: "",
    reportingManagerEmail1: "",
    reportingManager1: "",
    reasonForLeave: "",
    startDate: "",
    endDate: "",
    summaryForLeave: "",
    leaveType: "",
    document: null,
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [documentError, setDocumentError] = useState("");
  const [dateError, setDateError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const name = await localforage.getItem("userName");
        const email = await localforage.getItem("email");
        const userId = await localforage.getItem("ID");
        const location = await localforage.getItem("location");

        setFormData((prevData) => ({ ...prevData, email: email || "", location: location || "" }));

        if (email) {
          const response = await api.get(
            `${API_URL}/employeedata/get-manager-email/${email}`
          );
          setFormData((prevData) => ({
            ...prevData,
            receiverEmail: response.data.reportingManagerEmail || "",
            receiverName: response.data.reportingManager || "",
            reportingManagerEmail: response.data.reportingManagerEmail || "",
            reportingManager: response.data.reportingManager || "",
            reportingManagerEmail2: response.data.reportingManagerEmail2 || "",
            reportingManager2: response.data.reportingManager2 || "",
            reportingManagerEmail1: response.data.reportingManagerEmail1 || "",
            reportingManager1: response.data.reportingManager1 || "",
            name: name || "",
            userId: userId || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching user or manager email", err);
        setError("Error fetching manager email. Please try again later.");
      }
    };

    fetchUserData();
  }, []);

  const validateDates = () => {
    const { startDate, endDate } = formData;
    if (new Date(endDate) < new Date(startDate)) {
      setDateError("End date cannot be earlier than start date.");
      return false;
    }
    setDateError("");
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file && allowedDocumentTypes.includes(file.type)) {
      setFormData((prevData) => ({
        ...prevData,
        document: file,
      }));
      setDocumentError("");
    } else {
      setDocumentError(
        "Invalid document type. Please upload a PDF, DOC, or DOCX file."
      );
    }
  };

  const uploadFileToS3 = async (file, folder) => {
    const params = {
      Bucket: "mom-files-data-new",
      Key: `${folder}/${Date.now()}_${file.name}`,
      Body: file,
      ContentType: file.type,
    };

    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate the dates
    if (!validateDates()) {
      return;
    }

    setLoading(true);

    try {
      // Additional logic for document upload and form submission
      const documentUrl = formData.document
        ? await uploadFileToS3(formData.document, "documents")
        : null;

      const updatedFormData = {
        ...formData,
        document: documentUrl,
      };

      const token = await localforage.getItem("token");

      const response = await api.post(
        `${API_URL}/leavedata/leave`,
        updatedFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { leaveCode } = response.data;

      setSuccess(
        `Leave request submitted successfully! Leave Code: ${leaveCode}. Mail has been sent to the reporting manager and HR.`
      );

      setFormData({
        name: formData.name,
        email: formData.email,
        userId: formData.userId,
        receiverEmail: "",
        receiverName: "",
        reportingManagerEmail: "",
        reportingManager: "",
        reportingManagerEmail2: "",
        reportingManager2: "",
        reportingManagerEmail1: "",
        reportingManager1: "",
        reasonForLeave: "",
        startDate: "",
        endDate: "",
        summaryForLeave: "",
        leaveType: "",
        document: null,
      });

      setDocumentError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => {
        setSuccess(false);
        navigate("/leave-data");
      }, 3000);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.response?.data?.error || "Something went wrong");
      setTimeout(() => setError(null), 6000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dashboard />
      <div className="leave-form-container">
        <h2 style={{ textAlign: "center" }}>Apply for Leave</h2>
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
        {dateError && <p className="error-message">{dateError}</p>}

        <form onSubmit={handleSubmit} className="leave-form">
          <div className="leave-form-inputs">
            <div className="mailto">
              <label>Mail to:</label>
              <input
                type="email"
                name="receiverEmail"
                value={formData.receiverEmail}
                onChange={handleChange}
                required
                disabled
              />
              {/* <h3 className="rm">{formData.receiverEmail}</h3> */}
              <label>Reporting manager:</label>
              <input
                type="name"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleChange}
                required
                disabled
              />
            </div>
            <div className="mailto">
              <label>Request a leave from:</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
              <label>till</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mailto2">
              <label>Select a leave type:</label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="sickLeave">Sick Leave</option>
                <option value="regularizationLeave">
                  Leave Regularization
                </option>
                <option value="compensationLeave">Compensation Leave</option>
                <option value="onOfficeDuty">On Office Duty</option>
                <option value="paidLeave">Paid Leave</option>
                <option value="halfDayLeave">Half Day Leave</option>
                <option value="menstrualLeave">Menstrual Leave</option>
                <option value="restrictedHoliday">Restricted Holiday</option>
              </select>
              <label>Attach Document:</label>
              <input
                type="file"
                name="document"
                ref={fileInputRef}
                onChange={handleDocumentChange}
              />
              {documentError && (
                <p className="error-message">{documentError}</p>
              )}
            </div>
            <div className="mailto">
              <label>Subject:</label>
              <input
                type="text"
                name="reasonForLeave"
                value={formData.reasonForLeave}
                onChange={handleChange}
                placeholder="Enter the subject..."
                required
              />
            </div>
            <div className="mailto">
              <label>Reason for leave:</label>
              <textarea
                name="summaryForLeave"
                value={formData.summaryForLeave}
                onChange={handleChange}
                placeholder="Enter the Reason for leave..."
                required
              ></textarea>
            </div>
          </div>

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

export default LeaveForm;
