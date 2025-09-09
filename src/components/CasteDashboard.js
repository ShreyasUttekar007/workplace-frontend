import React, { useState, useEffect, useMemo, useRef } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import "../css/momData.css";
import { BeatLoader } from "react-spinners";
import data from "../dataFile.json";
import DashboardReport from "./DashboardReport";
import ReactToPrint from "react-to-print";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const CasteDashboard = () => {
  const [momData, setMomData] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialDropdownValue = "";
  const [filteredMomData, setFilteredMomData] = useState([]);
  const componentRef = useRef();
  const [selectedConstituency, setSelectedConstituency] =
    useState(initialDropdownValue);
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedPc, setSelectedPc] = useState("");
  const [expandedRows, setExpandedRows] = React.useState({});


  const toggleShowMore = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "desc",
  });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await localforage.getItem("token");
        const userId = await localforage.getItem("ID");

        const momDataResponse = await api.get(
          `${API_URL}/caste/get-report/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const sortedMomData = momDataResponse.data.sort((a, b) => {
          return parseFloat(b.percentage) - parseFloat(a.percentage);
        });

        setMomData(sortedMomData);
        setFilteredMomData(sortedMomData);
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

        // Fetch data for the initial selected constituency
        const responseMomByConstituency = await api.get(
          `${API_URL}/caste/get-report-by-constituency/104-Sillod`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const sortedConstituencyData = responseMomByConstituency.data.moms.sort(
          (a, b) => {
            return parseFloat(b.percentage) - parseFloat(a.percentage);
          }
        );

        setMomData(sortedConstituencyData);
        setFilteredMomData(sortedConstituencyData);
      } catch (error) {
        console.error("Error fetching mom data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSort = (key) => {
    requestSort(key);
    const sortedMomData = [...momData].sort((a, b) => {
      if (key === "percentage") {
        return sortConfig.direction === "asc"
          ? parseFloat(a[key]) - parseFloat(b[key])
          : parseFloat(b[key]) - parseFloat(a[key]);
      }
      const valA = a[key].toUpperCase();
      const valB = b[key].toUpperCase();

      if (sortConfig.direction === "asc") {
        return valA.localeCompare(valB);
      } else {
        return valB.localeCompare(valA);
      }
    });
    setMomData(sortedMomData);
    setFilteredMomData(sortedMomData);
  };

  const sortedMomData = useMemo(() => {
    let sortableMomData = [...momData];
    if (sortConfig.key) {
      sortableMomData.sort((a, b) => {
        if (sortConfig.key === "percentage") {
          return sortConfig.direction === "asc"
            ? parseFloat(a[sortConfig.key]) - parseFloat(b[sortConfig.key])
            : parseFloat(b[sortConfig.key]) - parseFloat(a[sortConfig.key]);
        } else {
          const valA = a[sortConfig.key].toUpperCase();
          const valB = b[sortConfig.key].toUpperCase();

          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
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
    ].sort((a, b) => {
      const numA = parseInt(a.match(/^\d+/)[0], 10);
      const numB = parseInt(b.match(/^\d+/)[0], 10);
      return numA - numB;
    });

    setDropdownData({
      zone: uniqueZone,
      districts: uniqueDistricts,
      pc: uniquePc,
      ac: uniqueAc,
    });
  }, []);

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
            `${API_URL}/caste/get-report-by-pc/${value}`,
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
            `${API_URL}/caste/get-report-by-constituency/${value}`,
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
        console.error("Error fetching caste data by constituency:", error);
      }
    } else if (name === "zone") {
      try {
        const token = await localforage.getItem("token");

        if (value === initialDropdownValue) {
          setFilteredMomData(sortedMomData);
        } else {
          const responseMomByZone = await api.get(
            `${API_URL}/caste/get-report-by-zone/${value}`,
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
        console.error("Error fetching caste data by zone:", error);
      }
    }
  };

  const groupDataByCategory = useMemo(() => {
    const groupedData = {};
    let overallTotalPercentage = 0; // Initialize overall total percentage

    filteredMomData.forEach((mom) => {
      const { category, caste, percentage } = mom;

      if (!groupedData[category]) {
        groupedData[category] = {
          category,
          castes: new Set(),
          totalPercentage: 0,
        };
      }

      // Add caste to the set (to avoid duplicates)
      groupedData[category].castes.add(caste);

      // Add the percentage (if it's a valid number)
      const validPercentage = parseFloat(percentage) || 0;
      groupedData[category].totalPercentage += validPercentage;

      // Add to the overall total percentage
      overallTotalPercentage += validPercentage;
    });

    // Convert sets to arrays of caste and sort by category
    const groupedArray = Object.values(groupedData).map((group) => ({
      category: group.category,
      castes: Array.from(group.castes).join(", "), // Join castes as comma-separated string
      totalPercentage: group.totalPercentage.toFixed(2),
    }));

    return {
      groupedArray,
      overallTotalPercentage: overallTotalPercentage.toFixed(2),
    };
  }, [filteredMomData]);

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

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
                className="all-container"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <div
                  className="select-columns"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
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
                    >
                      <option value={initialDropdownValue}>Select Zone</option>
                      {dropdownData.zone.map((zon) => {
                        // Extract only the name part and capitalize it
                        const name = zon.split("-")[1]?.trim();
                        const formattedName = name
                          ? name.charAt(0).toUpperCase() + name.slice(1)
                          : zon;

                        return (
                          <option key={zon} value={zon}>
                            {formattedName}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <label>
                    Parliamentary Constituency
                    <select
                      name="pc"
                      value={selectedPc}
                      onChange={(e) => {
                        setSelectedPc(e.target.value);
                        handleInputChange(e);
                      }}
                      style={{ margin: "5px" }}
                    >
                      <option value={initialDropdownValue}>Select PC</option>
                      {dropdownData.pc
                        .sort((a, b) => {
                          // Extract the names from the assembly strings (after the hyphen)
                          const nameA = a.split("-")[1].trim().toLowerCase();
                          const nameB = b.split("-")[1].trim().toLowerCase();

                          // Perform alphabetical sorting on names
                          return nameA.localeCompare(nameB);
                        })
                        .map((pcs) => {
                          // Split the assembly string into two parts
                          const [number, name] = pcs.split("-");
                          // Capitalize the first letter of the name
                          const capitalizedAssembly = `${number}-${
                            name.charAt(0).toUpperCase() + name.slice(1)
                          }`;
                          return (
                            <option key={pcs} value={pcs}>
                              {capitalizedAssembly}
                            </option>
                          );
                        })}
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
                    pageStyle={`@page { margin: 5mm 50mm; }`}
                    documentTitle={`Caste-Data ${selectedConstituency}`}
                    removeAfterPrint={true}
                  />
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
            <div
              class="table-container"
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "white",
              }}
              id="pdf-content"
              ref={componentRef}
            >
              <h2 style={{ textAlign: "center" }}>
                {capitalizeWords(
                  selectedConstituency || selectedPc || selectedZone
                )}
              </h2>
              <table className="mom-table" style={{ width: "500px" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Category</th>
                    <th style={{ textAlign: "left" }}>Caste</th>
                    <th style={{ textAlign: "left" }}>Total Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {groupDataByCategory.groupedArray.map((group, index) => {
                    console.log("group.castes:", group.castes); // Debugging

                    // Ensure castes is an array. If it's a string, split it into an array.
                    let castesArray = [];
                    if (Array.isArray(group.castes)) {
                      castesArray = group.castes;
                    } else if (typeof group.castes === "string") {
                      castesArray = group.castes
                        .split(",")
                        .map((caste) => caste.trim());
                    }

                    const showAll = expandedRows[index] || false;
                    const displayedCastes = showAll
                      ? castesArray
                      : castesArray.slice(0, 4);

                    return (
                      <tr key={index}>
                        <td>{group.category}</td>
                        <td>
                          {displayedCastes.length > 0
                            ? displayedCastes.join(", ")
                            : "N/A"}
                          {castesArray.length > 4 && (
                            <p
                              onClick={() => toggleShowMore(index)}
                              style={{
                                marginLeft: "5px",
                                color: "blue",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              {showAll ? "Show Less" : "Show More"}
                            </p>
                          )}
                        </td>
                        <td>{group.totalPercentage}%</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan="2" style={{ fontWeight: "600" }}>
                      Total
                    </td>
                    <td style={{ fontWeight: "600" }}>
                      {groupDataByCategory.overallTotalPercentage}%
                    </td>
                  </tr>
                </tbody>
              </table>
              <table className="mom-table" style={{ width: "500px" }}>
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("category")}
                      className={getClassNamesFor("category")}
                      style={{ textAlign: "left" }}
                    >
                      Category {getClassNamesFor("category") === "asc" && "↑"}
                      {getClassNamesFor("category") === "desc" && "↓"}
                    </th>
                    <th
                      onClick={() => handleSort("caste")}
                      className={getClassNamesFor("caste")}
                      style={{ textAlign: "left" }}
                    >
                      Caste {getClassNamesFor("caste") === "asc" && "↑"}
                      {getClassNamesFor("caste") === "desc" && "↓"}
                    </th>
                    <th
                      onClick={() => handleSort("percentage")}
                      className={getClassNamesFor("percentage")}
                      style={{ textAlign: "left" }}
                    >
                      Percentage{" "}
                      {getClassNamesFor("percentage") === "asc" && "↑"}
                      {getClassNamesFor("percentage") === "desc" && "↓"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMomData.map((mom) => (
                    <tr key={mom.id}>
                      <td>{mom.category}</td>
                      <td>{mom.caste}</td>
                      <td>{mom.percentage != null ? mom.percentage : 0}%</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="2" style={{ fontWeight: "600" }}>
                      Total
                    </td>
                    <td style={{ fontWeight: "600" }}>
                      {filteredMomData
                        .reduce(
                          (acc, mom) => acc + (parseFloat(mom.percentage) || 0),
                          0
                        )
                        .toFixed(2)}
                      %
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CasteDashboard;
