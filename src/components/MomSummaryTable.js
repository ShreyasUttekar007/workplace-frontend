import React, { useEffect, useRef, useState } from "react";
import api from "../utils/axiosConfig";
import localforage from "localforage";
import Select from "react-select";
import Dashboard from "./Dashboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactToPrint from "react-to-print";
import { faFileCsv, faFilePdf } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const MomSummaryTable = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totals, setTotals] = useState({ yes: 0, no: 0 });
  const [pcFilter, setPcFilter] = useState([]);
  const [constituencyFilter, setConstituencyFilter] = useState([]);
  const [reportingManagerFilter, setReportingManagerFilter] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userNames, setUserNames] = useState([]);
  const [userNameFilter, setUserNameFilter] = useState([]);
  const [pcs, setPcs] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [reportingManager, setReportingManager] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const componentRef = useRef();

  const sortData = (data, field, order) => {
    return [...data].sort((a, b) => {
      const aVal = (a[field] || "").toLowerCase();
      const bVal = (b[field] || "").toLowerCase();

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  };

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        const token = await localforage.getItem("token");
        const res = await api.get(`${API_URL}/new-mom/get-mom`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          },
        });

        const data = res.data.data;

        const grouped = {};
        let yesCount = 0;
        let noCount = 0;
        const uniquePcs = new Set();
        const uniqueConstituencies = new Set();
        const uniqueReportingManager = new Set();
        const uniqueUserNames = new Set();

        data.forEach((item) => {
          const key = `${item.pc}-${item.constituency}-${item.userName}`;
          uniquePcs.add(item.pc);
          uniqueConstituencies.add(item.constituency);
          uniqueReportingManager.add(item.reportingManager);
          uniqueUserNames.add(item.userName || "Unknown");

          if (!grouped[key]) {
            grouped[key] = {
              pc: item.pc,
              constituency: item.constituency,
              reportingManager: item.reportingManager,
              userName: item.userName || "Unknown",
              yes: 0,
              no: 0,
              nonShsCount: 0,
              dom: item.dom,
            };
          }

          grouped[key].yes += item.yes || 0;
          grouped[key].no += item.no || 0;
          grouped[key].nonShsCount += item.nonShsCount || 0;

          yesCount += item.yes || 0;
          noCount += item.no || 0;
        });

        const summaryArray = Object.values(grouped);

        setSummaryData(summaryArray);
        setFilteredData(summaryArray);
        const totalNonShsCount = summaryArray.reduce(
          (acc, item) => acc + item.nonShsCount,
          0
        );

        setTotals({
          yes: yesCount,
          no: noCount,
          nonShsCount: totalNonShsCount,
        });

        setPcs([...uniquePcs].map((pc) => ({ value: pc, label: pc })));
        setConstituencies(
          [...uniqueConstituencies].map((c) => ({ value: c, label: c }))
        );
        setReportingManager(
          [...uniqueReportingManager].map((r) => ({ value: r, label: r }))
        );
        setUserNames([...uniqueUserNames].map((u) => ({ value: u, label: u })));
      } catch (err) {
        console.error("Error fetching MOM data:", err.message);
      }
    };

    fetchFilteredData();
  }, [fromDate, toDate]); // trigger API call when date range changes

  const exportToCSV = () => {
    const csvHeader = [
      "Parliamentary Constituency",
      "Assembly Constituency",
      "Reporting Manager",
      "Submitted By",
      "Total Meeting Recorded",
      "MoM Submitted",
      "Non-SHS Meeting",
    ];
    const csvRows = [
      csvHeader,
      ...filteredData.map((row) => [
        row.pc,
        row.constituency,
        row.reportingManager,
        row.userName,
        row.yes + row.no,
        row.yes,
        row.nonShsCount,
      ]),
      [
        "",
        "",
        "",
        "Grand Total",
        totals.yes + totals.no,
        totals.yes,
        totals.nonShsCount || 0,
      ],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows
        .map((row) =>
          row
            .map((val) =>
              typeof val === "string" && val.includes(",")
                ? `"${val.replace(/"/g, '""')}"`
                : val
            )
            .join(",")
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Leader_Meeting_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    let filtered = summaryData;
    let yesCount = 0;
    let noCount = 0;
    let nonShsTotal = 0;

    if (pcFilter.length > 0) {
      const selectedPCs = pcFilter.map((item) => item.value);
      filtered = filtered.filter((item) => selectedPCs.includes(item.pc));
    }
    if (constituencyFilter.length > 0) {
      const selectedACs = constituencyFilter.map((item) => item.value);
      filtered = filtered.filter((item) =>
        selectedACs.includes(item.constituency)
      );
    }
    if (reportingManagerFilter.length > 0) {
      const selectedReportingManagers = reportingManagerFilter.map(
        (item) => item.value
      );
      filtered = filtered.filter((item) =>
        selectedReportingManagers.includes(item.reportingManager)
      );
    }
    if (fromDate) {
      filtered = filtered.filter((item) => item.dom >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter((item) => item.dom <= toDate);
    }

    if (userNameFilter.length > 0) {
      const selectedUserNames = userNameFilter.map((item) => item.value);
      filtered = filtered.filter((item) =>
        selectedUserNames.includes(item.userName)
      );
    }

    // 🔁 Now apply sorting on the filtered data
    if (sortField) {
      filtered = sortData(filtered, sortField, sortOrder);
    }

    // Update totals after filtering
    filtered.forEach((item) => {
      yesCount += item.yes;
      noCount += item.no;
      nonShsTotal += item.nonShsCount || 0;
    });

    setFilteredData(filtered);
    setTotals({ yes: yesCount, no: noCount, nonShsCount: nonShsTotal });
  }, [
    userNameFilter,
    pcFilter,
    constituencyFilter,
    fromDate,
    toDate,
    summaryData,
    reportingManagerFilter,
    sortField,
    sortOrder,
  ]);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <>
      <Dashboard />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
          marginTop: "20px",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <label style={{ width: "300px" }}>
          Parliamentary Constituency:
          <Select
            isMulti
            options={pcs}
            value={pcFilter}
            onChange={setPcFilter}
            placeholder="Select PC"
          />
        </label>

        <label style={{ width: "300px" }}>
          Assembly Constituency:
          <Select
            isMulti
            options={constituencies}
            value={constituencyFilter}
            onChange={setConstituencyFilter}
            placeholder="Select AC"
          />
        </label>
        <label style={{ width: "300px" }}>
          Reporting Manager:
          <Select
            isMulti
            options={reportingManager}
            value={reportingManagerFilter}
            onChange={setReportingManagerFilter}
            placeholder="Select Reporting Manager"
          />
        </label>
        <label style={{ width: "300px" }}>
          User Name:
          <Select
            isMulti
            options={userNames}
            value={userNameFilter}
            onChange={setUserNameFilter}
            placeholder="Select User"
          />
        </label>

        <label>
          From Date:
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>

        <label>
          To Date:
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>

        <ReactToPrint
          trigger={() => (
            <FontAwesomeIcon icon={faFilePdf} className="font-pdf" size="2x" />
          )}
          content={() => componentRef.current}
          pageStyle={`@page { margin: 5mm 7mm; }`}
          documentTitle={`Leader Meeting Report`}
          removeAfterPrint={true}
        />
        <button
          onClick={exportToCSV}
          style={{
            background: "#05880cff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FontAwesomeIcon icon={faFileCsv} size="1x"/>
        </button>
      </div>

      <div className="intervention-table">
        <h2>Leader Meeting Report</h2>
        <table className="mom-table" id="pdf-content" ref={componentRef}>
          <thead>
            <tr>
              {/* <th>Recorded Date and Time</th> */}
              <th>Parliamentary Constituency</th>
              <th>Assembly Constituency</th>
              <th
                onClick={() => handleSort("reportingManager")}
                style={{ cursor: "pointer" }}
              >
                Reporting Manager{" "}
                {sortField === "reportingManager" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>Submitted By</th>
              <th>Total Meeting Recorded</th>
              <th>MoM Submitted</th>
              <th>Non-SHS Meeting</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                {/* <td>
                  {new Date(row.createdAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td> */}
                <td>{row.pc}</td>
                <td>{row.constituency}</td>
                <td>{row.reportingManager}</td>
                <td>{row.userName}</td>
                <td>{row.yes + row.no}</td>
                <td>{row.yes}</td>
                <td>{row.nonShsCount}</td>
              </tr>
            ))}
            <tr style={{ backgroundColor: "#74a7e9" }}>
              <td colSpan="4">
                <strong>Grand Total</strong>
              </td>
              <td>
                <strong>{totals.yes + totals.no}</strong>
              </td>
              <td>
                <strong>{totals.yes}</strong>
              </td>
              <td>
                <strong>{totals.nonShsCount || 0}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MomSummaryTable;
