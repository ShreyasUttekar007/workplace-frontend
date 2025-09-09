import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import "../css/leaveRequestTable.css";
import localforage from "localforage";
import Dashboard from "./Dashboard";
import ReactPaginate from "react-paginate";

const API_URL = process.env.REACT_APP_API_URL;

const TravelRequestUserData = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
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
          `${API_URL}/travel/travel-requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLeaveRequests(response.data.leaveRequests);
      } catch (err) {
        console.error("Error fetching travel requests:", err);
        setError("Failed to fetch travel requests. Please try again later.");
      }
    };
    fetchLeaveRequests();
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
        <h2>Travel Requests</h2>

        {error && <p className="error-message">{error}</p>}
        {leaveRequests.length > 0 ? (
          <>
            <div className="intervention-table">
              <table>
                <thead>
                  <tr>
                    {/* <th>Name</th>
                  <th>Email</th>
                  <th>Employee Code</th>
                  <th>Department</th> */}
                    <th>Event Location</th>
                    <th>Request Type</th>
                    <th>Purpose Of Travel</th>
                    <th>Travel Date</th>
                    <th>Accommodation Start Date</th>
                    <th>Accommodation End Date</th>
                    <th>Event Details</th>
                    <th>Remarks</th>
                    <th>Travel Code</th>
                    <th>Travel Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLeaveRequests.map((travel) => (
                    <tr key={travel._id}>
                      {/* <td>{travel.name}</td>
                    <td>{travel.email}</td>
                    <td>{travel.employeeCode}</td>
                    <td>{travel.department}</td> */}
                      <td>{travel.eventLocation}</td>

                      <td>{formatLeaveType(travel.requestType)}</td>
                      <td>{travel.purposeOfTravel}</td>
                      <td>
                        {new Date(travel.travelDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td>
                        {travel.accommodationStartDate
                          ? new Date(
                              travel.accommodationStartDate
                            ).toLocaleDateString("en-GB")
                          : "NA"}
                      </td>
                      <td>
                        {travel.accommodationEndDate
                          ? new Date(
                              travel.accommodationEndDate
                            ).toLocaleDateString("en-GB")
                          : "NA"}
                      </td>

                      <td>{truncateText(travel.eventDetails, travel._id)}</td>
                      <td>{truncateText(travel.remarks, travel._id)}</td>

                      <td>{travel.travelCode}</td>
                      <td
                        className={
                          travel.requestStatus === "approved"
                            ? "status-approved"
                            : travel.requestStatus === "not approved"
                            ? "status-not-approved"
                            : "status-pending"
                        }
                      >
                        {capitalizeWords(travel.requestStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          </>
        ) : (
          <p>No travel requests found.</p>
        )}
      </div>
    </>
  );
};

export default TravelRequestUserData;
