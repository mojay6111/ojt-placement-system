import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, X } from "lucide-react";
import api from "../../api/axios";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", code: "" });

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/departments", form);
      setShowModal(false);
      setForm({ name: "", code: "" });
      fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (departmentID) => {
    if (!confirm("Delete this department?")) return;
    try {
      await api.delete(`/departments/${departmentID}`);
      fetchDepartments();
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
            Departments
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            {departments.length} departments
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
          <Plus size={16} /> Add Department
        </button>
      </div>

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
                borderBottom: "1px solid #2a2a2a",
                backgroundColor: "#111",
              }}
            >
              {["#", "Department Name", "Code", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    textAlign: "left",
                    padding: "14px 16px",
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
                  colSpan={4}
                  style={{
                    color: "#555",
                    padding: "32px",
                    textAlign: "center",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    color: "#555",
                    padding: "32px",
                    textAlign: "center",
                  }}
                >
                  No departments yet
                </td>
              </tr>
            ) : (
              departments.map((d, i) => (
                <tr
                  key={d.departmentID}
                  style={{ borderBottom: "1px solid #222" }}
                >
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#666",
                      fontSize: "13px",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  >
                    {d.name}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        backgroundColor: "rgba(254,194,0,0.1)",
                        color: "#FEC200",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {d.code}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => handleDelete(d.departmentID)}
                      style={{
                        backgroundColor: "rgba(204,0,0,0.15)",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        color: "#CC0000",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
                Add Department
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
              { key: "name", label: "Department Name" },
              { key: "code", label: "Code (e.g. AUT)" },
            ].map(({ key, label }) => (
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
