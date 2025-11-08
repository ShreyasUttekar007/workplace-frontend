import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import AWS from "aws-sdk";
import "../css/addCandidatesForm.css";
import Dashboard from "./Dashboard";
import DatePicker from "react-datepicker";
import { parse, format, isValid, subDays } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE = process.env.REACT_APP_API_URL || "";
const CREATE_URL = `${API_BASE}/candidates-daily-activities/add-candidates`;
const LOOKUP_URL = `${API_BASE}/candidates-daily-activities/lookup`;

// --- AWS (browser) config (frontend-only) ---
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});
const s3 = new AWS.S3({ signatureVersion: "v4" });

const S3_BUCKET = "mom-files-data-new";
const S3_FOLDER = "candidate-activities";

// ---------- S3 Upload ----------
const uploadFileToS3 = async (file, folder = S3_FOLDER) => {
  try {
    const params = {
      Bucket: S3_BUCKET,
      Key: `${folder}/${Date.now()}_${file.name}`,
      Body: file,
      ContentType: file.type || "application/octet-stream",
    };
    const res = await s3.upload(params).promise();
    return res.Location;
  } catch (error) {
    console.error("❌ Error uploading file to S3:", error);
    return "";
  }
};

// ---------- Dropdown Options ----------
const INITIAL_ACTIVITY_OPTIONS = [
  "Cadre Engagement",
  "Door to Door",
  "Rally",
  "Public/Social gathering or meeting",
  "Influencer Meeting",
  "Alliance meeting",
  "SC Campaign",
  "OBC Campaign",
  "Women meeting",
  "Nomination filing",
  "Inactive",
  "Other",
].map((x) => ({ value: x, label: x }));

// You can edit/extend this; “SHS” kept so Probable can default to it.
const INITIAL_PARTY_OPTIONS = [
  { value: "SHS", label: "SHS" },
  { value: "BJP", label: "BJP" },
  { value: "UBT", label: "UBT" },
  { value: "NCP(AP)", label: "NCP(AP)" },
  { value: "NCP(SP)", label: "NCP(SP)" },
  { value: "MVA", label: "MVA" },
  { value: "INC", label: "INC" },
  { value: "MNS", label: "MNS" },
  { value: "IND", label: "IND" },
  { value: "Other Party", label: "Other Party" },
  { value: "NA", label: "NA" },
];

const toOption = (s) => (s ? { value: s, label: s } : null);
const fromOption = (opt) => (opt ? opt.value : "");

// ---------- Shapes ----------
const emptyActivity = {
  activityType: "", // stored as string
  activityDetails: "",
  activityImage: "",
  date: "",
};
const emptyProbable = {
  name: "",
  designation: "",
  party: "SHS", // default SHS
  activities: [{ ...emptyActivity }],
};
const emptyOpposition = {
  name: "",
  designation: "",
  party: "",
  activities: [{ ...emptyActivity }],
};

function CandidatesDailyActivity() {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // dynamic dropdown option state
  const [activityOptions, setActivityOptions] = useState(
    INITIAL_ACTIVITY_OPTIONS
  );
  const [partyOptions, setPartyOptions] = useState(INITIAL_PARTY_OPTIONS);

  // cascading selects
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
    probableCandidates: [{ ...emptyProbable }],
    oppositionCandidates: [{ ...emptyOpposition }],
    majorPoliticalDevelopmentDetails: "",
  });

  // ---------- LOOKUP ----------
  const fetchPCs = useCallback(async () => {
    try {
      setPcsLoading(true);
      const { data } = await axios.get(LOOKUP_URL);
      setPcOptions((data?.pcs || []).map((v) => ({ value: v, label: v })));
    } catch (err) {
      console.error("Fetch PCs error:", err);
      setPcOptions([]);
    } finally {
      setPcsLoading(false);
    }
  }, []);

  const fetchConstituencies = useCallback(async (pcValue) => {
    if (!pcValue) {
      setAcOptions([]);
      return;
    }
    try {
      setAcLoading(true);
      const { data } = await axios.get(LOOKUP_URL, { params: { pc: pcValue } });
      setAcOptions(
        (data?.constituencies || []).map((v) => ({ value: v, label: v }))
      );
    } catch (err) {
      console.error("Fetch ACs error:", err);
      setAcOptions([]);
    } finally {
      setAcLoading(false);
    }
  }, []);

  const fetchWards = useCallback(async (acValue, pcValue) => {
    if (!acValue) {
      setWardOptions([]);
      return;
    }
    try {
      setWardsLoading(true);
      const params = pcValue
        ? { constituency: acValue, pc: pcValue }
        : { constituency: acValue };
      const { data } = await axios.get(LOOKUP_URL, { params });
      setWardOptions(
        (data?.wards || []).map((v) => ({ value: String(v), label: String(v) }))
      );
    } catch (err) {
      console.error("Fetch Wards error:", err);
      setWardOptions([]);
    } finally {
      setWardsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPCs();
  }, [fetchPCs]);

  // cascades
  const onPCChange = (opt) => {
    setSelectedPC(opt);
    setSelectedAC(null);
    setSelectedWard(null);
    setForm((p) => ({
      ...p,
      pc: opt?.value || "",
      constituency: "",
      ward: "",
    }));
    fetchConstituencies(opt?.value || "");
    setWardOptions([]);
  };
  const onACChange = (opt) => {
    setSelectedAC(opt);
    setSelectedWard(null);
    setForm((p) => ({ ...p, constituency: opt?.value || "", ward: "" }));
    fetchWards(opt?.value || "", selectedPC?.value || "");
  };
  const onWardChange = (opt) => {
    setSelectedWard(opt);
    setForm((p) => ({ ...p, ward: opt?.value || "" }));
  };

  // Probable helpers
  const addProbable = () =>
    setForm((p) => ({
      ...p,
      probableCandidates: [...p.probableCandidates, { ...emptyProbable }],
    }));
  const removeProbable = (idx) =>
    setForm((p) => ({
      ...p,
      probableCandidates: p.probableCandidates.filter((_, i) => i !== idx),
    }));
  const updateProbableField = (idx, field, value) =>
    setForm((p) => {
      const copy = [...p.probableCandidates];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...p, probableCandidates: copy };
    });
  const addProbableActivity = (cIdx) =>
    setForm((p) => {
      const copy = [...p.probableCandidates];
      copy[cIdx] = {
        ...copy[cIdx],
        activities: [...copy[cIdx].activities, { ...emptyActivity }],
      };
      return { ...p, probableCandidates: copy };
    });
  const removeProbableActivity = (cIdx, aIdx) =>
    setForm((p) => {
      const copy = [...p.probableCandidates];
      copy[cIdx] = {
        ...copy[cIdx],
        activities: copy[cIdx].activities.filter((_, i) => i !== aIdx),
      };
      return { ...p, probableCandidates: copy };
    });
  const updateProbableActivity = (cIdx, aIdx, field, value) =>
    setForm((p) => {
      const copy = [...p.probableCandidates];
      const acts = [...copy[cIdx].activities];
      acts[aIdx] = { ...acts[aIdx], [field]: value };
      copy[cIdx] = { ...copy[cIdx], activities: acts };
      return { ...p, probableCandidates: copy };
    });

  // Opposition helpers
  const addOpposition = () =>
    setForm((p) => ({
      ...p,
      oppositionCandidates: [...p.oppositionCandidates, { ...emptyOpposition }],
    }));
  const removeOpposition = (idx) =>
    setForm((p) => ({
      ...p,
      oppositionCandidates: p.oppositionCandidates.filter((_, i) => i !== idx),
    }));
  const updateOppositionField = (idx, field, value) =>
    setForm((p) => {
      const copy = [...p.oppositionCandidates];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...p, oppositionCandidates: copy };
    });
  const addOppositionActivity = (cIdx) =>
    setForm((p) => {
      const copy = [...p.oppositionCandidates];
      copy[cIdx] = {
        ...copy[cIdx],
        activities: [...copy[cIdx].activities, { ...emptyActivity }],
      };
      return { ...p, oppositionCandidates: copy };
    });
  const removeOppositionActivity = (cIdx, aIdx) =>
    setForm((p) => {
      const copy = [...p.oppositionCandidates];
      copy[cIdx] = {
        ...copy[cIdx],
        activities: copy[cIdx].activities.filter((_, i) => i !== aIdx),
      };
      return { ...p, oppositionCandidates: copy };
    });
  const updateOppositionActivity = (cIdx, aIdx, field, value) =>
    setForm((p) => {
      const copy = [...p.oppositionCandidates];
      const acts = [...copy[cIdx].activities];
      acts[aIdx] = { ...acts[aIdx], [field]: value };
      copy[cIdx] = { ...copy[cIdx], activities: acts };
      return { ...p, oppositionCandidates: copy };
    });

  // Upload activity images
  const uploadProbableActivityImage = async (cIdx, aIdx, file) => {
    setUploading(true);
    const url = await uploadFileToS3(file, `${S3_FOLDER}/activity/probable`);
    updateProbableActivity(cIdx, aIdx, "activityImage", url);
    setUploading(false);
  };
  const uploadOppositionActivityImage = async (cIdx, aIdx, file) => {
    setUploading(true);
    const url = await uploadFileToS3(file, `${S3_FOLDER}/activity/opposition`);
    updateOppositionActivity(cIdx, aIdx, "activityImage", url);
    setUploading(false);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
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
          probableCandidates: [{ ...emptyProbable }],
          oppositionCandidates: [{ ...emptyOpposition }],
          majorPoliticalDevelopmentDetails: "",
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

  // Date helpers
  const parseDMY = (s) => {
    if (!s) return null;
    const d = parse(s, "dd-MM-yyyy", new Date());
    return isValid(d) ? d : null;
  };
  const formatDMY = (d) => (d && isValid(d) ? format(d, "dd-MM-yyyy") : "");
  const YESTERDAY = subDays(new Date(), 1);

  // Creatable handlers (activity type & party)
  const onCreateActivityOption = (inputValue) => {
    const newOpt = { value: inputValue, label: inputValue };
    setActivityOptions((prev) => [...prev, newOpt]);
    return newOpt;
  };
  const onCreatePartyOption = (inputValue) => {
    const newOpt = { value: inputValue, label: inputValue };
    setPartyOptions((prev) => [...prev, newOpt]);
    return newOpt;
  };

  // keep classNamePrefix="rs" everywhere so CSS below applies
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 42,
      height: 42,
      borderRadius: 10,
      borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
      "&:hover": { borderColor: state.isFocused ? "#2563eb" : "#cbd5e1" },
      fontSize: 14,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "2px 8px",
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      lineHeight: 1,
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: 42,
    }),
    clearIndicator: (base) => ({ ...base, padding: 6 }),
    dropdownIndicator: (base) => ({ ...base, padding: 6 }),
    singleValue: (base) => ({ ...base, marginLeft: 0, marginRight: 0 }),
    placeholder: (base) => ({ ...base, color: "#6b7280" }),
    menu: (base) => ({
      ...base,
      zIndex: 7, // above datepicker/selects
    }),
  };

  return (
    <>
      <Dashboard />
      <div className="record-card">
        <h2 className="title">Record Candidate Activity</h2>

        <form className="form" onSubmit={handleSubmit}>
          {/* Top row: PC, AC, Ward */}
          <div className="grid-3-equal">
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
                  selectedPC
                    ? acLoading
                      ? "Loading ACs..."
                      : "Select Constituency..."
                    : "Select PC first"
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
                  selectedAC
                    ? wardsLoading
                      ? "Loading Wards..."
                      : "Select Ward..."
                    : "Select AC first"
                }
                options={wardOptions}
                value={selectedWard}
                onChange={onWardChange}
                isDisabled={!selectedAC}
                isLoading={wardsLoading}
              />
            </div>
          </div>

          {/* Probable SHS Candidates */}
          <div className="section-header">
            <h3>Probable SHS Candidates</h3>
            <button
              type="button"
              className="btn-secondary"
              onClick={addProbable}
            >
              + Add SHS Candidate
            </button>
          </div>

          {form.probableCandidates.map((c, cIdx) => (
            <div key={`prob-${cIdx}`} className="card soft">
              <div className="grid-4">
                <div className="field">
                  <label>Name</label>
                  <input
                    value={c.name}
                    onChange={(e) =>
                      updateProbableField(cIdx, "name", e.target.value)
                    }
                    placeholder="Enter Name..."
                  />
                </div>
                <div className="field">
                  <label>Designation</label>
                  <input
                    value={c.designation}
                    onChange={(e) =>
                      updateProbableField(cIdx, "designation", e.target.value)
                    }
                    placeholder="Enter Designation..."
                  />
                </div>
                <div className="field">
                  <label>Party</label>
                  <CreatableSelect
                    classNamePrefix="rs"
                    isClearable
                    isSearchable
                    placeholder="Select or add party..."
                    options={partyOptions}
                    value={toOption(c.party)}
                    onChange={(opt) =>
                      updateProbableField(cIdx, "party", fromOption(opt))
                    }
                    onCreateOption={(input) => {
                      const created = onCreatePartyOption(input);
                      updateProbableField(cIdx, "party", created.value);
                    }}
                  />
                </div>
                <div className="field align-end">
                  {form.probableCandidates.length > 1 && (
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => removeProbable(cIdx)}
                    >
                      Remove Candidate
                    </button>
                  )}
                </div>
              </div>

              <div className="activities">
                <div className="activities-header">
                  <h4>Activities</h4>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => addProbableActivity(cIdx)}
                  >
                    + Add Activity
                  </button>
                </div>

                {c.activities.map((a, aIdx) => (
                  <div
                    key={`prob-${cIdx}-act-${aIdx}`}
                    className="activity-row"
                  >
                    <div className="grid-4">
                      <div className="field">
                        <label>Activity Type</label>
                        <CreatableSelect
                          classNamePrefix="rs"
                          styles={selectStyles}
                          isClearable
                          isSearchable
                          options={activityOptions}
                          value={toOption(a.activityType)}
                          onChange={(opt) =>
                            updateProbableActivity(
                              cIdx,
                              aIdx,
                              "activityType",
                              fromOption(opt)
                            )
                          }
                          onCreateOption={(input) => {
                            const created = onCreateActivityOption(input);
                            updateProbableActivity(
                              cIdx,
                              aIdx,
                              "activityType",
                              created.value
                            );
                          }}
                          placeholder="Select or add type..."
                        />
                      </div>

                      <div className="field">
                        <label>Activity Date (DD-MM-YYYY)</label>
                        <DatePicker
                          selected={parseDMY(a.date)}
                          onChange={(date) => {
                            const safe =
                              date && date < YESTERDAY ? YESTERDAY : date;
                            updateProbableActivity(
                              cIdx,
                              aIdx,
                              "date",
                              formatDMY(safe)
                            );
                          }}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="dd-mm-yyyy"
                          isClearable
                          className="date-input"
                          wrapperClassName="date-wrapper"
                          calendarClassName="cdp-calendar"
                          popperClassName="cdp-popper"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          minDate={YESTERDAY}
                        />
                      </div>
                      <div className="field">
                        <label>Activity Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            uploadProbableActivityImage(
                              cIdx,
                              aIdx,
                              e.target.files[0]
                            )
                          }
                        />
                        {a.activityImage && (
                          <small className="muted">
                            Uploaded ✓{" "}
                            <a
                              href={a.activityImage}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Preview
                            </a>
                          </small>
                        )}
                      </div>
                      <div className="field">
                        <label>Details</label>
                        <textarea
                          rows={3}
                          value={a.activityDetails}
                          onChange={(e) =>
                            updateProbableActivity(
                              cIdx,
                              aIdx,
                              "activityDetails",
                              e.target.value
                            )
                          }
                          placeholder="Enter details..."
                        />
                      </div>
                      <div className="field align-end">
                        {c.activities.length > 1 && (
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => removeProbableActivity(cIdx, aIdx)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Opposition Candidates */}
          <div className="section-header">
            <h3>Opposition Candidates</h3>
            <button
              type="button"
              className="btn-secondary"
              onClick={addOpposition}
            >
              + Add Opposition Candidate
            </button>
          </div>

          {form.oppositionCandidates.map((c, cIdx) => (
            <div key={`opp-${cIdx}`} className="card soft">
              <div className="grid-4">
                <div className="field">
                  <label>Name</label>
                  <input
                    value={c.name}
                    onChange={(e) =>
                      updateOppositionField(cIdx, "name", e.target.value)
                    }
                    placeholder="Enter Name..."
                  />
                </div>
                <div className="field">
                  <label>Designation</label>
                  <input
                    value={c.designation}
                    onChange={(e) =>
                      updateOppositionField(cIdx, "designation", e.target.value)
                    }
                    placeholder="Enter Designation..."
                  />
                </div>
                <div className="field">
                  <label>Party</label>
                  <CreatableSelect
                    classNamePrefix="rs"
                    isClearable
                    isSearchable
                    placeholder="Select or add party..."
                    options={partyOptions}
                    value={toOption(c.party)}
                    onChange={(opt) =>
                      updateOppositionField(cIdx, "party", fromOption(opt))
                    }
                    onCreateOption={(input) => {
                      const created = onCreatePartyOption(input);
                      updateOppositionField(cIdx, "party", created.value);
                    }}
                  />
                </div>
                <div className="field align-end">
                  {form.oppositionCandidates.length > 1 && (
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => removeOpposition(cIdx)}
                    >
                      Remove Candidate
                    </button>
                  )}
                </div>
              </div>

              <div className="activities">
                <div className="activities-header">
                  <h4>Activities</h4>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => addOppositionActivity(cIdx)}
                  >
                    + Add Activity
                  </button>
                </div>

                {c.activities.map((a, aIdx) => (
                  <div key={`opp-${cIdx}-act-${aIdx}`} className="activity-row">
                    <div className="grid-4">
                      <div className="field">
                        <label>Activity Type</label>
                        <CreatableSelect
                          classNamePrefix="rs"
                          styles={selectStyles}
                          isClearable
                          isSearchable
                          options={activityOptions}
                          value={toOption(a.activityType)}
                          onChange={(opt) =>
                            updateProbableActivity(
                              cIdx,
                              aIdx,
                              "activityType",
                              fromOption(opt)
                            )
                          }
                          onCreateOption={(input) => {
                            const created = onCreateActivityOption(input);
                            updateProbableActivity(
                              cIdx,
                              aIdx,
                              "activityType",
                              created.value
                            );
                          }}
                          placeholder="Select or add type..."
                        />
                      </div>

                      <div className="field">
                        <label>Date (DD-MM-YYYY)</label>
                        <DatePicker
                          selected={parseDMY(a.date)}
                          onChange={(date) => {
                            const safe =
                              date && date < YESTERDAY ? YESTERDAY : date;
                            updateOppositionActivity(
                              cIdx,
                              aIdx,
                              "date",
                              formatDMY(safe)
                            );
                          }}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="dd-mm-yyyy"
                          isClearable
                          className="date-input"
                          wrapperClassName="date-wrapper"
                          calendarClassName="cdp-calendar"
                          popperClassName="cdp-popper"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          minDate={YESTERDAY}
                        />
                      </div>
                      <div className="field">
                        <label>Activity Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            uploadOppositionActivityImage(
                              cIdx,
                              aIdx,
                              e.target.files[0]
                            )
                          }
                        />
                        {a.activityImage && (
                          <small className="muted">
                            Uploaded ✓{" "}
                            <a
                              href={a.activityImage}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Preview
                            </a>
                          </small>
                        )}
                      </div>
                      <div className="field">
                        <label>Details</label>
                        <textarea
                          rows={3}
                          value={a.activityDetails}
                          onChange={(e) =>
                            updateOppositionActivity(
                              cIdx,
                              aIdx,
                              "activityDetails",
                              e.target.value
                            )
                          }
                          placeholder="Enter details..."
                        />
                      </div>
                      <div className="field align-end">
                        {c.activities.length > 1 && (
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() => removeOppositionActivity(cIdx, aIdx)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  majorPoliticalDevelopmentDetails: e.target.value,
                }))
              }
            />
          </div>

          {/* Submit */}
          <div className="actions">
            <button
              className="btn-primary"
              type="submit"
              disabled={submitting || uploading}
            >
              {submitting ? "Saving..." : uploading ? "Uploading…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CandidatesDailyActivity;
