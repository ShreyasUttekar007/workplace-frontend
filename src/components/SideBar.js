import React, { useEffect, useState } from "react";
import "../css/sidebar.css";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCab,
  faCar,
  faFile,
  faFolder,
  faHouse,
  faListUl,
  faPersonCirclePlus,
  faPieChart,
  faPodcast,
  faSatelliteDish,
  faSignOutAlt,
  faTrainSubway,
  faUserPlus,
  faUsersLine,
} from "@fortawesome/free-solid-svg-icons";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons/faCalendarAlt";

const SideBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [role2, setRole2] = useState("");
  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const logout = async () => {
    await localforage.removeItem("token");
    await localforage.removeItem("ID");
    await localforage.removeItem("email");
    navigate("/");
  };

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

  const isRoleAllowed = parliamentaryConstituencyRoles.includes(role2);
  const isZoneRoleAllowed = zoneRoles.includes(role2);
  const isEmailAllowed = acceptableEmails.includes(email);

  return (
    <div>
      <div
        className={`w3-sidebar w3-bar-block w3-card w3-animate-left ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="close-div">
          <button className="sidebar-close-button" onClick={closeSidebar}>
            Close &times;
          </button>
          <a href="/welcome" className="w3-bar-item w3-button">
            <div className="main-text-box">
              <FontAwesomeIcon icon={faHouse} className="font-pdf2" size="1x" />
              Home
            </div>
          </a>
          {/* {role === "hr" || role === "user" || role === "ops" ? null : (
            <a href="/momdata" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf2"
                  size="1x"
                />
                MoM Dashboard
              </div>
            </a>
          )} */}
          <a href="/meeting-section" className="w3-bar-item w3-button">
            <div className="main-text-box">
              <FontAwesomeIcon
                icon={faPersonCirclePlus}
                className="font-pdf2"
                size="1x"
              />
              Leader Meeting Section
            </div>
          </a>

          {role === "hr" || role === "user" || role === "ops" ? null : (
            <a href="/reportdata" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf2"
                  size="1x"
                />
                AC Report
              </div>
            </a>
          )}

          {role === "hr" || role === "user" || role === "ops" ? null : (
            <a href="/idi-data" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf2"
                  size="1x"
                />
                IDI Report
              </div>
            </a>
          )}
          {role === "hr" || role === "user" || role === "ops" ? null : (
            <a href="/booth-list" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faListUl}
                  className="font-pdf2"
                  size="1x"
                />
                Booth List
              </div>
            </a>
          )}
          {role === "hr" || role === "user" || role === "ops" ? null : (
            <a href="/candidate-list" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faListUl}
                  className="font-pdf2"
                  size="1x"
                />
                Candidate List
              </div>
            </a>
          )}
          {role === "hr" || role === "user" || role === "ops" ? null : (
            <a href="/media-scan" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faPodcast}
                  className="font-pdf2"
                  size="1x"
                />
                Media Scan
              </div>
            </a>
          )}
          {role === "hr" || role === "user" || role === "ops" ? null : (
            <a href="/caste-dashboard" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faPieChart}
                  className="font-pdf2"
                  size="1x"
                />
                Caste Dashboard
              </div>
            </a>
          )}
          {/* <a href="/state-dashboard" className="w3-bar-item w3-button">
            <div className="main-text-box">
              <FontAwesomeIcon
                icon={faPieChart}
                className="font-pdf2"
                size="1x"
              />
              BI Dashboard
            </div>
          </a> */}
          {role !== "mod" ? null : (
            <a href="/emp-data" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="font-pdf2"
                  size="1x"
                />
                Attendance Records
              </div>
            </a>
          )}
          {role === "ops" ? null : (
            <a href="/leave-section" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="font-pdf2"
                  size="1x"
                />
                Leave Section
              </div>
            </a>
          )}
          {role === "hr" ? null : (
            <a href="/travel-section" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faTrainSubway}
                  className="font-pdf2"
                  size="1x"
                />
                Travel Section
              </div>
            </a>
          )}
          {role === "hr" ? null : (
            <a href="/cab-section" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon icon={faCab} className="font-pdf2" size="1x" />
                Cab Section
              </div>
            </a>
          )}
          {/* {role !== "mod" &&
          role !== "state" ? null : (
            <a href="/survey-dashboard" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faPieChart}
                  className="font-pdf2"
                  size="1x"
                />
                Survey Dashboard
              </div>
            </a>
          )} */}
          {role !== "mod" || role === "ops" ? null : (
            <a href="/userdashboard" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faUsersLine}
                  className="font-pdf2"
                  size="1x"
                />
                User Data
              </div>
            </a>
          )}

          {role !== "mod" &&
          role !== "state" &&
          !isRoleAllowed &&
          !isEmailAllowed ? null : (
            <a
              href="/bmc-intervention-dashboard"
              className="w3-bar-item w3-button"
            >
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf2"
                  size="1x"
                />
                BMC Intervention Dashboard
              </div>
            </a>
          )}

          {role !== "mod" && role !== "state" && !isZoneRoleAllowed ? null : (
            <a
              href="/state-intervention-dashboard"
              className="w3-bar-item w3-button"
            >
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="font-pdf2"
                  size="1x"
                />
                State Intervention Dashboard
              </div>
            </a>
          )}

          {role !== "mod" && role !== "hr" ? null : (
            <a
              href="/nWuRGm1GvLXyCmQ6TbxqfQ7YasvDlY8z87TxUHrX0HUhX0Pxa9"
              className="w3-bar-item w3-button"
            >
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faUserPlus}
                  className="font-pdf2"
                  size="1x"
                />
                Add User
              </div>
            </a>
          )}
          {role !== "mod" &&
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
            <a href="/createMom" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFile}
                  className="font-pdf2"
                  size="1x"
                />
                Add MoM
              </div>
            </a>
          )}
          {role !== "mod" &&
          email !== "sharvil.bhurke@showtimeconsulting.in" ? null : (
            <a href="/create-form17" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFile}
                  className="font-pdf2"
                  size="1x"
                />
                Add Form-17
              </div>
            </a>
          )}
          {role !== "mod" &&
          email !== "sharvil.bhurke@showtimeconsulting.in" ? null : (
            <a href="/gatt-gann" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFile}
                  className="font-pdf2"
                  size="1x"
                />
                Add Gatt-Gann
              </div>
            </a>
          )}
          {role !== "mod" &&
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
            <a href="/createacreport" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFile}
                  className="font-pdf2"
                  size="1x"
                />
                Add AC Report
              </div>
            </a>
          )}
          {role === "hr" || role2 === "user" || role === "ops" ? null : (
            <a href="/create-media-scan" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faSatelliteDish}
                  className="font-pdf2"
                  size="1x"
                />
                Add Media Scan
              </div>
            </a>
          )}
          {role === "hr" || role2 === "user" || role === "ops" ? null : (
            <a href="/bmc-form" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFile}
                  className="font-pdf2"
                  size="1x"
                />
                BMC Interventions
              </div>
            </a>
          )}
          {role === "hr" || role2 === "user" || role === "ops" ? null : (
            <a href="/state-interventions" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFile}
                  className="font-pdf2"
                  size="1x"
                />
                State Interventions
              </div>
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
            <a href="/create-idi" className="w3-bar-item w3-button">
              <div className="main-text-box">
                <FontAwesomeIcon
                  icon={faFile}
                  className="font-pdf2"
                  size="1x"
                />
                Add IDI Report
              </div>
            </a>
          )}

          <a href="/" className="w3-bar-item w3-button" onClick={logout}>
            <div className="main-text-box">
              <FontAwesomeIcon
                icon={faSignOutAlt}
                className="font-pdf2"
                size="1x"
              />
              Logout
            </div>
          </a>
        </div>
      </div>

      <div id="main">
        <button id="openNav" className="sidebar-button" onClick={openSidebar}>
          &#9776;
        </button>
      </div>
    </div>
  );
};

export default SideBar;
