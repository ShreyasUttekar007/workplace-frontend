import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import "../css/userDashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faUserSecret } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";

const API_URL = process.env.REACT_APP_API_URL;

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const storedRole = await localforage.getItem("role");
        const token = await localforage.getItem("token");

        if (storedRole) {
          setRole(storedRole);

          if (storedRole === "admin") {
            const response = await api.get(
              `${API_URL}/auth/users`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const usersData = response.data;
            setUsers(usersData);
            setFilteredUsers(usersData);

            // Extract unique locations
            const uniqueLocations = [
              ...new Set(usersData.map((user) => user.location)),
            ];
            setLocations(uniqueLocations);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter((user) => user.location === selectedLocation);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.roles.some((r) =>
            r.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    setFilteredUsers(filtered);
  }, [searchQuery, selectedLocation, users]);

  const handleDeleteUser = async (userId) => {
    try {
      const token = await localforage.getItem("token");
      await api.delete(`${API_URL}/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user");
    }
  };

  const handleUpdateUser = (userId) => {
    navigate(`/update-user/${userId}`);
  };

  const handleUpdateUserPassword = (userId) => {
    navigate(`/update-user-password/${userId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Dashboard />
      <h1>User Dashboard</h1>
      {role === "admin" && (
        <div className="main-div">
          {/* Filter Controls */}
          <div className="filters">
            <input
              type="text"
              placeholder="Search by email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ margin: "10px" }}
            />

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="location-filter"
              style={{ margin: "10px" }}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* User Table */}
          <table className="mom-table" style={{ width: "50%" }}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Location</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.email}</td>
                    <td>{user.location}</td>
                    <td style={{ maxWidth: "300px" }}>
                      {user.roles
                        .map((role) => role.charAt(0).toUpperCase() + role.slice(1))
                        .join(", ")}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="buttons-div">
                        <button
                          onClick={() => handleUpdateUser(user._id)}
                          className="edit-button"
                          style={{ marginRight: "5px" }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleUpdateUserPassword(user._id)}
                          className="edit-button"
                          style={{ marginRight: "5px" }}
                        >
                          <FontAwesomeIcon icon={faUserSecret} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="delete-button"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
