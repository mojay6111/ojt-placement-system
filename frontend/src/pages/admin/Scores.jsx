import { useEffect, useState } from "react";
import { ClipboardList, Plus, X } from "lucide-react";
import api from "../../api/axios";

export default function Scores() {
  const [scores, setScores] = useState([]);
  const [students, setStudents] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [form, setForm] = useState({ studentID: "", periodID: "", attendance: "", academic: "", behavior: "" });

  const fetchData = async () => {
    try {
      const [studentsRes, periodsRes] = await Promise.all([
        api.get("/students"),
        api.get("/periods"),
      ]);
      setStudents(studentsRes.data);
      setPeriods(periodsRes.data);
      if (periodsRes.data.length > 0) {
        const pid = periodsRes.data[0].periodID;
        setSelectedPeriod(pid);
        const scoresRes = await api.get(`/studentscores/period/${pid}`);
        setScores(scoresRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePeriodChange = async (pid) => {
    setSelectedPeriod(pid);
    try {
      const res = await api.get(`/studentscores/period/${pid}`);
      setScores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post("/studentscores", {
        studentID: parseInt(form.studentID),
        periodID: parseInt(form.periodID),
        attendance: parseFloat(form.attendance),
        academic: parseFloat(form.academic),
        behavior: form.behavior ? parseFloat(form.behavior) : null,
      });
      setShowModal(false);
      setForm({ studentID: "", periodID: "", attendance: "", academic: "", behavior: "" });
      if (selectedPeriod) handlePeriodChange(selectedPeriod);
    } catch (err) {
      console.error(err);
      alert("Error adding score. Student may already have a score for this period.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "700", margin: 0 }}>Student Scores</h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>{scores.length} scores recorded</p>
          <div style={{ marginTop: "8px", height: "3px", width: "48px", backgroundColor: "#FEC200", borderRadius: "2px" }} />
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#FEC200", color: "#000", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
          <Plus size={16} /> Add Score
        </button>
      </div>

      {/* Period Filter */}
      <div style={{ marginBottom: "20px" }}>
        <select
          value={selectedPeriod}
          onChange={(e) => handlePeriodChange(e.target.value)}
          style={{ padding: "10px 14px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none" }}
        >
          {periods.map((p) => (
            <option key={p.periodID} value={p.periodID}>{p.name}</option>
          ))}
        </select>
      </div>

      <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2a2a2a", backgroundColor: "#111" }}>
              {["Student", "Attendance", "Academic", "Behavior", "Total Score"].map((h) => (
                <th key={h} style={{ color: "#666", fontSize: "12px", textAlign: "left", padding: "14px 16px", fontWeight: "600" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ color: "#555", padding: "32px", textAlign: "center" }}>Loading...</td></tr>
            ) : scores.length === 0 ? (
              <tr><td colSpan={5} style={{ color: "#555", padding: "32px", textAlign: "center" }}>No scores for this period</td></tr>
            ) : scores.map((s) => (
              <tr key={s.scoreID} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "14px 16px", color: "#fff", fontSize: "14px" }}>
                  {s.student?.firstName} {s.student?.lastName}
                </td>
                <td style={{ padding: "14px 16px", color: "#888", fontSize: "13px" }}>{s.attendance}%</td>
                <td style={{ padding: "14px 16px", color: "#888", fontSize: "13px" }}>{s.academic}%</td>
                <td style={{ padding: "14px 16px", color: "#888", fontSize: "13px" }}>{s.behavior ?? "—"}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ backgroundColor: "rgba(254,194,0,0.15)", color: "#FEC200", padding: "4px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>
                    {s.totalScore.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "420px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", margin: 0 }}>Add Score</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "#aaa", fontSize: "13px", display: "block", marginBottom: "6px" }}>Student</label>
              <select value={form.studentID} onChange={(e) => setForm({ ...form, studentID: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none" }}>
                <option value="">Select student</option>
                {students.map((s) => <option key={s.studentID} value={s.studentID}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "#aaa", fontSize: "13px", display: "block", marginBottom: "6px" }}>Period</label>
              <select value={form.periodID} onChange={(e) => setForm({ ...form, periodID: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none" }}>
                <option value="">Select period</option>
                {periods.map((p) => <option key={p.periodID} value={p.periodID}>{p.name}</option>)}
              </select>
            </div>

            {[
              { key: "attendance", label: "Attendance (0-100)" },
              { key: "academic", label: "Academic Score (0-100)" },
              { key: "behavior", label: "Behavior (0-100, optional)" },
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: "16px" }}>
                <label style={{ color: "#aaa", fontSize: "13px", display: "block", marginBottom: "6px" }}>{label}</label>
                <input
                  type="number" min="0" max="100"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", backgroundColor: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#888", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleCreate} style={{ flex: 1, padding: "11px", backgroundColor: "#FEC200", border: "none", borderRadius: "8px", color: "#000", fontWeight: "700", cursor: "pointer" }}>Save Score</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}