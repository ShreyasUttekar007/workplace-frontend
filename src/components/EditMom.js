import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import { useNavigate, useParams } from "react-router-dom";
import data from "../dataFile.json";
import AWS from "aws-sdk";
import Dashboard from "./Dashboard";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

const API_URL = process.env.REACT_APP_API_URL;

const EditMom = () => {
  const { momId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    district: "",
    zone: "",
    pc: "",
    constituency: "",
    leaderName: "",
    dom: "",
    designation: "",
    partyName: "",
    remarks: "",
    photo: null,
    document: null,
  });

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
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const photoUrl = formData.photo
          ? await uploadFileToS3(formData.photo, "images")
          : null;

        const documentUrl = formData.document
          ? await uploadFileToS3(formData.document, "documents")
          : null;

        const updatedMomData = {
          ...formData,
          photo: photoUrl,
          document: documentUrl,
        };

        setFormData(updatedMomData);
        const token = await localforage.getItem("token");
        const response = await api.get(
          `${API_URL}/moms/get-mom-by-id/${momId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching mom data:", error);
      }
    };

    fetchData();
  }, [momId]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const photoUrl = file ? await uploadFileToS3(file, "images") : null;

    setFormData({
      ...formData,
      photo: photoUrl,
    });
  };

  const handleDocumentChange = async (e) => {
    const file = e.target.files[0];
    const documentUrl = file ? await uploadFileToS3(file, "documents") : null;

    setFormData({
      ...formData,
      document: documentUrl,
    });
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

    setDropdownData({
      ...dropdownData,
      ac: [...new Set(filteredAc)],
    });
  };

  const handleDistrictChange = (e) => {
    const selectedAc = e.target.value;

    const filteredDistrict = data
      .filter((item) => item["Ac Name and Number"] === selectedAc)
      .map((item) => item["District"]);

    const filteredZone = data
      .filter((item) => item["District"] === filteredDistrict[0])
      .map((item) => item["Zone"]);

    setDropdownData({
      ...dropdownData,
      districts: [...new Set(filteredDistrict)],
      zone: [...new Set(filteredZone)],
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = await localforage.getItem("token");
      await api.put(
        `${API_URL}/moms/update-mom/${momId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/momdata");
      alert("MOM Updated Successfully!");
    } catch (error) {
      console.error("Error updating mom data:", error);
    }
  };

  return (
    <>
      <Dashboard />
      <div>
        <form className="form-container" onSubmit={(e) => handleUpdate(e)}>
          <h1>Update MOM Data</h1>
          <div className="form-row">
            <label>
              Parliament Constituency
              <select
                name="pc"
                value={formData.pc}
                onChange={(e) => {
                  handlePcChange(e);
                  handleInputChange(e);
                }}
              >
                <option value="" disabled>
                  Select PC
                </option>
                {dropdownData.pc.map((parliament) => (
                  <option key={parliament} value={parliament}>
                    {parliament}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assembly Constituency
              <select
                name="constituency"
                value={formData.constituency}
                onChange={(e) => {
                  handleDistrictChange(e);
                  handleInputChange(e);
                }}
                disabled={!formData.pc}
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
            <label>
              Zone
              <select
                name="zone"
                value={formData.zone}
                onChange={(e) => {
                  handleInputChange(e);
                }}
                disabled={!formData.constituency}
              >
                {!formData.constituency ? (
                  <option value="" disabled>
                    Select Zone
                  </option>
                ) : null}
                {dropdownData.zone.map((zon) => (
                  <option key={zon} value={zon}>
                    {zon}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              District
              <select
                name="district"
                value={formData.district}
                onChange={(e) => {
                  handleInputChange(e);
                }}
                disabled={!formData.constituency}
              >
                {!formData.constituency ? (
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
              Leader's Name:
              <input
                type="text"
                name="leaderName"
                value={formData.leaderName}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Party Name:
              <select
                name="partyName"
                value={formData.partyName}
                onChange={handleInputChange}
              >
                {partyNames.map((party, index) => (
                  <option key={index} value={party}>
                    {party}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Date of Meeting:
              <input
                type="date"
                name="dom"
                value={formData.dom}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Designation:
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Upload Image
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleImageChange}
              />
              <small>
                {" "}
                <a
                  href={formData.photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-link"
                >
                  View Uploaded Image
                </a>
              </small>
            </label>
          </div>
          <div className="form-row">
            <label>
              Upload MoM Document
              <input
                type="file"
                name="document"
                accept=".pdf, .doc, .docx"
                onChange={handleDocumentChange}
              />
              <small>
                {" "}
                <a
                  href={formData.document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-link"
                >
                  View Uploaded Document
                </a>
              </small>
            </label>
          </div>
          <label>
            Remarks
            <textarea
              type="text"
              placeholder="Please enter your Remarks..."
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
            />
          </label>
          <div className="button-submit">
            <button type="submit">UpdateMoM</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditMom;
