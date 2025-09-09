import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import data from "../dataFile.json";
import "../css/createMom.css";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

const API_URL = process.env.REACT_APP_API_URL;

const CreateMom = () => {
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];
  const allowedDocumentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const [imageError, setImageError] = useState("");
  const [documentError, setDocumentError] = useState("");
  const [momData, setMomData] = useState({
    district: "",
    zone: "",
    pc: "",
    constituency: "",
    leaderName: "",
    dom: "",
    designation: "",
    partyName: "",
    remarks: "",
    tags: "",
    photo: null,
    document: null,
  });
  const navigate = useNavigate();


  const partyNames = [
    "Shivsena",
    "BJP",
    "UBT",
    "NCP(AP)",
    "NCP(SP)",
    "MVA",
    "INC",
    "MNS",
    "Other Party",
    "NA"
  ];
  const [dropdownData, setDropdownData] = useState({
    pc: [],
    zone: [],
    districts: [],
    ac: [],
  });

  useEffect(() => {
    const uniqueZone = [...new Set(data.map((item) => item["Zone"]))];
    const uniqueDistricts = [...new Set(data.map((item) => item["District"]))];
    const uniquePc = [
      ...new Set(data.map((item) => item["Pc Name and Number"])),
    ];
    const uniqueAc = [
      ...new Set(data.map((item) => item["Ac Name and Number"])),
    ];

    setDropdownData({
      zone: uniqueZone,
      districts: uniqueDistricts,
      pc: uniquePc,
      ac: uniqueAc,
    });
  }, []);

  const handlePcChange = (e) => {
    const selectedPc = e.target.value;

    const filteredAc = data
      .filter((item) => item["Pc Name and Number"] === selectedPc)
      .map((item) => item["Ac Name and Number"]);

    setDropdownData((prevData) => ({
      ...prevData,
      ac: [...new Set(filteredAc)],
    }));

    setMomData((prevData) => ({
      ...prevData,
      pc: selectedPc,
    }));
  };

  const handleDistrictChange = (e) => {
    const selectedAc = e.target.value;

    const filteredDistrict = data
      .filter((item) => item["Ac Name and Number"] === selectedAc)
      .map((item) => item["District"]);

    setDropdownData((prevData) => ({
      ...prevData,
      districts: [...new Set(filteredDistrict)],
    }));

    setMomData((prevData) => ({
      ...prevData,
      constituency: selectedAc,
    }));
  };

  const handleZoneChange = (e) => {
    const selectedZone = e.target.value;

    const filteredpc = data
      .filter((item) => item["Zone"] === selectedZone)
      .map((item) => item["Pc Name and Number"]);

    setDropdownData((prevData) => ({
      ...prevData,
      pc: [...new Set(filteredpc)],
    }));

    setMomData((prevData) => ({
      ...prevData,
      zone: selectedZone,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await localforage.getItem("ID");

        if (userId !== null) {
          const defaultDistrict =
            dropdownData.districts.length > 0 ? dropdownData.districts[0] : "";

          setMomData((prevData) => ({
            ...prevData,
            userId: userId.toString(),
            district: defaultDistrict,
          }));
        } else {
          console.warn("User ID not found in localforage");
        }
      } catch (error) {
        console.error("Error fetching userId from localforage:", error);
      }
    };

    fetchData();
  }, [dropdownData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMomData({
      ...momData,
      [name]: value,
    });

    const inputField = document.querySelector(`[name="${name}"]`);
    if (inputField) {
      if (value.trim() !== "") {
        inputField.classList.add("non-empty");
      } else {
        inputField.classList.remove("non-empty");
      }
    }
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(",").map((tag) => tag.trim());

    setMomData({
      ...momData,
      tags: tagsArray,
    });
  };

  const currentDate = new Date();
  const oneYearAgo = new Date(currentDate);
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

  const futureDate = new Date(currentDate);
  futureDate.setFullYear(currentDate.getFullYear() + 5);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file && allowedImageTypes.includes(file.type)) {
      setMomData((prevData) => ({
        ...prevData,
        photo: file,
      }));
      setImageError("");
    } else {
      setImageError("Invalid image type upload a PNG, JPEG, or JPG file.");
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];

    if (file && allowedDocumentTypes.includes(file.type)) {
      setMomData((prevData) => ({
        ...prevData,
        document: file,
      }));
      setDocumentError("");
    } else {
      setDocumentError(
        "Invalid document type upload a PDF, DOC, or DOCX file."
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

    try {
      const photoUrl = momData.photo
        ? await uploadFileToS3(momData.photo, "images")
        : null;

      const documentUrl = momData.document
        ? await uploadFileToS3(momData.document, "documents")
        : null;

      const updatedMomData = {
        ...momData,
        photo: photoUrl,
        document: documentUrl,
      };

      setMomData(updatedMomData);

      const token = await localforage.getItem("token");
      const userId = await localforage.getItem("ID");
      const role = await localforage.getItem("role");

      if (!userId || !token) {
        console.error("User ID or Token not found");
        return;
      }

      const response = await api.post(
        `${API_URL}/moms/mom`,
        updatedMomData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("MoM submitted successfully!");
      setMomData({
        district: "",
        zone: "",
        pc: "",
        constituency: "",
        leaderName: "",
        dom: "",
        designation: "",
        partyName: "",
        remarks: "",
        tags: "",
        photo: null,
        document: null,
      });
      setImageError("");
      setDocumentError("");
      document.getElementById("createMomForm").reset(); 
    } catch (error) {
      console.error("Error creating Mom entry:", error);
    }
  };

  return (
    <>
      <Dashboard />
      <form
        id="createMomForm"
        className="form-container"
        onSubmit={handleSubmit}
      >
        <h1>Minutes of Meeting</h1>
        <div className="form-row">
          <label>
            Zone
            <select
              name="zone"
              value={momData.zone}
              onChange={(e) => {
                handleZoneChange(e);
                handleChange(e);
              }}
              required
            >
              <option value="" disabled>
                Select Zone
              </option>
              {dropdownData.zone.map((zon) => (
                <option key={zon} value={zon}>
                  {zon}
                </option>
              ))}
            </select>
          </label>
          <label>
            Parliament Constituency
            <select
              name="pc"
              value={momData.pc}
              onChange={(e) => {
                handlePcChange(e);
                handleChange(e);
              }}
              required
            >
              <option value="" disabled>
                Select PC
              </option>
              {dropdownData.pc.map((parliment) => (
                <option key={parliment} value={parliment}>
                  {parliment}
                </option>
              ))}
            </select>
          </label>
          <label>
            Assembly Constituency
            <select
              name="constituency"
              value={momData.constituency}
              onChange={(e) => {
                handleDistrictChange(e);
                handleChange(e);
              }}
              required
              disabled={!momData.pc}
            >
              <option value="" disabled>
                Select AC
              </option>
              {dropdownData.ac.map((assembly) => (
                <option key={assembly} value={assembly}>
                  {assembly}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            District
            <select
              name="District"
              value={momData.district}
              onChange={(e) => {
                handleChange(e);
              }}
              required
              disabled={!momData.constituency}
            >
              {!momData.constituency ? (
                <option value="" disabled>
                  Select District
                </option>
              ) : null}
              {dropdownData.districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>
          <label>
            Party Name
            <select
              name="partyName"
              value={momData.partyName}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select Party Name
              </option>
              {partyNames.map((party, index) => (
                <option key={index} value={party}>
                  {party}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date of Meeting
            <input
              type="date"
              name="dom"
              value={momData.dom}
              min={oneYearAgo.toISOString().split("T")[0]}
              max={futureDate.toISOString().split("T")[0]}
              required
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="form-row"></div>
        <div className="form-row">
          <label>
            Leader's Name
            <input
              type="text"
              name="leaderName"
              placeholder="Please enter Leader's Name"
              value={momData.leaderName}
              required
              onChange={handleChange}
            />
          </label>
          <label>
            Designation
            <input
              type="text"
              placeholder="Please enter your Designation"
              name="designation"
              value={momData.designation}
              required
              onChange={handleChange}
            />
          </label>
          <label>
            Tags
            <input
              type="text"
              placeholder="Please enter Tags"
              name="tags"
              value={Array.isArray(momData.tags) ? momData.tags.join(", ") : ""}
              onChange={handleTagsChange}
            />
            <small
              style={{ textAlign: "center", fontWeight: "400", color: "blue" }}
            >
              (Please enter a comma "," after each tag)
            </small>
          </label>
        </div>
        <div className="form-row">
          <div className="upload">
            <label>
              Upload MoM Document
              <input
                type="file"
                name="document"
                onChange={handleDocumentChange}
                required
              />
              {documentError && (
                <p
                  className="error-message"
                  style={{ fontSize: "12px", color: "red" }}
                >
                  {documentError}
                </p>
              )}
            </label>
          </div>
          <div className="upload">
            <label>
              Upload Leader's Image
              <input
                type="file"
                name="photo"
                onChange={handleImageChange}
                required
              />
              {imageError && (
                <p
                  className="error-message"
                  style={{ fontSize: "12px", color: "red" }}
                >
                  {imageError}
                </p>
              )}
            </label>
          </div>
        </div>
        <label>
          Remarks
          <textarea
            type="text"
            placeholder="Please enter your Remarks..."
            name="remarks"
            value={momData.remarks}
            required
            onChange={handleChange}
          />
        </label>
        <div className="button-submit">
          <button type="submit">Submit</button>
        </div>
      </form>
    </>
  );
};

export default CreateMom;
