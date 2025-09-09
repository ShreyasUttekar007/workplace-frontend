import React, { useState, useEffect } from "react";
import localforage from "localforage";
import "../css/welcomepage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCab,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import Dashboard from "./Dashboard";
import DownloadCSV from "./DownloadCSV";

const CabSection = () => {
  const [userName, setUserName] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [email, setEmail] = useState("");

  const [role, setRole] = useState("");

  useEffect(() => {
    localforage.getItem("userName").then((name) => {
      if (name) {
        setUserName(name);
      }
    });

    localforage.getItem("roles").then((roles) => {
      if (roles) {
        setUserRoles(roles.map((role) => role.toUpperCase()));
      }
    });
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedRole = await localforage.getItem("role1");
        if (storedRole) {
          setRole(storedRole);
        } else {
          console.log("Role not found in localforage.");
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const storedEmail = await localforage.getItem("email");
        if (storedEmail) {
          setEmail(storedEmail);
        } else {
          console.log("Email not found in localforage.");
        }
      } catch (error) {
        console.error("Error fetching email:", error);
      }
    };
    fetchUserEmail();
  }, []);

  return (
    <>
      <Dashboard />
      <div className="main-welcome">
        <h1 className="header">Welcome, {userName}!</h1>
      </div>
      <div className="buttons-container">
        <h2 className="head-text-welcome">Cab Section</h2>
        <div className="buttons">
          <a href="/cab-request" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCab}
              className="font-pdf"
              size="3x"
            />
            Request Cab
          </a>
          <a href="/cab-requests-rm" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCab}
              className="font-pdf"
              size="3x"
            />
            Cab Request Approval
          </a>
          {
          role !== "ops"? null : (
          <a href="/cab-dashboard" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="font-pdf"
              size="3x"
            />
            Admin Cab Data
          </a>)}
          {role !== "mod"? null : (
          <a href="/cab-dashboard" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="font-pdf"
              size="3x"
            />
            Admin Cab Data
          </a>)}
          {role !== "mod" ? null : (
          <DownloadCSV />
          )}
        </div>
      </div>
    </>
  );
};

export default CabSection;
