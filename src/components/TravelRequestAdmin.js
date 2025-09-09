import React, { useCallback, useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import ReactPaginate from "react-paginate";
import "../css/leaveRequestsAdmin.css";
import Dashboard from "./Dashboard";

const API_URL = process.env.REACT_APP_API_URL;

const TravelRequestAdmin = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});
  const itemsPerPage = 10;

  const fetchLeaveRequests = async (email) => {
    try {
      const token = await localforage.getItem("token");
      const response = await api.get(
        `${API_URL}/travel/travel-requests-emails`,
        {
          params: { receiverEmail: email },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedRequests = response.data.leaveRequests.map((request) => ({
        ...request,
        requestStatus: request.requestStatus || "pending",
      }));
      setLeaveRequests(updatedRequests);
      setFilteredRequests(updatedRequests);
    } catch (err) {
      setError("Error fetching travel requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getReceiverEmailFromLocalforage = useCallback(async () => {
    try {
      const email = await localforage.getItem("email");
      if (email) {
        fetchLeaveRequests(email);
      } else {
        setError("Receiver email not found in localforage.");
      }
    } catch (err) {
      setError("Error retrieving email from localforage");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getReceiverEmailFromLocalforage();
  }, [getReceiverEmailFromLocalforage]);

  const updateLeaveStatus = async (id, requestStatus) => {
    try {
      const token = await localforage.getItem("token");

      await api.put(
        `${API_URL}/travel/update-travel-status/${id}`,
        { requestStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLeaveRequests((prev) =>
        prev.map((request) =>
          request._id === id ? { ...request, requestStatus } : request
        )
      );
      setFilteredRequests((prev) =>
        prev.map((request) =>
          request._id === id ? { ...request, requestStatus } : request
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || "Error updating travel status");
      console.error(err);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = leaveRequests.filter((request) => {
        const name = request.name ? request.name.toLowerCase() : "";
        const travelCode = request.travelCode
          ? request.travelCode.toLowerCase()
          : "";

        return (
          name.includes(query.toLowerCase()) ||
          travelCode.includes(query.toLowerCase())
        );
      });

      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(leaveRequests);
    }
    setCurrentPage(0);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const formatLeaveType = (type) =>
    type.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const pageCount = Math.ceil(filteredRequests.length / itemsPerPage);
  const displayedRequests = filteredRequests.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const truncateText = (text, id) => {
    const words = text.split(" ");
    if (expandedRows[id] || words.length <= 5) {
      return (
        <>
          {text}{" "}
          {words.length > 5 && (
            <span
              className="toggle-text"
              onClick={() => toggleRowExpansion(id)}
            >
              Show Less
            </span>
          )}
        </>
      );
    }
    return (
      <>
        {words.slice(0, 5).join(" ")}...{" "}
        <span className="toggle-text" onClick={() => toggleRowExpansion(id)}>
          Show More
        </span>
      </>
    );
  };

  return (
    <>
      <Dashboard />
      <div>
        <h2>Travel Requests</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or travel code..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="intervention-table">
          <table className="travel-admin-table">
            <thead>
              <tr>
                <th>Name</th>
                {/* <th>Email</th> */}
                {/* <th>Phone Number</th> */}
                {/* <th>Employee Code</th> */}
                <th>Department</th>
                <th>Travel Instructed By</th>
                <th>Event Details</th>
                <th>Request Type</th>
                <th>Purpose Of Travel</th>
                <th>Travel Date</th>
                <th style={{ textAlign: "center", maxWidth: "180px" }}>Accommodation Start Date</th>
                <th style={{ textAlign: "center", maxWidth: "180px" }}>Accommodation End Date</th>
                {/* <th>Remarks</th> */}
                {/* <th>Travel Code</th> */}
                <th>Travel Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedRequests.map((travel) => (
                <tr key={travel._id}>
                  <td>{travel.name}</td>
                  {/* <td>{travel.email}</td> */}
                  {/* <td>{travel.employeePhoneNumber}</td> */}
                  {/* <td style={{ textAlign: "center" }}>{travel.employeeCode}</td> */}
                  <td style={{ textAlign: "center" }}>{travel.department}</td>
                  <td style={{ textAlign: "center" }}>
                    {travel.travelInstructedBy}
                  </td>
                  <td style={{ textAlign: "center", maxWidth: "180px" }}>
                    {travel.eventLocation} - {travel.eventName} -{" "}
                    {travel.eventDetails}
                  </td>
                  <td>{formatLeaveType(travel.requestType)}</td>
                  <td style={{ minWidth: "140px", textAlign: "center" }}>
                    {travel.purposeOfTravel}
                  </td>
                  <td>
                    {new Date(travel.travelDate).toLocaleDateString("en-GB")}
                  </td>
                  <td style={{ textAlign: "center", maxWidth: "180px" }}>
                    {travel.accommodationStartDate
                      ? new Date(
                          travel.accommodationStartDate
                        ).toLocaleDateString("en-GB")
                      : "NA"}
                  </td>
                  <td style={{ textAlign: "center", maxWidth: "180px" }}>
                    {travel.accommodationEndDate
                      ? new Date(
                          travel.accommodationEndDate
                        ).toLocaleDateString("en-GB")
                      : "NA"}
                  </td>
                  {/* <td style={{ minWidth: "140px" }}>
                    {truncateText(travel.remarks, travel._id)}
                  </td> */}

                  {/* <td>{travel.travelCode}</td> */}
                  <td
                    className={
                      travel.requestStatus === "approved"
                        ? "status-approved"
                        : travel.requestStatus === "not approved"
                        ? "status-not-approved"
                        : "status-pending"
                    }
                  >
                    <select
                      value={travel.requestStatus}
                      onChange={(e) =>
                        updateLeaveStatus(travel._id, e.target.value)
                      }
                      style={{ width: "100px" }}
                    >
                      <option value="approved">Approved</option>
                      <option value="not approved">Not Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  );
};

export default TravelRequestAdmin;
