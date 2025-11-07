import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import AWS from "aws-sdk";
import "../css/addCandidatesForm.css";
import Dashboard from "./Dashboard";

const API_BASE = process.env.REACT_APP_API_URL || "";
const CREATE_URL = `${API_BASE}/candidates-daily-activities/add-candidates`;
const LOOKUP_URL = `${API_BASE}/candidates-daily-activities/lookup`;

// --- AWS (browser) config (as requested: frontend-only) ---
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});
const s3 = new AWS.S3({ signatureVersion: "v4" });

const S3_FOLDER = "candidate-activities";

const uploadFileToS3 = async (file, folder = S3_FOLDER) => {
  try {
    const params = {
      Bucket: "mom-files-data-new",
      Key: `${folder}/${Date.now()}_${file.name}`,
      Body: file,
      ContentType: file.type || "application/octet-stream",
    };
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // public URL
  } catch (error) {
    console.error("❌ Error uploading file to S3:", error);
    return ""; // empty string on failure
  }
};

const emptyShs = { name: "", designation: "", activityType: "", activityDetails: "" };
const emptyOpp = { name: "", party: "", designation: "", activityType: "", activityDetails: "" };

function CandidatesDailyActivity() {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // cascading selects state
  const [pcOptions, setPcOptions] = useState([]);
  const [acOptions, setAcOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);

  const [pcsLoading, setPcsLoading] = useState(false);
  const [acLoading, setAcLoading] = useState(false);
  const [wardsLoading, setWardsLoading] = useState(false);

  const [selectedPC, setSelectedPC] = useState(null);
  const [selectedAC, setSelectedAC] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const [form, setForm] = useState({
    pc: "",
    constituency: "",
    ward: "",
    shsList: [{ ...emptyShs }],
    oppList: [{ ...emptyOpp }],
    majorPoliticalDevelopmentDetails: "",
    activityImage: "", // S3 URL
  });

  // ---------- LOOKUP HELPERS ----------
  const fetchPCs = useCallback(async () => {
    try {
      setPcsLoading(true);
      const { data } = await axios.get(LOOKUP_URL); // no params -> PCs
      const list = (data?.pcs || []).map((v) => ({ value: v, label: v }));
      setPcOptions(list);
    } catch (err) {
      console.error("Fetch PCs error:", err);
      setPcOptions([]);
    } finally {
      setPcsLoading(false);
    }
  }, []);

  const fetchConstituencies = useCallback(
    async (pcValue) => {
      if (!pcValue) {
        setAcOptions([]);
        return;
      }
      try {
        setAcLoading(true);
        const { data } = await axios.get(LOOKUP_URL, { params: { pc: pcValue } });
        const list = (data?.constituencies || []).map((v) => ({ value: v, label: v }));
        setAcOptions(list);
      } catch (err) {
        console.error("Fetch ACs error:", err);
        setAcOptions([]);
      } finally {
        setAcLoading(false);
      }
    },
    []
  );

  const fetchWards = useCallback(
    async (acValue, pcValue) => {
      if (!acValue) {
        setWardOptions([]);
        return;
      }
      try {
        setWardsLoading(true);
        const params = pcValue ? { constituency: acValue, pc: pcValue } : { constituency: acValue };
        const { data } = await axios.get(LOOKUP_URL, { params });
        const list = (data?.wards || []).map((v) => ({ value: String(v), label: String(v) }));
        setWardOptions(list);
      } catch (err) {
        console.error("Fetch Wards error:", err);
        setWardOptions([]);
      } finally {
        setWardsLoading(false);
      }
    },
    []
  );

  // On mount, load PCs
  useEffect(() => {
    fetchPCs();
  }, [fetchPCs]);

  // When PC changes, fetch AC, clear downstream
  const onPCChange = (opt) => {
    setSelectedPC(opt);
    setSelectedAC(null);
    setSelectedWard(null);
    setForm((prev) => ({
      ...prev,
      pc: opt?.value || "",
      constituency: "",
      ward: "",
    }));
    fetchConstituencies(opt?.value || "");
    setWardOptions([]);
  };

  // When AC changes, fetch Wards, clear downstream ward
  const onACChange = (opt) => {
    setSelectedAC(opt);
    setSelectedWard(null);
    setForm((prev) => ({
      ...prev,
      constituency: opt?.value || "",
      ward: "",
    }));
    fetchWards(opt?.value || "", selectedPC?.value || "");
  };

  // When Ward changes, just set
  const onWardChange = (opt) => {
    setSelectedWard(opt);
    setForm((prev) => ({
      ...prev,
      ward: opt?.value || "",
    }));
  };

  // --------- other helpers (text fields) ---------
  const handleSimple = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleShsChange = (idx, field, value) => {
    setForm((prev) => {
      const copy = [...prev.shsList];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, shsList: copy };
    });
  };

  const handleOppChange = (idx, field, value) => {
    setForm((prev) => {
      const copy = [...prev.oppList];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, oppList: copy };
    });
  };

  const addShs = () => setForm((p) => ({ ...p, shsList: [...p.shsList, { ...emptyShs }] }));
  const removeShs = (idx) =>
    setForm((p) => ({ ...p, shsList: p.shsList.filter((_, i) => i !== idx) }));

  const addOpp = () => setForm((p) => ({ ...p, oppList: [...p.oppList, { ...emptyOpp }] }));
  const removeOpp = (idx) =>
    setForm((p) => ({ ...p, oppList: p.oppList.filter((_, i) => i !== idx) }));

  // --------- image upload to S3 ---------
  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFileToS3(file);
    setForm((prev) => ({ ...prev, activityImage: url }));
    setUploading(false);
  };

  // --------- submit ---------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        pc: form.pc || "",
        constituency: form.constituency || "",
        ward: form.ward || "",

        probableShsCandidateName: form.shsList.map((x) => x.name || ""),
        shsDesignation: form.shsList.map((x) => x.designation || ""),
        shsActivityType: form.shsList.map((x) => x.activityType || ""),
        shsActivityDetails: form.shsList.map((x) => x.activityDetails || ""),

        oppositionCandidateName: form.oppList.map((x) => x.name || ""),
        candidateParty: form.oppList.map((x) => x.party || ""),
        oppositionCandidateDesignation: form.oppList.map((x) => x.designation || ""),
        oppositionActivityType: form.oppList.map((x) => x.activityType || ""),
        oppositionActivityDetails: form.oppList.map((x) => x.activityDetails || ""),

        majorPoliticalDevelopmentDetails: form.majorPoliticalDevelopmentDetails || "",
        activityImage: form.activityImage || "",
      };

      const res = await axios.post(CREATE_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data?.success) {
        alert("Entry saved ✅");
        setSelectedPC(null);
        setSelectedAC(null);
        setSelectedWard(null);
        setAcOptions([]);
        setWardOptions([]);

        setForm({
          pc: "",
          constituency: "",
          ward: "",
          shsList: [{ ...emptyShs }],
          oppList: [{ ...emptyOpp }],
          majorPoliticalDevelopmentDetails: "",
          activityImage: "",
        });
      } else {
        alert("Failed to save. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error while saving the entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dashboard />
      <div className="record-card">
        <h2 className="title">Record Candidate Activity</h2>

        <form className="form" onSubmit={handleSubmit}>
          {/* Top row: PC, AC, Ward, Image */}
          <div className="grid-4-equal">
            <div className="field">
              <label>Parliamentary Constituency</label>
              <Select
                classNamePrefix="rs"
                isSearchable
                isClearable
                placeholder={pcsLoading ? "Loading PCs..." : "Select PC..."}
                options={pcOptions}
                value={selectedPC}
                onChange={onPCChange}
                isLoading={pcsLoading}
              />
            </div>

            <div className="field">
              <label>Assembly Constituency</label>
              <Select
                classNamePrefix="rs"
                isSearchable
                isClearable
                placeholder={
                  selectedPC ? (acLoading ? "Loading ACs..." : "Select Constituency...") : "Select PC first"
                }
                options={acOptions}
                value={selectedAC}
                onChange={onACChange}
                isDisabled={!selectedPC}
                isLoading={acLoading}
              />
            </div>

            <div className="field">
              <label>Ward / Ward No</label>
              <Select
                classNamePrefix="rs"
                isSearchable
                isClearable
                placeholder={
                  selectedAC ? (wardsLoading ? "Loading Wards..." : "Select Ward...") : "Select AC first"
                }
                options={wardOptions}
                value={selectedWard}
                onChange={onWardChange}
                isDisabled={!selectedAC}
                isLoading={wardsLoading}
              />
            </div>

            <div className="field">
              <label>Activity Image</label>
              <input type="file" accept="image/*" onChange={handleImage} />
              {uploading && <small className="muted">Uploading…</small>}
              {!uploading && form.activityImage && (
                <small className="muted">
                  Uploaded ✓{" "}
                  <a href={form.activityImage} target="_blank" rel="noreferrer">
                    Preview
                  </a>
                </small>
              )}
            </div>
          </div>

          {/* SHS Section */}
          <div className="section-header">
            <h3>Probable SHS Candidate Activity</h3>
            <button type="button" className="btn-secondary" onClick={addShs}>
              + Add SHS Candidate
            </button>
          </div>

          {form.shsList.map((row, idx) => (
            <div key={`shs-${idx}`} className="card soft">
              <div className="grid-4">
                <div className="field">
                  <label>Candidate Name</label>
                  <input
                    value={row.name}
                    onChange={(e) => handleShsChange(idx, "name", e.target.value)}
                    placeholder="Enter Name..."
                  />
                </div>
                <div className="field">
                  <label>Designation</label>
                  <input
                    value={row.designation}
                    onChange={(e) => handleShsChange(idx, "designation", e.target.value)}
                    placeholder="Enter Designation..."
                  />
                </div>
                <div className="field">
                  <label>Activity Type</label>
                  <input
                    value={row.activityType}
                    onChange={(e) => handleShsChange(idx, "activityType", e.target.value)}
                    placeholder="Enter Activity Type..."
                  />
                </div>
                <div className="field">
                  <label>Activity Details</label>
                  <input
                    value={row.activityDetails}
                    onChange={(e) => handleShsChange(idx, "activityDetails", e.target.value)}
                    placeholder="Enter Activity Details..."
                  />
                </div>
              </div>
              {form.shsList.length > 1 && (
                <div className="row-right">
                  <button type="button" className="btn-danger" onClick={() => removeShs(idx)}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Opposition Section */}
          <div className="section-header">
            <h3>Opposition Candidate Activity</h3>
            <button type="button" className="btn-secondary" onClick={addOpp}>
              + Add Opposition Candidate
            </button>
          </div>

          {form.oppList.map((row, idx) => (
            <div key={`opp-${idx}`} className="card soft">
              <div className="grid-5">
                <div className="field">
                  <label>Candidate Name</label>
                  <input
                    value={row.name}
                    onChange={(e) => handleOppChange(idx, "name", e.target.value)}
                    placeholder="Enter Name..."
                  />
                </div>
                <div className="field">
                  <label>Party</label>
                  <input
                    value={row.party}
                    onChange={(e) => handleOppChange(idx, "party", e.target.value)}
                    placeholder="Enter Party..."
                  />
                </div>
                <div className="field">
                  <label>Designation</label>
                  <input
                    value={row.designation}
                    onChange={(e) => handleOppChange(idx, "designation", e.target.value)}
                    placeholder="Enter Designation..."
                  />
                </div>
                <div className="field">
                  <label>Activity Type</label>
                  <input
                    value={row.activityType}
                    onChange={(e) => handleOppChange(idx, "activityType", e.target.value)}
                    placeholder="Enter Activity Type..."
                  />
                </div>
                <div className="field">
                  <label>Activity Details</label>
                  <input
                    value={row.activityDetails}
                    onChange={(e) => handleOppChange(idx, "activityDetails", e.target.value)}
                    placeholder="Enter Activity Details..."
                  />
                </div>
              </div>
              {form.oppList.length > 1 && (
                <div className="row-right">
                  <button type="button" className="btn-danger" onClick={() => removeOpp(idx)}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Major Political Development */}
          <div className="field">
            <label>Major Political Development in Ward (if any)</label>
            <textarea
              rows={3}
              name="majorPoliticalDevelopmentDetails"
              placeholder="Enter details..."
              value={form.majorPoliticalDevelopmentDetails}
              onChange={handleSimple}
            />
          </div>

          {/* Submit */}
          <div className="actions">
            <button className="btn-primary" type="submit" disabled={submitting || uploading}>
              {submitting ? "Saving..." : uploading ? "Uploading Image…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CandidatesDailyActivity;
