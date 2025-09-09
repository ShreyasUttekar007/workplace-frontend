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

const Form17Dashboard = () => {
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

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "desc",
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);


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
          `${API_URL}/form17/get-report/${userId}`,
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
            `${API_URL}/form17/get-report-by-pc/${value}`,
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
            `${API_URL}/form17/get-report-by-constituency/${value}`,
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
        console.error("Error fetching form17 data by constituency:", error);
      }
    } else if (name === "zone") {
      try {
        const token = await localforage.getItem("token");

        if (value === initialDropdownValue) {
          setFilteredMomData(sortedMomData);
        } else {
          const responseMomByZone = await api.get(
            `${API_URL}/form17/get-report-by-zone/${value}`,
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
        console.error("Error fetching form17 data by zone:", error);
      }
    }
  };

  const handleDeleteMom = async (momId) => {
    try {
      const token = await localforage.getItem("token");
      await api.delete(
        `${API_URL}/form17/delete-report/${momId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedMomData = momData.filter((mom) => mom._id !== momId);
      setMomData(updatedMomData);
      setFilteredMomData(updatedMomData);
      window.alert("form17 is deleted successfully");
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
              <div className="select-columns">
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
                    {dropdownData.zone.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
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
                    disabled={!isRoleAllowed}
                  >
                    <option value={initialDropdownValue}>Select AC</option>
                    {dropdownData.ac.map((assembly) => (
                      <option key={assembly} value={assembly}>
                        {assembly}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Search
                  <input
                    type="text"
                    placeholder="Search by Leader's Name"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    style={{ margin: "5px" }}
                  />
                </label>
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
                  <h3>Total AC Count: </h3>
                  <h6>{responseAllMomCount}</h6>
                </div>
              </div>
            </div>
            <div class="table-container">
              <table className="mom-table">
                <thead>
                  <tr>
                    {/* <th>Creators Name</th> */}

                    <th
                      onClick={() => requestSort("constituency")}
                      className={getClassNamesFor("constituency")}
                    >
                      District{" "}
                      {getClassNamesFor("constituency") === "asc" && "↑"}
                      {getClassNamesFor("constituency") === "desc" && "↓"}
                    </th>
                    <th
                      onClick={() => requestSort("leaderName")}
                      className={getClassNamesFor("leaderName")}
                    >
                      Parliamentary Constituency{" "}
                      {getClassNamesFor("leaderName") === "asc" && "↑"}
                      {getClassNamesFor("leaderName") === "desc" && "↓"}
                    </th>

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
                      Created Date {getClassNamesFor("dom") === "asc" && "↑"}
                      {getClassNamesFor("dom") === "desc" && "↓"}
                    </th>
                    <th
                      onClick={() => requestSort("dom")}
                      className={getClassNamesFor("dom")}
                      style={{ textAlign: "left" }}
                    >
                      Updated Date {getClassNamesFor("dom") === "asc" && "↑"}
                      {getClassNamesFor("dom") === "desc" && "↓"}
                    </th>
                    <th style={{ textAlign: "center" }}>Form 17</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedMomData.map((mom) => (
                    <tr key={mom.id}>
                      {/* <td>{mom.userId.userName}</td> */}
                      <td>{mom.district}</td>
                      <td>{mom.pc}</td>
                      <td>{mom.constituency}</td>
                      <td>{formatIndianDate(mom.createdAt)}</td>
                      <td>{formatIndianDate(mom.updatedAt)}</td>
                      <td className="td-extra">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column-reverse",
                            alignItems: "center",
                          }}
                        >
                          {role !== "mod" ? null : (
                            <button
                              onClick={() => handleDeleteMom(mom._id)}
                              style={{
                                width: "fit-content",
                                backgroundColor: "red",
                              }}
                            >
                              Delete
                            </button>
                          )}
                          {mom.formDocument && (
                            <a
                              href={mom.formDocument}
                              download={`Document_of_${mom.leaderName}.pdf`}
                              className="download-link"
                              target="_blank"
                              style={{ color: "#008cff" }}
                            >
                              View
                            </a>
                          )}
                          {/* <Link
                            to={`/update-report/${mom._id}`}
                            style={{
                              textDecoration: "none",
                              padding: "5px 0px",
                              color: "#008cff",
                            }}
                          >
                            Update
                          </Link> */}
                        </div>
                      </td>
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

export default Form17Dashboard;
