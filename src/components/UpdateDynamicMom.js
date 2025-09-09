import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import "../css/dynamicNewForm.css";
import AWS from "aws-sdk";
import localforage from "localforage";
import Dashboard from "./Dashboard";
import { useParams } from "react-router-dom";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

const API_URL = process.env.REACT_APP_API_URL;

const UpdateDynamicMom = () => {
  const { momId } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    state: "",
    constituency: "",
    ward: "",
    leaderName: "",
    dom: "",
    designation: "",
    partyName: "",
    placeOfMeeting: "",
    priority: "",
    leaderPhoto: "",
    makeMom: "No",
    leaderContact: "",
    keyTakeaways: [""],
    pointOfDiscussion: [""],
    peopleName: [""],
    peopleDesignation: [""],
    peopleParty: [""],
    peoplePhoto: [""],
  });

  useEffect(() => {
    const fetchMomData = async () => {
      try {
        if (!momId) return; // Only fetch if editing
        const token = await localforage.getItem("token");
        const response = await api.get(
          `${API_URL}/new-mom/get-mom-by-id/${momId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFormData(response.data);
        console.log("✌️response.data --->", response.data);
      } catch (error) {
        console.error("Error fetching MoM data:", error);
      }
    };
    fetchMomData();
  }, [momId]);

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (
      [
        "keyTakeaways",
        "pointOfDiscussion",
        "peopleName",
        "peopleDesignation",
        "peopleParty",
        "peoplePhoto",
      ].includes(name)
    ) {
      const updatedArray = [...formData[name]];
      updatedArray[index] = value;
      setFormData({ ...formData, [name]: updatedArray });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addField = (fieldName) => {
    setFormData({ ...formData, [fieldName]: [...formData[fieldName], ""] });
  };

  const removeField = (fieldName, index) => {
    const updatedArray = formData[fieldName].filter((_, i) => i !== index);
    setFormData({ ...formData, [fieldName]: updatedArray });
  };

  const uploadFileToS3 = async (file, folder) => {
    try {
      const params = {
        Bucket: "mom-files-data-new",
        Key: `${folder}/${Date.now()}_${file.name}`,
        Body: file,
        ContentType: file.type,
      };
      const uploadResult = await s3.upload(params).promise();
      return uploadResult.Location;
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      return "";
    }
  };

  const handleFileUpload = async (e, fieldName, index = null) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const folder = fieldName === "leaderPhoto" ? "leaders" : "people";
      const fileUrl = await uploadFileToS3(file, folder);
      if (!fileUrl) {
        alert("File upload failed. Please try again.");
        return;
      }

      setFormData((prevData) => {
        if (fieldName === "leaderPhoto") {
          return { ...prevData, leaderPhoto: fileUrl };
        } else if (fieldName === "peoplePhoto" && index !== null) {
          const updatedPhotos = [...prevData.peoplePhoto];
          updatedPhotos[index] = fileUrl;
          return { ...prevData, peoplePhoto: updatedPhotos };
        }
        return prevData;
      });
    } catch (error) {
      console.error("❌ Error handling file upload:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await localforage.getItem("token");
  
      if (!token) {
        alert("Authorization token not found. Please log in again.");
        return;
      }
  
      let response;
  
      if (momId) {
        // Fetch the existing MoM data to retain the original userId
        const existingMom = await api.get(`${API_URL}/new-mom/get-mom-by-id/${momId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Preserve the original userId
        const payload = { ...formData, userId: existingMom.data.userId };
  
        response = await api.put(`${API_URL}/new-mom/update-mom/${momId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("MoM updated successfully!");
      } else {
        const userId = await localforage.getItem("ID");
  
        if (!userId) {
          alert("User ID not found. Please log in again.");
          return;
        }
  
        const payload = { ...formData, userId };
  
        response = await api.post(`${API_URL}/new-mom/mom`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("MoM saved successfully!");
      }
  
      console.log(response.data);
      setStep(1);
    } catch (error) {
      console.error("Error saving MoM:", error);
      alert("Failed to save MoM. Please try again.");
    }
  };
  

  return (
    <>
      <Dashboard />
      <div className="new-form-container" style={{ maxWidth: "900px" }}>
        <form className="mom-form" onSubmit={handleSubmit}>
          <h2>{momId ? "Edit MoM" : "Record Leader Meeting"}</h2>

          {step === 1 && (
            <div className="slide">
              <div className="form-row">
                <div className="form-group">
                  <label>Constituency:</label>
                  <input
                    type="text"
                    name="constituency"
                    value={formData.constituency}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Ward/Taluka:</label>
                  <input
                    type="text"
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Meeting:</label>
                  <input
                    type="date"
                    name="dom"
                    value={formData.dom}
                    onChange={handleChange}
                    required
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
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Designation:</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Party Name:</label>
                  <input
                    type="text"
                    name="partyName"
                    value={formData.partyName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Leader Contact:</label>
                  <input
                    type="number"
                    name="leaderContact"
                    value={formData.leaderContact}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Leader Photo:</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(e) => handleFileUpload(e, "leaderPhoto")}
                  />
                </div>
                <div className="form-group">
                  <label>Place of Meeting:</label>
                  <input
                    type="text"
                    name="placeOfMeeting"
                    value={formData.placeOfMeeting}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <label>Point of Discussion:</label>
              {formData.pointOfDiscussion.map((point, index) => (
                <div key={index}>
                  <input
                    name="pointOfDiscussion"
                    value={point}
                    onChange={(e) => handleChange(e, index)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeField("pointOfDiscussion", index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField("pointOfDiscussion")}
              >
                Add Takeaway
              </button>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority:</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Priority</option>
                    <option value="Priority 1">Priority 1</option>
                    <option value="Priority 2">Priority 2</option>
                    <option value="Priority 3">Priority 3</option>
                  </select>
                  <small>
                    <a
                      href="https://mom-files-data-new.s3.ap-south-1.amazonaws.com/PMU+File/Priority+Details.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Priority Details
                    </a>
                  </small>
                </div>
                <div className="form-group">
                  <label>Do you want to make MoM?</label>
                  <select
                    name="makeMom"
                    value={formData.makeMom}
                    onChange={handleChange}
                    required
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
              {formData.makeMom === "Yes" ? (
                <button
                  type="button"
                  className="next-btn"
                  onClick={() => setStep(2)}
                >
                  Next
                </button>
              ) : (
                <button type="submit" className="submit-btn">
                  Record Meeting
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="slide">
              <label>Key Takeaways:</label>
              {formData.keyTakeaways.map((point, index) => (
                <div key={index}>
                  <textarea
                    name="keyTakeaways"
                    value={point}
                    onChange={(e) => handleChange(e, index)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeField("keyTakeaways", index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addField("keyTakeaways")}>
                Add Takeaway
              </button>

              <label>People Involved:</label>
              {formData.peopleName.map((_, index) => (
                <div className="form-row" key={index}>
                  <div className="form-group">
                    <input
                      type="text"
                      name="peopleName"
                      placeholder="Name"
                      value={formData.peopleName[index]}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="peopleDesignation"
                      placeholder="Designation"
                      value={formData.peopleDesignation[index]}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="peopleParty"
                      placeholder="Party"
                      value={formData.peopleParty[index]}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </div>
                  <div
                    className="form-group"
                    style={{ display: "flex", flexDirection: "row" }}
                  >
                    <label>
                      Upload Photo:
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) =>
                          handleFileUpload(e, "peoplePhoto", index)
                        }
                      />
                    </label>
                    {formData.peoplePhoto[index] && (
                      <img
                        src={formData.peoplePhoto[index]}
                        alt="Person"
                        width="100"
                      />
                    )}
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeField("peopleName", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addField("peopleName")}>
                Add Person
              </button>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="submit" className="submit-btn">
                  {momId ? "Update MoM" : "Record Meeting"}
                </button>
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default UpdateDynamicMom;