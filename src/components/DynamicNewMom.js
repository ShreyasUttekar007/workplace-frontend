import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import "../css/dynamicNewForm.css";
import AWS from "aws-sdk";
import {
  assemblyConstituencies,
  assemblyConstituenciesAp,
  assemblyConstituenciesBg,
  assemblyConstituenciesUp,
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
    typeOfMeeting: "Leader Meeting",
    eventName: "",
    eventDetails: "",
    eventLocation: "",
    eventPocName: "",
    eventPocNumber: "",
    remarks: "",
    eventPhotos: [""],
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
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const folderMap = {
        leaderPhoto: "leaders",
        peoplePhoto: "people",
        eventPhotos: "events",
      };

      const folder = folderMap[fieldName] || "others";

      if (fieldName === "eventPhotos") {
        // Handle multiple uploads for event photos
        const uploadPromises = files.map((file) =>
          uploadFileToS3(file, folder)
        );
        const uploadedUrls = await Promise.all(uploadPromises);

        const validUrls = uploadedUrls.filter((url) => url !== "");

        setFormData((prevData) => ({
          ...prevData,
          eventPhotos: [...(prevData.eventPhotos || []), ...validUrls],
        }));
      } else if (fieldName === "leaderPhoto") {
        const fileUrl = await uploadFileToS3(files[0], folder);
        if (fileUrl) {
          setFormData((prevData) => ({ ...prevData, leaderPhoto: fileUrl }));
        }
      } else if (fieldName === "peoplePhoto" && index !== null) {
        const fileUrl = await uploadFileToS3(files[0], folder);
        if (fileUrl) {
          setFormData((prevData) => {
            const updatedPhotos = [...(prevData.peoplePhoto || [])];
            updatedPhotos[index] = fileUrl;
            return { ...prevData, peoplePhoto: updatedPhotos };
          });
        }
      }
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

      const response = await api.post(`${API_URL}/new-mom/mom`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("MoM saved successfully!");
      setFormData({
        state: formData.state,
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
        typeOfMeeting: "Leader Meeting",
        eventName: "",
        eventDetails: "",
        eventLocation: "",
        eventPocName: "",
        eventPocNumber: "",
        remarks: "",
        eventPhotos: [""],
        keyTakeaways: [""],
        pointOfDiscussion: [""],
        peopleName: [""],
        peopleDesignation: [""],
        peopleParty: [""],
        peoplePhoto: [""],
      });
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
          <h2>Record Meeting</h2>
          <div className="slide">
            <div className="form-row">
              <div className="form-group" style={{ alignItems: "center" }}>
                <label>Meeting Type:</label>
                <select
                  name="typeOfMeeting"
                  value={formData.typeOfMeeting}
                  onChange={handleChange}
                  required
                  style={{ maxWidth: "250px" }}
                >
                  <option value="">Select Meeting Type</option>
                  <option value="Leader Meeting">Leader Meeting</option>
                  <option value="Event/Programme">Event/Programme</option>
                </select>
              </div>
            </div>
            {formData.typeOfMeeting === "Leader Meeting" && (
              <>
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
                        : formData.state === "Andhra Pradesh"
                        ? assemblyConstituenciesAp
                        : formData.state === "Bengal"
                        ? assemblyConstituenciesBg
                        : formData.state === "Uttar Pradesh"
                        ? assemblyConstituenciesUp // <-- Added Uttar Pradesh
                        : []
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
                    {formData.state === "Maharashtra" ? (
                      <select
                        name="partyName"
                        value={formData.partyName}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select Party Name
                        </option>
                        {[
                          "Shivsena",
                          "BJP",
                          "UBT",
                          "NCP(AP)",
                          "NCP(SP)",
                          "MVA",
                          "INC",
                          "MNS",
                          "IND",
                          "Other Party",
                          "NA",
                        ].map((party) => (
                          <option key={party} value={party}>
                            {party}
                          </option>
                        ))}
                      </select>
                    ) : formData.state === "Andhra Pradesh" ? (
                      <input
                        type="text"
                        name="partyName"
                        value={formData.partyName}
                        onChange={handleChange}
                        placeholder="Enter Party Name..."
                        required
                      />
                    ) : formData.state === "Bengal" ? (
                      <select
                        name="partyName"
                        value={formData.partyName}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select Party Name
                        </option>
                        {[
                          "TMC",
                          "BJP",
                          "INC",
                          "CPI-M",
                          "GJM",
                          "GNLE",
                          "AIMIM",
                          "BGPM",
                          "SDA",
                          "Other Party",
                          "NA",
                        ].map((party) => (
                          <option key={party} value={party}>
                            {party}
                          </option>
                        ))}
                      </select>
                    ) : formData.state === "Uttar Pradesh" ? ( // <-- Added section for Uttar Pradesh
                      <select
                        name="partyName"
                        value={formData.partyName}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>
                          Select Party Name
                        </option>
                        {[
                          "Bharatiya Janata Party (BJP)",
                          "Indian National Congress (INC)",
                          "Bahujan Samaj Party (BSP)",
                          "Communist Party of India (CPI)",
                          "Communist Party of India (Marxist) – CPI(M)",
                          "National People’s Party (NPP)",
                          "Samajwadi Party (SP)",
                          "Rashtriya Lok Dal (RLD)",
                          "Lok Dal",
                          "Azad Samaj Party (Kanshi Ram)",
                          "Aam Aadmi Party (AAP)",
                          "Nishad Party",
                          "Other Party",
                          "NA",
                        ].map((party) => (
                          <option key={party} value={party}>
                            {party}
                          </option>
                        ))}
                      </select>
                    ) : (
                      "-"
                    )}
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
                          onClick={() =>
                            removeField("pointOfDiscussion", index)
                          }
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
              </>
            )}
            {formData.typeOfMeeting === "Event/Programme" && (
              <>
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
                    <label>Date of Event:</label>
                    <input
                      type="date"
                      name="dom"
                      value={formData.dom}
                      onChange={handleChange}
                      min={
                        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0]
                      } // yesterday
                      max={
                        new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0]
                      } // tomorrow
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Event Name:</label>
                    <input
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleChange}
                      placeholder="Enter Event Name..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Event Location:</label>
                    <input
                      type="text"
                      name="eventLocation"
                      value={formData.eventLocation}
                      onChange={handleChange}
                      placeholder="Enter Event Location..."
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Event POC Name:</label>
                    <input
                      type="text"
                      name="eventPocName"
                      value={formData.eventPocName}
                      onChange={handleChange}
                      placeholder="Enter Event POC Name..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Event POC Number:</label>
                    <input
                      type="text"
                      name="eventPocNumber"
                      value={formData.eventPocNumber}
                      onChange={handleChange}
                      placeholder="Enter Event POC Number..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Event POC Designation:</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="Enter Event POC Designation..."
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Event Details:</label>
                    <textarea
                      name="eventDetails"
                      value={formData.eventDetails}
                      onChange={handleChange}
                      placeholder="Enter Event Details..."
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Remarks:</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      placeholder="Enter Event Remarks if any..."
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Upload Photos:</label>
                    <input
                      type="file"
                      name="eventPhotos"
                      multiple
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => handleFileUpload(e, "eventPhotos")} // You’ll need to define this function
                    />
                  </div>
                </div>
              </>
            )}
            <button type="submit" className="submit-btn">
              Record Meeting
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default DynamicNewMom;
