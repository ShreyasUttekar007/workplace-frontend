import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import { useNavigate, useParams } from "react-router-dom";
import data from "../dataFile.json";
import AWS from "aws-sdk";
import Dashboard from "./Dashboard";
import DashboardReport from "./DashboardReport";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

const s3 = new AWS.S3();

const API_URL = process.env.REACT_APP_API_URL;

const UpdateReport = () => {
  const { momId } = useParams();

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    district: "",
    zone: "",
    pc: "",
    constituency: "",
    document: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const documentUrl = formData.document
          ? await uploadFileToS3(formData.document, "reports")
          : null;

        const updatedMomData = {
          ...formData,
          document: documentUrl,
        };

        setFormData(updatedMomData);
        const token = await localforage.getItem("token");
        const response = await api.get(
          `${API_URL}/report/get-report-by-id/${momId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };

    fetchData();
  }, [momId]);

  const handleDocumentChange = async (e) => {
    const file = e.target.files[0];
    const documentUrl = file ? await uploadFileToS3(file, "reports") : null;

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
        `${API_URL}/report/update-report/${momId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/reportdata");
      alert("Report Updated Successfully!");
    } catch (error) {
      console.error("Error updating report data:", error);
    }
  };

  return (
    <>
      <DashboardReport />
      <div>
        <form className="form-container" onSubmit={(e) => handleUpdate(e)}>
          <h1>Update AC Report</h1>
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
            <div className="form-row">
              <label>
                Upload Ac Report
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
          </div>

          <div className="button-submit">
            <button type="submit">Update Report</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UpdateReport;
