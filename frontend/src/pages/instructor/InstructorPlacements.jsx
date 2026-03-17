import { useEffect, useState } from "react";
import { Plus, X, CheckCircle } from "lucide-react";
import api from "../../api/axios";
import PeriodSelector from "../../components/PeriodSelector";
import usePeriods from "../../hooks/usePeriods";

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

export default function InstructorPlacements() {
  const [placements, setPlacements] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusModal, setStatusModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [form, setForm] = useState({
    studentID: "",
    coordinatorID: "",
    companyID: "",
    startDate: "",
    endDate: "",
    periodID: "",
  });
  const [statusForm, setStatusForm] = useState({
    placementStatus: "NOT_PLACED",
    instructorNote: "",
  });

  const { periods, selectedPeriod, setSelectedPeriod } = usePeriods();

  const fetchAll = async () => {
    try {
      const [p, s, co, coord, instr] = await Promise.all([
        api.get("/placements").catch(() => ({ data: [] })),
        api.get("/instructors/my-students").catch(() => ({ data: [] })),
        api.get("/companies").catch(() => ({ data: [] })),
        api.get("/coordinators").catch(() => ({ data: [] })),
        api.get("/instructors/me").catch(() => ({ data: null })),
      ]);
      setPlacements(p.data);
      setStudents(s.data);
      setCompanies(co.data);
      setCoordinators(coord.data);
      setInstructor(instr.data);
    } catch (err) {
      console.error("fetchAll error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/placements", {
        studentID: parseInt(form.studentID),
        coordinatorID: parseInt(form.coordinatorID),
        companyID: parseInt(form.companyID),
        startDate: form.startDate,
        endDate: form.endDate,
        periodID: parseInt(form.periodID),
      });
      setShowModal(false);
      setForm({
        studentID: "",
        coordinatorID: "",
        companyID: "",
        startDate: "",
        endDate: "",
        periodID: "",
      });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating placement");
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.patch(
        `/placements/${statusModal.placementID}/status`,
        statusForm,
      );
      setStatusModal(null);
      fetchAll();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const filtered = placements.filter((p) => {
    const matchPeriod =
      selectedPeriod === "all" || String(p.periodID) === String(selectedPeriod);
    const matchStatus =
      filterStatus === "ALL" || p.placementStatus === filterStatus;
    return matchPeriod && matchStatus;
  });

  const counts = placements.reduce((acc, p) => {
    acc[p.placementStatus] = (acc[p.placementStatus] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              color: "#fff",
              fontSize: "24px",
              fontWeight: "700",
              margin: 0,
            }}
          >
            Placements
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            {instructor?.department?.name} — {filtered.length} placements
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
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <PeriodSelector
            periods={periods}
            selectedPeriod={selectedPeriod}
            onChange={setSelectedPeriod}
          />
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#FEC200",
              color: "#000",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> New Placement
          </button>
        </div>
      </div>

      {/* Filter buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setFilterStatus("ALL")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            backgroundColor: filterStatus === "ALL" ? "#FEC200" : "#1a1a1a",
            color: filterStatus === "ALL" ? "#000" : "#888",
            border: filterStatus === "ALL" ? "none" : "1px solid #333",
          }}
        >
          All ({filtered.length})
        </button>
        {Object.entries(STATUS_STYLES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              backgroundColor: filterStatus === key ? val.bg : "#1a1a1a",
              color: filterStatus === key ? val.color : "#888",
              border: `1px solid ${filterStatus === key ? val.color : "#333"}`,
            }}
          >
            {val.label} ({counts[key] || 0})
          </button>
        ))}
      </div>

      {/* Table */}
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
                "Period",
                "Dates",
                "Status",
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
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    color: "#555",
                    padding: "32px",
                    textAlign: "center",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    color: "#555",
                    padding: "32px",
                    textAlign: "center",
                  }}
                >
                  No placements found
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const s = STATUS_STYLES[p.placementStatus];
                const periodName =
                  periods.find((pr) => pr.periodID === p.periodID)?.name ||
                  `Period #${p.periodID}`;
                return (
                  <tr
                    key={p.placementID}
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
                        {p.student?.firstName} {p.student?.lastName}
                      </p>
                      <p
                        style={{
                          color: "#555",
                          fontSize: "12px",
                          margin: "2px 0 0 0",
                        }}
                      >
                        {p.student?.admissionNumber}
                      </p>
                      {p.studentReported &&
                        p.placementStatus === "PLACED_NOT_REPORTED" && (
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
                        {p.student?.course} {p.student?.level}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <p style={{ color: "#fff", fontSize: "13px", margin: 0 }}>
                        {p.company?.name || "—"}
                      </p>
                      <p
                        style={{
                          color: "#555",
                          fontSize: "12px",
                          margin: "2px 0 0 0",
                        }}
                      >
                        {p.company?.location}
                      </p>
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        color: "#888",
                        fontSize: "13px",
                      }}
                    >
                      {periodName}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <p style={{ color: "#888", fontSize: "12px", margin: 0 }}>
                        {new Date(p.startDate).toLocaleDateString()}
                      </p>
                      <p
                        style={{
                          color: "#888",
                          fontSize: "12px",
                          margin: "2px 0 0 0",
                        }}
                      >
                        → {new Date(p.endDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span
                        style={{
                          backgroundColor: s.bg,
                          color: s.color,
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <button
                        onClick={() => {
                          setStatusModal(p);
                          setStatusForm({
                            placementStatus: p.placementStatus,
                            instructorNote: p.instructorNote || "",
                          });
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: "rgba(254,194,0,0.1)",
                          border: "1px solid rgba(254,194,0,0.3)",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          cursor: "pointer",
                          color: "#FEC200",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        <CheckCircle size={13} /> Update
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
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
              maxWidth: "460px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
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
                New Placement
              </h2>
              <button
                onClick={() => setShowModal(false)}
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
            {[
              {
                label: "Student",
                key: "studentID",
                options: students.map((s) => ({
                  value: s.studentID,
                  label: `${s.firstName} ${s.lastName} — ${s.course} ${s.level}`,
                })),
              },
              {
                label: "Company",
                key: "companyID",
                options: companies.map((c) => ({
                  value: c.companyID,
                  label: `${c.name} (${c.location})`,
                })),
              },
              {
                label: "Coordinator",
                key: "coordinatorID",
                options: coordinators.map((c) => ({
                  value: c.coordinatorID,
                  label: `${c.firstName} ${c.lastName}`,
                })),
              },
              {
                label: "Period",
                key: "periodID",
                options: periods.map((p) => ({
                  value: p.periodID,
                  label: `${p.name}${p.isCurrent ? " ⭐" : ""}`,
                })),
              },
            ].map(({ label, key, options }) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    color: "#aaa",
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </label>
                <select
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Select {label.toLowerCase()}</option>
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {[
              { key: "startDate", label: "Start Date" },
              { key: "endDate", label: "End Date" },
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    color: "#aaa",
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </label>
                <input
                  type="date"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={inputStyle}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={() => setShowModal(false)}
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
                onClick={handleCreate}
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
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
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
                Update Status
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
            <p
              style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}
            >
              {statusModal.student?.firstName} {statusModal.student?.lastName} —{" "}
              <span style={{ color: "#FEC200" }}>
                {statusModal.student?.course} {statusModal.student?.level}
              </span>
            </p>
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
                placeholder="e.g. Visited student at company..."
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
    </div>
  );
}
