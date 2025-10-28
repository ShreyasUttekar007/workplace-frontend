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

const BmcInterventionDashboard = () => {
  const [roles, setRoles] = useState([]);
  const [pcs, setPcs] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [selectedPC, setSelectedPC] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
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
    "PC",
    "AC",
    "Ward",
    "Type",
    "Issues",
    "Issue Brief",
    "Department",
    "Suggested Actionable",
    "Facilitator",
    "Leader",
    "Category",
    "Date",
    "Solvable",
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
          `${API_URL}/bmc/get-intervention-data/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch pcs and constituencies data
        const fetchedPcs = response.data.map((data) => data.pc).filter(Boolean); // Extract pcs from the response
        const fetchedConstituencies = response.data
          .map((data) => data.constituency)
          .filter(Boolean); // Extract constituencies from the response

        // Remove duplicates by converting them to a Set and then back to an array
        const uniquePcs = [...new Set(fetchedPcs)];
        const uniqueConstituencies = [...new Set(fetchedConstituencies)];

        // Set pcs and constituencies state
        setPcs(uniquePcs.map((pc) => ({ value: pc, label: pc })));
        setConstituencies(
          uniqueConstituencies.map((constituency) => ({
            value: constituency,
            label: constituency,
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
    selectedPC,
    selectedInterventionType,
    selectedInterventionAction,
    roles,
    selectedWard,
  ]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedConstituency) return;

      try {
        const token = await localforage.getItem("token");
        const response = await api.get(
          `${API_URL}/bmc/get-wards/${selectedConstituency}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setWards(
          response.data.wards.map((ward) => ({ value: ward, label: ward }))
        );
      } catch (error) {
        console.error("Error fetching wards:", error);
        setWards([]);
      }
    };

    fetchWards();
  }, [selectedConstituency]);

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
        const actions = [
          "Solved",
          "Rework",
          "Not Solved",
          "Action Taken",
          "Verified",
          "State Lead Reviewed",
          "Zonal Reviewed",
        ];
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
          pc: selectedPC, // Filter by PC
          constituency: selectedConstituency, // Filter by Constituency
          ward: selectedWard, // Filter by Ward
          interventionType: selectedInterventionType, // Filter by Intervention Type
          interventionAction: selectedInterventionAction, // Filter by Intervention Action
          fromDate: fromDate ? new Date(fromDate).toISOString() : null, // Filter by From Date
          toDate: toDate ? new Date(toDate).toISOString() : null, // Filter by To Date
        };

        const response = await api.get(`${API_URL}/bmc/interventions/counts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params, // Pass the filters as query parameters
        });

        setInterventionCounts(response.data);
      } catch (error) {
        console.error("Error fetching intervention counts:", error);
      }
    };

    // Fetch the counts when any of the filters, roles, or date range change
    if (roles.length > 0) fetchCounts();
  }, [
    selectedPC, // PC filter
    selectedConstituency, // Constituency filter
    selectedWard, // Ward filter
    selectedInterventionType, // Intervention Type filter
    selectedInterventionAction, // Intervention Action filter
    roles, // Trigger fetch when roles change
    fromDate, // Trigger fetch when fromDate changes
    toDate, // Trigger fetch when toDate changes
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

  const handleInterventionActionChange = async (id, newValue, solvable) => {
    try {
      // Update intervention action and solvable in the backend
      await api.put(`${API_URL}/bmc/update-intervention-action/${id}`, {
        interventionAction: newValue,
        solvable,
      });

      // Update the intervention action and solvable in the state
      setInterventionData((prevData) =>
        prevData.map((data) =>
          data._id === id
            ? { ...data, interventionAction: newValue, solvable }
            : data
        )
      );
    } catch (error) {
      console.error("Error updating intervention action:", error);
    }
  };

  const csvHeaders = [
    { label: "PC", key: "pc" },
    { label: "Constituency", key: "constituency" },
    { label: "Ward", key: "ward" },
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
    { label: "Solvable", key: "solvable" },
    { label: "Intervention Action", key: "interventionAction" },
  ];

  const filterData = () => {
    return interventionData.filter((data) => {
      // Use 'createdAt' as fallback for date if 'date' is missing
      const dateToUse = data.date || data.updatedAt || data.createdAt;

      // If neither 'date' nor 'createdAt' is present, skip the entry
      if (!dateToUse) {
        console.log("Skipping entry due to missing date:", data);
        return false;
      }

      const isPCMatch = selectedPC ? data.pc === selectedPC : true;
      const isConstituencyMatch = selectedConstituency
        ? data.constituency === selectedConstituency
        : true;
      const isWardMatch = selectedWard ? data.ward === selectedWard : true;
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
        isPCMatch &&
        isConstituencyMatch &&
        isWardMatch &&
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
        `${API_URL}/bmc/delete-intervention-data/${id}`
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
      <div>
        <h1>BMC Intervention Dashboard</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {!errorMessage && (
          <>
            <div className="filter-controls">
              <Select
                id="pc"
                options={pcs}
                placeholder="Select PC"
                value={pcs.find((pc) => pc.value === selectedPC) || null}
                onChange={(option) => setSelectedPC(option?.value || null)}
                styles={customStyles}
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
                  setSelectedWard(null);
                }}
                isClearable
              />

              <Select
                id="ward"
                options={wards}
                styles={customStyles}
                placeholder="Select Ward"
                value={
                  wards.find((ward) => ward.value === selectedWard) || null
                }
                onChange={(option) => setSelectedWard(option?.value || null)}
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
              documentTitle={`BMC Interventions_${[
                selectedPC,
                selectedConstituency,
                selectedWard,
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
                selectedPC,
                selectedWard,
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
          <h2>BMC Intervention Data</h2>
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
                    case "Rework":
                      return "#99eadf";
                    case "Not Solved":
                      return "#ea9999";
                    case "Action Taken":
                      return "#ffe599";
                    case "Verified":
                      return "#6a96e2";
                    case "State Lead Reviewed":
                      return "#cf8ee1";
                    case "Zonal Reviewed":
                      return "#f3692b";
                    default:
                      return "transparent";
                  }
                };

                return (
                  <tr key={index}>
                    <td className="pdf-hide">
                      {data.userId ? data.userId.userName : "-"}
                    </td>
                    <td>{data.pc}</td>
                    <td>{data.constituency}</td>
                    <td>{data.ward}</td>
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
                    <td>
                      {data.interventionType ===
                      "Government / Administrative" ? (
                        <select
                          value={data.solvable || ""}
                          onChange={(e) =>
                            handleInterventionActionChange(
                              data._id,
                              data.interventionAction,
                              e.target.value
                            )
                          }
                          style={{ width: "150px" }}
                        >
                          <option value="" disabled>
                            Select Solvable Level
                          </option>
                          <option value="Solvable - Easy">
                            Solvable - Easy
                          </option>
                          <option value="Solvable - Moderate">
                            Solvable - Moderate
                          </option>
                          <option value="Solvable - Difficult">
                            Solvable - Difficult
                          </option>
                        </select>
                      ) : (
                        "-"
                      )}
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
                        <option value="Zonal Reviewed">Zonal Reviewed</option>
                        <option value="State Lead Reviewed">
                          State Lead Reviewed
                        </option>
                        <option value="Verified">Verified</option>
                        <option value="Action Taken">Action Taken</option>
                        <option value="Solved">Solved</option>
                        <option value="Rework">Rework</option>
                        <option value="Not Solved">Not Solved</option>
                      </select>

                      <div className="action-icons-div">
                        <Link
                          to={`/update-bmc-intervention/${data._id}`}
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
        </div>
        <ReactPaginate
          previousLabel={"← Previous"}
          nextLabel={"Next →"}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
        />
      </div>
    </>
  );
};

export default BmcInterventionDashboard;
