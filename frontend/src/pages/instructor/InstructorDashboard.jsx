import { useEffect, useState } from "react";
import { CheckCircle, X, Plus } from "lucide-react";
import api from "../../api/axios";

const STATUS_STYLES = {
  PLACED_AND_REPORTED: {
    color: "#4ade80",
    bg: "rgba(74,222,128,0.15)",
    label: "Placed & Reported",
  },
  PLACED_NOT_REPORTED: {
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.15)",
    label: "Placed Not Reported",
  },
  NOT_PLACED: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    label: "Not Placed",
  },
  DISCIPLINARY: {
    color: "#CC0000",
    bg: "rgba(204,0,0,0.15)",
    label: "Disciplinary",
  },
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  backgroundColor: "#111",
  border: "1px solid #333",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

export default function InstructorDashboard() {
  const [instructor, setInstructor] = useState(null);
  const [students, setStudents] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(null);
  const [scoreModal, setScoreModal] = useState(null);
  const [visitModal, setVisitModal] = useState(null);
  const [statusForm, setStatusForm] = useState({
    placementStatus: "NOT_PLACED",
    instructorNote: "",
  });
  const [scoreForm, setScoreForm] = useState({
    periodID: "",
    attendance: "",
    academic: "",
    behavior: "",
  });
  const [visitForm, setVisitForm] = useState({
    visitDate: "",
    notes: "",
    placementID: "",
  });
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const [instrRes, studRes, perRes] = await Promise.all([
        api.get("/instructors/me"),
        api.get("/instructors/my-students"),
        api.get("/periods"),
      ]);
      setInstructor(instrRes.data);
      setStudents(studRes.data);
      setPeriods(perRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats
  const stats = students.reduce((acc, s) => {
    const status = s.ojtPlacements?.[0]?.placementStatus || "NOT_PLACED";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const filtered = students.filter((s) => {
    const status = s.ojtPlacements?.[0]?.placementStatus || "NOT_PLACED";
    const matchStatus = filterStatus === "ALL" || status === filterStatus;
    const matchSearch = `${s.firstName} ${s.lastName} ${s.admissionNumber}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleStatusUpdate = async () => {
    try {
      await api.patch(
        `/placements/${statusModal.placementID}/status`,
        statusForm,
      );
      setStatusModal(null);
      fetchData();
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const handleScoreSave = async () => {
    try {
      await api.post("/studentscores", {
        studentID: scoreModal.studentID,
        periodID: parseInt(scoreForm.periodID),
        attendance: parseFloat(scoreForm.attendance),
        academic: parseFloat(scoreForm.academic),
        behavior: scoreForm.behavior ? parseFloat(scoreForm.behavior) : null,
      });
      setScoreModal(null);
      setScoreForm({
        periodID: "",
        attendance: "",
        academic: "",
        behavior: "",
      });
      fetchData();
    } catch (err) {
      alert("Error saving score.");
    }
  };

  const handleVisitLog = async () => {
    try {
      await api.post("/visits", {
        placementID: parseInt(visitForm.placementID),
        instructorID: instructor.instructorID,
        visitDate: visitForm.visitDate,
        notes: visitForm.notes,
      });
      setVisitModal(null);
      setVisitForm({ visitDate: "", notes: "", placementID: "" });
      fetchData();
    } catch (err) {
      alert("Error logging visit.");
    }
  };

  if (loading)
    return <div style={{ color: "#888", padding: "40px" }}>Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            color: "#fff",
            fontSize: "24px",
            fontWeight: "700",
            margin: 0,
          }}
        >
          Welcome, {instructor?.firstName} 👋
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
          {instructor?.department?.name} — OJT Instructor Portal
        </p>
        <div
          style={{
            marginTop: "8px",
            height: "3px",
            width: "48px",
            backgroundColor: "#FEC200",
            borderRadius: "2px",
          }}
        />
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total Students", value: students.length, color: "#FEC200" },
          {
            label: "Placed & Reported",
            value: stats.PLACED_AND_REPORTED || 0,
            color: "#4ade80",
          },
          {
            label: "Placed Not Reported",
            value: stats.PLACED_NOT_REPORTED || 0,
            color: "#60a5fa",
          },
          {
            label: "Not Placed",
            value: stats.NOT_PLACED || 0,
            color: "#f59e0b",
          },
          {
            label: "Disciplinary",
            value: stats.DISCIPLINARY || 0,
            color: "#CC0000",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              padding: "18px 22px",
              flex: 1,
              minWidth: "130px",
              borderTop: `3px solid ${color}`,
            }}
          >
            <p style={{ color: "#666", fontSize: "12px", margin: "0 0 6px 0" }}>
              {label}
            </p>
            <p
              style={{ color, fontSize: "26px", fontWeight: "700", margin: 0 }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Pending self-reports alert */}
      {students.some(
        (s) =>
          s.ojtPlacements?.[0]?.studentReported &&
          s.ojtPlacements?.[0]?.placementStatus === "PLACED_NOT_REPORTED",
      ) && (
        <div
          style={{
            backgroundColor: "rgba(96,165,250,0.1)",
            border: "1px solid rgba(96,165,250,0.3)",
            borderRadius: "10px",
            padding: "14px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>🔔</span>
          <p style={{ color: "#60a5fa", fontSize: "14px", margin: 0 }}>
            Some students have self-reported and are awaiting your confirmation
          </p>
        </div>
      )}

      {/* Search + Filter */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <input
          placeholder="Search student name or admission no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: "300px" }}
        />
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", ...Object.keys(STATUS_STYLES)].map((key) => {
            const s = STATUS_STYLES[key];
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  backgroundColor:
                    filterStatus === key ? s?.bg || "#FEC200" : "#1a1a1a",
                  color: filterStatus === key ? s?.color || "#000" : "#666",
                  border: `1px solid ${filterStatus === key ? s?.color || "#FEC200" : "#333"}`,
                }}
              >
                {s?.label || "All"}{" "}
                {key !== "ALL"
                  ? `(${stats[key] || 0})`
                  : `(${students.length})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Students Table */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#111",
                borderBottom: "1px solid #2a2a2a",
              }}
            >
              {[
                "Student",
                "Class",
                "Company",
                "Status",
                "Latest Score",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    textAlign: "left",
                    padding: "13px 16px",
                    fontWeight: "600",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    color: "#555",
                    padding: "32px",
                    textAlign: "center",
                  }}
                >
                  No students found
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const placement = s.ojtPlacements?.[0];
                const score = s.scores?.[0];
                const st =
                  STATUS_STYLES[placement?.placementStatus] ||
                  STATUS_STYLES.NOT_PLACED;
                return (
                  <tr
                    key={s.studentID}
                    style={{ borderBottom: "1px solid #1e1e1e" }}
                  >
                    <td style={{ padding: "13px 16px" }}>
                      <p
                        style={{
                          color: "#fff",
                          fontWeight: "600",
                          fontSize: "14px",
                          margin: 0,
                        }}
                      >
                        {s.firstName} {s.lastName}
                      </p>
                      <p
                        style={{
                          color: "#555",
                          fontSize: "12px",
                          margin: "2px 0 0 0",
                        }}
                      >
                        {s.admissionNumber}
                      </p>
                      {placement?.studentReported &&
                        placement?.placementStatus ===
                          "PLACED_NOT_REPORTED" && (
                          <span
                            style={{
                              backgroundColor: "rgba(96,165,250,0.15)",
                              color: "#60a5fa",
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              marginTop: "3px",
                              display: "inline-block",
                            }}
                          >
                            🔔 Self-reported
                          </span>
                        )}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span
                        style={{
                          backgroundColor: "rgba(254,194,0,0.1)",
                          color: "#FEC200",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {s.course} {s.level}
                      </span>
                      <p
                        style={{
                          color: "#555",
                          fontSize: "11px",
                          margin: "4px 0 0 0",
                        }}
                      >
                        {s.category}
                      </p>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <p style={{ color: "#fff", fontSize: "13px", margin: 0 }}>
                        {placement?.company?.name || "—"}
                      </p>
                      <p
                        style={{
                          color: "#555",
                          fontSize: "12px",
                          margin: "2px 0 0 0",
                        }}
                      >
                        {placement?.company?.location || ""}
                      </p>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span
                        style={{
                          backgroundColor: st.bg,
                          color: st.color,
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {st.label}
                      </span>
                      {placement?.instructorNote && (
                        <p
                          style={{
                            color: "#444",
                            fontSize: "11px",
                            margin: "4px 0 0 0",
                            maxWidth: "160px",
                          }}
                        >
                          {placement.instructorNote}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {score ? (
                        <div>
                          <p
                            style={{
                              color: "#FEC200",
                              fontWeight: "700",
                              fontSize: "16px",
                              margin: 0,
                            }}
                          >
                            {score.totalScore.toFixed(1)}
                          </p>
                          <p
                            style={{
                              color: "#555",
                              fontSize: "11px",
                              margin: "2px 0 0 0",
                            }}
                          >
                            A:{score.attendance}% | Ac:{score.academic}%
                            {score.behavior != null
                              ? ` | B:${score.behavior}%`
                              : ""}
                          </p>
                        </div>
                      ) : (
                        <span style={{ color: "#444", fontSize: "13px" }}>
                          No score yet
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Update Status */}
                        {placement && (
                          <button
                            onClick={() => {
                              setStatusModal(placement);
                              setStatusForm({
                                placementStatus: placement.placementStatus,
                                instructorNote: placement.instructorNote || "",
                              });
                            }}
                            style={{
                              backgroundColor: "rgba(254,194,0,0.1)",
                              border: "1px solid rgba(254,194,0,0.3)",
                              borderRadius: "6px",
                              padding: "5px 10px",
                              cursor: "pointer",
                              color: "#FEC200",
                              fontSize: "11px",
                              fontWeight: "600",
                            }}
                          >
                            ✏️ Status
                          </button>
                        )}
                        {/* Add Score */}
                        <button
                          onClick={() => {
                            setScoreModal(s);
                            setScoreForm({
                              periodID: periods[0]?.periodID || "",
                              attendance: score?.attendance || "",
                              academic: score?.academic || "",
                              behavior: score?.behavior || "",
                            });
                          }}
                          style={{
                            backgroundColor: "rgba(74,222,128,0.1)",
                            border: "1px solid rgba(74,222,128,0.3)",
                            borderRadius: "6px",
                            padding: "5px 10px",
                            cursor: "pointer",
                            color: "#4ade80",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        >
                          📊 Score
                        </button>
                        {/* Log Visit */}
                        {placement && (
                          <button
                            onClick={() => {
                              setVisitModal(s);
                              setVisitForm({
                                visitDate: "",
                                notes: "",
                                placementID: placement.placementID,
                              });
                            }}
                            style={{
                              backgroundColor: "rgba(96,165,250,0.1)",
                              border: "1px solid rgba(96,165,250,0.3)",
                              borderRadius: "6px",
                              padding: "5px 10px",
                              cursor: "pointer",
                              color: "#60a5fa",
                              fontSize: "11px",
                              fontWeight: "600",
                            }}
                          >
                            🚗 Visit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Status Update Modal */}
      {statusModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                Update Placement Status
              </h2>
              <button
                onClick={() => setStatusModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {Object.entries(STATUS_STYLES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() =>
                    setStatusForm({ ...statusForm, placementStatus: key })
                  }
                  style={{
                    padding: "11px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    textAlign: "left",
                    backgroundColor:
                      statusForm.placementStatus === key ? val.bg : "#111",
                    color:
                      statusForm.placementStatus === key ? val.color : "#666",
                    border:
                      statusForm.placementStatus === key
                        ? `1px solid ${val.color}`
                        : "1px solid #222",
                  }}
                >
                  {statusForm.placementStatus === key ? "✓ " : ""}
                  {val.label}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  color: "#aaa",
                  fontSize: "13px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Instructor Note
              </label>
              <textarea
                value={statusForm.instructorNote}
                onChange={(e) =>
                  setStatusForm({
                    ...statusForm,
                    instructorNote: e.target.value,
                  })
                }
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="e.g. Visited student at company on..."
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setStatusModal(null)}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "transparent",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#FEC200",
                  border: "none",
                  borderRadius: "8px",
                  color: "#000",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Score Modal */}
      {scoreModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                Add Score — {scoreModal.firstName} {scoreModal.lastName}
              </h2>
              <button
                onClick={() => setScoreModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  color: "#aaa",
                  fontSize: "13px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Period
              </label>
              <select
                value={scoreForm.periodID}
                onChange={(e) =>
                  setScoreForm({ ...scoreForm, periodID: e.target.value })
                }
                style={inputStyle}
              >
                <option value="">Select period</option>
                {periods.map((p) => (
                  <option key={p.periodID} value={p.periodID}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {[
              {
                key: "attendance",
                label: "Attendance (%)",
                hint: "Weight: 40%",
              },
              { key: "academic", label: "Academic (%)", hint: "Weight: 50%" },
              {
                key: "behavior",
                label: "Behavior (%) — optional",
                hint: "Weight: 10%",
              },
            ].map(({ key, label, hint }) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    color: "#aaa",
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {label}{" "}
                  <span style={{ color: "#555", fontSize: "11px" }}>
                    {hint}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoreForm[key]}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, [key]: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="0 - 100"
                />
              </div>
            ))}
            {/* Preview total */}
            {scoreForm.attendance && scoreForm.academic && (
              <div
                style={{
                  backgroundColor: "#111",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    margin: "0 0 4px 0",
                  }}
                >
                  Calculated Total Score
                </p>
                <p
                  style={{
                    color: "#FEC200",
                    fontSize: "22px",
                    fontWeight: "700",
                    margin: 0,
                  }}
                >
                  {(
                    parseFloat(scoreForm.attendance) * 0.4 +
                    parseFloat(scoreForm.academic) * 0.5 +
                    (parseFloat(scoreForm.behavior) || 0) * 0.1
                  ).toFixed(1)}
                </p>
              </div>
            )}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setScoreModal(null)}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "transparent",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleScoreSave}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#FEC200",
                  border: "none",
                  borderRadius: "8px",
                  color: "#000",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Save Score
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visit Modal */}
      {visitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                Log Visit — {visitModal.firstName} {visitModal.lastName}
              </h2>
              <button
                onClick={() => setVisitModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  color: "#aaa",
                  fontSize: "13px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Visit Date
              </label>
              <input
                type="date"
                value={visitForm.visitDate}
                onChange={(e) =>
                  setVisitForm({ ...visitForm, visitDate: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  color: "#aaa",
                  fontSize: "13px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Visit Notes
              </label>
              <textarea
                value={visitForm.notes}
                onChange={(e) =>
                  setVisitForm({ ...visitForm, notes: e.target.value })
                }
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="e.g. Student was present, working on engine maintenance..."
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setVisitModal(null)}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "transparent",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVisitLog}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#FEC200",
                  border: "none",
                  borderRadius: "8px",
                  color: "#000",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Log Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
