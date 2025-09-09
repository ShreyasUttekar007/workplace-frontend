import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom"; // to get joineeId from URL
import AWS from "aws-sdk";
import {
  assemblyConstituencies,
  assemblyConstituenciesAp,
} from "../components/Roles";
import Dashboard from "./Dashboard";
import localforage from "localforage";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

const API_URL = process.env.REACT_APP_API_URL;

const UpdateProbableJoinee = () => {
  const { joineeId } = useParams();
  const Navigate = useNavigate();
  const [formData, setFormData] = useState({
    // initialize all fields here with default empty values
    constituency: "",
    ward: "",
    vibhagPramukhName: "",
    vibhagPramukhContactNo: "",
    probableJoineeName: "",
    age: "",
    gender: "",
    caste: "",
    phoneNo: "",
    party: "",
    otherPartyName: "",
    photo: "",
    designation: "",
    briefProfile: "",
    publicImage: "",
    financialStatus: "",
    voterInfluence: "",
    areaOfInfluence: "",
    viability: "",
    leaderWhoInformedSTC: "",
    vibhagPramukhAgreed: "",
    mlaOrMpAgreed: "",
    facilitator: "",
    demand: "",
    offer: "",
    stcRecommendation: "",
    stcRecommendationReason: "",
    leadersToManage: "",
  });

  const [message, setMessage] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJoinee = async () => {
      try {
        const token = await localforage.getItem("token");
        const res = await axios.get(
          `${API_URL}/probable-joinee/get-joinee-by-id/${joineeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = res.data;
        setFormData((prevFormData) => ({
          ...prevFormData, // keep previous defaults
          ...data, // overwrite with fetched data
        }));
      } catch (error) {
        console.error(error);
        setMessage("Failed to load Joinee data.");
      }
    };

    fetchJoinee();
  }, [joineeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const token = await localforage.getItem("token");
      let updatedFormData = { ...formData }; // clone formData first
  
      if (photoFile) {
        // If new photo selected, upload to S3 first
        const uploadParams = {
          Bucket: "mom-files-data-new",
          Key: `probable-joinees/${Date.now()}-${photoFile.name}`, // unique filename
          Body: photoFile,
          ContentType: photoFile.type,
        };
  
        const uploadResult = await s3.upload(uploadParams).promise();
        console.log("Upload success ✅", uploadResult);
  
        updatedFormData.photo = uploadResult.Location; // S3 file URL
      }
  
      const response = await axios.put(`${API_URL}/probable-joinee/update-joinee/${joineeId}`, updatedFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      alert("Joinee Added successfully!");
      Navigate("/probable-joinees"); // Redirect to the list page after successful update
    } catch (error) {
      console.error("Update error ❌", error);
      if (error.response) {
        console.error(error.response.data);
      }
      setMessage("Failed to update Joinee.");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <>
      <Dashboard />
      <div className="new-form-container" style={{ maxWidth: "900px" }}>
        <form onSubmit={handleSubmit} className="mom-form">
          <h2>Update Probable Joinee</h2>
          {message && <p className="message">{message}</p>}
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
              <label>Ward</label>
              <input
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                placeholder="Enter Ward Number..."
                required
              />
            </div>
            <div className="form-group">
              <label>Vibhag Pramukh Name</label>
              <input
                name="vibhagPramukhName"
                value={formData.vibhagPramukhName}
                onChange={handleChange}
                placeholder="Enter Vibhag Pramukh Name..."
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Vibhag Pramukh Contact No</label>
              <input
                name="vibhagPramukhContactNo"
                value={formData.vibhagPramukhContactNo}
                onChange={handleChange}
                placeholder="Enter Vibhag Pramukh Contact No..."
                required
                type="tel"
                pattern="[0-9]{10}"
              />
            </div>
            <div className="form-group">
              <label>Probable Joinee Name</label>
              <input
                name="probableJoineeName"
                value={formData.probableJoineeName}
                onChange={handleChange}
                placeholder="Enter Probable Joinee Name..."
                required
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter Age..."
                type="number"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Caste</label>
              <input
                name="caste"
                value={formData.caste}
                onChange={handleChange}
                placeholder="Enter Caste..."
              />
            </div>
            <div className="form-group">
              <label>Phone No</label>
              <input
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
                placeholder="Enter Phone No..."
                type="tel"
                pattern="[0-9]{10}"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Party</label>
              <select
                name="party"
                value={formData.party}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setFormData((prevData) => ({
                    ...prevData,
                    party: selectedValue, // Update party value from the dropdown
                  }));
                }}
                className="form-control"
                required
              >
                <option value="">Select Party</option>
                <option value="Shivsena">Shivsena</option>
                <option value="BJP">BJP</option>
                <option value="UBT">UBT</option>
                <option value="NCP(AP)">NCP(AP)</option>
                <option value="NCP(SP)">NCP(SP)</option>
                <option value="MVA">MVA</option>
                <option value="INC">INC</option>
                <option value="MNS">MNS</option>
                <option value="IND">IND</option>
                <option value="NA">NA</option>
                <option value="Other Party">Other Party</option>
              </select>

              {/* Show input only if 'Other Party' is selected */}
              {formData.party === "Other Party" && (
                <div className="form-group">
                  <label>Specify Party</label>
                  <input
                    name="otherPartyName"
                    value={formData.otherPartyName || ""} // Use a different state field for the input value
                    onChange={(e) => {
                      setFormData((prevData) => ({
                        ...prevData,
                        otherPartyName: e.target.value, // Update the input value when typed
                      }));
                    }}
                    placeholder="Enter other party name"
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Photo</label>
              <input
                type="file"
                name="photo"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => handleFileUpload(e, "photo")}
              />
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Enter Designation..."
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Brief Profile</label>
              <textarea
                rows="4"
                name="briefProfile"
                value={formData.briefProfile}
                onChange={handleChange}
                placeholder="Enter Brief Profile..."
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Public Image</label>
              <select
                name="publicImage"
                value={formData.publicImage}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Public Image</option>
                <option value="Strong">Strong</option>
                <option value="Moderate">Moderate</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Financial Status</label>
              <select
                name="financialStatus"
                value={formData.financialStatus}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Financial Status</option>
                <option value="Strong">Strong</option>
                <option value="Moderate">Moderate</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Voter Influence</label>
              <input
                name="voterInfluence"
                value={formData.voterInfluence}
                onChange={handleChange}
                placeholder="Enter Voter Influence..."
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Area Of Influence</label>
              <select
                name="areaOfInfluence"
                value={formData.areaOfInfluence}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Area Of Influence</option>
                <option value="Booth">Booth</option>
                <option value="Shakha">Shakha</option>
                <option value="Ward">Ward</option>
                <option value="Assembly Constituency">
                  Assembly Constituency
                </option>
                <option value="Parliamentary Constituency">
                  Parliamentary Constituency
                </option>
                <option value="District">District</option>
              </select>
            </div>
            <div className="form-group">
              <label>Viability</label>
              <select
                name="viability"
                value={formData.viability}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Viability</option>
                <option value="Favourable">Favourable</option>
                <option value="Moderate">Moderate</option>
                <option value="Difficult">Difficult</option>
              </select>
            </div>
            <div className="form-group">
              <label>Leader Who Informed STC</label>
              <input
                name="leaderWhoInformedSTC"
                value={formData.leaderWhoInformedSTC}
                onChange={handleChange}
                placeholder="Enter Leader Who Informed STC..."
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Vibhag Pramukh Agreed</label>
              <select
                name="vibhagPramukhAgreed"
                value={formData.vibhagPramukhAgreed}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Will Discuss today">Will Discuss today</option>
              </select>
            </div>
            <div className="form-group">
              <label>MLA or MP Agreed</label>
              <select
                name="mlaOrMpAgreed"
                value={formData.mlaOrMpAgreed}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Option</option>
                <option value="Will Discuss today">Will Discuss today</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>
            <div className="form-group">
              <label>Facilitator</label>
              <input
                name="facilitator"
                value={formData.facilitator}
                onChange={handleChange}
                placeholder="Enter Facilitator..."
              />
            </div>{" "}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Demand</label>
              <input
                name="demand"
                value={formData.demand}
                onChange={handleChange}
                placeholder="Enter Demand..."
              />
            </div>
            <div className="form-group">
              <label>Offer</label>
              <input
                name="offer"
                value={formData.offer}
                onChange={handleChange}
                placeholder="Enter Offer..."
              />
            </div>
            <div className="form-group">
              <label>STC Recommendation</label>
              <select
                name="stcRecommendation"
                value={formData.stcRecommendation}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>STC Recommendation Reason</label>
              <textarea
                rows="4"
                name="stcRecommendationReason"
                value={formData.stcRecommendationReason}
                onChange={handleChange}
                placeholder="Enter STC Recommendation Reason..."
                required
              />
            </div>
            <div className="form-group">
              <label>Leaders To Manage</label>
              <textarea
                rows="4"
                name="leadersToManage"
                value={formData.leadersToManage}
                onChange={handleChange}
                placeholder="Enter Leaders To Manage..."
              />
            </div>{" "}
          </div>
          <div className="form-row">
            {/* <div className="form-group">
            <label>Status</label>
            <input
              name="status"
              value={formData.status}
              onChange={handleChange}
              placeholder="Enter Status..."
            />
          </div> */}
            <div className="form-group">
              <label>Discussion With Joinee</label>
              <select
                name="discussionWithJoinee"
                value={formData.discussionWithJoinee}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Option</option>
                <option value="Discussion Initiated">
                  Discussion Initiated
                </option>
                <option value="Discussion Not Initiated">
                  Discussion Not Initiated
                </option>
                <option value="Leader Joined">Leader Joined</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </>
  );
};

export default UpdateProbableJoinee;
