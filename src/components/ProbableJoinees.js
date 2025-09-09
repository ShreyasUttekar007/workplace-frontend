import React, { useEffect, useMemo, useRef, useState } from "react";
import localforage from "localforage";
import axios from "axios";
import "../css/probableJoineeTable.css";
import Select from "react-select";
import Dashboard from "./Dashboard";
import ReactPaginate from "react-paginate";
import ReactToPrint from "react-to-print";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const ProbableJoinees = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [constituencyOptions, setConstituencyOptions] = useState([]);
  const [selectedConstituencies, setSelectedConstituencies] = useState([]);
  const [pcOptions, setPcOptions] = useState([]);
  const [selectedPcs, setSelectedPcs] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 100;
  const componentRef = useRef();
  const [searchQuery, setSearchQuery] = useState("");
  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  const displayedMomData = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [currentPage, filteredData]);

  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await localforage.getItem("token");
        const user = await localforage.getItem("ID");
        // const userId = user?._id;

        const response = await axios.get(
          `${API_URL}/probable-joinee/get-probable-joinees/${user}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const joinees = response.data;
        setData(joinees);
        setFilteredData(joinees);

        const uniqueConstituencies = [
          ...new Set(joinees.map((j) => j.constituency).filter(Boolean)),
        ].map((cons) => ({
          label: cons,
          value: cons,
        }));

        setConstituencyOptions(uniqueConstituencies);

        const uniquePcs = [
          ...new Set(joinees.map((j) => j.pc).filter(Boolean)),
        ].map((pcs) => ({
          label: pcs,
          value: pcs,
        }));

        setPcOptions(uniquePcs);

        const uniqueStatus = [
          ...new Set(
            joinees.map((j) => j.discussionWithJoinee).filter(Boolean)
          ),
        ].map((discussionWithJoinees) => ({
          label: discussionWithJoinees,
          value: discussionWithJoinees,
        }));

        setStatusOptions(uniqueStatus);
      } catch (err) {
        console.error("Error fetching Probable Joinees:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = data;

    // Filter by constituencies
    if (selectedConstituencies.length > 0) {
      const selectedValues = selectedConstituencies.map((c) => c.value);
      result = result.filter((d) => selectedValues.includes(d.constituency));
    }

    // Filter by parliamentary constituencies
    if (selectedPcs.length > 0) {
      const selectedValues = selectedPcs.map((c) => c.value);
      result = result.filter((d) => selectedValues.includes(d.pc));
    }

    // Filter by status
    if (selectedStatus.length > 0) {
      const selectedValues = selectedStatus.map((c) => c.value);
      result = result.filter((d) =>
        selectedValues.includes(d.discussionWithJoinee)
      );
    }

    // Also apply search query if needed
    if (searchQuery) {
      result = result.filter((joinee) =>
        joinee.probableJoineeName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(result);
    setCurrentPage(0); // Reset to page 0 when filter changes
  }, [selectedConstituencies, selectedPcs, selectedStatus, searchQuery, data]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = displayedMomData.filter((joinee) =>
        joinee.probableJoineeName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(displayedMomData);
    }
    setCurrentPage(0);
  };

  const csvHeaders = [
    { label: "State", key: "state" },
    { label: "Constituency", key: "constituency" },
    { label: "Ward", key: "ward" },
    { label: "Vibhag Pramukh Name", key: "vibhagPramukhName" },
    { label: "Vibhag Pramukh Contact No", key: "vibhagPramukhContactNo" },
    { label: "Probable Joinee Name", key: "probableJoineeName" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Caste", key: "caste" },
    { label: "Phone No", key: "phoneNo" },
    { label: "Party", key: "party" },
    { label: "Photo", key: "photo" },
    { label: "Designation", key: "designation" },
    { label: "Brief Profile", key: "briefProfile" },
    { label: "Public Image", key: "publicImage" },
    { label: "Financial Status", key: "financialStatus" },
    { label: "Voter Influence", key: "voterInfluence" },
    { label: "Area Of Influence", key: "areaOfInfluence" },
    { label: "Viability", key: "viability" },
    { label: "Leader Who Informed STC", key: "leaderWhoInformedSTC" },
    { label: "Vibhag Pramukh Agreed", key: "vibhagPramukhAgreed" },
    { label: "MLA or MP Agreed", key: "mlaOrMpAgreed" },
    { label: "STC Recommendation", key: "stcRecommendation" },
    { label: "STC Recommendation Reason", key: "stcRecommendationReason" },
    { label: "Facilitator", key: "facilitator" },
    { label: "Demand", key: "demand" },
    { label: "Offer", key: "offer" },
    { label: "Leaders To Manage", key: "leadersToManage" },
    { label: "Status", key: "status" },
    { label: "Discussion With Joinee", key: "discussionWithJoinee" },
  ];

  return (
    <>
      <Dashboard />
      <div>
        <div className="pj-filter">
          <label>
            Assembly Constituency:
            <div style={{ width: "300px", marginTop: "8px" }}>
              <Select
                isMulti
                options={constituencyOptions}
                value={selectedConstituencies}
                onChange={setSelectedConstituencies}
                placeholder="Select AC(s)"
              />
            </div>
          </label>
          <label>
            Parliamentary Constituency:
            <div style={{ width: "300px", marginTop: "8px" }}>
              <Select
                isMulti
                options={pcOptions}
                value={selectedPcs}
                onChange={setSelectedPcs}
                placeholder="Select Pc(s)"
              />
            </div>
          </label>
          <label>
            Status:
            <div style={{ width: "300px", marginTop: "8px" }}>
              <Select
                isMulti
                options={statusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="Select Status"
              />{" "}
            </div>
          </label>
          <label>
            Search:
            <div style={{ width: "300px", marginTop: "8px" }}>
              <input
                type="text"
                placeholder="Search by name or leave code..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </label>
          <ReactToPrint
            trigger={() => (
              <FontAwesomeIcon
                icon={faFilePdf}
                className="font-pdf"
                size="2x"
              />
            )}
            content={() => componentRef.current}
            pageStyle={`@page { margin: 5mm 2mm; }`}
            documentTitle={`BMC Interventions_${[selectedConstituencies]
              .filter(Boolean)
              .join("_")}`}
            removeAfterPrint={true}
          />

          <CSVLink
            data={displayedMomData}
            headers={csvHeaders}
            filename={`Probable_Joinees${[selectedConstituencies]
              .filter(Boolean)
              .join("_")}`}
          >
            <FontAwesomeIcon
              icon={faFileCsv}
              className="font-pdf"
              size="2x"
              style={{ marginLeft: "20px", color: "#325c23" }}
            />
          </CSVLink>
        </div>
        <div className="intervention-table">
          <h2>Probable Joinees</h2>
          <table className="leave-table" id="pdf-content" ref={componentRef}>
            <thead>
              <tr>
                <th>Actions</th>
                <th>Constituency</th>
                <th>Ward</th>
                <th>Vibhag Pramukh Name</th>
                <th>Vibhag Pramukh Contact No</th>
                <th>Probable Joinee Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Caste</th>
                <th>Phone No</th>
                <th>Party</th>
                <th>Photo</th>
                <th>Designation</th>
                <th>Brief Profile</th>
                <th>Public Image</th>
                <th>Financial Status</th>
                <th>Voter Influence</th>
                <th>Area of Influence</th>
                <th>Viability</th>
                <th>Leader Who Informed STC</th>
                <th>Vibhag Pramukh Agreed</th>
                <th>MLA or MP Agreed</th>
                <th>STC Recommendation</th>
                <th>STC Recommendation Reason</th>
                <th>Facilitator</th>
                <th>Demand</th>
                <th>Offer</th>
                <th>Leaders to Manage</th>
                <th>Status</th>
                <th>Discussion With Joinee</th>
              </tr>
            </thead>
            <tbody>
              {displayedMomData.length > 0 ? (
                displayedMomData.map((joinee, idx) => (
                  <tr key={idx}>
                    <td className="td-extra">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column-reverse",
                          alignItems: "center",
                        }}
                      >
                        <Link
                          to={`/update-new-joinee/${joinee._id}`}
                          style={{
                            textDecoration: "none",
                            padding: "5px 0px",
                            color: "#008cff",
                          }}
                        >
                          Update
                        </Link>
                      </div>
                    </td>
                    <td>{joinee.constituency || "-"}</td>
                    <td>{joinee.ward || "-"}</td>
                    <td>{joinee.vibhagPramukhName || "-"}</td>
                    <td>{joinee.vibhagPramukhContactNo || "-"}</td>
                    <td>{joinee.probableJoineeName || "-"}</td>
                    <td>{joinee.age || "-"}</td>
                    <td>{joinee.gender || "-"}</td>
                    <td>{joinee.caste || "-"}</td>
                    <td>{joinee.phoneNo || "-"}</td>
                    <td>{joinee.party || "-"}</td>
                    <td>
                      {joinee.photo ? (
                        <img
                          src={joinee.photo}
                          alt="Joinee"
                          width="50"
                          height="50"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{joinee.designation || "-"}</td>
                    <td>{joinee.briefProfile || "-"}</td>
                    <td>{joinee.publicImage || "-"}</td>
                    <td>{joinee.financialStatus || "-"}</td>
                    <td>{joinee.voterInfluence || "-"}</td>
                    <td>{joinee.areaOfInfluence || "-"}</td>
                    <td>{joinee.viability || "-"}</td>
                    <td>{joinee.leaderWhoInformedSTC || "-"}</td>
                    <td>{joinee.vibhagPramukhAgreed || "-"}</td>
                    <td>{joinee.mlaOrMpAgreed || "-"}</td>
                    <td>{joinee.stcRecommendation || "-"}</td>
                    <td>{joinee.stcRecommendationReason || "-"}</td>
                    <td>{joinee.facilitator || "-"}</td>
                    <td>{joinee.demand || "-"}</td>
                    <td>{joinee.offer || "-"}</td>
                    <td>{joinee.leadersToManage || "-"}</td>
                    <td>{joinee.status || "-"}</td>
                    <td>{joinee.discussionWithJoinee || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="29" className="pj-no-data">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ReactPaginate
          pageCount={pageCount}
          pageRangeDisplayed={5}
          marginPagesDisplayed={2}
          previousLabel={"previous"}
          nextLabel={"next"}
          breakLabel={"..."}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          subContainerClassName={"pages pagination"}
          activeClassName={"active"}
        />
      </div>
    </>
  );
};

export default ProbableJoinees;
