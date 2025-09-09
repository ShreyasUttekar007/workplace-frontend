import React, { useState, useEffect } from "react";
import DashboardReport from "./DashboardReport";
import localforage from "localforage";

const Card = ({ imageSrc, title, onCardClick }) => {
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

const SurveyDashboard = () => {
  const [iframeSrc, setIframeSrc] = useState("");
  const [email, setEmail] = useState("");
  const [dashboardLinks, setDashboardLinks] = useState([]);

  useEffect(() => {
    // Fetch the email from localforage
    localforage.getItem("email").then((value) => {
      if (value) {
        setEmail(value);
        // Set the dashboards based on the email
        const dashboards = getDashboardLinksForEmail(value);
        setDashboardLinks(dashboards);
      }
    });
  }, []);

  const getDashboardLinksForEmail = (email) => {
    const dashboardLinksWithUsers = [
      {
        title: "Assembly Survey",
        imageSrc: "https://www.scnsoft.com/images-for-demo/power-bi.png",
        link: "https://app.powerbi.com/view?r=eyJrIjoiMWE0YTUzNjMtYjMyYy00N2IwLTkwYjYtYWQzNjVmN2M2NGFiIiwidCI6ImE0NDY0OWI4LTg3ZDQtNDUyNC04ZjYwLTEwNTgxMGRhZDRiNiJ9",
        users: [
          "samarth@showtimeconsulting.in",
          "anuragsaxena@showtimeconsulting.in",
          "at@showtimeconsulting.in",
          "prasad.p@showtimeconsulting.in",
          "shantanu@showtimeconsulting.in",
          "robbinsharrma@showtimeconsulting.in",
          "tushar.kashyap@showtimeconsulting.in",
          "debjyoti@showtimeconsulting.in",
          "alimpan@showtimeconsulting.in",
          "shreyas@showtimeconsulting.in",
          "sonkar.shalini@showtimeconsulting.in",
          "tanay.mishra@showtimeconsulting.in",
          "sachintiwari@showtimeconsulting.in",
          "siddharthag@showtimeconsulting.in",
          "rajvardhan@showtimeconsulting.in",
        ],
      },
      {
        title: "Mumbai Assembly Survey",
        imageSrc: "https://www.scnsoft.com/images-for-demo/power-bi.png",
        link: "https://app.powerbi.com/view?r=eyJrIjoiMGJjNDQxOWQtOTZiOS00MzI1LTkwYmMtZDQ0NjQxZGI2NTAyIiwidCI6ImE0NDY0OWI4LTg3ZDQtNDUyNC04ZjYwLTEwNTgxMGRhZDRiNiJ9",
        users: [
          "aparnaj@showtimeconsulting.in",
          "shipra.bhardwaj@showtimeconsulting.in",
          "debjyoti@showtimeconsulting.in"
        ],
      },
      {
        title: "Thane Assembly Survey",
        imageSrc: "https://www.scnsoft.com/images-for-demo/power-bi.png",
        link: "https://app.powerbi.com/view?r=eyJrIjoiMzgwMGM3NDktYTZmNC00ZWMxLWI0ZTQtZWQ5NzRlNzQ3ZDAyIiwidCI6ImE0NDY0OWI4LTg3ZDQtNDUyNC04ZjYwLTEwNTgxMGRhZDRiNiJ9",
        users: [
          "anirban@showtimeconsulting.in",
          "praveenkumar@showtimeconsulting.in",
          "tammana@showtimeconsulting.in",
        ],
      },
      {
        title: "Vidharbha Assembly Survey",
        imageSrc: "https://www.scnsoft.com/images-for-demo/power-bi.png",
        link: "https://app.powerbi.com/view?r=eyJrIjoiYThlZGFkN2MtMGIxOS00YWMxLThkNDEtNDczNGJmZTliOTg0IiwidCI6ImE0NDY0OWI4LTg3ZDQtNDUyNC04ZjYwLTEwNTgxMGRhZDRiNiJ9",
        users: [
          "souvik.basak@showtimeconsulting.in",
          "siddharthag@showtimeconsulting.in",
        ],
      },
      {
        title: "Northern-MH Assembly Survey",
        imageSrc: "https://www.scnsoft.com/images-for-demo/power-bi.png",
        link: "https://app.powerbi.com/view?r=eyJrIjoiM2U3ODRiNzktZTNkMy00ZTBjLTg4M2ItOTA4ZTA1N2U4NDg0IiwidCI6ImE0NDY0OWI4LTg3ZDQtNDUyNC04ZjYwLTEwNTgxMGRhZDRiNiJ9",
        users: [
          "abhishek.behara@showtimeconsulting.in",
          "miteshbhadane@showtimeconsulting.in",
        ],
      },
      {
        title: "Marathwada Assembly Survey",
        imageSrc: "https://www.scnsoft.com/images-for-demo/power-bi.png",
        link: "https://app.powerbi.com/view?r=eyJrIjoiNWY1N2RmNTEtNTYxMi00NzQyLWI3ZGUtMmQ5MDgxNTM3ODg4IiwidCI6ImE0NDY0OWI4LTg3ZDQtNDUyNC04ZjYwLTEwNTgxMGRhZDRiNiJ9",
        users: [
          "bikash@showtimeconsulting.in",
          "siddharthag@showtimeconsulting.in",
          "ashutosh.pandey@showtimeconsulting.in",
          "mandanna@showtimeconsulting.in",
        ],
      },
      {
        title: "Western-MH Assembly Survey",
        imageSrc: "https://www.scnsoft.com/images-for-demo/power-bi.png",
        link: "https://app.powerbi.com/view?r=eyJrIjoiYjM0YTUzNjgtNDY5ZS00NjIzLTllZDAtNWQyMzQ4OTY2NWI0IiwidCI6ImE0NDY0OWI4LTg3ZDQtNDUyNC04ZjYwLTEwNTgxMGRhZDRiNiJ9",
        users: ["ashish@showtimeconsulting.in", "gurram.saikiran@showtimeconsulting.in"],
      },
      {
        title: "Konkan Assembly Survey",
        imageSrc: "https://www.scnsoft.com/images-for-demo/power-bi.png",
        link: "https://app.powerbi.com/view?r=eyJrIjoiYmViOTVmOTMtMjI1Ny00MWQ2LWFkMTgtZDRjYWQzNjUwN2UyIiwidCI6ImE0NDY0OWI4LTg3ZDQtNDUyNC04ZjYwLTEwNTgxMGRhZDRiNiJ9",
        users: ["praveenkumar@showtimeconsulting.in", "kiranponnoju@showtimeconsulting.in"],
      },
    ];

    return dashboardLinksWithUsers.filter((dashboard) =>
      dashboard.users.includes(email)
    );
  };

  const handleCardClick = (link) => {
    setIframeSrc(link);
  };

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
          {dashboardLinks.map((dashboard, index) => (
            <Card
              key={index}
              imageSrc={dashboard.imageSrc}
              title={dashboard.title}
              onCardClick={() => handleCardClick(dashboard.link)}
            />
          ))}
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

export default SurveyDashboard;
