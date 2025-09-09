import React, { useState, useEffect } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage"; // Import localForage
import "../css/employeeData.css";
import Dashboard from "./Dashboard";

const API_URL = process.env.REACT_APP_API_URL;

const EmployeeData = () => {
  const [empId, setEmpId] = useState(null);
  const [empData, setEmpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmpId = async () => {
      const id = await localforage.getItem("empId"); // Fetch empId from localForage
      setEmpId(id);
    };

    fetchEmpId();
  }, []);

  useEffect(() => {
    if (empId) {
      const fetchEmployeeData = async () => {
        try {
          const response = await api.get(
            `${API_URL}/empmetrics/emps/${empId}`
          );
          setEmpData(response.data);
        } catch (err) {
          setError(
            err.response ? err.response.data.error : "An error occurred"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchEmployeeData();
    }
  }, [empId]);

  // Function to calculate time difference in HH:MM format
  const calculateTimeDifference = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const start = new Date();
    start.setHours(startHours, startMinutes, 0, 0);

    const end = new Date();
    end.setHours(endHours, endMinutes, 0, 0);

    const differenceInMilliseconds = end - start;
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);

    const hours = Math.floor(differenceInMinutes / 60);
    const minutes = Math.floor(differenceInMinutes % 60);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Function to format month with number
  const formatMonthWithNumber = (month, index) => {
    return `${index + 1} ${month}`;
  };

  // Function to get the day of the week for a given date
  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return daysOfWeek[date.getDay()];
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <>
      <Dashboard />
      <div className="main-set-container">
        <h1>Attendance Records</h1>
        <div className="employee-info">
          {empData && empData.employeeData && (
            <div>
              <div>
                <strong style={{ marginRight: "5px" }}>Employee Name:</strong>{" "}
                {empData.employeeData.empName}
              </div>
              <div>
                <strong style={{ marginRight: "5px" }}>Email:</strong>{" "}
                {empData.employeeData.email}
              </div>
              <div>
                <strong style={{ marginRight: "5px" }}>Emp ID:</strong>{" "}
                {empData.biometricData.empId}
              </div>
            </div>
          )}
        </div>
        <table className="employee-table" border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Working Hours</th>
            </tr>
          </thead>
          <tbody>
            {empData &&
            empData.biometricData &&
            empData.biometricData.date &&
            empData.biometricData.date.length > 0 ? (
              empData.biometricData.date.map((entry, index) => {
                const month = empData.biometricData.month || "";
                const times = (entry || "")
                  .trim()
                  .split("\n")
                  .map((time) => time.trim())
                  .filter((time) => time);

                let date1 = "-";
                let date2 = "-";
                let timeDifference = "-";
                let dayOfWeek = "-";
                let workingHours = "-hrs";

                if (times.length === 1) {
                  date1 = times[0];
                  dayOfWeek = getDayOfWeek(`${index + 1} ${month} 2024`); // Assuming year 2024
                } else if (times.length > 1) {
                  [date1, date2] = [times[0], times[times.length - 1]];
                  dayOfWeek = getDayOfWeek(`${index + 1} ${month} 2024`); // Assuming year 2024
                  timeDifference = calculateTimeDifference(date1, date2);
                  workingHours = `${timeDifference}hrs`;
                }

                // Check for Sunday and update workingHours accordingly
                if (dayOfWeek === "Sunday") {
                  workingHours = "Holiday";
                } else if (date1 === "-" && date2 === "-") {
                  workingHours = "Absent";
                }

                const formattedMonth = month
                  ? formatMonthWithNumber(month, index)
                  : "-";

                return (
                  <tr key={index}>
                    <td>{formattedMonth}</td>
                    <td>{dayOfWeek}</td>
                    <td>{date1}</td>
                    <td>{date2}</td>
                    <td>{workingHours}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5">No biometric data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EmployeeData;
