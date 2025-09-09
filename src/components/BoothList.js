import React, { useState, useEffect, useMemo, useRef } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import "../css/momData.css";
import { Link, useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import DashboardReport from "./DashboardReport";
import ReactToPrint from "react-to-print";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFileCsv } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";

const API_URL = process.env.REACT_APP_API_URL;

const BoothList = () => {
  const [momData, setMomData] = useState([]);
  const [responseAllMomCount, setResponseAllMomCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoneCount, setZoneCount] = useState(0);
  const [pcCount, setPcCount] = useState(0);
  const [acCount, setAcCount] = useState(0);
  const [partyCounts, setPartyCounts] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [role, setRole] = useState("");
  const initialDropdownValue = "";
  const [searchInput, setSearchInput] = useState("");
  const [filteredMomData, setFilteredMomData] = useState([]);

  const [selectedPc, setSelectedPc] = useState(initialDropdownValue);
  const [selectedConstituency, setSelectedConstituency] =
    useState(initialDropdownValue);
  const [selectedZone, setSelectedZone] = useState(initialDropdownValue);
  const navigate = useNavigate();
  const componentRef = useRef();


  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "desc",
  });

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

  const filterMomDataByDateRange = (start, end) => {
    const filteredMomDataByDate = momData.filter(
      (mom) => new Date(mom.dom) >= start && new Date(mom.dom) <= end
    );

    setFilteredMomData(filteredMomDataByDate);
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedMomData = useMemo(() => {
    let sortableMomData = [...momData];
    if (sortConfig.key) {
      sortableMomData.sort((a, b) => {
        if (sortConfig.key === "dom" || sortConfig.key === "createdAt") {
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
        mom.constituency.toLowerCase().includes(input.toLowerCase()) ||
        mom.district.toLowerCase().includes(input.toLowerCase()) ||
        mom.pc.toLowerCase().includes(input.toLowerCase()) ||
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

  const [dropdownData, setDropdownData] = useState({
    pc: [],
    zone: [],
    districts: [],
    ac: [],
  });
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
          `${API_URL}/booth/get-report/${userId}`,
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
  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    setMomData([]);

    if (name === "pc") {
      try {
        const token = await localforage.getItem("token");

        if (value === initialDropdownValue) {
          setFilteredMomData(sortedMomData);
        } else {
          const responseMomByPC = await api.get(
            `${API_URL}/booth/get-report-by-pc/${value}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setMomData(responseMomByPC.data.moms);
          setFilteredMomData(responseMomByPC.data.moms);
        }
      } catch (error) {
        console.error("Error fetching mom data by PC:", error);
      }
    } else if (name === "constituency") {
      try {
        const token = await localforage.getItem("token");

        if (value === initialDropdownValue) {
          setFilteredMomData(sortedMomData);
        } else {
          const responseMomByConstituency = await api.get(
            `${API_URL}/booth/get-report-by-constituency/${value}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setMomData(responseMomByConstituency.data.moms);
          setFilteredMomData(responseMomByConstituency.data.moms);
        }
      } catch (error) {
        console.error("Error fetching booth data by constituency:", error);
      }
    } else if (name === "zone") {
      try {
        const token = await localforage.getItem("token");

        if (value === initialDropdownValue) {
          setFilteredMomData(sortedMomData);
        } else {
          const responseMomByZone = await api.get(
            `${API_URL}/booth/get-report-by-zone/${value}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setMomData(responseMomByZone.data.moms);
          setFilteredMomData(responseMomByZone.data.moms);
        }
      } catch (error) {
        console.error("Error fetching booth data by zone:", error);
      }
    }
  };

  const handleDeleteMom = async (momId) => {
    try {
      const token = await localforage.getItem("token");
      await api.delete(
        `${API_URL}/booth/delete-report/${momId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedMomData = momData.filter((mom) => mom._id !== momId);
      setMomData(updatedMomData);
      setFilteredMomData(updatedMomData);
      window.alert("booth is deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting mom:", error);
    }
  };

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

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  // Define the headers for the CSV export
  const csvHeaders = [
    // { label: "District", key: "district" },
    // { label: "PC", key: "pc" },
    // { label: "Constituency", key: "constituency" },
    { label: "Booth Name", key: "booth" },
    { label: "Address", key: "address" },
    // { label: "Party Name", key: "partyName" },
    // { label: "Date of MOM", key: "dom" },
  ];

  if (loading) {
    return (
      <div className="loading-spinner">
        <BeatLoader size={15} color={"#123abc"} loading={loading} />
      </div>
    );
  }

  return (
    <>
      <DashboardReport
        momData={momData}
        zoneCount={zoneCount}
        pcCount={pcCount}
        acCount={acCount}
        partyCounts={partyCounts}
        responseAllMomCount={responseAllMomCount}
        handleSort={handleSort}
        getClassNamesFor={getClassNamesFor}
      />
      <div className="mom-container">
        {loading ? (
          <div>
            <BeatLoader color="#03b3ff" className="loader" />
          </div>
        ) : momData.length === 0 ? (
          <div>
            <p>No MOM data available.</p>
          </div>
        ) : (
          <>
            <div className="mom-count">
              <div
                className="all-container"
                style={{ display: "flex", flexWrap: "wrap", justifyContent:"center" }}
              >
                <div
                  className="select-columns"
                  style={{ display: "flex", flexWrap: "wrap", justifyContent:"center"  }}
                >
                  <label>
                    Zone
                    <select
                      name="zone"
                      value={selectedZone}
                      onChange={(e) => {
                        setSelectedZone(e.target.value);
                        handleInputChange(e);
                      }}
                      style={{ margin: "5px" }}
                      disabled={!isRoleAllowed}
                    >
                      <option value={initialDropdownValue}>Select Zone</option>
                      {dropdownData.zone
                        .sort((a, b) => {
                          // Extract the numeric part of the constituency by splitting and trimming
                          const numberA = parseInt(a.split("-")[0].trim(), 10);
                          const numberB = parseInt(b.split("-")[0].trim(), 10);

                          // Compare and sort numerically
                          return numberA - numberB;
                        })
                        .map((zone) => (
                          <option key={zone} value={zone}>
                            {zone}
                          </option>
                        ))}
                    </select>
                  </label>
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
                </div>
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
                    pageStyle={`@page { margin: 5mm 10mm; }`}
                    documentTitle="Booth List"
                    removeAfterPrint={true}
                  />
                  <CSVLink
                    data={filteredMomData}
                    headers={csvHeaders}
                    filename={`Booth_List_${selectedConstituency}.csv`}
                  >
                    <FontAwesomeIcon
                      icon={faFileCsv}
                      className="font-pdf"
                      size="2x"
                      style={{ marginLeft: "20px", color:"#325c23" }}
                    />
                  </CSVLink>
                </div>
              </div>
              <div
                className="select-columns"
                style={{
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-evenly",
                  fontSize: "20px",
                }}
              ></div>
            </div>
            <div>
              {selectedConstituency !== initialDropdownValue && (
                <div
                  class="table-container"
                  id="pdf-content"
                  ref={componentRef}
                >
                  <h2 style={{ textAlign: "center" }}>
                    {capitalizeWords(selectedConstituency)}
                  </h2>
                  <table className="mom-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: "center" }}>Sr.No</th>
                        <th
                          onClick={() => requestSort("constituency")}
                          className={getClassNamesFor("constituency")}
                          style={{ textAlign: "center" }}
                        >
                          Booth{" "}
                          {getClassNamesFor("constituency") === "asc" && "↑"}
                          {getClassNamesFor("constituency") === "desc" && "↓"}
                        </th>
                        <th
                          onClick={() => requestSort("leaderName")}
                          className={getClassNamesFor("leaderName")}
                          style={{ textAlign: "center", maxWidth: "400px" }}
                        >
                          Address{" "}
                          {getClassNamesFor("leaderName") === "asc" && "↑"}
                          {getClassNamesFor("leaderName") === "desc" && "↓"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMomData.map((mom, index) => (
                        <tr key={mom.id}>
                          <td style={{ textAlign: "center" }}>{index + 1}</td>
                          <td>{mom.booth}</td>
                          <td style={{ maxWidth: "400px" }}>{mom.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BoothList;
