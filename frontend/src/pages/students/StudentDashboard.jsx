import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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

function Countdown({ endDate }) {
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return <span style={{ color: "#CC0000" }}>Ended</span>;
  if (diff === 0) return <span style={{ color: "#f59e0b" }}>Last day!</span>;
  return (
    <div style={{ textAlign: "center" }}>
      <p
        style={{
          color: "#FEC200",
          fontSize: "36px",
          fontWeight: "800",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {diff}
      </p>
      <p style={{ color: "#555", fontSize: "11px", margin: "4px 0 0 0" }}>
        days remaining
      </p>
    </div>
  );
}

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [rankData, setRankData] = useState(null);
  const [visits, setVisits] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      const [stuRes, rankRes, visitsRes, scoresRes] = await Promise.all([
        api.get("/students/me"),
        api.get("/students/me/rank").catch(() => ({ data: null })),
        api.get("/students/me/visits").catch(() => ({ data: [] })),
        api.get("/students/me/scores").catch(() => ({ data: [] })),
      ]);
      setStudent(stuRes.data);
      setRankData(rankRes.data);
      setVisits(visitsRes.data);
      setScores(scoresRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleReport = async () => {
    setReporting(true);
    setError("");
    try {
      await api.post("/students/me/report");
      fetchAll();
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

  // Chart data
  const chartData = scores.map((s) => ({
    period: s.period?.name || `Period ${s.periodID}`,
    Total: parseFloat(s.totalScore.toFixed(1)),
    Attendance: s.attendance,
    Academic: s.academic,
    Behavior: s.behavior ?? 0,
  }));

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

      {/* Top Row — Profile + Placement + Score */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "16px",
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
            minWidth: "200px",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "11px",
              fontWeight: "600",
              margin: "0 0 14px 0",
              letterSpacing: "1px",
            }}
          >
            MY PROFILE
          </p>
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
                padding: "8px 0",
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

        {/* Placement Card */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "24px",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "11px",
              fontWeight: "600",
              margin: "0 0 14px 0",
              letterSpacing: "1px",
            }}
          >
            MY PLACEMENT
          </p>

          {placement ? (
            <>
              {[
                { label: "Company", value: placement.company?.name },
                { label: "Location", value: placement.company?.location },
                {
                  label: "Period",
                  value:
                    placement.period?.name || `Period #${placement.periodID}`,
                },
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
                    padding: "8px 0",
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
                  padding: "8px 0",
                  borderBottom: "1px solid #1e1e1e",
                }}
              >
                <span style={{ color: "#555", fontSize: "12px" }}>Status</span>
                <span
                  style={{
                    backgroundColor: status.bg,
                    color: status.color,
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {status.label}
                </span>
              </div>

              {/* Countdown */}
              <div
                style={{
                  marginTop: "16px",
                  backgroundColor: "#111",
                  borderRadius: "8px",
                  padding: "14px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "#555",
                    fontSize: "11px",
                    margin: "0 0 6px 0",
                  }}
                >
                  OJT ENDS IN
                </p>
                <Countdown endDate={placement.endDate} />
              </div>

              {/* Self Report */}
              <div style={{ marginTop: "12px" }}>
                {placement.placementStatus === "PLACED_AND_REPORTED" ? (
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
                        fontSize: "13px",
                        margin: "0 0 3px 0",
                      }}
                    >
                      ✅ Placement Confirmed
                    </p>
                    <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>
                      Your placement has been confirmed by your instructor
                    </p>
                  </div>
                ) : !placement.studentReported ? (
                  <>
                    <button
                      onClick={handleReport}
                      disabled={reporting}
                      style={{
                        width: "100%",
                        padding: "11px",
                        backgroundColor: "#FEC200",
                        border: "none",
                        borderRadius: "8px",
                        color: "#000",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: reporting ? "not-allowed" : "pointer",
                        opacity: reporting ? 0.7 : 1,
                      }}
                    >
                      {reporting ? "Reporting..." : "✅ Report My Arrival"}
                    </button>
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
                  </>
                ) : (
                  <div
                    style={{
                      backgroundColor: "rgba(96,165,250,0.1)",
                      border: "1px solid rgba(96,165,250,0.3)",
                      borderRadius: "8px",
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        color: "#60a5fa",
                        fontWeight: "700",
                        fontSize: "13px",
                        margin: "0 0 3px 0",
                      }}
                    >
                      🔔 Arrival Reported
                    </p>
                    <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>
                      {placement.reportedAt
                        ? new Date(placement.reportedAt).toLocaleDateString()
                        : ""}{" "}
                      · Awaiting instructor confirmation
                    </p>
                  </div>
                )}
              </div>

              {placement.instructorNote && (
                <div
                  style={{
                    backgroundColor: "#111",
                    borderRadius: "8px",
                    padding: "10px",
                    marginTop: "10px",
                  }}
                >
                  <p
                    style={{
                      color: "#555",
                      fontSize: "11px",
                      margin: "0 0 3px 0",
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
            <div style={{ textAlign: "center", padding: "32px 0" }}>
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

        {/* Score + Rank Card */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "24px",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "11px",
              fontWeight: "600",
              margin: "0 0 14px 0",
              letterSpacing: "1px",
            }}
          >
            MY SCORE & RANK
          </p>

          {score ? (
            <>
              {/* Score + Rank side by side */}
              <div
                style={{ display: "flex", gap: "12px", marginBottom: "20px" }}
              >
                <div
                  style={{
                    flex: 1,
                    backgroundColor: "#111",
                    borderRadius: "8px",
                    padding: "14px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      color: "#555",
                      fontSize: "11px",
                      margin: "0 0 4px 0",
                    }}
                  >
                    TOTAL SCORE
                  </p>
                  <p
                    style={{
                      color: "#FEC200",
                      fontSize: "36px",
                      fontWeight: "800",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {score.totalScore.toFixed(1)}
                  </p>
                </div>
                {rankData?.rank && (
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#111",
                      borderRadius: "8px",
                      padding: "14px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        color: "#555",
                        fontSize: "11px",
                        margin: "0 0 4px 0",
                      }}
                    >
                      CLASS RANK
                    </p>
                    <p
                      style={{
                        color: "#4ade80",
                        fontSize: "36px",
                        fontWeight: "800",
                        margin: 0,
                        lineHeight: 1,
                      }}
                    >
                      #{rankData.rank}
                    </p>
                    <p
                      style={{
                        color: "#444",
                        fontSize: "11px",
                        margin: "4px 0 0 0",
                      }}
                    >
                      of {rankData.total} students
                    </p>
                  </div>
                )}
              </div>

              {/* Score bars */}
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
                <div key={label} style={{ marginBottom: "10px" }}>
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
                      }}
                    >
                      <div
                        style={{
                          width: `${value}%`,
                          height: "100%",
                          backgroundColor: color,
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: "32px", margin: "0 0 8px 0" }}>📊</p>
              <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
                No score recorded yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Green List Banner */}
      {score && (
        <div
          style={{
            backgroundColor:
              score.totalScore >= 70
                ? "rgba(74,222,128,0.08)"
                : "rgba(245,158,11,0.08)",
            border: `1px solid ${score.totalScore >= 70 ? "rgba(74,222,128,0.25)" : "rgba(245,158,11,0.25)"}`,
            borderRadius: "12px",
            padding: "18px 24px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "28px" }}>
            {score.totalScore >= 70 ? "🏆" : "📈"}
          </span>
          <div>
            <p
              style={{
                color: score.totalScore >= 70 ? "#4ade80" : "#f59e0b",
                fontWeight: "700",
                fontSize: "15px",
                margin: "0 0 3px 0",
              }}
            >
              {score.totalScore >= 70
                ? `You are on the Green List! ${rankData?.rank ? `(Rank #${rankData.rank} of ${rankData.total})` : ""}`
                : "Keep improving to make the Green List"}
            </p>
            <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
              {score.totalScore >= 70
                ? `Score of ${score.totalScore.toFixed(1)} qualifies you for the Green List ranking`
                : `Current score: ${score.totalScore.toFixed(1)} — Green List requires 70+`}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Row — Score Chart + Visit History */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {/* Score History Chart */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "24px",
            flex: 2,
            minWidth: "300px",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "11px",
              fontWeight: "600",
              margin: "0 0 16px 0",
              letterSpacing: "1px",
            }}
          >
            SCORE HISTORY
          </p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis
                  dataKey="period"
                  tick={{ fill: "#666", fontSize: 11 }}
                  stroke="#333"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#666", fontSize: 11 }}
                  stroke="#333"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend
                  formatter={(v) => (
                    <span style={{ color: "#aaa", fontSize: "11px" }}>{v}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="Total"
                  stroke="#FEC200"
                  strokeWidth={2}
                  dot={{ fill: "#FEC200", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Attendance"
                  stroke="#4ade80"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                />
                <Line
                  type="monotone"
                  dataKey="Academic"
                  stroke="#60a5fa"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                />
                <Line
                  type="monotone"
                  dataKey="Behavior"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{ textAlign: "center", padding: "48px 0", color: "#555" }}
            >
              No score history yet
            </div>
          )}
        </div>

        {/* Visit History */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "24px",
            flex: 1,
            minWidth: "260px",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "11px",
              fontWeight: "600",
              margin: "0 0 16px 0",
              letterSpacing: "1px",
            }}
          >
            INSTRUCTOR VISITS{" "}
            {visits.length > 0 && (
              <span style={{ color: "#FEC200" }}>({visits.length})</span>
            )}
          </p>
          {visits.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxHeight: "260px",
                overflowY: "auto",
              }}
            >
              {visits.map((v) => (
                <div
                  key={v.visitID}
                  style={{
                    backgroundColor: "#111",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    borderLeft: "3px solid #FEC200",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        color: "#FEC200",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {v.instructor?.firstName} {v.instructor?.lastName}
                    </span>
                    <span style={{ color: "#555", fontSize: "11px" }}>
                      {new Date(v.visitDate).toLocaleDateString()}
                    </span>
                  </div>
                  {v.notes && (
                    <p style={{ color: "#888", fontSize: "12px", margin: 0 }}>
                      {v.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <p style={{ fontSize: "28px", margin: "0 0 8px 0" }}>🚗</p>
              <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
                No visits recorded yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
