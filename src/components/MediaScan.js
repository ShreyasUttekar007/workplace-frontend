import React, { useState, useEffect, useMemo, useRef } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import "../css/momData.css";
import { Link, useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import Dashboard from "./Dashboard";
import data from "../dataFile.json";
import ReactToPrint from "react-to-print";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const MediaScan = () => {
  const [momData, setMomData] = useState([]);
  const [responseAllMomCount, setResponseAllMomCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partyCounts, setPartyCounts] = useState([]);
  const [zoneCount, setZoneCount] = useState(0);
  const [pcCount, setPcCount] = useState(0);
  const [acCount, setAcCount] = useState(0);
  console.log("acCount::: ", acCount);
  const [userRole, setUserRole] = useState("");
  const [role, setRole] = useState("");
  console.log("role::: ", role);
  const initialDropdownValue = "";
  const [searchInput, setSearchInput] = useState("");
  const [filteredMomData, setFilteredMomData] = useState([]);

  const [selectedPc, setSelectedPc] = useState(initialDropdownValue);
  const [selectedConstituency, setSelectedConstituency] =
    useState(initialDropdownValue);
  const [selectedZone, setSelectedZone] = useState(initialDropdownValue);
  const navigate = useNavigate();
  const componentRef = useRef();
  

  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    const uniqueDates = [
      ...new Set(momData.map((mom) => mom.createdAt.split("T")[0])),
    ];
    setAvailableDates(uniqueDates.sort());
  }, [momData]);

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "desc",
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  //   const [availableDates, setAvailableDates] = useState([]);

  //   const [currentPage, setCurrentPage] = useState(0);
  //   const itemsPerPage = 10;

  //   const pageCount = Math.ceil(filteredMomData.length / itemsPerPage);

  //   const displayedMomData = useMemo(() => {
  //     const startIndex = currentPage * itemsPerPage;
  //     const endIndex = startIndex + itemsPerPage;
  //     return filteredMomData.slice(startIndex, endIndex);
  //   }, [currentPage, filteredMomData]);

  //   const handlePageClick = (data) => {
  //     setCurrentPage(data.selected);
  //   };

  //   useEffect(() => {
  //     const uniqueDates = [
  //       ...new Set(momData.map((mom) => mom.dom.split("T")[0])),
  //     ];
  //     setAvailableDates(uniqueDates.sort());
  //   }, [momData]);

  //   const handleStartDateChange = (date) => {
  //     setStartDate(date);
  //   };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedRole = await localforage.getItem("role1");
        if (storedRole) {
          setRole(storedRole);
        } else {
          console.log("Role not found in localforage.");
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const uniqueDates = [
      ...new Set(momData.map((mom) => mom.createdAt.split("T")[0])),
    ];
    setAvailableDates(uniqueDates.sort());
  }, [momData]);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (date && endDate && date <= endDate) {
      filterMomDataByDateRange(date, endDate);
    } else {
      setFilteredMomData(momData);
    }
  };
  
  const handleEndDateChange = (date) => {
    setEndDate(date);
  
    if (startDate && date && date < startDate) {
      setStartDate(null);
      setEndDate(null);
      alert("Please select a valid end date.");
    } else if (startDate) {
      filterMomDataByDateRange(startDate, date);
    } else {
      filterMomDataByDateRange(null, date);
    }
  };
  
  const filterMomDataByDateRange = (start, end) => {
    // Ensure the end date includes the entire end day by setting time to end of day
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);
  
    const filteredMomDataByDate = momData.filter((mom) => {
      const createdAt = new Date(mom.createdAt);
      return (
        (!start || createdAt >= start) && (!end || createdAt <= endOfDay)
      );
    });
  
    setFilteredMomData(filteredMomDataByDate);
  };
  
  
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSort = (key) => {
    requestSort(key);
    const sortedFilteredMomData = [...filteredMomData].sort((a, b) => {
      const valA = a[key].toUpperCase();
      const valB = b[key].toUpperCase();

      if (sortConfig.direction === "asc") {
        return valA.localeCompare(valB);
      } else {
        return valB.localeCompare(valA);
      }
    });
    setFilteredMomData(sortedFilteredMomData);
  };

  const getClassNamesFor = (name) => {
    if (!sortConfig.key) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const handleSearchInputChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);

    const filteredAndSortedData = sortedMomData.filter((mom) => {
      const tagsMatch = mom.tags.some((tag) =>
        tag.toLowerCase().includes(input.toLowerCase())
      );

      return (
        mom.partyName.toLowerCase().includes(input.toLowerCase()) ||
        mom.designation.toLowerCase().includes(input.toLowerCase()) ||
        mom.constituency.toLowerCase().includes(input.toLowerCase()) ||
        mom.leaderName.toLowerCase().includes(input.toLowerCase()) ||
        mom.createdAt.toLowerCase().includes(input.toLowerCase()) ||
        tagsMatch
      );
    });

    setFilteredMomData(
      [...filteredAndSortedData].sort((a, b) => {
        if (sortConfig.key) {
          const valA = a[sortConfig.key].toUpperCase();
          const valB = b[sortConfig.key].toUpperCase();

          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return 0;
      })
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await localforage.getItem("token");
        const userId = await localforage.getItem("ID");
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

        const role = await localforage.getItem("role");
        setUserRole(role);

        const momDataResponse = await api.get(
          `${API_URL}/mediascan/get-mom/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const sortedMomData = momDataResponse.data.sort((a, b) => {
          if (a.pc < b.pc) return -1;
          if (a.pc > b.pc) return 1;
          if (a.constituency < b.constituency) return -1;
          if (a.constituency > b.constituency) return 1;
          return 0;
        });

        setMomData(sortedMomData);
        setFilteredMomData(sortedMomData);
        const momDataForAllParties = partyNames.map((partyName) => {
          const momCount = sortedMomData.filter(
            (mom) => mom.partyName === partyName
          ).length;
          return {
            partyName,
            momCount,
          };
        });

        setPartyCounts(momDataForAllParties);
        setResponseAllMomCount(sortedMomData.length);
        setLoading(false);

        const uniquePc = [...new Set(sortedMomData.map((mom) => mom.pc))];
        const uniqueAc = [
          ...new Set(sortedMomData.map((mom) => mom.constituency)),
        ];
        const uniqueZone = [...new Set(sortedMomData.map((mom) => mom.zone))];
        setDropdownData({
          ...dropdownData,
          pc: uniquePc,
          ac: uniqueAc,
          zone: uniqueZone,
        });
      } catch (error) {
        console.error("Error fetching mom data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [sortConfig]);

  const sortedMomData = useMemo(() => {
    let sortableMomData = [...momData];
    if (sortConfig.key) {
      sortableMomData.sort((a, b) => {
        if (sortConfig.key === "createdAt") {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);

          if (sortConfig.direction === "asc") {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        } else {
          const valA = a[sortConfig.key].toUpperCase();
          const valB = b[sortConfig.key].toUpperCase();

          if (sortConfig.direction === "asc") {
            return valA.localeCompare(valB);
          } else {
            return valB.localeCompare(valA);
          }
        }
      });
    }
    return sortableMomData;
  }, [momData, sortConfig]);

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

  const handleZoneChange = (e) => {
    const selectedZone = e.target.value;

    const filteredPc = data
      .filter((item) => item["Zone"] === selectedZone)
      .map((item) => item["Pc Name and Number"]);

    const filteredAc = data
      .filter((item) => item["Zone"] === selectedZone)
      .map((item) => item["Ac Name and Number"]);

    setDropdownData({
      ...dropdownData,
      pc: [...new Set(filteredPc)],
      ac: [...new Set(filteredAc)],
    });

    // Clear the selected PC and AC if they're not available in the newly filtered lists
    if (!filteredPc.includes(selectedPc)) {
      setSelectedPc(initialDropdownValue);
    }
    if (!filteredAc.includes(selectedConstituency)) {
      setSelectedConstituency(initialDropdownValue);
    }
  };

  const handlePcChange = (e) => {
    const selectedPc = e.target.value;

    const filteredAc = data
      .filter((item) => item["Pc Name and Number"] === selectedPc)
      .map((item) => item["Ac Name and Number"]);

    setDropdownData({
      ...dropdownData,
      ac: [...new Set(filteredAc)],
    });

    // Clear the selected AC if it's not available in the newly filtered list
    if (!filteredAc.includes(selectedConstituency)) {
      setSelectedConstituency(initialDropdownValue);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    setMomData([]);
    let updatedMomData = [];

    try {
      const token = await localforage.getItem("token");

      if (value === initialDropdownValue) {
        updatedMomData = sortedMomData;
      } else {
        if (name === "pc") {
          const responseMomByPC = await api.get(
            `${API_URL}/mediascan/get-mom-by-pc/${value}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          updatedMomData = responseMomByPC.data.moms;
        } else if (name === "constituency") {
          const responseMomByConstituency = await api.get(
            `${API_URL}/mediascan/get-mom-by-constituency/${value}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          updatedMomData = responseMomByConstituency.data.moms;
        } else if (name === "zone") {
          const responseMomByZone = await api.get(
            `${API_URL}/mediascan/get-mom-by-zone/${value}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          updatedMomData = responseMomByZone.data.moms;
        }
      }

      setMomData(updatedMomData);
      setFilteredMomData(updatedMomData);
      updatePartyCounts(updatedMomData);
      setResponseAllMomCount(updatedMomData.length);
    } catch (error) {
      console.error("Error fetching mom data:", error);
    }
  };

  const updatePartyCounts = (data) => {
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

    const momDataForAllParties = partyNames.map((partyName) => {
      const momCount = data.filter((mom) => mom.partyName === partyName).length;
      return {
        partyName,
        momCount,
      };
    });

    setPartyCounts(momDataForAllParties);
  };

  const handleDeleteMom = async (momId) => {
    try {
      const token = await localforage.getItem("token");
      await api.delete(
        `${API_URL}/mediascan/delete-mom/${momId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedMomData = momData.filter((mom) => mom._id !== momId);
      setMomData(updatedMomData);
      setFilteredMomData(updatedMomData);
      window.alert("Mom is deleted successfully");
      // window.location.reload();
    } catch (error) {
      console.error("Error deleting mom:", error);
    }
  };

  const fetchZoneCount = async () => {
    try {
      const token = await localforage.getItem("token");

      if (selectedZone === initialDropdownValue) {
        // Set count to 0 or handle accordingly
        console.log("Selected zone is not valid");
        setZoneCount(0);
      } else {
        const responseZoneCount = await api.get(
          `${API_URL}/mediascan/get-mom-count-by-zone/${selectedZone}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setZoneCount(responseZoneCount.data.momCount);
      }
    } catch (error) {
      console.error("Error fetching zone count:", error);
    }
  };

  useEffect(() => {
    fetchZoneCount();
  }, [selectedZone]);

  const fetchPcCount = async () => {
    try {
      const token = await localforage.getItem("token");

      if (selectedPc === initialDropdownValue) {
        // Set count to 0 or handle accordingly
        console.log("Selected pc is not valid");
        setPcCount(0);
      } else {
        const responsePcCount = await api.get(
          `${API_URL}/mediascan/get-mom-count-by-pc/${selectedPc}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPcCount(responsePcCount.data.momCount);
      }
    } catch (error) {
      console.error("Error fetching zone count:", error);
    }
  };

  useEffect(() => {
    fetchPcCount();
  }, [selectedPc]);

  const formatIndianDate = (date) => {
    if (!date) return "";

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    };

    return date.toLocaleDateString("en-IN", options);
  };

  const fetchAcCount = async () => {
    try {
      const token = await localforage.getItem("token");

      if (selectedConstituency === initialDropdownValue) {
        // Set count to 0 or handle accordingly
        console.log("Selected ac is not valid");
        setAcCount(0);
      } else {
        const responseAcCount = await api.get(
          `${API_URL}/mediascan/get-mom-count-by-constituency/${selectedConstituency}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAcCount(responseAcCount.data.momCount);
        console.log("responseAcCount::: ", responseAcCount);
      }
    } catch (error) {
      console.error("Error fetching zone count:", error);
    }
  };

  useEffect(() => {
    fetchAcCount();
  }, [selectedConstituency]);

  const allowedRoles = [
    "admin",
    "mod",
    "soul",
    "state",
    "Eastern Vidarbha",
    "Konkan",
    "Marathwada",
    "Mumbai",
    "Northern Maharashtra",
    "Thane + Palghar",
    "Western Maharashtra",
    "Western Vidarbha",
  ];

  const isRoleAllowed = allowedRoles.includes(role);

  return (
    <>
      <Dashboard />
      <div className="mom-container">
        {loading ? (
          <div>
            <BeatLoader color="#03b3ff" className="loader" />
          </div>
        ) : momData.length === 0 ? (
          <div>
            <p>No Media Scan data available.</p>
          </div>
        ) : (
          <>
            <div className="mom-count">
              <div
                className="select-columns"
                style={{
                  gridTemplateColumns: "1fr 1fr 1fr",
                }}
              >
                <label>
                  Zone
                  <select
                    name="zone"
                    value={selectedZone}
                    onChange={(e) => {
                      setSelectedZone(e.target.value);
                      handleZoneChange(e);
                      handleInputChange(e);
                    }}
                    style={{ margin: "5px" }}
                    disabled={!isRoleAllowed}
                  >
                    <option value={initialDropdownValue}>Select Zone</option>
                    {dropdownData.zone.sort((a, b) => {
                        // Extract the numeric part of the constituency by splitting and trimming
                        const numberA = parseInt(a.split("-")[0].trim(), 10);
                        const numberB = parseInt(b.split("-")[0].trim(), 10);

                        // Compare and sort numerically
                        return numberA - numberB;
                      }).map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </label>
                {/* <label>
                  Parliament Constituency
                  <select
                    name="pc"
                    value={selectedPc}
                    onChange={(e) => {
                      setSelectedPc(e.target.value);
                      handlePcChange(e);
                      handleInputChange(e);
                    }}
                    style={{ margin: "5px" }}
                    disabled={!isRoleAllowed}
                  >
                    <option value={initialDropdownValue}>Select PC</option>
                    {dropdownData.pc.map((parliament) => (
                      <option key={parliament} value={parliament}>
                        {parliament}
                      </option>
                    ))}
                  </select>
                </label> */}
                <label>
                  Assembly Constituency
                  <select
                    name="constituency"
                    value={selectedConstituency}
                    onChange={(e) => {
                      setSelectedConstituency(e.target.value);
                      handleInputChange(e);
                    }}
                    style={{ margin: "5px" }}
                  >
                    <option value={initialDropdownValue}>Select AC</option>
                    {dropdownData.ac
                      .sort((a, b) => {
                        // Extract the names from the assembly strings (after the hyphen)
                        const nameA = a.split("-")[1].trim().toLowerCase();
                        const nameB = b.split("-")[1].trim().toLowerCase();

                        // Perform alphabetical sorting on names
                        return nameA.localeCompare(nameB);
                      })
                      .map((assembly) => {
                        // Split the assembly string into two parts
                        const [number, name] = assembly.split("-");
                        // Capitalize the first letter of the name
                        const capitalizedAssembly = `${number}-${
                          name.charAt(0).toUpperCase() + name.slice(1)
                        }`;
                        return (
                          <option key={assembly} value={assembly}>
                            {capitalizedAssembly}
                          </option>
                        );
                      })}
                  </select>
                </label>
                <label>
                  Start Date
                  <input
                    type="date"
                    value={
                      startDate ? startDate.toISOString().split("T")[0] : ""
                    }
                    onChange={(e) =>
                      handleStartDateChange(new Date(e.target.value))
                    }
                    min={availableDates.length > 0 ? availableDates[0] : ""}
                    max={endDate ? endDate.toISOString().split("T")[0] : ""}
                    style={{ margin: "5px" }}
                  />
                </label>
                <label>
                  End Date
                  <input
                    type="date"
                    value={endDate ? endDate.toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      handleEndDateChange(new Date(e.target.value))
                    }
                    disabled={!startDate}
                    min={startDate ? startDate.toISOString().split("T")[0] : ""}
                    max={
                      availableDates.length > 0
                        ? availableDates[availableDates.length - 1]
                        : ""
                    }
                    style={{ margin: "5px" }}
                  />
                </label>
                <div className="export-button">
                  <ReactToPrint
                    trigger={() => (
                      <FontAwesomeIcon
                        icon={faFilePdf}
                        className="font-pdf"
                        size="2x"
                      />
                    )}
                    content={() => componentRef.current}
                    pageStyle={`@page { margin: 5mm 5mm; }`}
                    documentTitle="Media Scan"
                    removeAfterPrint={true}
                  />
                </div>
              </div>
              <div
                className="select-columns"
                style={{
                  gridTemplateColumns: "1fr 1fr 1fr",
                }}
              >
                {/* <label>
                  Start Date
                  <input
                    type="date"
                    value={
                      startDate ? startDate.toISOString().split("T")[0] : ""
                    }
                    onChange={(e) =>
                      handleStartDateChange(new Date(e.target.value))
                    }
                    min={availableDates.length > 0 ? availableDates[0] : ""}
                    max={endDate ? endDate.toISOString().split("T")[0] : ""}
                    style={{ margin: "5px" }}
                  />
                </label>
                <label>
                  End Date
                  <input
                    type="date"
                    value={endDate ? endDate.toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      handleEndDateChange(new Date(e.target.value))
                    }
                    disabled={!startDate}
                    min={startDate ? startDate.toISOString().split("T")[0] : ""}
                    max={
                      availableDates.length > 0
                        ? availableDates[availableDates.length - 1]
                        : ""
                    }
                    style={{ margin: "5px" }}
                  />
                </label> */}
                <div className="total-count" style={{ margin: "5px" }}>
                  <h3>Total Media Scan Count: </h3>
                  <h6>{responseAllMomCount}</h6>
                </div>
                <div className="total-count" style={{ margin: "5px" }}>
                  <h3>Zone-wise Media Scan Count: </h3>
                  <h6>{zoneCount}</h6>
                </div>
                <div className="total-count" style={{ margin: "5px" }}>
                  <h3>Ac-wise Media Scan Count: </h3>
                  <h6>{acCount}</h6>
                </div>
              </div>
            </div>
            <div class="table-container" id="pdf-content" ref={componentRef}>
              <h1>{selectedConstituency}</h1>
              <table className="mom-table">
                <thead>
                  <tr>
                    <th
                      onClick={() => requestSort("constituency")}
                      className={getClassNamesFor("constituency")}
                      style={{ maxWidth: "300px", textAlign: "center" }}
                    >
                      District{" "}
                      {getClassNamesFor("constituency") === "asc" && "↑"}
                      {getClassNamesFor("constituency") === "desc" && "↓"}
                    </th>
                    <th
                      onClick={() => requestSort("leaderName")}
                      className={getClassNamesFor("leaderName")}
                      style={{ maxWidth: "300px", textAlign: "center" }}
                    >
                      Date {getClassNamesFor("leaderName") === "asc" && "↑"}
                      {getClassNamesFor("leaderName") === "desc" && "↓"}
                    </th>
                    <th style={{ maxWidth: "300px", textAlign: "center" }}>
                      Party
                    </th>
                    <th
                      onClick={() => requestSort("partyName")}
                      className={getClassNamesFor("partyName")}
                      style={{ maxWidth: "300px", textAlign: "center" }}
                    >
                      Headline {getClassNamesFor("partyName") === "asc" && "↑"}
                      {getClassNamesFor("partyName") === "desc" && "↓"}
                    </th>
                    <th
                      onClick={() => requestSort("partyName")}
                      className={getClassNamesFor("partyName")}
                      style={{ maxWidth: "300px", textAlign: "center" }}
                    >
                      Summary {getClassNamesFor("partyName") === "asc" && "↑"}
                      {getClassNamesFor("partyName") === "desc" && "↓"}
                    </th>

                    <th
                      onClick={() => requestSort("dom")}
                      className={getClassNamesFor("dom")}
                      style={{ maxWidth: "300px", textAlign: "center" }}
                    >
                      Source {getClassNamesFor("dom") === "asc" && "↑"}
                      {getClassNamesFor("dom") === "desc" && "↓"}
                    </th>

                    <th style={{ maxWidth: "300px", textAlign: "center" }}>
                      Sentiment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMomData.map((mom) => (
                    <tr key={mom.id}>
                      <td style={{ maxWidth: "300px", textAlign: "center" }}>
                        {mom.district}
                      </td>
                      <td style={{ maxWidth: "300px", textAlign: "center" }}>
                        {formatIndianDate(mom.createdAt)}
                      </td>
                      <td style={{ maxWidth: "300px", textAlign: "center" }}>
                        {mom.organizationName}
                      </td>
                      <td style={{ maxWidth: "150px", textAlign: "center" }}>
                        <a
                          href={mom.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            textDecoration: "none",
                            color: "blue",
                          }}
                          className="headline"
                        >
                          {mom.headline}
                        </a>
                      </td>
                      <td
                        style={{
                          maxWidth: "400px",
                          textAlign: "center",
                          fontSize: "14px",
                        }}
                      >
                        {mom.summary}
                      </td>

                      <td style={{ maxWidth: "300px", textAlign: "center" }}>
                        {mom.source}
                      </td>
                      <td
                        style={{
                          maxWidth: "300px",
                          textAlign: "center",
                          backgroundColor:
                            mom.sentiment === "Positive"
                              ? "#d9ead3"
                              : mom.sentiment === "Negative"
                              ? "#f4cccc"
                              : "#fff2cc",
                        }}
                      >
                        {mom.sentiment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* <ReactPaginate
                pageCount={pageCount}
                pageRangeDisplayed={5}
                marginPagesDisplayed={2}
                previousLabel={"previous"}
                nextLabel={"next"}
                breakLabel={"..."}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                subContainerClassName={"pages pagination"}
                activeClassName={"active"}
              /> */}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default MediaScan;
