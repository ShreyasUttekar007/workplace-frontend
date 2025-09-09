import React, { useState, useEffect, useMemo } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import "../css/momData.css";
import { Link, useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import Dashboard from "./Dashboard";
import data from "../dataFile.json";
import ReactPaginate from "react-paginate";
import DashboardReport from "./DashboardReport";

const API_URL = process.env.REACT_APP_API_URL;

const CandidateList = () => {
  const [momData, setMomData] = useState([]);
  const [responseAllMomCount, setResponseAllMomCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoneCount, setZoneCount] = useState(0);
  const [pcCount, setPcCount] = useState(0);
  const [acCount, setAcCount] = useState(0);
  const [partyCounts, setPartyCounts] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [form20DocumentCount, setForm20DocumentCount] = useState("");
  const [documentCount, setDocumentCount] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const initialDropdownValue = "";
  const [searchInput, setSearchInput] = useState("");
  const [filteredMomData, setFilteredMomData] = useState([]);

  const [selectedPc, setSelectedPc] = useState(initialDropdownValue);
  const [selectedConstituency, setSelectedConstituency] =
    useState(initialDropdownValue);
  const [selectedZone, setSelectedZone] = useState(initialDropdownValue);
  const navigate = useNavigate();

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "desc",
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  const [filteredDocumentCount, setFilteredDocumentCount] = useState(0);
  const [filteredForm20DocumentCount, setFilteredForm20DocumentCount] =
    useState(0);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;


  const pageCount = Math.ceil(filteredMomData.length / itemsPerPage);

  const displayedMomData = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMomData.slice(startIndex, endIndex);
  }, [currentPage, filteredMomData]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

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
          `${API_URL}/candidate/get-mom/${userId}`,
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

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const storedEmail = await localforage.getItem("email");
        if (storedEmail) {
          setEmail(storedEmail);
        } else {
          console.log("Email not found in localforage.");
        }
      } catch (error) {
        console.error("Error fetching email:", error);
      }
    };
    fetchUserEmail();
  }, []);

  const fetchZoneCount = async () => {
    try {
      const token = await localforage.getItem("token");

      if (selectedZone === initialDropdownValue) {
        // Set count to 0 or handle accordingly
        console.log("Selected zone is not valid");
        setZoneCount(0);
      } else {
        const responseZoneCount = await api.get(
          `${API_URL}/moms/get-mom-count-by-zone/${selectedZone}`,
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
          `${API_URL}/moms/get-mom-count-by-pc/${selectedPc}`,
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

  const fetchAcCount = async () => {
    try {
      const token = await localforage.getItem("token");

      if (selectedConstituency === initialDropdownValue) {
        // Set count to 0 or handle accordingly
        console.log("Selected ac is not valid");
        setAcCount(0);
      } else {
        const responseAcCount = await api.get(
          `${API_URL}/moms/get-mom-count-by-constituency/${selectedConstituency}`,
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

  useEffect(() => {
    fetchZoneCount();
    fetchPcCount();
    fetchAcCount();
  }, [selectedZone, selectedPc, selectedConstituency]);

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
            `${API_URL}/candidate/get-mom-by-pc/${value}`,
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
            `${API_URL}/candidate/get-mom-by-constituency/${value}`,
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
        console.error("Error fetching candidate data by constituency:", error);
      }
    } else if (name === "zone") {
      try {
        const token = await localforage.getItem("token");

        if (value === initialDropdownValue) {
          setFilteredMomData(sortedMomData);
        } else {
          const responseMomByZone = await api.get(
            `${API_URL}/candidate/get-mom-by-zone/${value}`,
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
        console.error("Error fetching candidate data by zone:", error);
      }
    }
  };

  const handleDeleteMom = async (momId) => {
    try {
      const token = await localforage.getItem("token");
      await api.delete(
        `${API_URL}/candidate/delete-mom/${momId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedMomData = momData.filter((mom) => mom._id !== momId);
      setMomData(updatedMomData);
      setFilteredMomData(updatedMomData);
      window.alert("candidate is deleted successfully");
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

  useEffect(() => {
    const fetchDocumentCount = async () => {
      try {
        const token = await localforage.getItem("token");

        const response = await api.get(
          `${API_URL}/candidate/count-documents`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDocumentCount(response.data.count);
        console.log("response::: ", response);
      } catch (error) {
        console.error("Error fetching document count:", error);
      }
    };

    const fetchForm20DocumentCount = async () => {
      try {
        const token = await localforage.getItem("token");

        const response = await api.get(
        `${API_URL}/candidate/count-form20-documents`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setForm20DocumentCount(response.data.count);
      } catch (error) {
        console.error("Error fetching form20Document count:", error);
      }
    };

    fetchDocumentCount();
    fetchForm20DocumentCount();
  }, []);

  useEffect(() => {
    // Update filtered document counts whenever filteredMomData changes
    const updateFilteredCounts = () => {
      const filteredDocsCount = filteredMomData.reduce((acc, mom) => {
        if (mom.candidateNameEnglish) acc++;
        return acc;
      }, 0);
      const filteredForm20Count = filteredMomData.reduce((acc, mom) => {
        if (mom.form20Document) acc++;
        return acc;
      }, 0);

      setFilteredDocumentCount(filteredDocsCount);
      setFilteredForm20DocumentCount(filteredForm20Count);
    };

    updateFilteredCounts();
  }, [filteredMomData]);

  return (
    <>
      <DashboardReport />
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
                className="select-columns"
                style={{
                  gridTemplateColumns: "1fr 1fr",
                }}
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
                    {dropdownData.pc
                      .sort((a, b) => {
                        // Extract the constituency names from "number-name" format
                        const nameA = a.split("-")[1].trim();
                        const nameB = b.split("-")[1].trim();
                        // Compare and sort alphabetically
                        return nameA.localeCompare(nameB);
                      })
                      .map((parliament) => (
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

                {/* <label>
                  Search
                  <input
                    type="text"
                    placeholder="Search by Leader's Name"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    style={{ margin: "5px" }}
                  />
                </label> */}
              </div>
              <div
                className="select-columns"
                style={{
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-evenly",
                  fontSize: "20px",
                }}
              >
                <div className="total-count" style={{ margin: "5px" }}>
                  <h3>Total Candidates: </h3>
                  <h6>{responseAllMomCount}</h6>
                  <h3> Zone/AC-wise Candidates: </h3>
                  <h6>{filteredDocumentCount}</h6> {/* Updated line */}
                  {/* <h3>Total Form-20: </h3>
                  <h6>{filteredForm20DocumentCount}</h6> Updated line */}
                </div>
              </div>
            </div>
            <div class="table-container">
              <table className="mom-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>Sr No.</th>
                    <th
                      onClick={() => requestSort("dom")}
                      className={getClassNamesFor("dom")}
                      style={{ textAlign: "left" }}
                    >
                      Assembly Constituency{" "}
                      {getClassNamesFor("dom") === "asc" && "↑"}
                      {getClassNamesFor("dom") === "desc" && "↓"}
                    </th>
                    <th
                      onClick={() => requestSort("dom")}
                      className={getClassNamesFor("dom")}
                      style={{ textAlign: "left" }}
                    >
                      Candidate Name (English){" "}
                      {getClassNamesFor("dom") === "asc" && "↑"}
                      {getClassNamesFor("dom") === "desc" && "↓"}
                    </th>
                    {/* <th style={{ textAlign: "center" }}>
                      Candidate Name (Marathi)
                    </th>
                    <th style={{ textAlign: "center" }}>Caste</th>
                    <th style={{ textAlign: "center" }}>Age</th>
                    <th style={{ textAlign: "center" }}>Gender</th> */}
                    <th style={{ textAlign: "center" }}>
                      Candidate Party Name
                    </th>
                    {/* <th style={{ textAlign: "center" }}>Alliance</th> */}
                  </tr>
                </thead>
                <tbody>
                  {displayedMomData.map((mom, index) => (
                    <tr key={mom.id}>
                      <td style={{ maxWidth: "200px" }}>{index + 1}</td>
                      <td style={{ maxWidth: "200px" }}>{mom.constituency}</td>
                      <td style={{ maxWidth: "200px" }}>
                        {mom.candidateNameEnglish}
                      </td>
                      {/* <td className="td-extra" style={{ maxWidth: "200px" }}>
                        {mom.candidateNameMarathi}
                      </td>
                      <td className="td-extra" style={{ maxWidth: "200px" }}>
                        {mom.casteEnglish}
                      </td>
                      <td className="td-extra" style={{ maxWidth: "200px" }}>
                        {mom.ageEnglish}
                      </td>
                      <td className="td-extra" style={{ maxWidth: "200px" }}>
                        {mom.genderEnglish}
                      </td> */}
                      <td className="td-extra" style={{ maxWidth: "200px" }}>
                        {mom.candidatePartyFullName}
                      </td>
                      {/* <td className="td-extra" style={{ maxWidth: "200px" }}>
                        {mom.alliance}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>

              <ReactPaginate
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
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CandidateList;
