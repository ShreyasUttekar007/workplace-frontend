import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import ReactPaginate from "react-paginate";
import "../css/leaveRequestsAdmin.css";
import Dashboard from "./Dashboard";

const LeaveRequestsRM = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedRows, setExpandedRows] = useState({}); // Tracks expanded rows
  const itemsPerPage = 10;

  const API_URL = process.env.REACT_APP_API_URL;

  const fetchLeaveRequests = async (email) => {
    try {
      const token = await localforage.getItem("token");
      const response = await api.get(
        `${API_URL}/leavedata/leave-requests-reporting-manager`,
        {
          params: { receiverEmail: email },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedRequests = response.data.leaveRequests.map((request) => ({
        ...request,
        leaveStatus: request.leaveStatus || "pending",
      }));
      setLeaveRequests(updatedRequests);
      setFilteredRequests(updatedRequests);
    } catch (err) {
      setError("Error fetching leave requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getReceiverEmailFromLocalforage = async () => {
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
  };

  const updateLeaveStatus = async (
    id,
    leaveStatus,
    leaveType,
    startDate,
    endDate
  ) => {
    try {
      const token = await localforage.getItem("token");
      await api.put(
        `${API_URL}/leavedata/update-leave-status/${id}`,
        { leaveStatus, leaveType, startDate, endDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLeaveRequests((prev) =>
        prev.map((request) =>
          request._id === id ? { ...request, leaveStatus } : request
        )
      );
      setFilteredRequests((prev) =>
        prev.map((request) =>
          request._id === id ? { ...request, leaveStatus } : request
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || "Error updating leave status");
      console.error(err);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = leaveRequests.filter(
        (request) =>
          request.name.toLowerCase().includes(query.toLowerCase()) ||
          request.leaveCode.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(leaveRequests);
    }
    setCurrentPage(0);
  };

  useEffect(() => {
    getReceiverEmailFromLocalforage();
  }, []);

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
        <h2>Leave Requests</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or leave code..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="intervention-table">
          <table className="leave-table">
            <thead>
              <tr>
                <th>Name</th>
                {/* <th>Department</th> */}
                <th>Employee Code</th>
                <th>Leave Code</th>
                {/* <th>Reporting Manager</th> */}
                <th>Leave Type</th>
                <th>Subject</th>
                <th>Reason</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Leave Applied On</th>
                <th>Leave Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedRequests.map((request) => (
                <tr key={request._id}>
                  <td>{request.name}</td>
                  {/* <td>{request.department}</td> */}
                  <td>{request.employeeCode}</td>
                  <td>{request.leaveCode}</td>
                  {/* <td>{request.receiverName}</td> */}
                  <td>{formatLeaveType(request.leaveType)}</td>
                  <td>{request.reasonForLeave}</td>
                  <td>{truncateText(request.summaryForLeave, request._id)}</td>
                  <td>
                    {new Date(request.startDate).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    {new Date(request.endDate).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    {new Date(request.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td
                    className={
                      request.leaveStatus === "approved"
                        ? "status-approved"
                        : request.leaveStatus === "not approved"
                        ? "status-not-approved"
                        : "status-pending"
                    }
                  >
                    <select
                      value={request.leaveStatus}
                      onChange={(e) =>
                        updateLeaveStatus(
                          request._id,
                          e.target.value,
                          request.leaveType,
                          request.startDate,
                          request.endDate
                        )
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
       
      </div>
    </>
  );
};

export default LeaveRequestsRM;
