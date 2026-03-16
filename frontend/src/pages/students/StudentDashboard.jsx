import { useEffect, useState } from "react";
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

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchStudent = async () => {
    try {
      const res = await api.get("/students/me");
      setStudent(res.data);
      if (res.data.ojtPlacements?.[0]?.studentReported) {
        setReportSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  const handleReport = async () => {
    setReporting(true);
    setError("");
    try {
      await api.post("/students/me/report");
      setReportSuccess(true);
      fetchStudent();
    } catch (err) {
      setError(err.response?.data?.message || "Error reporting arrival");
    } finally {
      setReporting(false);
    }
  };

  if (loading)
    return <div style={{ color: "#888", padding: "40px" }}>Loading...</div>;

  const placement = student?.ojtPlacements?.[0];
  const score = student?.scores?.[0];
  const status =
    STATUS_STYLES[placement?.placementStatus] || STATUS_STYLES.NOT_PLACED;

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
          Welcome, {student?.firstName} 👋
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
          {student?.course} {student?.level} — {student?.category} ·{" "}
          {student?.department?.name}
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

      {/* Top Cards Row */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        {/* Profile Card */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "24px",
            flex: 1,
            minWidth: "220px",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "12px",
              fontWeight: "600",
              margin: "0 0 16px 0",
            }}
          >
            MY PROFILE
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {[
              {
                label: "Full Name",
                value: `${student?.firstName} ${student?.lastName}`,
              },
              { label: "Admission No.", value: student?.admissionNumber },
              { label: "Class", value: `${student?.course} ${student?.level}` },
              { label: "Category", value: student?.category },
              { label: "Department", value: student?.department?.name },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #1e1e1e",
                }}
              >
                <span style={{ color: "#555", fontSize: "12px" }}>{label}</span>
                <span
                  style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}
                >
                  {value || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Placement Card */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "24px",
            flex: 1,
            minWidth: "220px",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "12px",
              fontWeight: "600",
              margin: "0 0 16px 0",
            }}
          >
            MY PLACEMENT
          </p>

          {placement ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                {[
                  { label: "Company", value: placement.company?.name },
                  { label: "Location", value: placement.company?.location },
                  {
                    label: "Start Date",
                    value: new Date(placement.startDate).toLocaleDateString(),
                  },
                  {
                    label: "End Date",
                    value: new Date(placement.endDate).toLocaleDateString(),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: "8px",
                      borderBottom: "1px solid #1e1e1e",
                    }}
                  >
                    <span style={{ color: "#555", fontSize: "12px" }}>
                      {label}
                    </span>
                    <span
                      style={{
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      {value || "—"}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#555", fontSize: "12px" }}>
                    Status
                  </span>
                  <span
                    style={{
                      backgroundColor: status.bg,
                      color: status.color,
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Self Report Button */}
              {!placement.studentReported ? (
                <div>
                  <button
                    onClick={handleReport}
                    disabled={reporting}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#FEC200",
                      border: "none",
                      borderRadius: "8px",
                      color: "#000",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: reporting ? "not-allowed" : "pointer",
                      opacity: reporting ? 0.7 : 1,
                    }}
                  >
                    {reporting ? "Reporting..." : "✅ Report My Arrival"}
                  </button>
                  <p
                    style={{
                      color: "#555",
                      fontSize: "11px",
                      textAlign: "center",
                      marginTop: "8px",
                    }}
                  >
                    Tap to confirm you have arrived at your placement company
                  </p>
                  {error && (
                    <p
                      style={{
                        color: "#CC0000",
                        fontSize: "12px",
                        textAlign: "center",
                        marginTop: "6px",
                      }}
                    >
                      {error}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "rgba(74,222,128,0.1)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      color: "#4ade80",
                      fontWeight: "700",
                      fontSize: "14px",
                      margin: "0 0 4px 0",
                    }}
                  >
                    ✅ Arrival Reported
                  </p>
                  <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>
                    Reported on{" "}
                    {placement.reportedAt
                      ? new Date(placement.reportedAt).toLocaleDateString()
                      : "—"}
                  </p>
                  <p
                    style={{
                      color: "#555",
                      fontSize: "11px",
                      margin: "4px 0 0 0",
                    }}
                  >
                    Awaiting instructor confirmation
                  </p>
                </div>
              )}

              {/* Instructor Note */}
              {placement.instructorNote && (
                <div
                  style={{
                    backgroundColor: "#111",
                    borderRadius: "8px",
                    padding: "12px",
                    marginTop: "12px",
                  }}
                >
                  <p
                    style={{
                      color: "#666",
                      fontSize: "11px",
                      margin: "0 0 4px 0",
                    }}
                  >
                    INSTRUCTOR NOTE
                  </p>
                  <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>
                    {placement.instructorNote}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ fontSize: "32px", margin: "0 0 8px 0" }}>⏳</p>
              <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
                No placement assigned yet
              </p>
              <p style={{ color: "#444", fontSize: "12px", marginTop: "6px" }}>
                Contact your coordinator
              </p>
            </div>
          )}
        </div>

        {/* Score Card */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "24px",
            flex: 1,
            minWidth: "220px",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "12px",
              fontWeight: "600",
              margin: "0 0 16px 0",
            }}
          >
            MY SCORE
          </p>

          {score ? (
            <>
              {/* Big total score */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <p
                  style={{
                    color: "#FEC200",
                    fontSize: "52px",
                    fontWeight: "800",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {score.totalScore.toFixed(1)}
                </p>
                <p
                  style={{ color: "#555", fontSize: "12px", marginTop: "6px" }}
                >
                  Total Score
                </p>
              </div>

              {/* Score breakdown */}
              {[
                {
                  label: "Attendance",
                  value: score.attendance,
                  weight: "40%",
                  color: "#4ade80",
                },
                {
                  label: "Academic",
                  value: score.academic,
                  weight: "50%",
                  color: "#60a5fa",
                },
                {
                  label: "Behavior",
                  value: score.behavior,
                  weight: "10%",
                  color: "#f59e0b",
                },
              ].map(({ label, value, weight, color }) => (
                <div key={label} style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ color: "#666", fontSize: "12px" }}>
                      {label} <span style={{ color: "#444" }}>({weight})</span>
                    </span>
                    <span
                      style={{ color, fontSize: "12px", fontWeight: "600" }}
                    >
                      {value ?? "—"}%
                    </span>
                  </div>
                  {value != null && (
                    <div
                      style={{
                        backgroundColor: "#111",
                        borderRadius: "4px",
                        height: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${value}%`,
                          height: "100%",
                          backgroundColor: color,
                          borderRadius: "4px",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ fontSize: "32px", margin: "0 0 8px 0" }}>📊</p>
              <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
                No score recorded yet
              </p>
              <p style={{ color: "#444", fontSize: "12px", marginTop: "6px" }}>
                Your instructor will add your score
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Green List Status Banner */}
      {score && (
        <div
          style={{
            backgroundColor:
              score.totalScore >= 70
                ? "rgba(74,222,128,0.08)"
                : "rgba(245,158,11,0.08)",
            border: `1px solid ${score.totalScore >= 70 ? "rgba(74,222,128,0.25)" : "rgba(245,158,11,0.25)"}`,
            borderRadius: "12px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "32px" }}>
            {score.totalScore >= 70 ? "🏆" : "📈"}
          </span>
          <div>
            <p
              style={{
                color: score.totalScore >= 70 ? "#4ade80" : "#f59e0b",
                fontWeight: "700",
                fontSize: "16px",
                margin: "0 0 4px 0",
              }}
            >
              {score.totalScore >= 70
                ? "You are on the Green List!"
                : "Keep improving to make the Green List"}
            </p>
            <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
              {score.totalScore >= 70
                ? `Your score of ${score.totalScore.toFixed(1)} qualifies you for the Green List ranking`
                : `Your current score is ${score.totalScore.toFixed(1)} — Green List requires 70+`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
