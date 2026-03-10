import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import api from "../../api/axios";

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

const categoryColor = (cat) =>
  cat === "NITA"
    ? { bg: "rgba(254,194,0,0.1)", color: "#FEC200" }
    : { bg: "rgba(96,165,250,0.1)", color: "#60a5fa" };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterCourse, setFilterCourse] = useState("ALL");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    admissionNumber: "",
    departmentID: "",
    email: "",
    password: "",
    category: "NITA",
    course: "ATC",
    level: "G3",
  });

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, []);

  // When category changes reset course and level
  const handleCategoryChange = (cat) => {
    const defaultCourse = COURSES[cat][0];
    const defaultLevel = LEVELS[cat][0];
    setForm({
      ...form,
      category: cat,
      course: defaultCourse,
      level: defaultLevel,
    });
  };

  const handleCreate = async () => {
    try {
      const userRes = await api.post("/auth/register", {
        email: form.email,
        password: form.password,
        role: "STUDENT",
      });
      await api.post("/students", {
        firstName: form.firstName,
        lastName: form.lastName,
        admissionNumber: form.admissionNumber,
        departmentID: parseInt(form.departmentID),
        userID: userRes.data.userID,
        category: form.category,
        course: form.course,
        level: form.level,
      });
      setShowModal(false);
      setForm({
        firstName: "",
        lastName: "",
        admissionNumber: "",
        departmentID: "",
        email: "",
        password: "",
        category: "NITA",
        course: "ATC",
        level: "G3",
      });
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Error creating student. Email may already exist.");
    }
  };

  const handleDelete = async (studentID) => {
    if (!confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${studentID}`);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logic
  const filtered = students.filter((s) => {
    if (filterCategory !== "ALL" && s.category !== filterCategory) return false;
    if (filterCourse !== "ALL" && s.course !== filterCourse) return false;
    return true;
  });

  const availableCourses =
    filterCategory === "ALL"
      ? [...COURSES.NITA, ...COURSES.Diploma]
      : COURSES[filterCategory] || [];

  return (
    <div>
      {/* Header */}
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
            Students
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            {filtered.length} students
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
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setFilterCourse("ALL");
          }}
          style={{
            padding: "9px 14px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "13px",
            outline: "none",
          }}
        >
          <option value="ALL">All Categories</option>
          <option value="NITA">NITA</option>
          <option value="Diploma">Diploma</option>
        </select>
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          style={{
            padding: "9px 14px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "13px",
            outline: "none",
          }}
        >
          <option value="ALL">All Courses</option>
          {availableCourses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
                borderBottom: "1px solid #2a2a2a",
                backgroundColor: "#111",
              }}
            >
              {[
                "#",
                "Name",
                "Admission No.",
                "Category",
                "Class",
                "Department",
                "Actions",
              ].map((h) => (
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
                  No students found
                </td>
              </tr>
            ) : (
              filtered.map((s, i) => {
                const cc = categoryColor(s.category);
                return (
                  <tr
                    key={s.studentID}
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
                        fontWeight: "600",
                      }}
                    >
                      {s.firstName} {s.lastName}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: "#888",
                        fontSize: "13px",
                      }}
                    >
                      {s.admissionNumber}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          backgroundColor: cc.bg,
                          color: cc.color,
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {s.category}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          backgroundColor: "rgba(255,255,255,0.05)",
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        {s.course} {s.level}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: "#888",
                        fontSize: "13px",
                      }}
                    >
                      {s.department?.name || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        onClick={() => handleDelete(s.studentID)}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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

            {/* Basic fields */}
            {[
              { key: "firstName", label: "First Name", type: "text" },
              { key: "lastName", label: "Last Name", type: "text" },
              {
                key: "admissionNumber",
                label: "Admission Number",
                type: "text",
              },
              { key: "email", label: "Email", type: "email" },
              { key: "password", label: "Password", type: "password" },
            ].map(({ key, label, type }) => (
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
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={inputStyle}
                />
              </div>
            ))}

            {/* Department */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  color: "#aaa",
                  fontSize: "13px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Department
              </label>
              <select
                value={form.departmentID}
                onChange={(e) =>
                  setForm({ ...form, departmentID: e.target.value })
                }
                style={{ ...inputStyle }}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.departmentID} value={d.departmentID}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
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
              <div style={{ display: "flex", gap: "10px" }}>
                {["NITA", "Diploma"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      backgroundColor:
                        form.category === cat ? "#FEC200" : "#111",
                      color: form.category === cat ? "#000" : "#888",
                      border: form.category === cat ? "none" : "1px solid #333",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Course */}
            <div style={{ marginBottom: "14px" }}>
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
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {COURSES[form.category].map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, course: c })}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                      backgroundColor: form.course === c ? "#FEC200" : "#111",
                      color: form.course === c ? "#000" : "#888",
                      border: form.course === c ? "none" : "1px solid #333",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div style={{ marginBottom: "24px" }}>
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
              <div style={{ display: "flex", gap: "8px" }}>
                {LEVELS[form.category].map((l) => (
                  <button
                    key={l}
                    onClick={() => setForm({ ...form, level: l })}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                      backgroundColor: form.level === l ? "#CC0000" : "#111",
                      color: form.level === l ? "#fff" : "#888",
                      border: form.level === l ? "none" : "1px solid #333",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
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
                Create Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
