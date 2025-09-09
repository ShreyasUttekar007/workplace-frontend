import React, { useEffect, useState } from "react";
import DashboardReport from "./DashboardReport";
import localforage from "localforage";

const Card = ({ imageSrc, title, link, onCardClick }) => {
  return (
    <div
      onClick={onCardClick}
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "pointer",
        padding: "20px",
        margin: "20px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <img
        src={imageSrc}
        alt={title}
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          padding: "16px",
          background: "#fff",
        }}
      >
        <h2
          style={{
            margin: "0",
            fontSize: "26px",
            textAlign: "center",
          }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
};

const StateDashboard = () => {
  const [iframeSrc, setIframeSrc] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");

  const handleCardClick = () => {
    setIframeSrc(
      "https://app.powerbi.com/view?r=eyJrIjoiNjMxMGJiYjAtMzFiOC00NGU1LWEzYWItNDAwYjI5MTM5YTg3IiwidCI6ImE0NDY0OWI4LTg3ZDQtNDUyNC04ZjYwLTEwNTgxMGRhZDRiNiJ9"
    );
  };

  const handleCardClick2 = () => {
    setIframeSrc(
      "https://app.powerbi.com/view?r=eyJrIjoiNGEwZTczMjYtN2Y2Zi00NjIzLWE2ZTMtZTIyOTI3NTc2MjJmIiwidCI6ImE0NDY0OWI4LTg3ZDQtNDUyNC04ZjYwLTEwNTgxMGRhZDRiNiJ9"
    );
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedRole = await localforage.getItem("role");
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

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const storedLocation = await localforage.getItem("location");
        if (storedLocation) {
          setLocation(storedLocation);
        } else {
          console.log("Email not found in localforage.");
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };
    fetchUserEmail();
  }, []);

  return (
    <div>
      <DashboardReport />
      {!iframeSrc ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            flexWrap: "wrap",
          }}
        >
          {location === "Maharashtra" ? null : (
            <Card
              imageSrc="https://www.scnsoft.com/images-for-demo/power-bi.png"
              title="State Dashboard"
              onCardClick={handleCardClick2}
            />
          )}
          {email === "sachintiwari@showtimeconsulting.in" &&
          email === "tanay.mishra@showtimeconsulting.in" &&
          email === "shreyas.uttekar@showtimeconsulting.in" ? (
            <Card
              imageSrc="https://www.scnsoft.com/images-for-demo/power-bi.png"
              title="Municipal Corporation"
              onCardClick={handleCardClick}
            />
          ) : null}
        </div>
      ) : (
        <iframe
          src={iframeSrc}
          title="iframe"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            border: "none",
            zIndex: "1000",
          }}
        />
      )}
    </div>
  );
};

export default StateDashboard;
