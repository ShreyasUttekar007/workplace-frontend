import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import "../css/leaveRequestTable.css";
import localforage from "localforage";
import Dashboard from "./Dashboard";
import ReactPaginate from "react-paginate";

const API_URL = process.env.REACT_APP_API_URL;

const LeaveRequestsTable = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveCounts, setLeaveCounts] = useState({
    sickLeave: 0,
    paidLeave: 0,
    restrictedHoliday: 0,
    menstrualLeave: 0,
    regularizationLeave: 0,
    compensationLeave: 0,
    onOfficeDuty: 0,
  });

  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [expandedRows, setExpandedRows] = useState({});

  const pageCount = Math.ceil(leaveRequests.length / itemsPerPage);
  const displayedLeaveRequests = leaveRequests.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );


  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const token = await localforage.getItem("token");
        const response = await api.get(
          `${API_URL}/leavedata/leave-requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLeaveRequests(response.data.leaveRequests);
      } catch (err) {
        console.error("Error fetching leave requests:", err);
        setError("Failed to fetch leave requests. Please try again later.");
      }
    };

    const fetchLeaveCounts = async () => {
      try {
        const token = await localforage.getItem("token");
        const email = await localforage.getItem("email");
        const response = await api.get(
          `${API_URL}/employeedata/get-leave-data/${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLeaveCounts(response.data.leaveData);
      } catch (err) {
        console.error("Error fetching leave counts:", err);
        setError("Failed to fetch leave counts. Please try again later.");
      }
    };

    fetchLeaveRequests();
    fetchLeaveCounts();
  }, []);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatLeaveType = (type) =>
    type.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

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

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <>
      <Dashboard />
      <div>
        <h2>Leave Requests</h2>
        <div className="leave-counts">
          <div className="leave-box">
            <h3>Sick Leave</h3>
            <p>{leaveCounts.sickLeave}</p>
          </div>
          <div className="leave-box">
            <h3>Paid Leave</h3>
            <p>{leaveCounts.paidLeave}</p>
          </div>
          <div className="leave-box">
            <h3>Restricted Holiday</h3>
            <p>{leaveCounts.restrictedHoliday}</p>
          </div>
          <div className="leave-box">
            <h3>Menstrual Leave</h3>
            <p>{leaveCounts.menstrualLeave}</p>
          </div>
          <div className="leave-box">
            <h3>Leave Regularization</h3>
            <p>{leaveCounts.regularizationLeave}</p>
          </div>
          <div className="leave-box">
            <h3>On Office Duty</h3>
            <p>{leaveCounts.onOfficeDuty}</p>
          </div>
          <div className="leave-box">
            <h3>Compensation Leave</h3>
            <p>{leaveCounts.compensationLeave}</p>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}
        {leaveRequests.length > 0 ? (
          <>
            <div className="intervention-table">
              <table>
                <thead>
                  <tr>
                    <th>Reporting Manager</th>
                    <th>Leave Type</th>
                    <th>Reason</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Summary</th>
                    <th>Leave Code</th>
                    <th>Leave Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLeaveRequests.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.receiverEmail}</td>
                      <td>{formatLeaveType(leave.leaveType)}</td>
                      <td>{leave.reasonForLeave}</td>
                      <td>
                        {new Date(leave.startDate).toLocaleDateString("en-GB")}
                      </td>
                      <td>
                        {new Date(leave.endDate).toLocaleDateString("en-GB")}
                      </td>
                      <td style={{ minWidth: "140px" }}>
                        {leave.summaryForLeave}
                      </td>
                      <td>{leave.leaveCode}</td>
                      <td
                        className={
                          leave.leaveStatus === "approved"
                            ? "status-approved"
                            : leave.leaveStatus === "not approved"
                            ? "status-not-approved"
                            : "status-pending"
                        }
                      >
                        {capitalizeWords(leave.leaveStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                activeClassName={"active"}
                previousLinkClassName={"prev-link"}
                nextLinkClassName={"next-link"}
                disabledClassName={"disabled"}
              />
            </div>
          </>
        ) : (
          <p>No leave requests found.</p>
        )}
      </div>
    </>
  );
};

export default LeaveRequestsTable;
