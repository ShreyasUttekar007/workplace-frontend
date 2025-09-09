import React, { useEffect, useRef, useState } from "react";
import localforage from "localforage";
import axios from "axios";
import Select from "react-select";
import "../css/mumbaiCastes.css";
import Dashboard from "./Dashboard";
import ReactToPrint from "react-to-print";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL;

const MumbaiCastes = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const [constituencyOptions, setConstituencyOptions] = useState([]);
  const [pcOptions, setPcOptions] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [selectedPc, setSelectedPc] = useState(null);
  const [wardMapByAC, setWardMapByAC] = useState({});
  const componentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await localforage.getItem("ID");
        const token = await localforage.getItem("token");
        const location = await localforage.getItem("location");

        const res = await axios.get(
          `${API_URL}/mumbai-caste/get-castes/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data.filter((report) => report.state === location);

        setReports(data);
        setFilteredReports(data);

        // Map wards by AC
        const wardMap = {};
        data.forEach((item) => {
          if (item.constituency && item.ward) {
            if (!wardMap[item.constituency])
              wardMap[item.constituency] = new Set();
            wardMap[item.constituency].add(item.ward);
          }
        });

        // Set full ward list
        const allWards = [
          ...new Set(data.map((item) => item.ward).filter(Boolean)),
        ];
        setWardMapByAC(wardMap);
        setWardOptions(allWards.map((w) => ({ value: w, label: w })));

        const constituencies = [
          ...new Set(data.map((item) => item.constituency).filter(Boolean)),
        ];
        const pcs = [...new Set(data.map((item) => item.pc).filter(Boolean))];
        setConstituencyOptions(
          constituencies.map((c) => ({ value: c, label: c }))
        );
        setPcOptions(pcs.map((p) => ({ value: p, label: p })));
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (
      selectedConstituency?.value &&
      wardMapByAC[selectedConstituency.value]
    ) {
      const wardsForAC = Array.from(wardMapByAC[selectedConstituency.value]);
      setWardOptions(wardsForAC.map((w) => ({ value: w, label: w })));
    } else {
      // If no AC selected, show all wards
      const allWards = [
        ...new Set(reports.map((item) => item.ward).filter(Boolean)),
      ];
      setWardOptions(allWards.map((w) => ({ value: w, label: w })));
    }
  }, [selectedConstituency, wardMapByAC, reports]);

  useEffect(() => {
    let filtered = [...reports];

    if (selectedWard) {
      filtered = filtered.filter(
        (report) => report.ward === selectedWard.value
      );
    }

    if (selectedConstituency) {
      filtered = filtered.filter(
        (report) => report.constituency === selectedConstituency.value
      );
    }
    if (selectedPc) {
      filtered = filtered.filter((report) => report.pc === selectedPc.value);
    }

    setFilteredReports(filtered);
  }, [selectedWard, selectedConstituency, reports, selectedPc]);

  return (
    <>
      <Dashboard />
      <div className="intervention-table">
        <h2 className="title">BMC Caste Data</h2>
        <div className="filters">
          <div className="filter-group">
            <label style={{ width: "300px" }}>
              Parliamentary Constituency
              <Select
                options={pcOptions}
                value={selectedPc}
                onChange={setSelectedPc}
                isClearable
                placeholder="Select Parliament"
              />
            </label>
          </div>
          <div className="filter-group">
            <label style={{ width: "300px" }}>
              Assembly Constituency
              <Select
                options={constituencyOptions}
                value={selectedConstituency}
                onChange={setSelectedConstituency}
                isClearable
                placeholder="Select Assembly"
              />
            </label>
          </div>
          <div className="filter-group">
            <label style={{ width: "300px" }}>
              Ward
              <Select
                options={wardOptions}
                value={selectedWard}
                onChange={setSelectedWard}
                isClearable
                placeholder="Select Ward"
              />
            </label>
          </div>
          <div className="export-button">
            <ReactToPrint
              trigger={() => (
                <FontAwesomeIcon
                  icon={faFilePdf}
                  className="font-pdf"
                  size="2x"
                />
              )}
              content={() => componentRef.current}
              pageStyle={`@page { margin: 5mm 50mm; }`}
              documentTitle={`Caste-Data ${selectedConstituency}`}
              removeAfterPrint={true}
            />
          </div>
        </div>
        <div className="table-wrapper" id="pdf-content" ref={componentRef}>
          <h2>
            {selectedConstituency?.label
              ? selectedConstituency.label
              : selectedWard?.label
              ? `Ward-${selectedWard.label}`
              : ""}
          </h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Community</th>
                <th>Category</th>
                <th>Percentage</th>
                {/* <th>Approx Voters</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                <>
                  {filteredReports.map((report, idx) => (
                    <tr key={idx}>
                      <td>{report.community || "N/A"}</td>
                      <td>{report.category || "N/A"}</td>
                      <td>{report.percentage || "0"}%</td>
                      {/* <td>{report.voters || "0"}</td> */}
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan="2" style={{ fontWeight: "bold" }}>
                      Total
                    </td>
                    <td style={{ fontWeight: "bold" }}>
                      {filteredReports
                        .reduce(
                          (sum, r) => sum + (parseFloat(r.percentage) || 0),
                          0
                        )
                        .toFixed(2)}
                      %
                    </td>
                    {/* <td style={{ fontWeight: "bold" }}>
                      {filteredReports
                        .reduce((sum, r) => {
                          const raw = (r.voters ?? "0")
                            .toString()
                            .trim()
                            .replace(/,/g, "");
                          const num = parseInt(raw, 10);
                          return sum + (isNaN(num) ? 0 : num);
                        }, 0)
                        .toLocaleString()}
                    </td> */}
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MumbaiCastes;
