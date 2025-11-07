import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import "../css/momData.css";
import { Link, useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import Dashboard from "./Dashboard";
import data from "../dataFile.json";
import ReactPaginate from "react-paginate";

const API_URL = process.env.REACT_APP_API_URL;

const ListNewMom = () => {
  const [momData, setMomData] = useState([]);
  const [responseAllMomCount, setResponseAllMomCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partyCounts, setPartyCounts] = useState([]);
  const [zoneCount, setZoneCount] = useState(0);
  const [pcCount, setPcCount] = useState(0);
  const [acCount, setAcCount] = useState(0);
  const [userRole, setUserRole] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
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
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [email, setEmail] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [userDetails, setUserDetails] = useState({});
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  const pageCount = Math.ceil(filteredMomData.length / itemsPerPage);

  const displayedMomData = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMomData.slice(startIndex, endIndex);
  }, [currentPage, filteredMomData]);
  const [yesNoFilter, setYesNoFilter] = useState(""); // New state for Yes/No filter

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  useEffect(() => {
    const uniqueDates = [
      ...new Set(
        momData
          .filter((mom) => mom.dom) // Ensure `mom.dom` is defined
          .map((mom) => mom.dom.split("T")[0]) // Extract date part
      ),
    ];
    setAvailableDates(uniqueDates.sort());
  }, [momData]);

  const handleStartDateChange = (date) => {
    setStartDate(date);
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

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const storedLocation = await localforage.getItem("location");
        if (storedLocation) {
          setLocation(storedLocation);
        } else {
          console.log("Location not found in localforage.");
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchUserLocation();
  }, []);

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

  const handleEndDateChange = (date) => {
    setEndDate(date);

    if (startDate && date && date < startDate) {
      setStartDate(null);
      setEndDate(null);
      alert("Please select a valid end date.");
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
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
  };

  // Load saved filters first
  useEffect(() => {
    const loadFilters = async () => {
      const filters = await localforage.getItem("momFilters");
      const details = await localforage.getItem("userDetails");

      if (filters) {
        setSelectedZone(filters.selectedZone || details?.zone || "");
        setSelectedPc(filters.selectedPc || details?.pc || "");
        setSelectedConstituency(
          filters.selectedConstituency || details?.constituency || ""
        );
        setStartDate(filters.startDate ? new Date(filters.startDate) : null);
        setEndDate(filters.endDate ? new Date(filters.endDate) : null);
        setSearchInput(filters.searchInput || "");
        setYesNoFilter(filters.yesNoFilter || "");
        setCurrentPage(filters.currentPage || 0);
      }

      setUserDetails(details);
      setFiltersLoaded(true);
    };

    loadFilters();
  }, []);

  // Fetch data after filters are loaded
  useEffect(() => {
    if (!filtersLoaded) return;

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

        let momDataResponse;

        // Check if we have active filters and fetch filtered data accordingly
        if (selectedZone && selectedZone !== initialDropdownValue) {
          momDataResponse = await api.get(
            `${API_URL}/new-mom/get-mom-by-zone/${selectedZone}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          momDataResponse.data = momDataResponse.data.moms;
        } else if (selectedPc && selectedPc !== initialDropdownValue) {
          momDataResponse = await api.get(
            `${API_URL}/new-mom/get-mom-by-pc/${selectedPc}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          momDataResponse.data = momDataResponse.data.moms;
        } else if (
          selectedConstituency &&
          selectedConstituency !== initialDropdownValue
        ) {
          momDataResponse = await api.get(
            `${API_URL}/new-mom/get-mom-by-constituency/${selectedConstituency}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          momDataResponse.data = momDataResponse.data.moms;
        } else {
          momDataResponse = await api.get(
            `${API_URL}/new-mom/get-latest-mom/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        const sortedMomData = momDataResponse.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setMomData(sortedMomData);

        // Apply all filters to the data
        let filteredData = [...sortedMomData];

        // Apply date range filter
        if (startDate && endDate) {
          filteredData = filteredData.filter(
            (mom) =>
              new Date(mom.dom) >= startDate && new Date(mom.dom) <= endDate
          );
        }

        // Apply search filter
        if (searchInput && typeof searchInput === "string") {
          filteredData = filteredData.filter((mom) => {
            const userName = mom?.userId?.userName;
            const designation = mom?.designation;

            const lowerSearch = searchInput.toLowerCase();

            return (
              (typeof userName === "string" &&
                userName.toLowerCase().includes(lowerSearch)) ||
              (typeof designation === "string" &&
                designation.toLowerCase().includes(lowerSearch))
            );
          });
        }

        // Apply Yes/No filter
        if (yesNoFilter) {
          filteredData = filteredData.filter(
            (mom) => mom.makeMom === yesNoFilter
          );
        }

        setFilteredMomData(filteredData);

        const momDataForAllParties = partyNames.map((partyName) => {
          const momCount = filteredData.filter(
            (mom) => mom.partyName === partyName
          ).length;
          return {
            partyName,
            momCount,
          };
        });

        setPartyCounts(momDataForAllParties);
        setResponseAllMomCount(filteredData.length);
        setLoading(false);
        const yesCount = filteredData.filter(
          (mom) => mom.makeMom === "Yes"
        ).length;
        const noCount = filteredData.filter(
          (mom) => mom.makeMom === "No"
        ).length;

        setYesCount(yesCount);
        setNoCount(noCount);

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
  }, [filtersLoaded, sortConfig]);

  // Apply filters whenever filter values change
  useEffect(() => {
    if (!momData.length) return;

    let filteredData = [...momData];

    // Apply date range filter
    if (startDate && endDate) {
      filteredData = filteredData.filter(
        (mom) => new Date(mom.dom) >= startDate && new Date(mom.dom) <= endDate
      );
    }

    // Apply search filter
    if (searchInput && typeof searchInput === "string") {
      filteredData = filteredData.filter((mom) => {
        const userName = mom?.userId?.userName;
        const designation = mom?.designation;

        const lowerSearch = searchInput.toLowerCase();

        return (
          (typeof userName === "string" &&
            userName.toLowerCase().includes(lowerSearch)) ||
          (typeof designation === "string" &&
            designation.toLowerCase().includes(lowerSearch))
        );
      });
    }

    // Apply Yes/No filter
    if (yesNoFilter) {
      filteredData = filteredData.filter((mom) => mom.makeMom === yesNoFilter);
    }

    setFilteredMomData(filteredData);
    setResponseAllMomCount(filteredData.length);

    // Set partyNames only for supported states
    let partyNames = null;
    if (location === "Maharashtra") {
      partyNames = [
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
    } else if (location === "Bengal") {
      partyNames = [
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
      ];
    } else if (location === "Uttar Pradesh") {
      partyNames = [
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
      ];
    }

    if (Array.isArray(partyNames)) {
      const momDataForAllParties = partyNames.map((partyName) => {
        const momCount = filteredData.filter(
          (mom) => mom.partyName === partyName
        ).length;
        return {
          partyName,
          momCount,
        };
      });
      setPartyCounts(momDataForAllParties);
    } else {
      // If partyNames is not set, clear counts
      setPartyCounts([]);
    }

    const yesCount = filteredData.filter((mom) => mom.makeMom === "Yes").length;
    setYesCount(yesCount);
  }, [momData, startDate, endDate, searchInput, yesNoFilter, location]);
  // ✅ Include location in dependency array

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
      const userId = await localforage.getItem("ID");

      if (value === initialDropdownValue) {
        const responseMomByAll = await api.get(
          `${API_URL}/new-mom/get-latest-mom/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        updatedMomData = responseMomByAll.data;
      } else {
        if (name === "pc") {
          const responseMomByPC = await api.get(
            `${API_URL}/new-mom/get-mom-by-pc/${value}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          updatedMomData = responseMomByPC.data.moms;
        } else if (name === "constituency") {
          const responseMomByConstituency = await api.get(
            `${API_URL}/new-mom/get-mom-by-constituency/${value}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          updatedMomData = responseMomByConstituency.data.moms;
        } else if (name === "zone") {
          const responseMomByZone = await api.get(
            `${API_URL}/new-mom/get-mom-by-zone/${value}`,
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
      await api.delete(`${API_URL}/new-mom/delete-mom/${momId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedMomData = momData.filter((mom) => mom._id !== momId);
      setMomData(updatedMomData);
      setFilteredMomData(updatedMomData);
      window.alert("Mom is deleted successfully");
      // window.location.reload();
    } catch (error) {
      console.error("Error deleting mom:", error);
    }
  };

  const fetchZoneCount = useCallback(async () => {
    try {
      const token = await localforage.getItem("token");

      if (selectedZone === initialDropdownValue) {
        // Set count to 0 or handle accordingly
        setZoneCount(0);
      } else {
        const responseZoneCount = await api.get(
          `${API_URL}/new-mom/get-mom-count-by-zone/${selectedZone}`,
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
  }, [selectedZone, initialDropdownValue]);

  useEffect(() => {
    fetchZoneCount();
  }, [fetchZoneCount]);

  const fetchPcCount = useCallback(async () => {
    try {
      const token = await localforage.getItem("token");

      if (selectedPc === initialDropdownValue) {
        // Set count to 0 or handle accordingly
        setPcCount(0);
      } else {
        const responsePcCount = await api.get(
          `${API_URL}/new-mom/get-mom-count-by-pc/${selectedPc}`,
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
  }, [selectedPc, initialDropdownValue]);

  useEffect(() => {
    fetchPcCount();
  }, [fetchPcCount]);

  const fetchAcCount = useCallback(async () => {
    try {
      const token = await localforage.getItem("token");

      if (selectedConstituency === initialDropdownValue) {
        // Set count to 0 or handle accordingly
        setAcCount(0);
      } else {
        const responseAcCount = await api.get(
          `${API_URL}/new-mom/get-mom-count-by-constituency/${selectedConstituency}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAcCount(responseAcCount.data.momCount);
      }
    } catch (error) {
      console.error("Error fetching zone count:", error);
    }
  }, [selectedConstituency, initialDropdownValue]);

  useEffect(() => {
    fetchAcCount();
  }, [fetchAcCount]);

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
    "Zone 1",
    "Zone 2",
    "Zone 3",
    "Zone 4",
    "Zone 5",
  ];

  const isRoleAllowed = allowedRoles.includes(role);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (filtersLoaded) {
      localforage.setItem("momFilters", {
        selectedZone,
        selectedPc,
        selectedConstituency,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        searchInput,
        currentPage,
        yesNoFilter,
      });
    }
  }, [
    selectedZone,
    selectedPc,
    selectedConstituency,
    startDate,
    endDate,
    searchInput,
    currentPage,
    yesNoFilter,
    filtersLoaded,
  ]);

  const clearFilters = async () => {
    await localforage.removeItem("momFilters");
    window.location.reload();
  };

  const handleMeetingStatusUpdate = async (momId, newStatus) => {
    try {
      const token = await localforage.getItem("token");

      // Update the status in the database
      const response = await api.put(
        `${API_URL}/new-mom/update-mom/${momId}`,
        { meetingStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state to reflect the change immediately
      const updatedMomData = momData.map((mom) =>
        mom._id === momId ? { ...mom, meetingStatus: newStatus } : mom
      );

      const updatedFilteredData = filteredMomData.map((mom) =>
        mom._id === momId ? { ...mom, meetingStatus: newStatus } : mom
      );

      setMomData(updatedMomData);
      setFilteredMomData(updatedFilteredData);

      console.log("Meeting status updated successfully");
    } catch (error) {
      console.error("Error updating meeting status:", error);
      alert("Failed to update meeting status. Please try again.");
    }
  };

  return (
    <>
      <Dashboard />
      <div className="mom-container">
        {loading ? (
          <div className="loader">
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
                      handleZoneChange(e);
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
                    {dropdownData.pc
                      .sort((a, b) => {
                        // Extract the numeric part of the constituency by splitting and trimming
                        const numberA = parseInt(a.split("-")[0].trim(), 10);
                        const numberB = parseInt(b.split("-")[0].trim(), 10);

                        // Compare and sort numerically
                        return numberA - numberB;
                      })
                      .map((parliament) => (
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
                  Search (ACM Name or Designation)
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    style={{ margin: "5px" }}
                  />
                </label>
              </div>
              <div className="select-columns">
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
                <label>
                  MoM Submitted:
                  <select
                    value={yesNoFilter}
                    onChange={(e) => setYesNoFilter(e.target.value)}
                    style={{ margin: "5px" }}
                  >
                    <option value="">All</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <div className="total-count" style={{ margin: "5px" }}>
                  <h3>Total Meeting Count: </h3>
                  <h6>{responseAllMomCount}</h6>
                </div>
              </div>
              <div className="select-columns">
                <div className="total-count" style={{ margin: "5px" }}>
                  <h3>Zone-wise MOM Count: </h3>
                  <h6>{zoneCount}</h6>
                </div>
                <div className="total-count" style={{ margin: "5px" }}>
                  <h3>Pc-wise MOM Count: </h3>
                  <h6>{pcCount}</h6>
                </div>
                <div className="total-count" style={{ margin: "5px" }}>
                  <h3>Ac-wise MOM Count: </h3>
                  <h6>{acCount}</h6>
                </div>
                <div className="total-count" style={{ margin: "5px" }}>
                  <h3>Total MoM Count: </h3>
                  <h6>{yesCount}</h6>
                </div>
                <button style={{ marginTop: "10px" }} onClick={clearFilters}>
                  Clear filter
                </button>
              </div>
              {partyCounts.length > 0 && (
                <>
                  <h2 className="party-header">Meeting count by party</h2>
                  <div className="party-count">
                    {partyCounts.map((partyData) => (
                      <div key={partyData.partyName} className="party-counts">
                        <h4>{partyData.partyName}:</h4>
                        <h6>{partyData.momCount}</h6>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div class="intervention-table">
              <table className="travel-admin-table">
                <thead>
                  <tr>
                    <th>Created By</th>
                    <th>Recorded Date and Time</th>

                    <th
                      onClick={() => requestSort("constituency")}
                      className={getClassNamesFor("constituency")}
                    >
                      Assembly Constituency{" "}
                      {getClassNamesFor("constituency") === "asc" && "↑"}
                      {getClassNamesFor("constituency") === "desc" && "↓"}
                    </th>
                    <th>
                      {location === "Andhra Pradesh"
                        ? "Respondent Name"
                        : "Leader Name"}
                    </th>
                    <th>Photo</th>
                    <th
                      onClick={() => requestSort("designation")}
                      className={getClassNamesFor("designation")}
                    >
                      Designation{" "}
                      {getClassNamesFor("designation") === "asc" && "↑"}
                      {getClassNamesFor("designation") === "desc" && "↓"}
                    </th>

                    <th>Party Name</th>
                    <th
                      onClick={() => requestSort("dom")}
                      className={getClassNamesFor("dom")}
                      style={{ textAlign: "center" }}
                    >
                      Date of Meeting {getClassNamesFor("dom") === "asc" && "↑"}
                      {getClassNamesFor("dom") === "desc" && "↓"}
                    </th>
                    <th style={{ textAlign: "center" }}>Meeting Location</th>
                    <th style={{ textAlign: "center" }}>MoM Available?</th>
                    <th style={{ textAlign: "center" }}>MoM Review Status</th>
                    <th style={{ textAlign: "center" }}>Minutes of Meeting</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedMomData.map((mom) => (
                    <tr key={mom.id}>
                      <td>{mom?.userId?.userName || "NA"}</td>
                      <td>
                        {new Date(mom.createdAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>

                      <td>{mom.constituency}</td>
                      <td>{mom.leaderName}</td>
                      <td>
                        {mom.leaderPhoto && (
                          <img
                            src={mom.leaderPhoto}
                            alt={`Photo of ${mom.partyName}`}
                            className="datatable-photo"
                          />
                        )}
                      </td>
                      <td>{mom.designation}</td>
                      <td>{mom.partyName}</td>

                      <td className="td-extra">
                        {new Date(mom.dom).toLocaleDateString("en-GB")}
                      </td>
                      <td>
                        <a
                          href={`https://www.google.com/maps?q=${mom.gMapLocation}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Google Maps
                        </a>
                      </td>
                      <td>{mom.makeMom}</td>
                      <td>
                        <select
                          value={mom.meetingStatus || "Not reviewed"}
                          onChange={(e) =>
                            handleMeetingStatusUpdate(mom._id, e.target.value)
                          }
                          style={{
                            padding: "5px",
                            borderRadius: "4px",
                            width: "105px",
                            border: "1px solid #ccc",
                            backgroundColor:
                              mom.meetingStatus === "Zonal reviewed"
                                ? "#e8f5e8"
                                : mom.meetingStatus === "State lead reviewed"
                                ? "#e8f0ff"
                                : "#fff3cd",
                          }}
                        >
                          <option value="Not reviewed">Not reviewed</option>
                          <option value="Zonal reviewed">Zonal reviewed</option>
                          <option value="State lead reviewed">
                            State lead reviewed
                          </option>
                        </select>
                      </td>
                      <td className="td-extra">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column-reverse",
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={() => handleDeleteMom(mom._id)}
                            style={{
                              width: "fit-content",
                              backgroundColor: "red",
                            }}
                          >
                            Delete
                          </button>
                          <Link
                            to={`/update-new-mom/${mom._id}`}
                            style={{
                              textDecoration: "none",
                              padding: "5px 0px",
                              color: "#008cff",
                            }}
                          >
                            Update
                          </Link>
                          <Link
                            to={`/view-new-mom/${mom._id}`}
                            style={{
                              textDecoration: "none",
                              padding: "5px 0px",
                              color: "#008cff",
                            }}
                          >
                            View
                          </Link>
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

export default ListNewMom;
