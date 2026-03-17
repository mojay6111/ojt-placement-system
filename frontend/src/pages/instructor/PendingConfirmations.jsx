import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import api from "../../api/axios";
import PeriodSelector from "../../components/PeriodSelector";
import usePeriods from "../../hooks/usePeriods";

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

export default function PendingConfirmations() {
  const [allPlacements, setAllPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [note, setNote] = useState("");

  const { periods, selectedPeriod, setSelectedPeriod } = usePeriods();

  const fetchPending = async () => {
    try {
      const res = await api.get("/placements");
      setAllPlacements(
        res.data.filter(
          (p) =>
            p.studentReported && p.placementStatus === "PLACED_NOT_REPORTED",
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Filter by selected period
  const pending = allPlacements.filter(
    (p) =>
      selectedPeriod === "all" || String(p.periodID) === String(selectedPeriod),
  );

  const handleConfirm = async () => {
    try {
      await api.patch(`/placements/${confirmModal.placementID}/status`, {
        placementStatus: "PLACED_AND_REPORTED",
        instructorNote: note || "Confirmed by instructor",
      });
      setConfirmModal(null);
      setNote("");
      fetchPending();
    } catch (err) {
      alert("Error confirming placement");
    }
  };

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
            Pending Confirmations
            {pending.length > 0 && (
              <span
                style={{
                  marginLeft: "12px",
                  backgroundColor: "rgba(96,165,250,0.15)",
                  color: "#60a5fa",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "16px",
                }}
              >
                {pending.length}
              </span>
            )}
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Students who have self-reported arrival and need confirmation
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
        <PeriodSelector
          periods={periods}
          selectedPeriod={selectedPeriod}
          onChange={setSelectedPeriod}
        />
      </div>

      {loading ? (
        <p style={{ color: "#555" }}>Loading...</p>
      ) : pending.length === 0 ? (
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "60px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "40px", margin: "0 0 12px 0" }}>✅</p>
          <p
            style={{
              color: "#4ade80",
              fontSize: "16px",
              fontWeight: "600",
              margin: 0,
            }}
          >
            All caught up!
          </p>
          <p style={{ color: "#555", fontSize: "13px", marginTop: "6px" }}>
            No pending confirmations for this period
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {pending.map((p) => (
            <div
              key={p.placementID}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid rgba(96,165,250,0.2)",
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div
                style={{ display: "flex", gap: "16px", alignItems: "center" }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(96,165,250,0.1)",
                    borderRadius: "10px",
                    padding: "12px",
                    fontSize: "24px",
                  }}
                >
                  🔔
                </div>
                <div>
                  <p
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: "15px",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {p.student?.firstName} {p.student?.lastName}
                  </p>
                  <p
                    style={{
                      color: "#555",
                      fontSize: "12px",
                      margin: "0 0 6px 0",
                    }}
                  >
                    {p.student?.admissionNumber} ·{" "}
                    <span style={{ color: "#FEC200" }}>
                      {p.student?.course} {p.student?.level}
                    </span>
                  </p>
                  <div
                    style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
                  >
                    <span style={{ color: "#888", fontSize: "12px" }}>
                      🏢 {p.company?.name || "No company"}
                    </span>
                    <span style={{ color: "#888", fontSize: "12px" }}>
                      📍 {p.company?.location || "—"}
                    </span>
                    {p.reportedAt && (
                      <span style={{ color: "#60a5fa", fontSize: "12px" }}>
                        🕐 Reported{" "}
                        {new Date(p.reportedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setConfirmModal(p);
                  setNote("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "rgba(74,222,128,0.15)",
                  border: "1px solid rgba(74,222,128,0.4)",
                  borderRadius: "8px",
                  padding: "10px 18px",
                  cursor: "pointer",
                  color: "#4ade80",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                <CheckCircle size={15} /> Confirm
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
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
                Confirm Arrival
              </h2>
              <button
                onClick={() => setConfirmModal(null)}
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
                backgroundColor: "rgba(74,222,128,0.08)",
                border: "1px solid rgba(74,222,128,0.2)",
                borderRadius: "8px",
                padding: "14px",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  color: "#4ade80",
                  fontWeight: "600",
                  fontSize: "14px",
                  margin: "0 0 4px 0",
                }}
              >
                {confirmModal.student?.firstName}{" "}
                {confirmModal.student?.lastName}
              </p>
              <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
                {confirmModal.company?.name} · {confirmModal.student?.course}{" "}
                {confirmModal.student?.level}
              </p>
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
                Confirmation Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="e.g. Visited student at Toyota Kenya on 16/03/2026..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setConfirmModal(null)}
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
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#4ade80",
                  border: "none",
                  borderRadius: "8px",
                  color: "#000",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ✅ Confirm Placed & Reported
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
