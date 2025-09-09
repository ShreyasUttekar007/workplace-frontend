import React, { useEffect, useRef, useState } from "react";
import "../css/viewNewMom.css";
import { useParams } from "react-router-dom";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import Dashboard from "./Dashboard";
import ReactToPrint from "react-to-print";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const ViewNewMom = () => {
  const { momId } = useParams();
  const [momData, setMomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef();

  useEffect(() => {
    const fetchMomData = async () => {
      try {
        const token = await localforage.getItem("token");

        const response = await api.get(
          `${API_URL}/new-mom/get-mom-by-id/${momId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMomData(response.data);
      } catch (error) {
        console.error("Error fetching MOM data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMomData();
  }, [momId]);

  if (loading) return <p>Loading...</p>;
  if (!momData) return <p>No MOM data found</p>;

  const validPeoplePhotos = momData.peoplePhoto.filter((photo) => photo);

  return (
    <>
      <Dashboard />
      <div className="export-button-new-mom">
        <ReactToPrint
          trigger={() => (
            <FontAwesomeIcon icon={faFilePdf} className="font-pdf" size="2x" />
          )}
          content={() => componentRef.current}
          pageStyle={`@page { margin: 5mm 5mm; }`}
          documentTitle={`Caste-Data ${momData.constituency}`}
          removeAfterPrint={true}
        />
      </div>
      <div className="mom-new-container" id="pdf-content" ref={componentRef}>
        <div className="mom-header">
          <div className="mom-title">
            <h2 className="mom-title">Meeting with {momData.leaderName}</h2>
            <p className="desig-text">
              {momData.designation}, {momData.partyName}
            </p>
          </div>
          {momData.leaderPhoto && (
            <img
              src={momData.leaderPhoto}
              alt={momData.leaderName}
              className="leader-image"
            />
          )}
        </div>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(momData.createdAt)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
            .replace(/^(\d{2})/, (match) => {
              let suffix = "th";
              if (match === "01" || match === "21" || match === "31")
                suffix = "st";
              else if (match === "02" || match === "22") suffix = "nd";
              else if (match === "03" || match === "23") suffix = "rd";
              return `${parseInt(match)}${suffix}`;
            })}
        </p>
        <p>
          <strong>Place:</strong> Ward {momData.ward}, {momData.constituency},{" "}
          {momData.pc}.
        </p>
        {momData.makeMom !== "No" &&
          momData.keyTakeaways &&
          Array.isArray(momData.keyTakeaways) &&
          momData.keyTakeaways.length > 0 && (
            <div className="mom-new-section">
              <table className="mom-table">
                <thead>
                  <tr>
                    <th>Key Takeaways</th>
                  </tr>
                </thead>
                <tbody>
                  {momData.keyTakeaways.map((point, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "left" }}>{point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        <div className="mom-new-section">
          <h3 className="heading-mom-texts">Points of Discussion:</h3>
          <ul>
            {momData.pointOfDiscussion.map((point, index) => (
              <li key={index} style={{ fontSize: "16px", margin: "10px 0px" }}>
                {point}
              </li>
            ))}
          </ul>
        </div>
        {validPeoplePhotos.length > 0 && (
          <div className="mom-new-section page-break">
            <h3 className="heading-mom-texts">
              Images of those mentioned in meeting:
            </h3>
            <table className="mentioned-people-table">
              <tbody>
                {Array.from({
                  length: Math.ceil(validPeoplePhotos.length / 4),
                }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {validPeoplePhotos
                      .slice(rowIndex * 4, rowIndex * 4 + 4)
                      .map((photo, index) => {
                        const actualIndex = rowIndex * 4 + index;
                        return (
                          <td key={actualIndex} className="mom-image-item">
                            <img
                              src={photo}
                              alt={
                                momData.peopleName[actualIndex] ||
                                "Unknown Person"
                              }
                              onError={(e) => (e.target.style.display = "none")}
                            />
                            {momData.peopleName[actualIndex] && (
                              <p className="extra-image-text">
                                {momData.peopleName[actualIndex]}
                              </p>
                            )}
                            {momData.peopleDesignation[actualIndex] &&
                              momData.peopleParty[actualIndex] && (
                                <p>
                                  {momData.peopleDesignation[actualIndex]},{" "}
                                  {momData.peopleParty[actualIndex]}
                                </p>
                              )}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewNewMom;
