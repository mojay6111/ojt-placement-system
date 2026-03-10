import { useEffect, useState } from "react";
import { Calendar, Plus, X } from "lucide-react";
import api from "../../api/axios";

export default function Periods() {
  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "" });

  const fetchPeriods = async () => {
    try {
      const res = await api.get("/periods");
      setPeriods(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/periods", form);
      setShowModal(false);
      setForm({ name: "", startDate: "", endDate: "" });
      fetchPeriods();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
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
            Placement Periods
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            {periods.length} periods defined
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
          <Plus size={16} /> Add Period
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {loading ? (
          <p style={{ color: "#555" }}>Loading...</p>
        ) : periods.length === 0 ? (
          <p style={{ color: "#555" }}>No periods yet</p>
        ) : (
          periods.map((p) => (
            <div
              key={p.periodID}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "12px",
                padding: "24px",
                minWidth: "260px",
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <Calendar size={18} color="#FEC200" />
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "700",
                    margin: 0,
                  }}
                >
                  {p.name}
                </h3>
              </div>
              <p style={{ color: "#888", fontSize: "13px", margin: "4px 0" }}>
                Start:{" "}
                <span style={{ color: "#fff" }}>
                  {new Date(p.startDate).toLocaleDateString()}
                </span>
              </p>
              <p style={{ color: "#888", fontSize: "13px", margin: "4px 0" }}>
                End:{" "}
                <span style={{ color: "#fff" }}>
                  {new Date(p.endDate).toLocaleDateString()}
                </span>
              </p>
              <p
                style={{ color: "#888", fontSize: "13px", margin: "8px 0 0 0" }}
              >
                Scores:{" "}
                <span style={{ color: "#FEC200", fontWeight: "600" }}>
                  {p.scores?.length || 0}
                </span>
              </p>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
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
              maxWidth: "400px",
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
                Add Period
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
                key: "name",
                label: "Period Name",
                type: "text",
                placeholder: "e.g. Jan-Mar 2026",
              },
              { key: "startDate", label: "Start Date", type: "date" },
              { key: "endDate", label: "End Date", type: "date" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} style={{ marginBottom: "16px" }}>
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
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#111",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
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
    </div>
  );
}
