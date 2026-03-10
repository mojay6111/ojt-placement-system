import { useEffect, useState } from "react";
import { Plus, Trash2, X, Pencil, Users } from "lucide-react";
import api from "../../api/axios";

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

const emptyForm = {
  name: "", industry: "", location: "",
  contactName: "", contactEmail: "", contactPhone: "", capacity: 1,
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, obj = edit
  const [form, setForm] = useState(emptyForm);
  const [viewCompany, setViewCompany] = useState(null); // for students drawer

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (company) => {
    setEditTarget(company);
    setForm({
      name: company.name,
      industry: company.industry,
      location: company.location,
      contactName: company.contactName || "",
      contactEmail: company.contactEmail || "",
      contactPhone: company.contactPhone || "",
      capacity: company.capacity,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, capacity: parseInt(form.capacity) };
      if (editTarget) {
        await api.patch(`/companies/${editTarget.companyID}`, payload);
      } else {
        await api.post("/companies", payload);
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditTarget(null);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Error saving company.");
    }
  };

  const handleDelete = async (companyID) => {
    if (!confirm("Delete this company?")) return;
    try {
      await api.delete(`/companies/${companyID}`);
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  const fields = [
    { key: "name", label: "Company Name", type: "text" },
    { key: "industry", label: "Industry", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "contactName", label: "Contact Name", type: "text" },
    { key: "contactEmail", label: "Contact Email", type: "email" },
    { key: "contactPhone", label: "Contact Phone", type: "text" },
    { key: "capacity", label: "Capacity (slots)", type: "number" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "700", margin: 0 }}>Companies</h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>{companies.length} registered companies</p>
          <div style={{ marginTop: "8px", height: "3px", width: "48px", backgroundColor: "#FEC200", borderRadius: "2px" }} />
        </div>
        <button
          onClick={openCreate}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#FEC200", color: "#000", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
        >
          <Plus size={16} /> Add Company
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2a2a2a", backgroundColor: "#111" }}>
              {["#", "Company", "Industry", "Location", "Capacity", "Actions"].map((h) => (
                <th key={h} style={{ color: "#666", fontSize: "12px", textAlign: "left", padding: "14px 16px", fontWeight: "600" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ color: "#555", padding: "32px", textAlign: "center" }}>Loading...</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan={6} style={{ color: "#555", padding: "32px", textAlign: "center" }}>No companies yet</td></tr>
            ) : companies.map((c, i) => (
              <tr key={c.companyID} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "14px 16px", color: "#666", fontSize: "13px" }}>{i + 1}</td>
                <td style={{ padding: "14px 16px", color: "#fff", fontSize: "14px", fontWeight: "600" }}>{c.name}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ backgroundColor: "rgba(204,0,0,0.1)", color: "#CC0000", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>
                    {c.industry}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", color: "#888", fontSize: "13px" }}>{c.location}</td>
                <td style={{ padding: "14px 16px", color: "#FEC200", fontSize: "13px", fontWeight: "600" }}>
                  {c.placements?.length || 0} / {c.capacity} slots
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {/* View Students */}
                    <button
                      onClick={() => setViewCompany(c)}
                      title="View placed students"
                      style={{ backgroundColor: "rgba(254,194,0,0.1)", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", color: "#FEC200" }}
                    >
                      <Users size={14} />
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => openEdit(c)}
                      title="Edit company"
                      style={{ backgroundColor: "rgba(96,165,250,0.1)", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", color: "#60a5fa" }}
                    >
                      <Pencil size={14} />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(c.companyID)}
                      title="Delete company"
                      style={{ backgroundColor: "rgba(204,0,0,0.15)", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", color: "#CC0000" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "460px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", margin: 0 }}>
                {editTarget ? "Edit Company" : "Add New Company"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {fields.map(({ key, label, type }) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <label style={{ color: "#aaa", fontSize: "13px", display: "block", marginBottom: "6px" }}>{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={inputStyle}
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "11px", backgroundColor: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#888", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{ flex: 1, padding: "11px", backgroundColor: "#FEC200", border: "none", borderRadius: "8px", color: "#000", fontWeight: "700", cursor: "pointer" }}
              >
                {editTarget ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Students Drawer */}
      {viewCompany && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "500px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", margin: 0 }}>{viewCompany.name}</h2>
                <p style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>
                  {viewCompany.placements?.length || 0} / {viewCompany.capacity} slots filled
                </p>
              </div>
              <button onClick={() => setViewCompany(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {/* Capacity bar */}
            <div style={{ backgroundColor: "#111", borderRadius: "8px", height: "8px", marginBottom: "24px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(((viewCompany.placements?.length || 0) / viewCompany.capacity) * 100, 100)}%`,
                backgroundColor: "#FEC200",
                borderRadius: "8px",
                transition: "width 0.3s",
              }} />
            </div>

            {!viewCompany.placements || viewCompany.placements.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <Users size={32} color="#333" style={{ marginBottom: "12px" }} />
                <p style={{ color: "#555", fontSize: "14px" }}>No students placed here yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {viewCompany.placements.map((p, i) => (
                  <div key={p.placementID} style={{
                    backgroundColor: "#111",
                    border: "1px solid #222",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <div>
                      <p style={{ color: "#fff", fontSize: "14px", fontWeight: "600", margin: 0 }}>
                        Student #{p.studentID}
                      </p>
                      <p style={{ color: "#666", fontSize: "12px", margin: "4px 0 0 0" }}>
                        {new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ backgroundColor: "rgba(254,194,0,0.1)", color: "#FEC200", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>
                      Slot {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}