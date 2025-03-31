import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/updateBmcIntervention.css"; // Assume you have this CSS file for styling
import localforage from "localforage";
import { useNavigate, useParams } from "react-router-dom";
import Dashboard from "./Dashboard";

const API_URL = process.env.REACT_APP_API_URL;

const UpdateStateIntervention = () => {
  const { interventionId } = useParams();
  const [formData, setFormData] = useState({
    zone: "",
    district: "",
    constituency: "",
    interventionType: "",
    interventionIssues: "",
    interventionIssueBrief: "",
    interventionAction: "",
    department: "",
    suggestedActionable: "",
    facilitatorNumber: "",
    facilitatorName: "",
    leaderNumber: "",
    leaderName: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterventionData = async () => {
      setLoading(true);
      const token = await localforage.getItem("token");
      try {
        const response = await axios.get(
          `${API_URL}/state/get-interventions/${interventionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const {
          zone,
          district,
          constituency,
          interventionType,
          interventionIssues,
          interventionIssueBrief,
          interventionAction,
          department,
          suggestedActionable,
          facilitatorNumber,
          facilitatorName,
          leaderNumber,
          leaderName,
          category,
        } = response.data;
        setFormData({
          zone,
          district,
          constituency,
          interventionType,
          interventionIssues,
          interventionIssueBrief,
          interventionAction,
          department,
          suggestedActionable,
          facilitatorNumber,
          facilitatorName,
          leaderNumber,
          leaderName,
          category,
        });
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterventionData();
  }, [interventionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Initialize the navigate function

    try {
      await axios.put(
        `${API_URL}/state/update-intervention-data/${interventionId}`,
        formData
      );
      alert("Intervention data updated successfully!");
      navigate("/state-intervention-dashboard"); // Redirect after alert
    } catch (err) {
      setError("Failed to update data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dashboard />
      <div className="update-bmc-intervention">
        <h2>Update Intervention Data</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Zone:</label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>District:</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Constituency:</label>
              <input
                type="text"
                name="constituency"
                value={formData.constituency}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Intervention Type:</label>
              <select
                name="interventionType"
                value={formData.interventionType}
                onChange={handleChange}
                required
              >
                <option value="">Select Intervention Type</option>{" "}
                <option value="Political">Political</option>
                <option value="Party / Organizational">
                  Party / Organizational
                </option>
                <option value="Government / Administrative">
                  Government / Administrative
                </option>
                <option value="Alliance">Alliance</option>
                <option value="Leader Activation">Leader Activation</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category:</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">-- Select Category --</option>{" "}
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label>Department:</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Suggested Actionable:</label>
              <input
                type="text"
                name="suggestedActionable"
                value={formData.suggestedActionable}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Facilitator Name:</label>
              <input
                type="text"
                name="facilitatorName"
                value={formData.facilitatorName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Facilitator Number:</label>
              <input
                type="text"
                name="facilitatorNumber"
                value={formData.facilitatorNumber}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Leader Name:</label>
              <input
                type="text"
                name="leaderName"
                value={formData.leaderName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Leader Number:</label>
              <input
                type="text"
                name="leaderNumber"
                value={formData.leaderNumber}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Intervention Issues:</label>
            <textarea
              name="interventionIssues"
              value={formData.interventionIssues}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Intervention Issue Brief:</label>
            <textarea
              name="interventionIssueBrief"
              value={formData.interventionIssueBrief}
              onChange={handleChange}
            ></textarea>
          </div>
          <button type="submit" className="submit-button">
            Update
          </button>
        </form>
      </div>
    </>
  );
};

export default UpdateStateIntervention;
