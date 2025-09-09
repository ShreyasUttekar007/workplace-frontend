import React, { useState, useEffect } from "react";
import localforage from "localforage";
import "../css/welcomepage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faCalendarDays,
  faCalendarPlus,
  faFolder,
} from "@fortawesome/free-solid-svg-icons";
import Dashboard from "./Dashboard";
import DownloadCSV from "./DownloadCSV";

const LeaderMeetingSection = () => {
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
        <h2 className="head-text-welcome">Leader Meeting Section</h2>
        <div className="buttons">
          <a href="/new-mom" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCalendarPlus}
              className="font-pdf"
              size="3x"
            />
            Add Meeting/Event
          </a>
          {role === "user" || role === "hr" || role === "ops" ? null : (
            <a href="/list-new-mom" className="menu-buttons">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="font-pdf"
                size="3x"
              />
              Meeting Dashboard
            </a>
          )}
          {role === "hr" || role === "user" || role === "ops" ? null : (
            <a href="/momdata" className="menu-buttons">
              <FontAwesomeIcon icon={faFolder} className="font-pdf" size="3x" />
              Old MoM's
            </a>
          )}
          {role !== "mod" && role !== "state" &&
            email !== "ashish@showtimeconsulting.in" &&
            email !== "aparnaj@showtimeconsulting.in" &&
            email !== "rajvardhan@showtimeconsulting.in" &&
            email !== "aditiambekar@showtimeconsulting.in" &&
            email !== "hardik.parab@showtimeconsulting.in" &&
            email !== "guttedar.kiran@showtimeconsulting.in" ? null : (
            <a href="/new-mom-summary" className="menu-buttons">
              <FontAwesomeIcon icon={faFolder} className="font-pdf" size="3x" />
              Leader Meeting Report
            </a>
          )}
        </div>
      </div>
    </>
  );
};

export default LeaderMeetingSection;
