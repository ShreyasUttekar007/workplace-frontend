import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import Dashboard from "./Dashboard";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import ReactPaginate from "react-paginate";

const API_URL = process.env.REACT_APP_API_URL;

const CabDashboard = () => {
  const [cabRequests, setCabRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;


  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = await localforage.getItem("token");
        const response = await api.get(
          `${API_URL}/cab/vendors`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setVendors(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    const fetchCabRequests = async () => {
      try {
        const token = await localforage.getItem("token");
        const response = await api.get(
          `${API_URL}/cab/cab-requests-emails`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const requests = response.data.cabRequests;
        setCabRequests(requests);

        // Build a mapping for vendor values if they exist in the DB
        const vendorMapping = {};
        requests.forEach((request) => {
          if (request.vendor) {
            vendorMapping[request._id] = request.vendor;
          }
        });
        setSelectedVendors(vendorMapping);
      } catch (error) {
        console.error("Error fetching cab requests:", error);
        setError("Failed to load cab requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
    fetchCabRequests();
  }, []);

  const formatTo12Hour = (time) => {
    const [hour, minute] = time.split(":");
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${suffix}`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleDeleteIntervention = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record?"
    );
    if (!confirmDelete) return;

    try {
      const token = await localforage.getItem("token");
      const response = await api.delete(
        `${API_URL}/cab/delete-cab-request/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        alert("Record deleted successfully!");
        setCabRequests((prevData) =>
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

  const filteredRequests = filterDate
    ? cabRequests.filter(
        (request) =>
          new Date(request.dateOfRequest).toISOString().split("T")[0] ===
          filterDate
      )
    : cabRequests;

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };
  const pageCount = Math.ceil(filteredRequests.length / itemsPerPage);
  const displayedRequests = filteredRequests.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <>
      <Dashboard />
      <h2>Cab Requests</h2>
      <div className="filter-date-div">
        <label style={{ fontSize: "16px" }}>Filter by Date </label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>
      <div className="intervention-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Requested On</th>
              <th>Phone Number</th>
              <th>Reporting Manager</th>
              <th>Pick-up Location</th>
              <th>Date of Pick-up</th>
              <th>Pick-up Time</th>
              <th>Purpose</th>
              <th>Co-Passenger</th>
              <th>Cab Number</th>
              <th>Driver Name</th>
              <th>Driver Number</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedRequests.map((request) => (
              <tr key={request._id}>
                <td style={{ textAlign: "center" }}>{request.name}</td>
                <td>
                  {new Date(request.createdAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>
                <td style={{ textAlign: "center" }}>
                  {request.employeePhoneNumber}
                </td>

                <td style={{ textAlign: "center" }}>{request.recieverName}</td>
                <td style={{ textAlign: "center", maxWidth: "150px" }}>
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
                <td style={{ textAlign: "center" }}>{request.cabNumber}</td>
                <td style={{ textAlign: "center" }}>{request.driverName}</td>
                <td style={{ textAlign: "center" }}>{request.driverNumber}</td>
                <td style={{ textAlign: "center" }}>{request.remarks}</td>
                <td>
                  <div className="action-icons-div">
                    <Link
                      to={`/update-driver-data/${request._id}`}
                      onClick={(e) => {
                        if (request.cabStatus === "pending") {
                          alert(
                            "Warning: The Approval is still pending from Reporting Manager."
                          );
                        }
                      }}
                      style={{
                        textDecoration: "none",
                        padding: "5px 0px",
                        color: "#008cff",
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} size="1x" />
                    </Link>

                    <FontAwesomeIcon
                      onClick={() => handleDeleteIntervention(request._id)}
                      icon={faTrash}
                      size="1x"
                    />
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
  );
};

export default CabDashboard;
