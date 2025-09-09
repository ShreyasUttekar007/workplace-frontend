import React, { useState, useEffect } from "react";
import localforage from "localforage";
import "../css/welcomepage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCab,
  faCalendarAlt,
  faCalendarDay,
  faFile,
  faFolder,
  faPersonCircleCheck,
  faPersonCirclePlus,
  faPieChart,
  faPodcast,
  faSatelliteDish,
  faTrainSubway,
  faUserPlus,
  faUsersLine,
} from "@fortawesome/free-solid-svg-icons";
import DashboardIDI from "./DashboardIDI";
import { faListUl } from "@fortawesome/free-solid-svg-icons/faListUl";

const WelcomePage = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const [role, setRole] = useState("");
  const [role2, setRole2] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    localforage.getItem("userName").then((name) => {
      if (name) {
        setUserName(name);
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
    const fetchUserRole = async () => {
      try {
        const storedRole = await localforage.getItem("role");
        if (storedRole) {
          setRole2(storedRole);
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
    const fetchUserLocation = async () => {
      try {
        const storedLocation = await localforage.getItem("location");
        if (storedLocation) {
          setLocation(storedLocation);
        } else {
          console.log("Location not found in localforage.");
        }
      } catch (error) {
        console.error("Error fetching Location:", error);
      }
    };

    fetchUserLocation();
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

  const parliamentaryConstituencyRoles = [
    // "1-Nandurbar (ST)",
    // "10-Nagpur",
    // "11-Bhandara-Gondiya",
    // "12-Gadchiroli-Chimur (ST)",
    // "13-Chandrapur",
    // "14-Yavatmal-Washim",
    // "15-Hingoli",
    // "16-Nanded",
    // "17-Parbhani",
    // "18-Jalna",
    // "19-Chatrapati Sambhaji Nagar",
    // "2-Dhule",
    // "20-Dindori (ST)",
    // "21-Nashik",
    // "22-Palghar (ST)",
    // "23-Bhiwandi",
    // "24-Kalyan",
    // "25-Thane",
    "26-Mumbai North",
    "27-Mumbai North-West",
    "28-Mumbai North-East",
    "29-Mumbai North-Central",
    // "3-Jalgaon",
    "30-Mumbai South-Central",
    "31-Mumbai South",
    // "32-Raigad",
    // "33-Maval",
    // "34-Pune",
    // "35-Baramati",
    // "36-Shirur",
    // "37-Ahmednagar",
    // "38-Shirdi (SC)",
    // "39-Beed",
    // "4-Raver",
    // "40-Dharashiv",
    // "41-Latur (SC)",
    // "42-Solapur (SC)",
    // "43-Madha",
    // "44-Sangli",
    // "45-Satara",
    // "46-Ratnagiri-Sindhudurg",
    // "47-Kolhapur",
    // "48-Hatkanangle",
    // "5-Buldhana",
    // "6-Akola",
    // "7-Amravati (SC)",
    // "8-Wardha",
    // "9-Ramtek (SC)",
  ];

  const zoneRoles = [
    "Eastern Vidarbha",
    "Konkan",
    "Marathwada",
    "Mumbai",
    "Northern Maharashtra",
    "Thane + Palghar",
    "Western Maharashtra",
    "Western Vidarbha",
  ];

  const acceptableEmails = [
    "ashok.pawar@showtimeconsulting.in",
    "shipra.bhardwaj@showtimeconsulting.in",
    "anil.agarwal@showtimeconsulting.in",
    "souvik.basak@showtimeconsulting.in",
    "prashant.sapkal@showtimeconsulting.in",
    "ashutosh.pandey@showtimeconsulting.in",
    "anirban@showtimeconsulting.in",
    "mandanna@showtimeconsulting.in",
    "abhishek.behara@showtimeconsulting.in",
  ];
  const isEmailAllowed = acceptableEmails.includes(email);
  const isRoleAllowed = parliamentaryConstituencyRoles.includes(role2);
  const isZoneRoleAllowed = zoneRoles.includes(role2);

  return (
    <>
      <DashboardIDI />
      <div className="main-welcome">
        <h1 className="header">Welcome, {userName}!</h1>
      </div>
      {location === "Andhra Pradesh" && (
        <div className="buttons-container">
          <h2 className="head-text-welcome">Dashboards</h2>
          <div className="buttons">
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/reportdata" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                Political Reports
              </a>
            )}
            {/* {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/momdata" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                MoM Dashboard
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/reportdata" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                AC Report
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/idi-data" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                IDI Dashboard
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/booth-list" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faListUl}
                  className="font-pdf"
                  size="3x"
                />
                Booth List
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/candidate-list" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faListUl}
                  className="font-pdf"
                  size="3x"
                />
                Candidate List
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/media-scan" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPodcast}
                  className="font-pdf"
                  size="3x"
                />
                Media Scan
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/caste-dashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPieChart}
                  className="font-pdf"
                  size="3x"
                />
                Caste Dashboard
              </a>
            )} */}
            {/* <a href="/state-dashboard" className="menu-buttons">
            <FontAwesomeIcon icon={faPieChart} className="font-pdf" size="3x" />
            BI Dashboard
          </a> */}
            {/* {role !== "mod" ? null : (
              <a href="/emp-data" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="font-pdf"
                  size="3x"
                />
                Attendance Records
              </a>
            )} */}
            {role !== "mod" &&
            role !== "state" &&
            email !== "akhilesh@showtimeconsulting.in" &&
            email !== "siddharthag@showtimeconsulting.in" ? null : (
              <a href="/state-dashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPieChart}
                  className="font-pdf"
                  size="3x"
                />
                Retrospective Analyzed Dashboard
              </a>
            )}
            {role !== "mod" &&
            email !== "akhilesh@showtimeconsulting.in" &&
            email !== "siddharthag@showtimeconsulting.in" ? null : (
              <a href="/caste-dashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPieChart}
                  className="font-pdf"
                  size="3x"
                />
                State Caste Dashboard
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/meeting-section" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPersonCirclePlus}
                  className="font-pdf"
                  size="3x"
                />
                Leader Meeting Section
              </a>
            )}
            {role !== "mod" && role !== "hr" ? null : (
              <a href="/userdashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faUsersLine}
                  className="font-pdf"
                  size="3x"
                />
                User Data
              </a>
            )}
            {/* {role !== "mod" &&
            role !== "state" &&
            !isRoleAllowed &&
            !isEmailAllowed ? null : (
              <a href="/bmc-intervention-dashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                BMC Intervention Dashboard
              </a>
            )}
            {role !== "mod" && role !== "state" && !isZoneRoleAllowed ? null : (
              <a href="/state-intervention-dashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                State Intervention Dashboard
              </a>
            )} */}
            {role === "ops" ? null : (
              <a href="/leave-section" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faCalendarDay}
                  className="font-pdf"
                  size="3x"
                />
                Leave Section
              </a>
            )}
            {role === "hr" ? null : (
              <a href="/travel-section" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faTrainSubway}
                  className="font-pdf"
                  size="3x"
                />
                Travel Section
              </a>
            )}
            {role === "hr" ? null : (
              <a href="/cab-section" className="menu-buttons">
                <FontAwesomeIcon icon={faCab} className="font-pdf" size="3x" />
                Cab Section
              </a>
            )}
          </div>
          {role !== "mod" ? null : (
            <h2 className="head-text-welcome">Upload Data</h2>
          )}
          <div className="buttons2">
            {role !== "mod" && role !== "hr" ? null : (
              <a
                href="/nWuRGm1GvLXyCmQ6TbxqfQ7YasvDlY8z87TxUHrX0HUhX0Pxa9"
                className="menu-buttons"
              >
                <FontAwesomeIcon
                  icon={faUserPlus}
                  className="font-pdf"
                  size="3x"
                />
                Add User
              </a>
            )}
            {/* {role !== "mod" &&
            role !== "soul" &&
            email !== "aditiambekar@showtimeconsulting.in" &&
            email !== "sagar.jadhav@showtimeconsulting.in" &&
            email !== "akash.jaywant@showtimeconsulting.in" &&
            email !== "pratikubale@showtimeconsulting.in" &&
            email !== "kaustavv.das@showtimeconsulting.in" &&
            email !== "hardik.parab@showtimeconsulting.in" &&
            email !== "vinay.gowda@showtimeconsulting.in" &&
            email !== "koushik@showtimeconsulting.in" &&
            email !== "somali@showtimeconsulting.in" &&
            email !== "govind.lilhare@showtimeconsulting.in" ? null : (
              <a href="/createMom" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add MoM
              </a>
            )}
            {role !== "mod" &&
            email !== "sharvil.bhurke@showtimeconsulting.in" ? null : (
              <a href="/create-form17" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add Form-17
              </a>
            )}
            {role !== "mod" &&
            email !== "sharvil.bhurke@showtimeconsulting.in" ? null : (
              <a href="/gatt-gann" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add Gatt-Gann
              </a>
            )}
            {role !== "mod" &&
            role !== "soul" &&
            email !== "aditiambekar@showtimeconsulting.in" &&
            email !== "sagar.jadhav@showtimeconsulting.in" &&
            email !== "pratikubale@showtimeconsulting.in" &&
            email !== "akash.jaywant@showtimeconsulting.in" &&
            email !== "kaustavv.das@showtimeconsulting.in" &&
            email !== "hardik.parab@showtimeconsulting.in" &&
            email !== "vinay.gowda@showtimeconsulting.in" &&
            email !== "koushik@showtimeconsulting.in" &&
            email !== "somali@showtimeconsulting.in" &&
            email !== "govind.lilhare@showtimeconsulting.in" ? null : (
              <a href="/createacreport" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add AC Report
              </a>
            )}
            {role === "hr" || role2 === "user" || role === "ops" ? null : (
              <a href="/create-media-scan" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faSatelliteDish}
                  className="font-pdf"
                  size="3x"
                />
                Add Media Scan
              </a>
            )}
            {role === "hr" || role2 === "user" || role === "ops" ? null : (
              <a href="/bmc-form" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                BMC Interventions
              </a>
            )}
            {role === "hr" || role2 === "user" || role === "ops" ? null : (
              <a href="/state-interventions" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                State Interventions
              </a>
            )}
            {role !== "mod" &&
            role !== "soul" &&
            email !== "aditiambekar@showtimeconsulting.in" &&
            email !== "sagar.jadhav@showtimeconsulting.in" &&
            email !== "pratikubale@showtimeconsulting.in" &&
            email !== "akash.jaywant@showtimeconsulting.in" &&
            email !== "kaustavv.das@showtimeconsulting.in" &&
            email !== "somali@showtimeconsulting.in" &&
            email !== "hardik.parab@showtimeconsulting.in" &&
            email !== "vinay.gowda@showtimeconsulting.in" &&
            email !== "govind.lilhare@showtimeconsulting.in" ? null : (
              <a href="/create-idi" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add IDI Report
              </a>
            )} */}
          </div>
        </div>
      )}
      {location === "Maharashtra" && (
        <div className="buttons-container">
          <h2 className="head-text-welcome">Dashboards</h2>
          <div className="buttons">
            {/* {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/momdata" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                MoM Dashboard
              </a>
            )} */}
            {role !== "mod" &&
            role !== "state" &&
            !isRoleAllowed &&
            !isEmailAllowed ? null : (
              <a href="/bmc-intervention-dashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                BMC Intervention Dashboard
              </a>
            )}
            {role !== "mod" && role !== "state" && !isZoneRoleAllowed ? null : (
              <a href="/state-intervention-dashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                State Intervention Dashboard
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/meeting-section" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPersonCirclePlus}
                  className="font-pdf"
                  size="3x"
                />
                Leader Meeting Section
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/probable-joinees-section" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPersonCircleCheck}
                  className="font-pdf"
                  size="3x"
                />
                Probable Joinees Section
              </a>
            )}
            {role === "ops" ? null : (
              <a href="/leave-section" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faCalendarDay}
                  className="font-pdf"
                  size="3x"
                />
                Leave Section
              </a>
            )}
            {role === "hr" ? null : (
              <a href="/travel-section" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faTrainSubway}
                  className="font-pdf"
                  size="3x"
                />
                Travel Section
              </a>
            )}
            {role === "hr" ? null : (
              <a href="/cab-section" className="menu-buttons">
                <FontAwesomeIcon icon={faCab} className="font-pdf" size="3x" />
                Cab Section
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/reportdata" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                AC Report
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/idi-data" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                IDI Dashboard
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/booth-list" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faListUl}
                  className="font-pdf"
                  size="3x"
                />
                Booth List
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/candidate-list" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faListUl}
                  className="font-pdf"
                  size="3x"
                />
                Candidate List
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/media-scan" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPodcast}
                  className="font-pdf"
                  size="3x"
                />
                Media Scan
              </a>
            )}
            {role === "hr" ||
            role === "user" ||
            role === "ops" ||
            email !== "gautam.pandey@showtimeconsulting.in" ? null : (
              <a href="/caste-dashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPieChart}
                  className="font-pdf"
                  size="3x"
                />
                Caste Dashboard
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/mumbai-castes" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPieChart}
                  className="font-pdf"
                  size="3x"
                />
                BMC Caste Dashboard
              </a>
            )}
            <a href="/state-dashboard" className="menu-buttons">
              <FontAwesomeIcon
                icon={faPieChart}
                className="font-pdf"
                size="3x"
              />
              BI Dashboard
            </a>
            {role !== "mod" ? null : (
              <a href="/emp-data" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="font-pdf"
                  size="3x"
                />
                Attendance Records
              </a>
            )}
            {/* {role !== "mod" &&
          role !== "state" ? null : (
            <a href="/survey-dashboard" className="menu-buttons">
              <FontAwesomeIcon
                icon={faPieChart}
                className="font-pdf"
                size="3x"
              />
              Survey Dashboard
            </a>
          )} */}
            {role !== "mod" && role !== "hr" ? null : (
              <a href="/userdashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faUsersLine}
                  className="font-pdf"
                  size="3x"
                />
                User Data
              </a>
            )}
          </div>
          {role2 === "user" || role === "ops" ? null : (
            <h2 className="head-text-welcome">Upload Data</h2>
          )}
          <div className="buttons2">
            {role !== "mod" && role !== "hr" ? null : (
              <a
                href="/nWuRGm1GvLXyCmQ6TbxqfQ7YasvDlY8z87TxUHrX0HUhX0Pxa9"
                className="menu-buttons"
              >
                <FontAwesomeIcon
                  icon={faUserPlus}
                  className="font-pdf"
                  size="3x"
                />
                Add User
              </a>
            )}
            {/* {role !== "mod" &&
            role !== "soul" &&
            email !== "aditiambekar@showtimeconsulting.in" &&
            email !== "sagar.jadhav@showtimeconsulting.in" &&
            email !== "akash.jaywant@showtimeconsulting.in" &&
            email !== "pratikubale@showtimeconsulting.in" &&
            email !== "kaustavv.das@showtimeconsulting.in" &&
            email !== "hardik.parab@showtimeconsulting.in" &&
            email !== "vinay.gowda@showtimeconsulting.in" &&
            email !== "koushik@showtimeconsulting.in" &&
            email !== "somali@showtimeconsulting.in" &&
            email !== "govind.lilhare@showtimeconsulting.in" ? null : (
              <a href="/createMom" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add MoM
              </a>
            )} */}
            {role !== "mod" &&
            email !== "sharvil.bhurke@showtimeconsulting.in" ? null : (
              <a href="/create-form17" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add Form-17
              </a>
            )}
            {role !== "mod" &&
            email !== "sharvil.bhurke@showtimeconsulting.in" ? null : (
              <a href="/gatt-gann" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add Gatt-Gann
              </a>
            )}
            {role !== "mod" &&
            role !== "soul" &&
            email !== "aditiambekar@showtimeconsulting.in" &&
            email !== "sagar.jadhav@showtimeconsulting.in" &&
            email !== "pratikubale@showtimeconsulting.in" &&
            email !== "akash.jaywant@showtimeconsulting.in" &&
            email !== "kaustavv.das@showtimeconsulting.in" &&
            email !== "hardik.parab@showtimeconsulting.in" &&
            email !== "vinay.gowda@showtimeconsulting.in" &&
            email !== "koushik@showtimeconsulting.in" &&
            email !== "somali@showtimeconsulting.in" &&
            email !== "govind.lilhare@showtimeconsulting.in" ? null : (
              <a href="/createacreport" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add AC Report
              </a>
            )}
            {role === "hr" || role2 === "user" || role === "ops" ? null : (
              <a href="/create-media-scan" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faSatelliteDish}
                  className="font-pdf"
                  size="3x"
                />
                Add Media Scan
              </a>
            )}
            {role === "hr" || role2 === "user" || role === "ops" ? null : (
              <a href="/bmc-form" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                BMC Interventions
              </a>
            )}
            {role === "hr" || role2 === "user" || role === "ops" ? null : (
              <a href="/state-interventions" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                State Interventions
              </a>
            )}
            {role !== "mod" &&
            role !== "soul" &&
            email !== "aditiambekar@showtimeconsulting.in" &&
            email !== "sagar.jadhav@showtimeconsulting.in" &&
            email !== "pratikubale@showtimeconsulting.in" &&
            email !== "akash.jaywant@showtimeconsulting.in" &&
            email !== "kaustavv.das@showtimeconsulting.in" &&
            email !== "somali@showtimeconsulting.in" &&
            email !== "hardik.parab@showtimeconsulting.in" &&
            email !== "vinay.gowda@showtimeconsulting.in" &&
            email !== "govind.lilhare@showtimeconsulting.in" ? null : (
              <a href="/create-idi" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add IDI Report
              </a>
            )}
          </div>
        </div>
      )}
      {location === "Bengal" && (
        <div className="buttons-container">
          <h2 className="head-text-welcome">Dashboards</h2>
          <div className="buttons">
            {/* {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/momdata" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                MoM Dashboard
              </a>
            )} */}
            {/* {role !== "mod" &&
            role !== "state" &&
            !isRoleAllowed &&
            !isEmailAllowed ? null : (
              <a href="/bmc-intervention-dashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                BMC Intervention Dashboard
              </a>
            )}
            {role !== "mod" && role !== "state" && !isZoneRoleAllowed ? null : (
              <a href="/state-intervention-dashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                State Intervention Dashboard
              </a>
            )} */}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/meeting-section" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPersonCirclePlus}
                  className="font-pdf"
                  size="3x"
                />
                Leader Meeting Section
              </a>
            )}
            {/* {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/probable-joinees-section" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPersonCircleCheck}
                  className="font-pdf"
                  size="3x"
                />
                Probable Joinees Section
              </a>
            )} */}
            {role === "ops" ? null : (
              <a href="/leave-section" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faCalendarDay}
                  className="font-pdf"
                  size="3x"
                />
                Leave Section
              </a>
            )}
            {role === "hr" ? null : (
              <a href="/travel-section" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faTrainSubway}
                  className="font-pdf"
                  size="3x"
                />
                Travel Section
              </a>
            )}
            {/* {role === "hr" ? null : (
              <a href="/cab-section" className="menu-buttons">
                <FontAwesomeIcon icon={faCab} className="font-pdf" size="3x" />
                Cab Section
              </a>
            )} */}
            {/* {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/reportdata" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                AC Report
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/idi-data" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf"
                  size="3x"
                />
                IDI Dashboard
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/booth-list" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faListUl}
                  className="font-pdf"
                  size="3x"
                />
                Booth List
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/candidate-list" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faListUl}
                  className="font-pdf"
                  size="3x"
                />
                Candidate List
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/media-scan" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPodcast}
                  className="font-pdf"
                  size="3x"
                />
                Media Scan
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" || email !=="gautam.pandey@showtimeconsulting.in"? null : (
              <a href="/caste-dashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPieChart}
                  className="font-pdf"
                  size="3x"
                />
                Caste Dashboard
              </a>
            )}
            {role === "hr" || role === "user" || role === "ops" ? null : (
              <a href="/mumbai-castes" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faPieChart}
                  className="font-pdf"
                  size="3x"
                />
                BMC Caste Dashboard
              </a>
            )}
            <a href="/state-dashboard" className="menu-buttons">
            <FontAwesomeIcon icon={faPieChart} className="font-pdf" size="3x" />
            BI Dashboard
          </a>
            {role !== "mod" ? null : (
              <a href="/emp-data" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="font-pdf"
                  size="3x"
                />
                Attendance Records
              </a>
            )} */}
            {/* {role !== "mod" &&
          role !== "state" ? null : (
            <a href="/survey-dashboard" className="menu-buttons">
              <FontAwesomeIcon
                icon={faPieChart}
                className="font-pdf"
                size="3x"
              />
              Survey Dashboard
            </a>
          )} */}
            {role !== "mod" && role !== "hr" ? null : (
              <a href="/userdashboard" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faUsersLine}
                  className="font-pdf"
                  size="3x"
                />
                User Data
              </a>
            )}
          </div>
          {role !== "mod" ? null : (
            <h2 className="head-text-welcome">Upload Data</h2>
          )}
          <div className="buttons2">
            {role !== "mod" && role !== "hr" ? null : (
              <a
                href="/nWuRGm1GvLXyCmQ6TbxqfQ7YasvDlY8z87TxUHrX0HUhX0Pxa9"
                className="menu-buttons"
              >
                <FontAwesomeIcon
                  icon={faUserPlus}
                  className="font-pdf"
                  size="3x"
                />
                Add User
              </a>
            )}
            {/* {role !== "mod" &&
            role !== "soul" &&
            email !== "aditiambekar@showtimeconsulting.in" &&
            email !== "sagar.jadhav@showtimeconsulting.in" &&
            email !== "akash.jaywant@showtimeconsulting.in" &&
            email !== "pratikubale@showtimeconsulting.in" &&
            email !== "kaustavv.das@showtimeconsulting.in" &&
            email !== "hardik.parab@showtimeconsulting.in" &&
            email !== "vinay.gowda@showtimeconsulting.in" &&
            email !== "koushik@showtimeconsulting.in" &&
            email !== "somali@showtimeconsulting.in" &&
            email !== "govind.lilhare@showtimeconsulting.in" ? null : (
              <a href="/createMom" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add MoM
              </a>
            )} */}
            {/* {role !== "mod" &&
            email !== "sharvil.bhurke@showtimeconsulting.in" ? null : (
              <a href="/create-form17" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add Form-17
              </a>
            )}
            {role !== "mod" &&
            email !== "sharvil.bhurke@showtimeconsulting.in" ? null : (
              <a href="/gatt-gann" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add Gatt-Gann
              </a>
            )}
            {role !== "mod" &&
            role !== "soul" &&
            email !== "aditiambekar@showtimeconsulting.in" &&
            email !== "sagar.jadhav@showtimeconsulting.in" &&
            email !== "pratikubale@showtimeconsulting.in" &&
            email !== "akash.jaywant@showtimeconsulting.in" &&
            email !== "kaustavv.das@showtimeconsulting.in" &&
            email !== "hardik.parab@showtimeconsulting.in" &&
            email !== "vinay.gowda@showtimeconsulting.in" &&
            email !== "koushik@showtimeconsulting.in" &&
            email !== "somali@showtimeconsulting.in" &&
            email !== "govind.lilhare@showtimeconsulting.in" ? null : (
              <a href="/createacreport" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add AC Report
              </a>
            )}
            {role === "hr" || role2 === "user" || role === "ops" ? null : (
              <a href="/create-media-scan" className="menu-buttons">
                <FontAwesomeIcon
                  icon={faSatelliteDish}
                  className="font-pdf"
                  size="3x"
                />
                Add Media Scan
              </a>
            )}
            {role === "hr" || role2 === "user" || role === "ops" ? null : (
              <a href="/bmc-form" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                BMC Interventions
              </a>
            )}
            {role === "hr" || role2 === "user" || role === "ops" ? null : (
              <a href="/state-interventions" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                State Interventions
              </a>
            )} */}
            {/* {role !== "mod" &&
            role !== "soul" &&
            email !== "aditiambekar@showtimeconsulting.in" &&
            email !== "sagar.jadhav@showtimeconsulting.in" &&
            email !== "pratikubale@showtimeconsulting.in" &&
            email !== "akash.jaywant@showtimeconsulting.in" &&
            email !== "kaustavv.das@showtimeconsulting.in" &&
            email !== "somali@showtimeconsulting.in" &&
            email !== "hardik.parab@showtimeconsulting.in" &&
            email !== "vinay.gowda@showtimeconsulting.in" &&
            email !== "govind.lilhare@showtimeconsulting.in" ? null : (
              <a href="/create-idi" className="menu-buttons">
                <FontAwesomeIcon icon={faFile} className="font-pdf" size="3x" />
                Add IDI Report
              </a>
            )} */}
          </div>
        </div>
      )}
    </>
  );
};

export default WelcomePage;
