import React, { useEffect, useState } from "react";
import axios from "axios";
import localforage from "localforage";
import Dashboard from "./Dashboard";

const API_URL = process.env.REACT_APP_API_URL;

const JoineeSummaryTable = () => {
  const [summary, setSummary] = useState(null);
  const [expandedPCs, setExpandedPCs] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await localforage.getItem("token");
        const res = await axios.get(
          `${API_URL}/probable-joinee/joinee-summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch joinee summary:", err);
      }
    };

    fetchData();
  }, []);

  const togglePC = (pcName) => {
    setExpandedPCs((prev) => ({
      ...prev,
      [pcName]: !prev[pcName],
    }));
  };

  const renderRow = (key, data, isSubRow = false) => (
    <tr key={key} className={isSubRow ? "tr-subrow" : ""}>
      <td className={isSubRow ? "td-subrow" : ""}>{key}</td>
      <td>{data.total}</td>
      <td>{data.ward}</td>
      <td>{data.booth}</td>
      <td>{data.ac}</td>
      <td>{data.pc}</td>
      <td>{data.discussionNotInitiated}</td>
      <td>{data.discussionInitiated}</td>
      <td>{data.leaderJoined}</td>
    </tr>
  );

  if (!summary) return <div className="intervention-table">Loading...</div>;

  return (
    <>
      <Dashboard />
      <div className="intervention-table">
        <h2 className="heading">Probable Joinees Summary by Zone</h2>
        <table className="mom-table">
          <thead className="zone-head">
            <tr>
              <th rowSpan="2">Zone</th>
              <th rowSpan="2">Total</th>
              <th colSpan="4">Area of Influence</th>
              <th colSpan="3">Status</th>
            </tr>
            <tr>
              <th>Ward Level</th>
              <th>Booth Level</th>
              <th>AC Level</th>
              <th>PC Level</th>
              <th>Not Initiated</th>
              <th>Initiated</th>
              <th>Leader Joined</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(summary.zone).map(([zone, data]) =>
              renderRow(zone, data)
            )}
          </tbody>
        </table>

        <h2 className="heading">Probable Joinees Summary by PC & AC</h2>
        <table className="mom-table">
          <thead className="pc-head">
            <tr>
              <th rowSpan="2">Name</th>
              <th rowSpan="2">Total</th>
              <th colSpan="4">Area of Influence</th>
              <th colSpan="3">Status</th>
            </tr>
            <tr>
              <th>Ward Level</th>
              <th>Booth Level</th>
              <th>AC Level</th>
              <th>PC Level</th>
              <th>Not Initiated</th>
              <th>Initiated</th>
              <th>Leader Joined</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary.pc).map(([pc, pcData]) => (
              <React.Fragment key={pc}>
                <tr className="tr-pc" onClick={() => togglePC(pc)}>
                  <td className="flex">
                    <span>{pc}</span>
                    <span style={{ cursor: "pointer" }}>
                      {expandedPCs[pc] ? "−" : "+"}
                    </span>
                  </td>
                  <td>{pcData.total}</td>
                  <td>{pcData.ward}</td>
                  <td>{pcData.booth}</td>
                  <td>{pcData.ac}</td>
                  <td>{pcData.pc}</td>
                  <td>{pcData.discussionNotInitiated}</td>
                  <td>{pcData.discussionInitiated}</td>
                  <td>{pcData.leaderJoined}</td>
                </tr>

                {expandedPCs[pc] &&
                  Object.entries(summary.constituency)
                    .filter(([_, acData]) => acData.pcName === pc)
                    .map(([ac, acData]) => renderRow(ac, acData, true))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default JoineeSummaryTable;
