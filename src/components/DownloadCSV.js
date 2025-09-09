import React from "react";
import api from "../utils/axiosConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import localforage from "localforage";

const API_URL = process.env.REACT_APP_API_URL;

function DownloadCSV() {
  const handleDownload = async () => {
    try {
      const token = await localforage.getItem("token");
      const response = await api.get(`${API_URL}/cab/export-csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // Handle binary data
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Cab_Data.csv");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading the CSV file", error);
    }
  };

  return (
    <a onClick={handleDownload} className="menu-buttons">
      <FontAwesomeIcon icon={faDownload} className="font-pdf" size="3x" />
      Download Cab Data
    </a>
  );
}

export default DownloadCSV;
