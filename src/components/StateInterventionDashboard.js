import React, { useState, useEffect, useRef } from "react";
import api from "../utils/axiosConfig";
import Select from "react-select";
import localforage from "localforage";
import "../css/bmcInterventionDashboard.css";
import Dashboard from "./Dashboard";
import { CSVLink } from "react-csv";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFileCsv,
  faFilePdf,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import ReactPaginate from "react-paginate";
import ReactToPrint from "react-to-print";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const StateInterventionDashboard = () => {
  const [roles, setRoles] = useState([]);
  const [zones, setZones] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [interventionTypes, setInterventionTypes] = useState([]);
  const [selectedInterventionType, setSelectedInterventionType] =
    useState(null);
  const [interventionActions, setInterventionActions] = useState([]);
  const [selectedInterventionAction, setSelectedInterventionAction] =
    useState(null);
  const [interventionCounts, setInterventionCounts] = useState({});
  const [interventionData, setInterventionData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 100; // Items per page
  const componentRef = useRef();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");


  const headers = [
    "Name",
    "Zone",
    "District",
    "AC",
    "Type",
    "Issues",
    "Issue Brief",
    "Department",
    "Suggested Actionable",
    "Facilitator",
    "Leader",
    "Category",
    "Date",
    "Action",
  ];

  const [columnWidths, setColumnWidths] = useState(
    Array(headers.length).fill(150)
  );

  const startResize = (event, index) => {
    event.preventDefault(); // Prevents selection issues
    const startX = event.clientX;
    const startWidth = columnWidths[index];

    const handleMouseMove = (e) => {
      e.preventDefault();
      const newWidth = Math.max(50, startWidth + (e.clientX - startX));
      setColumnWidths((prevWidths) => {
        const updatedWidths = [...prevWidths];
        updatedWidths[index] = newWidth;
        console.log("Updated Widths:", updatedWidths); // Debugging
        return updatedWidths;
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesFromLocalForage = (await localforage.getItem("role")) || [];
        setRoles(rolesFromLocalForage);
      } catch (error) {
        console.error("Error fetching roles from localForage:", error);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchInterventionData = async () => {
      try {
        // Get user ID from localforage
        const userId = await localforage.getItem("ID");
        if (!userId) {
          console.error("User ID not found in localforage.");
          return;
        }
        const token = await localforage.getItem("token");

        const response = await api.get(
          `${API_URL}/state/get-intervention-data/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch Zones, Constituencies, and Districts data
        const fetchedZones = response.data
          .map((data) => data.zone)
          .filter(Boolean); // Extract Zones
        const fetchedConstituencies = response.data
          .map((data) => data.constituency)
          .filter(Boolean); // Extract Constituencies
        const fetchedDistricts = response.data
          .map((data) => data.district)
          .filter(Boolean); // Extract Districts

        // Remove duplicates by converting them to a Set and then back to an array
        const uniqueZones = [...new Set(fetchedZones)];
        const uniqueConstituencies = [...new Set(fetchedConstituencies)];
        const uniqueDistricts = [...new Set(fetchedDistricts)];

        // Set Zones, Constituencies, and Districts state
        setZones(uniqueZones.map((zone) => ({ value: zone, label: zone })));
        setConstituencies(
          uniqueConstituencies.map((constituency) => ({
            value: constituency,
            label: constituency,
          }))
        );
        setDistricts(
          uniqueDistricts.map((district) => ({
            value: district,
            label: district,
          }))
        );

        setInterventionData(response.data);
      } catch (error) {
        console.error("Error fetching intervention data:", error);
        setErrorMessage(error);
      }
    };

    if (roles.length > 0) fetchInterventionData();
  }, [
    selectedConstituency,
    selectedZone,
    selectedInterventionType,
    selectedInterventionAction,
    selectedDistrict,
    roles,
    API_URL,
  ]);

  useEffect(() => {
    const fetchInterventionTypesAndActions = async () => {
      try {
        const types = [
          "Political",
          "Party / Organizational",
          "Government / Administrative",
          "Alliance",
          "SHS Leader Activation",
          "SHS Dispute Resolution",
        ];
        const actions = ["Solved", "Not Solved", "Action Taken", "Reviewed"];
        setInterventionTypes(types);
        setInterventionActions(actions);
      } catch (error) {
        console.error("Error fetching intervention types and actions:", error);
      }
    };

    fetchInterventionTypesAndActions();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const token = await localforage.getItem("token");
      try {
        // Construct the API endpoint with the filters applied
        const params = {
          zone: selectedZone, // Filter by Zone
          constituency: selectedConstituency, // Filter by Constituency
          district: selectedDistrict, // Filter by District
          interventionType: selectedInterventionType, // Filter by Intervention Type
          interventionAction: selectedInterventionAction, // Filter by Intervention Action
          fromDate: fromDate ? new Date(fromDate).toISOString() : null, // Filter by From Date
          toDate: toDate ? new Date(toDate).toISOString() : null, // Filter by To Date
        };

        const response = await api.get(
          `${API_URL}/state/interventions/counts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: params, // Pass the filters as query parameters
          }
        );

        setInterventionCounts(response.data);
      } catch (error) {
        console.error("Error fetching intervention counts:", error);
      }
    };

    // Fetch the counts when any of the filters, roles, or date range change
    if (roles.length > 0) fetchCounts();
  }, [
    selectedZone, // Zone filter
    selectedConstituency, // Constituency filter
    selectedDistrict, // Ward filter
    selectedInterventionType, // Intervention Type filter
    selectedInterventionAction, // Intervention Action filter
    roles, // Trigger fetch when roles change
    fromDate, // Trigger fetch when fromDate changes
    toDate, // Trigger fetch when toDate changes
    API_URL,
  ]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: "250px", // Set the width of the select box
      marginBottom: "10px",
      border: "2px solid black",
      color: "black",
    }),
  };

  const handleInterventionActionChange = async (id, newValue) => {
    try {
      // Update intervention action in the backend
      await api.put(`${API_URL}/state/update-intervention-action/${id}`, {
        interventionAction: newValue,
      });

      // Update the intervention action in the state
      setInterventionData((prevData) =>
        prevData.map((data) =>
          data._id === id ? { ...data, interventionAction: newValue } : data
        )
      );
    } catch (error) {
      console.error("Error updating intervention action:", error);
    }
  };

  const csvHeaders = [
    { label: "Zone", key: "zone" },
    { label: "Constituency", key: "constituency" },
    { label: "District", key: "district" },
    { label: "Category", key: "category" },
    { label: "Department", key: "department" },
    { label: "Intervention Type", key: "interventionType" },
    { label: "Intervention Issues", key: "interventionIssues" },
    {
      label: "Intervention Issue Brief",
      key: "interventionIssueBrief",
    },
    { label: "Suggested Actionable", key: "suggestedActionable" },
    { label: "Facilitator Name", key: "facilitatorName" },
    { label: "Facilitator Number", key: "facilitatorNumber" },
    { label: "Leader Name", key: "leaderName" },
    { label: "Leader Number", key: "leaderNumber" },
    { label: "Created On", key: "createdAt" },
    { label: "Intervention Action", key: "interventionAction" },
  ];

  const filterData = () => {
    return interventionData.filter((data) => {
      // Log the entire data object for debugging
      console.log("Data:", data);

      // Use 'createdAt' as fallback for date if 'date' is missing
      const dateToUse = data.date || data.createdAt;

      // If neither 'date' nor 'createdAt' is present, skip the entry
      if (!dateToUse) {
        console.log("Skipping entry due to missing date:", data);
        return false;
      }

      const isZoneMatch = selectedZone ? data.zone === selectedZone : true;
      const isConstituencyMatch = selectedConstituency
        ? data.constituency === selectedConstituency
        : true;
      const isDistrictMatch = selectedDistrict
        ? data.district === selectedDistrict
        : true;
      const isInterventionTypeMatch = selectedInterventionType
        ? data.interventionType === selectedInterventionType
        : true;
      const isInterventionActionMatch = selectedInterventionAction
        ? data.interventionAction === selectedInterventionAction
        : true;

      // Validate and parse the fallback date
      const recordDate = new Date(dateToUse);
      const dateIsValid = !isNaN(recordDate);

      if (!dateIsValid) {
        console.log("Invalid Date:", dateToUse);
      }

      // Normalize the dates by stripping the time portion for accurate comparison
      const normalizeDate = (date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0); // Set time to 00:00:00 to ignore time in comparison
        return normalized;
      };

      const normalizedRecordDate = normalizeDate(recordDate);
      const normalizedFromDate = fromDate
        ? normalizeDate(new Date(fromDate))
        : null;
      const normalizedToDate = toDate ? normalizeDate(new Date(toDate)) : null;

      const isDateMatch =
        dateIsValid &&
        (!normalizedFromDate || normalizedRecordDate >= normalizedFromDate) &&
        (!normalizedToDate || normalizedRecordDate <= normalizedToDate);

      return (
        isZoneMatch &&
        isConstituencyMatch &&
        isDistrictMatch &&
        isInterventionTypeMatch &&
        isInterventionActionMatch &&
        (!fromDate && !toDate ? true : isDateMatch)
      );
    });
  };

  const currentFilteredData = filterData();
  const pageCount = Math.ceil(currentFilteredData.length / itemsPerPage);
  const paginatedData = currentFilteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageClick = (event) => {
    setCurrentPage(event.selected); // Update current page
  };

  const handleDeleteIntervention = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record?"
    );
    if (!confirmDelete) return;

    try {
      const response = await api.delete(
        `${API_URL}/state/delete-intervention-data/${id}`
      );
      if (response.status === 200) {
        alert("Record deleted successfully!");
        setInterventionData((prevData) =>
          prevData.filter((data) => data._id !== id)
        );
      }
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to delete record. Please try again."
      );
    }
  };

  const pdfHideColumns = [0, 12, 13];
  return (
    <>
      <Dashboard />
      <div className="intervention-data-component">
        <h1>State Intervention Dashboard</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {!errorMessage && (
          <>
            <div className="filter-controls">
              <Select
                id="zone"
                options={zones}
                placeholder="Select Zone"
                value={
                  zones.find((zone) => zone.value === selectedZone) || null
                }
                onChange={(option) => setSelectedZone(option?.value || null)}
                styles={customStyles}
                isClearable
              />

              <Select
                id="district"
                options={districts}
                styles={customStyles}
                placeholder="Select District"
                value={
                  districts.find(
                    (district) => district.value === selectedDistrict
                  ) || null
                }
                onChange={(option) =>
                  setSelectedDistrict(option?.value || null)
                }
                isClearable
              />
              <Select
                id="constituency"
                options={constituencies}
                styles={customStyles}
                placeholder="Select Constituency"
                value={
                  constituencies.find(
                    (c) => c.value === selectedConstituency
                  ) || null
                }
                onChange={(option) => {
                  setSelectedConstituency(option?.value || null);
                }}
                isClearable
              />

              <Select
                id="interventionType"
                styles={customStyles}
                placeholder="Select Intervention Type"
                options={interventionTypes.map((type) => ({
                  value: type,
                  label: type,
                }))}
                value={
                  selectedInterventionType
                    ? {
                        value: selectedInterventionType,
                        label: selectedInterventionType,
                      }
                    : null
                }
                onChange={(option) =>
                  setSelectedInterventionType(option?.value || null)
                }
                isClearable
              />

              <Select
                id="interventionAction"
                styles={customStyles}
                placeholder="Select Intervention Action"
                options={interventionActions.map((action) => ({
                  value: action,
                  label: action,
                }))}
                value={
                  selectedInterventionAction
                    ? {
                        value: selectedInterventionAction,
                        label: selectedInterventionAction,
                      }
                    : null
                }
                onChange={(option) =>
                  setSelectedInterventionAction(option?.value || null)
                }
                isClearable
              />
            </div>
            <div className="filter-controls">
              <div className="date-filter">
                <label>From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{ width: "250px" }}
                />
                <label>To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{ width: "250px" }}
                />
              </div>
            </div>
          </>
        )}
        <div className="intervention-counts">
          <h2>Intervention Counts</h2>
          <div className="counts-grid">
            {interventionCounts.typeCounts && (
              <div className="count-card total-count">
                <h3>Total</h3>
                <p>
                  {Object.values(interventionCounts.typeCounts).reduce(
                    (total, count) => total + count,
                    0
                  )}
                </p>
              </div>
            )}

            {/* Display counts for each intervention type */}
            {Object.entries(interventionCounts.typeCounts || {}).map(
              ([type, count]) => (
                <div key={type} className="count-card">
                  <h3>{type}</h3>
                  <p>{count}</p>
                </div>
              )
            )}
            <ReactToPrint
              trigger={() => (
                <FontAwesomeIcon
                  icon={faFilePdf}
                  className="font-pdf"
                  size="2x"
                />
              )}
              content={() => componentRef.current}
              pageStyle={`@page { margin: 5mm 2mm; }`}
              documentTitle={`State Interventions_${[
                selectedZone,
                selectedConstituency,
                selectedDistrict,
                selectedInterventionType,
              ]
                .filter(Boolean)
                .join("_")}`}
              removeAfterPrint={true}
            />

            <CSVLink
              data={paginatedData}
              headers={csvHeaders}
              filename={`Intervention_Data_${[
                selectedConstituency,
                selectedInterventionType,
                selectedZone,
                selectedDistrict,
                selectedInterventionAction,
              ]
                .filter(Boolean)
                .join("_")}`}
            >
              <FontAwesomeIcon
                icon={faFileCsv}
                className="font-pdf"
                size="2x"
                style={{ marginLeft: "20px", color: "#325c23" }}
              />
            </CSVLink>
          </div>
        </div>
        <div className="intervention-table">
          <h2>State Intervention Data</h2>
          <table
            id="pdf-content"
            ref={componentRef}
            className="bmc-admin-table"
          >
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    style={{
                      width: `${columnWidths[index]}px`,
                      position: "relative",
                    }}
                    className={pdfHideColumns.includes(index) ? "pdf-hide" : ""}
                  >
                    {header}
                    <div
                      className="resizer"
                      onMouseDown={(e) => startResize(e, index)}
                    />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((data, index) => {
                const getBackgroundColor = (action) => {
                  switch (action) {
                    case "Solved":
                      return "#b6d7a8";
                    case "Not Solved":
                      return "#ea9999";
                    case "Action Taken":
                      return "#ffe599";
                    case "Reviewed":
                      return "#6a96e2";
                    default:
                      return "transparent";
                  }
                };

                return (
                  <tr key={index}>
                    <td className="pdf-hide">
                      {data.userId ? data.userId.userName : "-"}
                    </td>
                    <td>{data.zone}</td>
                    <td>{data.district}</td>
                    <td>{data.constituency}</td>
                    <td style={{ textAlign: "center" }}>
                      {data.interventionType}
                    </td>
                    <td>{data.interventionIssues}</td>
                    <td style={{ minWidth: "240px" }}>
                      {data.interventionIssueBrief}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {data.department || "-"}
                    </td>
                    <td>{data.suggestedActionable || "-"}</td>
                    <td style={{ wordBreak: "break-word" }}>
                      {data.facilitatorName || "-"}-
                      {data.facilitatorNumber || "-"}
                    </td>
                    <td style={{ wordBreak: "break-word" }}>
                      {data.leaderName || "-"}-{data.leaderNumber || "-"}
                    </td>
                    <td
                      style={{ wordBreak: "break-word", textAlign: "center" }}
                    >
                      {data.category}
                    </td>
                    <td className="pdf-hide">
                      {new Date(data.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td
                      style={{
                        backgroundColor: getBackgroundColor(
                          data.interventionAction || "Not Solved"
                        ),
                      }}
                      className="pdf-hide"
                    >
                      <select
                        value={data.interventionAction || "Not Solved"}
                        onChange={(e) =>
                          handleInterventionActionChange(
                            data._id,
                            e.target.value
                          )
                        }
                        style={{ width: "150px" }}
                      >
                        <option value="Reviewed">Reviewed</option>
                        <option value="Action Taken">Action Taken</option>
                        <option value="Solved">Solved</option>
                        <option value="Not Solved">Not Solved</option>
                      </select>
                      <div className="action-icons-div">
                        <Link
                          to={`/update-state-intervention/${data._id}`}
                          style={{
                            textDecoration: "none",
                            padding: "5px 0px",
                            color: "#008cff",
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} size="2x" />
                        </Link>
                        {/* <FontAwesomeIcon
                          onClick={() => handleDeleteIntervention(data._id)}
                          icon={faTrash}
                          size="2x"
                        /> */}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ReactPaginate
            previousLabel={"← Previous"}
            nextLabel={"Next →"}
            pageCount={pageCount}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
          />
        </div>
      </div>
    </>
  );
};

export default StateInterventionDashboard;
