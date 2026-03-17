import { useEffect, useState, useRef } from "react";
import { Plus, Upload, X, Download } from "lucide-react";
import api from "../../api/axios";
import PeriodSelector from "../../components/PeriodSelector";
import usePeriods from "../../hooks/usePeriods";

const COURSES = {
  NITA: ["ATC", "ELT", "MMT", "BCT", "ICT"],
  Diploma: ["DAE", "DEEE", "DME", "DICT"],
};
const LEVELS = {
  NITA: ["G3", "G2", "G1"],
  Diploma: ["MOD1", "MOD2", "MOD3"],
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

export default function InstructorStudents() {
  const [students, setStudents] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef();

  const { periods, selectedPeriod, setSelectedPeriod } = usePeriods();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    admissionNumber: "",
    phone: "",
    yearAdmitted: "",
    category: "NITA",
    course: "ATC",
    level: "G3",
  });

  const fetchData = async () => {
    try {
      const [stuRes, instrRes] = await Promise.all([
        api.get("/instructors/my-students"),
        api.get("/instructors/me"),
      ]);
      setStudents(stuRes.data);
      setInstructor(instrRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    try {
      await api.post("/students/register", form);
      setShowAddModal(false);
      setForm({
        firstName: "",
        lastName: "",
        admissionNumber: "",
        phone: "",
        yearAdmitted: "",
        category: "NITA",
        course: "ATC",
        level: "G3",
      });
      fetchData();
      alert(
        `Student added! Login: ${form.admissionNumber} / ${form.admissionNumber}`,
      );
    } catch (err) {
      alert(err.response?.data?.message || "Error adding student");
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/students/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(res.data);
      fetchData();
    } catch (err) {
      setUploadResult({
        message: err.response?.data?.message || "Upload failed",
      });
    } finally {
      setUploading(false);
      fileRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const headers =
      "firstName,lastName,admissionNumber,phone,yearAdmitted,category,course,level";
    const example = "John,Doe,ECT2024001,0712345678,2024,NITA,ATC,G3";
    const blob = new Blob([headers + "\n" + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_template.csv";
    a.click();
  };

  // Show score for selected period or latest
  const getScore = (s) => {
    if (selectedPeriod === "all") return s.scores?.[0];
    return (
      s.scores?.find((sc) => String(sc.periodID) === String(selectedPeriod)) ||
      s.scores?.[0]
    );
  };

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.admissionNumber}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

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
            Students
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            {instructor?.department?.name} — {students.length} students
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
            gap: "10px",
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
            onClick={() => setShowCSVModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#1a1a1a",
              color: "#fff",
              border: "1px solid #333",
              padding: "10px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            <Upload size={15} /> Bulk Upload CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
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
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <Plus size={15} /> Add Student
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        placeholder="Search name or admission no..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ ...inputStyle, maxWidth: "320px", marginBottom: "16px" }}
      />

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
                "#",
                "Name",
                "Admission No.",
                "Class",
                "Phone",
                "Year Admitted",
                `Score (${selectedPeriod === "all" ? "Latest" : periods.find((p) => String(p.periodID) === String(selectedPeriod))?.name || "Selected"})`,
                "Login",
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
                  colSpan={8}
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
                  colSpan={8}
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
              filtered.map((s, i) => {
                const score = getScore(s);
                return (
                  <tr
                    key={s.studentID}
                    style={{ borderBottom: "1px solid #1e1e1e" }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "#555",
                        fontSize: "13px",
                      }}
                    >
                      {i + 1}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
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
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "#aaa",
                        fontSize: "13px",
                      }}
                    >
                      {s.admissionNumber}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
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
                      <span
                        style={{
                          marginLeft: "6px",
                          color: "#555",
                          fontSize: "11px",
                        }}
                      >
                        {s.category}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "#666",
                        fontSize: "13px",
                      }}
                    >
                      {s.phone || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "#666",
                        fontSize: "13px",
                      }}
                    >
                      {s.yearAdmitted || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {score ? (
                        <div>
                          <p
                            style={{
                              color: "#FEC200",
                              fontWeight: "700",
                              fontSize: "15px",
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
                          </p>
                        </div>
                      ) : (
                        <span style={{ color: "#444", fontSize: "12px" }}>
                          No score
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          backgroundColor: "#111",
                          color: "#555",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontFamily: "monospace",
                        }}
                      >
                        {s.admissionNumber}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
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
              maxWidth: "480px",
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
                Add New Student
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
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
                backgroundColor: "rgba(254,194,0,0.08)",
                border: "1px solid rgba(254,194,0,0.2)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px",
              }}
            >
              <p style={{ color: "#FEC200", fontSize: "12px", margin: 0 }}>
                🔐 Login credentials:{" "}
                <strong>Username & Password = Admission Number</strong>. Student
                will be prompted to change password on first login.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
              {[
                { key: "firstName", label: "First Name" },
                { key: "lastName", label: "Last Name" },
              ].map(({ key, label }) => (
                <div key={key} style={{ flex: 1 }}>
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
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    style={inputStyle}
                    placeholder={label}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
              {[
                { key: "admissionNumber", label: "Admission No." },
                { key: "phone", label: "Phone (optional)" },
              ].map(({ key, label }) => (
                <div key={key} style={{ flex: 1 }}>
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
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    style={inputStyle}
                    placeholder={label}
                  />
                </div>
              ))}
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
                Year Admitted
              </label>
              <input
                type="number"
                value={form.yearAdmitted}
                onChange={(e) =>
                  setForm({ ...form, yearAdmitted: e.target.value })
                }
                style={inputStyle}
                placeholder="e.g. 2024"
              />
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
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                    course: COURSES[e.target.value][0],
                    level: LEVELS[e.target.value][0],
                  })
                }
                style={inputStyle}
              >
                <option value="NITA">NITA</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    color: "#aaa",
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Course
                </label>
                <select
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  style={inputStyle}
                >
                  {COURSES[form.category].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    color: "#aaa",
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Level
                </label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  style={inputStyle}
                >
                  {LEVELS[form.category].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowAddModal(false)}
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
                onClick={handleAdd}
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
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCSVModal && (
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
              maxWidth: "480px",
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
                Bulk Upload CSV
              </h2>
              <button
                onClick={() => {
                  setShowCSVModal(false);
                  setUploadResult(null);
                }}
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
                backgroundColor: "#111",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  color: "#aaa",
                  fontSize: "13px",
                  margin: "0 0 10px 0",
                }}
              >
                CSV must have these columns:
              </p>
              <code
                style={{
                  color: "#FEC200",
                  fontSize: "11px",
                  display: "block",
                  marginBottom: "12px",
                }}
              >
                firstName, lastName, admissionNumber, phone, yearAdmitted,
                category, course, level
              </code>
              <button
                onClick={downloadTemplate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "transparent",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  padding: "7px 14px",
                  cursor: "pointer",
                  color: "#aaa",
                  fontSize: "12px",
                }}
              >
                <Download size={13} /> Download Template
              </button>
            </div>
            <div
              onClick={() => fileRef.current.click()}
              style={{
                border: "2px dashed #333",
                borderRadius: "10px",
                padding: "32px",
                textAlign: "center",
                cursor: "pointer",
                marginBottom: "16px",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.borderColor = "#FEC200")
              }
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#333")}
            >
              <p style={{ fontSize: "28px", margin: "0 0 8px 0" }}>📂</p>
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                Click to select CSV file
              </p>
              <p
                style={{ color: "#444", fontSize: "12px", margin: "4px 0 0 0" }}
              >
                Only .csv files accepted
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                style={{ display: "none" }}
              />
            </div>
            {uploading && (
              <p
                style={{
                  color: "#FEC200",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                ⏳ Processing...
              </p>
            )}
            {uploadResult && (
              <div
                style={{
                  backgroundColor: "#111",
                  borderRadius: "8px",
                  padding: "14px",
                }}
              >
                <p
                  style={{
                    color: "#4ade80",
                    fontWeight: "600",
                    fontSize: "13px",
                    margin: "0 0 8px 0",
                  }}
                >
                  {uploadResult.message}
                </p>
                {uploadResult.results?.skipped?.length > 0 && (
                  <p
                    style={{
                      color: "#f59e0b",
                      fontSize: "12px",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Skipped:{" "}
                    {uploadResult.results.skipped
                      .map((s) => s.admNo)
                      .join(", ")}
                  </p>
                )}
                {uploadResult.results?.errors?.length > 0 && (
                  <p style={{ color: "#CC0000", fontSize: "12px", margin: 0 }}>
                    Errors:{" "}
                    {uploadResult.results.errors
                      .map((e) => e.admNo || "unknown")
                      .join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
