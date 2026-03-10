import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import api from "../../api/axios";

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [periodName, setPeriodName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const res = await api.get("/periods");
        setPeriods(res.data);
        if (res.data.length > 0) {
          setSelectedPeriod(res.data[0].periodID);
          setPeriodName(res.data[0].name);
          fetchRanking(res.data[0].periodID);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPeriods();
  }, []);

  const fetchRanking = async (pid) => {
    try {
      const res = await api.get(`/ranking/${pid}`);
      setRanking(res.data.ranking);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePeriodChange = (pid) => {
    setSelectedPeriod(pid);
    const p = periods.find((p) => p.periodID === parseInt(pid));
    setPeriodName(p?.name || "");
    fetchRanking(pid);
  };

  const medalColor = (rank) => {
    if (rank === 1) return "#FEC200";
    if (rank === 2) return "#aaa";
    if (rank === 3) return "#cd7f32";
    return "#555";
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
            🏆 Green List
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            {periodName} — {ranking.length} students ranked
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
        <select
          value={selectedPeriod}
          onChange={(e) => handlePeriodChange(e.target.value)}
          style={{
            padding: "10px 14px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "14px",
            outline: "none",
          }}
        >
          {periods.map((p) => (
            <option key={p.periodID} value={p.periodID}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Top 3 Podium */}
      {ranking.length >= 3 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          {[ranking[1], ranking[0], ranking[2]].map((r, i) => (
            <div
              key={r.studentID}
              style={{
                backgroundColor: "#1a1a1a",
                border: `1px solid ${i === 1 ? "#FEC200" : "#2a2a2a"}`,
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center",
                minWidth: "160px",
                flex: 1,
                maxWidth: "200px",
                boxShadow: i === 1 ? "0 0 24px rgba(254,194,0,0.15)" : "none",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                {i === 1 ? "🥇" : i === 0 ? "🥈" : "🥉"}
              </div>
              <p
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "15px",
                  margin: "0 0 4px 0",
                }}
              >
                {r.name}
              </p>
              <p
                style={{ color: "#888", fontSize: "12px", margin: "0 0 8px 0" }}
              >
                {r.department}
              </p>
              <span
                style={{
                  backgroundColor: `${medalColor(r.rank)}22`,
                  color: medalColor(r.rank),
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "700",
                }}
              >
                {r.totalScore.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Full Table */}
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
                "Rank",
                "Student",
                "Admission No.",
                "Department",
                "Attendance",
                "Academic",
                "Behavior",
                "Total",
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
            ) : ranking.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    color: "#555",
                    padding: "32px",
                    textAlign: "center",
                  }}
                >
                  No rankings yet for this period
                </td>
              </tr>
            ) : (
              ranking.map((r) => (
                <tr
                  key={r.studentID}
                  style={{
                    borderBottom: "1px solid #222",
                    backgroundColor:
                      r.rank <= 3 ? "rgba(254,194,0,0.03)" : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 16px",
                      color: medalColor(r.rank),
                      fontWeight: "700",
                      fontSize: "15px",
                    }}
                  >
                    {r.rank === 1
                      ? "🥇"
                      : r.rank === 2
                        ? "🥈"
                        : r.rank === 3
                          ? "🥉"
                          : `#${r.rank}`}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: r.rank <= 3 ? "600" : "400",
                    }}
                  >
                    {r.name}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    {r.admissionNumber}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        backgroundColor: "rgba(254,194,0,0.1)",
                        color: "#FEC200",
                        padding: "3px 8px",
                        borderRadius: "20px",
                        fontSize: "11px",
                      }}
                    >
                      {r.department}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    {r.attendance}%
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    {r.academic}%
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    {r.behavior ?? "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        backgroundColor: "rgba(254,194,0,0.15)",
                        color: "#FEC200",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {r.totalScore.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
