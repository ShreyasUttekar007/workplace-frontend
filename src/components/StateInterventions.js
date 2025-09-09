import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import "../css/create.css";
import Dashboard from "./Dashboard";
import "../css/momData.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const StateInterventions = () => {
  const [formData, setFormData] = useState({
    userId: "",
    constituency: "",
    interventionIssues: "",
    interventionIssueBrief: "",
    interventionType: "",
    category: "",
    suggestedActionable: "",
    department: "",
    leaderName: "",
    leaderNumber: "",
    facilitatorName: "",
    facilitatorNumber: "",
  });
  const [acName, setAcName] = useState("");
  const [sampleName, setSampleName] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedAc, setSelectedAc] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [interventionData, setInterventionData] = useState([]);

  useEffect(() => {
    localforage
      .getItem("role")
      .then((roles) => {
        if (roles) {
          const acName = roles;
        } else {
          console.error("Error: No roles found in local storage.");
        }
      })
      .catch((error) => {
        console.error("Error fetching AC name from local storage:", error);
      });

    localforage.getItem("email").then((email) => {
      setUserEmail(email || "");
    });

    localforage.getItem("roles").then((roles) => {
      if (roles) {
        setUserRoles(roles);
        setAcName(roles[0]);
      }
    });
  }, []);

  const handleAcChange = (e) => {
    const { value } = e.target;
    setSelectedAc(value);
    localforage.setItem("nonBmcSelectedAc", value); // persist AC
    fetchInterventionData(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
    localforage.setItem("nonBmcFormData", newFormData); // persist form data
  };

  const fetchInterventionData = async (selectedAc) => {
    try {
      const response = await api.get(
        `${API_URL}/state/get-intervention-data-by-constituency/${selectedAc}`
      );
      setInterventionData(response.data);
    } catch (error) {
      console.error("Error fetching intervention data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = await localforage.getItem("ID");
      const postResponse = await api.post(
        `${API_URL}/state/create-intervention`,
        {
          ...formData,
          userId: userId,
          constituency: selectedAc,
        }
      );
      console.log(postResponse.data);
      setFormData({
        userId: "",
        constituency: "",
        ward: "",
        interventionIssues: "",
        interventionType: "",
        interventionIssueBrief: "",
        suggestedActionable: "",
        department: "",
        category: "",
        leaderName: "",
        leaderNumber: "",
        facilitatorName: "",
        facilitatorNumber: "",
      });
      setSampleName(!sampleName);
    } catch (error) {
      console.error("Error creating intervention:", error);
    }
  };

   useEffect(() => {
      const init = async () => {
        try {
          const roles = await localforage.getItem("roles");
          if (roles) {
            setUserRoles(roles);
            setAcName(roles[0]);
          }
  
          const email = await localforage.getItem("email");
          setUserEmail(email || "");
  
          const savedAc = await localforage.getItem("nonBmcSelectedAc");
          if (savedAc) {
            setSelectedAc(savedAc);
            fetchInterventionData(savedAc);
          }
  
          const savedFormData = await localforage.getItem("nonBmcFormData");
          if (savedFormData) {
            setFormData(savedFormData);
          }
        } catch (error) {
          console.error("Error initializing component:", error);
        }
      };
  
      init();
    }, []);

  return (
    <div className="main-class">
      <Dashboard />
      <div style={{ marginTop: "10px" }}></div>
      <div className="data-container">
        <h1>Add State Intervention</h1>
        <div className="main-ac-container">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label>
              Assembly Constituency:
              <select
                name="ac"
                value={selectedAc}
                onChange={handleAcChange}
                className="input-fields"
                required
              >
                <option value="">Select AC</option>
                {userRoles.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Intervention Type:
              <select
                name="interventionType"
                value={formData.interventionType}
                onChange={handleChange}
                className="input-fields"
                required
              >
                <option value="">Select Intervention Type</option>
                <option value="Political">Political</option>
                <option value="Party / Organizational">
                  Party / Organizational
                </option>
                <option value="Government / Administrative">
                  Government / Administrative
                </option>
                <option value="Alliance">Alliance</option>
                <option value="SHS Leader Activation">
                  SHS Leader Activation
                </option>
                <option value="SHS Dispute Resolution">
                  SHS Dispute Resolution
                </option>
              </select>
            </label>
            <label>
              Priority:
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-fields"
                required
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>
            {formData.interventionType === "Government / Administrative" && (
              <label>
                Department:
                <input
                  type="text"
                  name="department"
                  className="input-fields"
                  onChange={handleChange}
                  placeholder="Enter Department..."
                  style={{
                    fontSize: "16px",
                  }}
                  value={formData.department}
                />
              </label>
            )}
          </div>
        </div>
        <form className="data-form" onSubmit={handleSubmit}>
          <div
            className="fields-div"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label>
              Leader Name:
              <input
                type="text"
                name="leaderName"
                className="input-fields"
                onChange={handleChange}
                placeholder="Enter Leader Name..."
                style={{
                  fontSize: "16px",
                }}
                value={formData.leaderName}
              />
            </label>
            <label>
              Leader Contact Number:
              <input
                type="text"
                name="leaderNumber"
                className="input-fields"
                onChange={handleChange}
                placeholder="Enter Leader Contact Number..."
                style={{
                  fontSize: "16px",
                }}
                value={formData.leaderNumber}
              />
            </label>
            <label>
              Facilitator Name:
              <input
                type="text"
                name="facilitatorName"
                className="input-fields"
                onChange={handleChange}
                placeholder="Enter Facilitator Name..."
                style={{
                  fontSize: "16px",
                }}
                value={formData.facilitatorName}
              />
            </label>
            <label>
              Facilitator Contact Number:
              <input
                type="text"
                name="facilitatorNumber"
                className="input-fields"
                onChange={handleChange}
                placeholder="Enter Facilitator Contact Number..."
                style={{
                  fontSize: "16px",
                }}
                value={formData.facilitatorNumber}
              />
            </label>
          </div>
          <div
            className="fields-div"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label>
              Suggested Actionable:
              <input
                type="text"
                name="suggestedActionable"
                className="input-fields"
                onChange={handleChange}
                placeholder="Enter Suggested Actionable..."
                style={{
                  fontSize: "16px",
                }}
                value={formData.suggestedActionable}
              />
            </label>

            <label>
              Intervention Issues:
              <input
                type="text"
                name="interventionIssues"
                className="input-fields2"
                onChange={handleChange}
                placeholder="Enter Intervention Issues..."
                style={{
                  fontSize: "16px",
                }}
                value={formData.interventionIssues}
                required
              />
            </label>
          </div>
          <div className="fields-div">
            <textarea
              name="interventionIssueBrief"
              className="input-fields"
              placeholder="Enter Issue in Brief..."
              value={formData.interventionIssueBrief}
              onChange={handleChange}
              rows="4"
              cols="50"
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
      <div className="table-container">
        <h2>Intervention Data for Constituency: {selectedAc}</h2>
        {interventionData.length > 0 ? (
          <table className="mom-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>District</th>
                <th>Constituency</th>
                <th>Intervention Type</th>
                <th>Intervention Issues</th>
                <th>Issue Brief</th>
                <th>Priority</th>
                <th>Leader Name</th>
                <th>Leader Contact Number</th>
                <th>Facilitator Name</th>
                <th>Facilitator Contact Number</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {interventionData.map((data) => (
                <tr key={data._id}>
                  <td>{data.zone}</td>
                  <td>{data.district}</td>
                  <td>{data.constituency}</td>
                  <td>{data.interventionType}</td>
                  <td>{data.interventionIssues}</td>
                  <td style={{ wordWrap: "break-word" }}>
                    {data.interventionIssueBrief}
                  </td>
                  <td>{data.category}</td>
                  <td>{data.leaderName}</td>
                  <td>{data.leaderNumber}</td>
                  <td>{data.facilitatorName}</td>
                  <td>{data.facilitatorNumber}</td>
                  <td>
                    {data.interventionAction || "Pending"}{" "}
                    <Link
                      to={`/update-bmc-intervention/${data._id}`}
                      style={{
                        textDecoration: "none",
                        padding: "5px 0px",
                        margin: "5px",
                        color: "#008cff",
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} size="2x" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data found for the selected constituency.</p>
        )}
      </div>
    </div>
  );
};

export default StateInterventions;
