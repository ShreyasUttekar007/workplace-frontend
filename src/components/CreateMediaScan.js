import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import data from "../dataFile.json";
import "../css/createMom.css";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";

const API_URL = process.env.REACT_APP_API_URL;

const CreateMediaScan = () => {
  const [momData, setMomData] = useState({
    district: "",
    zone: "",
    constituency: "",
    organization: "party", // Default to "party"
    organizationName: "",
    headline: "",
    source: "",
    link: "",
    sentiment: "",
    summary: "",
  });
  const [dropdownData, setDropdownData] = useState({
    pc: [],
    zone: [],
    districts: [],
    ac: [],
  });
  const [selectedType, setSelectedType] = useState("party");
  const [governmentOptions, setGovernmentOptions] = useState([
    "Government",
    "Health Department",
    "Option 3",
  ]);
  const [newGovernmentOption, setNewGovernmentOption] = useState("");
  const [showNewGovernmentInput, setShowNewGovernmentInput] = useState(false);

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
    "NA",
  ];
  const sentiment = ["Positive", "Neutral", "Negative"];

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
      .map((item) => item["Ac Name and Number"]);

    setDropdownData((prevData) => ({
      ...prevData,
      ac: [...new Set(filteredpc)],
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

    if (name === "organizationName" && value === "add_new") {
      setShowNewGovernmentInput(true);
    } else {
      setShowNewGovernmentInput(false);
    }
  };

  const handleRadioChange = (e) => {
    setSelectedType(e.target.value);
    setMomData({
      ...momData,
      organization: e.target.value, // Set organization to "party" or "government"
      organizationName: "", // Reset organizationName when the type changes
    });
  };

  const handleNewGovernmentOptionChange = (e) => {
    setNewGovernmentOption(e.target.value);
  };

  const handleAddGovernmentOption = () => {
    if (newGovernmentOption.trim() !== "") {
      setGovernmentOptions((prevOptions) => [
        ...prevOptions,
        newGovernmentOption,
      ]);
      setNewGovernmentOption("");
      setShowNewGovernmentInput(false);
      setMomData((prevData) => ({
        ...prevData,
        organizationName: newGovernmentOption,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await localforage.getItem("token");
      const userId = await localforage.getItem("ID");
      const role = await localforage.getItem("role");

      if (!userId || !token) {
        console.error("User ID or Token not found");
        return;
      }

      const response = await api.post(
        `${API_URL}/mediascan/mom`,
        momData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Media-Scan submitted successfully!");
      setMomData({
        district: "",
        zone: "",
        constituency: "",
        organization: selectedType, 
        organizationName: "",
        headline: "",
        source: "",
        link: "",
        sentiment: "",
        summary: "",
      });
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
        <h1>Media Scan</h1>
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
          {/* <label>
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
          </label> */}
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
              disabled={!momData.zone}
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
            District
            <select
              name="district"
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
        </div>
        <div className="form-row">
          
          <label style={{ width: "30%" }}>
            Select Organization
            <div className="radio-div">
              <label
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <input
                  type="radio"
                  name="type"
                  className="radio-button"
                  value="party"
                  checked={selectedType === "party"}
                  onChange={handleRadioChange}
                />
                Party
              </label>
              <label
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <input
                  type="radio"
                  name="type"
                  className="radio-button"
                  value="government"
                  checked={selectedType === "government"}
                  onChange={handleRadioChange}
                />
                Government
              </label>
            </div>
          </label>
          {selectedType === "party" ? (
            <label>
              Party Name
              <select
                name="organizationName"
                value={momData.organizationName}
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
          ) : (
            <label>
              Government
              <input
                type="text"
                placeholder="Please enter Government"
                name="organizationName"
                value={momData.organizationName}
                onChange={handleChange}
                required
              />
            </label>
          )}
           <label>
            Sentiment
            <select
              name="sentiment"
              value={momData.sentiment}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select Sentiment
              </option>
              {sentiment.map((sent, index) => (
                <option key={index} value={sent}>
                  {sent}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Headline
            <input
              type="text"
              name="headline"
              placeholder="Please enter Headline"
              value={momData.headline}
              required
              onChange={handleChange}
            />
          </label>
          <label>
            Source
            <input
              type="text"
              placeholder="Please enter Source"
              name="source"
              value={momData.source}
              required
              onChange={handleChange}
            />
          </label>
          <label>
            Link
            <input
              type="text"
              placeholder="Please enter Link"
              name="link"
              value={momData.link}
              required
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="form-row2">
         
          <label style={{width:"65%"}}>
            Summary
            <textarea
              type="text"
              placeholder="Please enter Summary..."
              name="summary"
              value={momData.summary}
              required
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="button-submit">
          <button type="submit">Submit</button>
        </div>
      </form>
    </>
  );
};

export default CreateMediaScan;
