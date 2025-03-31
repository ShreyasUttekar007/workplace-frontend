import React, { useEffect, useState } from "react";
import axios from "axios";
import localforage from "localforage";

const API_URL = process.env.REACT_APP_API_URL;

const MomSummaryTable = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [totals, setTotals] = useState({ yes: 0, no: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await localforage.getItem("token");
        const res = await axios.get(
          `${API_URL}/new-mom/get-mom`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = res.data;

        // Grouping data by unique PC+AC+userId+constituency
        const grouped = {};

        let yesCount = 0;
        let noCount = 0;

        data.forEach((item) => {
          const key = `${item.pc}-${item.ac}-${item.userId?._id}-${item.constituency}`;
          if (!grouped[key]) {
            grouped[key] = {
              pc: item.pc,
              ac: item.ac,
              nameOfPc: item.nameOfPc || "", // In case it's stored
              constituency: item.constituency,
              userName: item.userId?.userName || "Unknown",
              yes: 0,
              no: 0,
            };
          }

          if (item.makeMom === "Yes") {
            grouped[key].yes++;
            yesCount++;
          } else if (item.makeMom === "No") {
            grouped[key].no++;
            noCount++;
          }
        });

        const summaryArray = Object.values(grouped);
        setSummaryData(summaryArray);
        setTotals({ yes: yesCount, no: noCount });
      } catch (err) {
        console.error("Error fetching MOM data:", err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div class="table-container">
      <h2 className="text-2xl font-bold mb-4">MOM Submission Summary</h2>
      <table className="mom-table">
        <thead>
          <tr>
            <th>PC</th>
            <th>Constituency</th>
            <th>Submitted By</th>
            <th>Count of Yes</th>
            <th>Count of No</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((row, index) => (
            <tr key={index}>
              <td>{row.pc}</td>
              <td>{row.constituency}</td>
              <td>{row.userName}</td>
              <td>{row.yes}</td>
              <td>{row.no}</td>
              <td>{row.yes + row.no}</td>
            </tr>
          ))}
          <tr style={{ backgroundColor: "#74a7e9" }}>
            <td colspan="3">
              <strong>Grand Total</strong>
            </td>
            <td>
              <strong>{totals.yes}</strong>
            </td>
            <td>
              <strong>{totals.no}</strong>
            </td>
            <td>
              <strong>{totals.yes + totals.no}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MomSummaryTable;
