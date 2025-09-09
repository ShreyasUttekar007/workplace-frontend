import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import ReactPaginate from "react-paginate";
import "../css/leaveRequestsAdmin.css";
import Dashboard from "./Dashboard";

const API_URL = process.env.REACT_APP_API_URL;

const CabRequestsRM = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;


  const fetchLeaveRequests = async (email) => {
    try {
      const token = await localforage.getItem("token");
      const response = await api.get(
        `${API_URL}/cab/cab-requests-reporting-manager`,
        {
          params: { receiverEmail: email },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedRequests = response.data.cabRequests.map((request) => ({
        ...request,
        cabStatus: request.cabStatus || "pending",
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

  const updateCabStatus = async (id, cabStatus) => {
    try {
      const token = await localforage.getItem("token");
      await api.put(
        `${API_URL}/cab/update-reporting-manager-cab-data/${id}`,
        { cabStatus }, // Removed unnecessary fields
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update state to reflect changes immediately
      setLeaveRequests((prev) =>
        prev.map((request) =>
          request._id === id ? { ...request, cabStatus } : request
        )
      );
      setFilteredRequests((prev) =>
        prev.map((request) =>
          request._id === id ? { ...request, cabStatus } : request
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || "Error updating cab status");
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

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const pageCount = Math.ceil(filteredRequests.length / itemsPerPage);
  const displayedRequests = filteredRequests.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const formatTo12Hour = (time) => {
    const [hour, minute] = time.split(":");
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${suffix}`;
  };

  return (
    <>
      <Dashboard />
      <div>
        <h2>Cab Requests</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or leave code..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="intervention-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Pick-up Location</th>
                <th>Date of Pick-up</th>
                <th>Pick-up Time</th>
                <th>Purpose</th>
                <th>Co-Passenger</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedRequests.map((request) => (
                <tr key={request._id}>
                  <td style={{ textAlign: "center" }}>{request.name}</td>
                  <td style={{ textAlign: "center" }}>
                    {request.employeePhoneNumber}
                  </td>
                  <td style={{ textAlign: "center", maxWidth: "200px" }}>
                    {request.pickupLocation}
                  </td>
                  <td style={{ textAlign: "center" }}>
                  {new Date(request.dateOfRequest).toLocaleDateString("en-GB")}
                </td>
                  <td style={{ textAlign: "center" }}>
                    {formatTo12Hour(request.pickupTime)}
                  </td>
                  <td>{request.purpose}</td>
                  <td style={{ textAlign: "center" }}>
                    {request.addOnPerson && request.addOnPerson.length > 0
                      ? request.addOnPerson
                          .map((person) => person.employeeName)
                          .join(", ")
                      : "N/A"}
                  </td>
                  <td
                    className={
                      request.cabStatus === "approved"
                        ? "status-approved"
                        : request.cabStatus === "not approved"
                        ? "status-not-approved"
                        : "status-pending"
                    }
                  >
                    <select
                      value={request.cabStatus}
                      onChange={(e) =>
                        updateCabStatus(request._id, e.target.value)
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

export default CabRequestsRM;
