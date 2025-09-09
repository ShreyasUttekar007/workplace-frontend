import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import "../css/dynamicNewForm.css";
import AWS from "aws-sdk";
import {
  assemblyConstituencies,
  assemblyConstituenciesAp,
} from "../components/Roles";
import localforage from "localforage";
import Dashboard from "./Dashboard";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

const API_URL = process.env.REACT_APP_API_URL;

const DynamicNewMom = () => {
  const [step, setStep] = useState(1);
  const [location] = useState("");
  console.log("✌️location --->", location);
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
    gMapLocation: "",
  });

  useEffect(() => {
    const fetchState = async () => {
      const savedState = await localforage.getItem("location");
      if (savedState) {
        setFormData((prevData) => ({ ...prevData, state: savedState }));
      }
    };
    fetchState();
  }, []);

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
      return uploadResult.Location; // Returns S3 file URL
    } catch (error) {
      console.error("❌ Error uploading file to S3:", error);
      return ""; // Return empty string on failure
    }
  };

  const handleFileUpload = async (e, fieldName, index = null) => {
    const file = e.target.files[0];
    if (!file) return; // Prevent empty file uploads

    try {
      const folder = fieldName === "leaderPhoto" ? "leaders" : "people";
      const fileUrl = await uploadFileToS3(file, folder);

      if (!fileUrl) {
        alert("File upload failed. Please try again.");
        return;
      }

      setFormData((prevData) => {
        if (fieldName === "leaderPhoto") {
          // Single file upload for leaderPhoto
          return { ...prevData, leaderPhoto: fileUrl };
        } else if (fieldName === "peoplePhoto" && index !== null) {
          // Array update for peoplePhoto
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

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationString = `${position.coords.latitude},${position.coords.longitude}`;
          setFormData((prevData) => ({
            ...prevData,
            gMapLocation: locationString,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await localforage.getItem("token");
      const userId = await localforage.getItem("ID"); // Fetch userId

      if (!userId) {
        alert("User ID not found. Please log in again.");
        return;
      }

      const payload = { ...formData, userId };

      const response = await api.post(
        `${API_URL}/new-mom/mom`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("MoM saved successfully!");
      console.log(response.data);

      // Reset form fields
      setFormData({
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

      setStep(1); // Reset to step 1
    } catch (error) {
      console.error("Error saving MoM:", error);
      alert("Failed to save MoM. Please try again.");
    }
  };

  return (
    <>
      <Dashboard />
      <div className="form-container" style={{ maxWidth: "900px" }}>
        <form className="mom-form" onSubmit={handleSubmit}>
          <h2>Record Leader Meeting</h2>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="slide">
              <div className="form-row">
                <div className="form-group">
                  <label>Constituency:</label>
                  <select
                    name="constituency"
                    value={formData.constituency}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Constituency</option>
                    {(formData.state === "Maharashtra"
                      ? assemblyConstituencies
                      : assemblyConstituenciesAp
                    ).map((item, index) => (
                      <option key={index} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ward/Taluka:</label>
                  <input
                    type="text"
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    placeholder="Enter Ward/Taluka..."
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
                  <label>
                    {formData.state === "Andhra Pradesh"
                      ? "Name of the Respondent:"
                      : "Leader Name:"}
                  </label>
                  <input
                    type="text"
                    name="leaderName"
                    value={formData.leaderName}
                    onChange={handleChange}
                    placeholder={
                      formData.state === "Andhra Pradesh"
                        ? "Enter Respondent Name..."
                        : "Enter Leader Name..."
                    }
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
                    placeholder="Enter Designation..."
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
                    placeholder="Enter Party Name..."
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    {formData.state === "Andhra Pradesh"
                      ? "Respondent Contact:"
                      : "Leader Contact:"}
                  </label>
                  <input
                    type="text"
                    name="leaderContact"
                    value={formData.leaderContact}
                    onChange={handleChange}
                    placeholder={
                      formData.state === "Andhra Pradesh"
                        ? "Enter Respondent Contact..."
                        : "Enter Leader Contact..."
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    {formData.state === "Andhra Pradesh"
                      ? "Respondent Photo:"
                      : "Leader Photo:"}
                  </label>
                  <input
                    type="file"
                    name="leaderPhoto"
                    accept="image/png, image/jpeg, image/jpg"
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
                    placeholder="Enter Place of Meeting..."
                  />
                  
                </div>
              </div>
              <div className="form-group">
                <label>Point of Discussion:</label>
                {formData.pointOfDiscussion.map((point, index) => (
                  <div key={index} className="point-group">
                    <input
                      type="text"
                      name="pointOfDiscussion"
                      value={point}
                      onChange={(e) => handleChange(e, index)}
                      required
                      placeholder="Enter Point of Discussion..."
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeField("pointOfDiscussion", index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addField("pointOfDiscussion")}
                >
                  Add Discussion Point
                </button>
              </div>
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
              </div>
              {/* {formData.makeMom === "Yes" ? (
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
              )} */}
              <button type="submit" className="submit-btn">
                Record Meeting
              </button>
            </div>
          )}

          {/* STEP 2 */}
        </form>
      </div>
    </>
  );
};

export default DynamicNewMom;
