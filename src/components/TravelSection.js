import React, { useState, useEffect } from "react";
import localforage from "localforage";
import "../css/welcomepage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faCalendarDays,
  faCalendarPlus,
} from "@fortawesome/free-solid-svg-icons";
import Dashboard from "./Dashboard";

const TravelSection = () => {
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
        <h2 className="head-text-welcome">Travel Section</h2>
        <div className="buttons">
          <a href="/travel-request-user-data" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCalendarDay}
              className="font-pdf"
              size="3x"
            />
            Check Travel Status
          </a>
          <a href="/request-travel" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCalendarPlus}
              className="font-pdf"
              size="3x"
            />
            Request Travel
          </a>
          {
          role !== "ops"? null : (
          <a href="/travel-request-ops-data" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="font-pdf"
              size="3x"
            />
            Admin Travel Data
          </a>)}
          {role !== "mod"? null : (
          <a href="/travel-request-admin-data" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="font-pdf"
              size="3x"
            />
            Admin Travel Data
          </a>)}
        </div>
      </div>
    </>
  );
};

export default TravelSection;
