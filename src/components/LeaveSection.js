import React, { useState, useEffect } from "react";
import localforage from "localforage";
import "../css/welcomepage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCalendarCheck,
  faCalendarDay,
  faCalendarDays,
  faCalendarPlus,
  faFileArchive,
  faFileContract,
} from "@fortawesome/free-solid-svg-icons";
import Dashboard from "./Dashboard";

const LeaveSection = () => {
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
        <h2 className="head-text-welcome">Leave Section</h2>
        <div className="buttons">
          <a href="/leave-data" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCalendarDay}
              className="font-pdf"
              size="3x"
            />
            Check Leave Status
          </a>
          <a href="/leave-form" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCalendarPlus}
              className="font-pdf"
              size="3x"
            />
            Request Leave
          </a>
          <a href="/maha-holiday-calendar" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="font-pdf"
              size="3x"
            />
            Holiday Calendar
          </a>
          <a href="/leave-data-rm" className="menu-buttons">
            <FontAwesomeIcon
              icon={faCalendarCheck}
              className="font-pdf"
              size="3x"
            />
            Leave Request Approvals
          </a>
          <a
            href="https://mom-files-data-new.s3.ap-south-1.amazonaws.com/holiday-policy/Attendance%2C+Leave%2C+policy+For+Portal.pdf"
            className="menu-buttons"
          >
            <FontAwesomeIcon
              icon={faFileContract}
              className="font-pdf"
              size="3x"
            />
            Leave Policy
          </a>
          {role !== "hr" &&
          email !== "shreyas.uttekar@showtimeconsulting.in" &&
          email !== "saumitra@showtimeconsulting.ina" &&
          email !== "anuragsaxena@showtimeconsulting.in" &&
          email !== "at@showtimeconsulting.in" ? null : (
            <a href="/leave-data-admin" className="menu-buttons">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="font-pdf"
                size="3x"
              />
              Admin Leave Data
            </a>
          )}
        </div>
      </div>
    </>
  );
};

export default LeaveSection;
