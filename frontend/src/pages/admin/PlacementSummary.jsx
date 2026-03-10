import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import api from "../../api/axios";

const STATUS_COLORS = {
  PLACED_AND_REPORTED: { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
  PLACED_NOT_REPORTED: { bg: "rgba(96,165,250,0.15)", color: "#60a5fa" },
  NOT_PLACED: { bg: "rgba(204,0,0,0.15)", color: "#CC0000" },
  DISCIPLINARY: { bg: "rgba(251,146,60,0.15)", color: "#fb923c" },
};

const Cell = ({ value, type }) => {
  const style = STATUS_COLORS[type];
  if (!value)
    return (
      <td style={{ padding: "12px 16px", color: "#555", textAlign: "center" }}>
        0
      </td>
    );
  return (
    <td style={{ padding: "12px 16px", textAlign: "center" }}>
      <span
        style={{
          backgroundColor: style.bg,
          color: style.color,
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        {value}
      </span>
    </td>
  );
};

export default function PlacementSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("ALL");

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get("/summary");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const filteredRows =
    data?.rows.filter(
      (r) => filterCategory === "ALL" || r.category === filterCategory,
    ) || [];

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
            Placement Summary
          </h1>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
            Overall placement status per class
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
          onClick={fetchSummary}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#1a1a1a",
            color: "#fff",
            border: "1px solid #333",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Overall stat cards */}
      {data && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          {[
            {
              label: "Placed & Reported",
              key: "PLACED_AND_REPORTED",
              color: "#4ade80",
            },
            {
              label: "Placed Not Reported",
              key: "PLACED_NOT_REPORTED",
              color: "#60a5fa",
            },
            { label: "Not Placed", key: "NOT_PLACED", color: "#CC0000" },
            { label: "Disciplinary", key: "DISCIPLINARY", color: "#fb923c" },
            { label: "Total Students", key: "total", color: "#FEC200" },
          ].map(({ label, key, color }) => (
            <div
              key={key}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "12px",
                padding: "20px 24px",
                flex: 1,
                minWidth: "140px",
                borderTop: `3px solid ${color}`,
              }}
            >
              <p
                style={{ color: "#666", fontSize: "12px", margin: "0 0 8px 0" }}
              >
                {label}
              </p>
              <p
                style={{
                  color,
                  fontSize: "28px",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                {data.totals[key]}
              </p>
              {key !== "total" && (
                <p
                  style={{
                    color: "#555",
                    fontSize: "11px",
                    margin: "4px 0 0 0",
                  }}
                >
                  {((data.totals[key] / data.totals.total) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pending review alert */}
      {data?.totals.pendingReview > 0 && (
        <div
          style={{
            backgroundColor: "rgba(96,165,250,0.1)",
            border: "1px solid rgba(96,165,250,0.3)",
            borderRadius: "10px",
            padding: "14px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ color: "#60a5fa", fontSize: "18px" }}>🔔</span>
          <p style={{ color: "#60a5fa", fontSize: "14px", margin: 0 }}>
            <strong>{data.totals.pendingReview}</strong> student
            {data.totals.pendingReview > 1 ? "s have" : " has"} self-reported
            and awaiting instructor confirmation
          </p>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        {["ALL", "NITA", "Diploma"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              backgroundColor: filterCategory === cat ? "#FEC200" : "#1a1a1a",
              color: filterCategory === cat ? "#000" : "#888",
              border: filterCategory === cat ? "none" : "1px solid #333",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Summary Table */}
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
              <th
                style={{
                  color: "#666",
                  fontSize: "12px",
                  textAlign: "left",
                  padding: "14px 16px",
                  fontWeight: "600",
                }}
              >
                Class
              </th>
              <th
                style={{
                  color: "#666",
                  fontSize: "12px",
                  textAlign: "left",
                  padding: "14px 16px",
                  fontWeight: "600",
                }}
              >
                Category
              </th>
              <th
                style={{
                  color: "#4ade80",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "14px 16px",
                  fontWeight: "600",
                }}
              >
                Placed & Reported
              </th>
              <th
                style={{
                  color: "#60a5fa",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "14px 16px",
                  fontWeight: "600",
                }}
              >
                Placed Not Reported
              </th>
              <th
                style={{
                  color: "#CC0000",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "14px 16px",
                  fontWeight: "600",
                }}
              >
                Not Placed
              </th>
              <th
                style={{
                  color: "#fb923c",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "14px 16px",
                  fontWeight: "600",
                }}
              >
                Disciplinary
              </th>
              <th
                style={{
                  color: "#FEC200",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "14px 16px",
                  fontWeight: "600",
                }}
              >
                Total
              </th>
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
            ) : filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    color: "#555",
                    padding: "32px",
                    textAlign: "center",
                  }}
                >
                  No placement data yet
                </td>
              </tr>
            ) : (
              <>
                {filteredRows.map((r) => (
                  <tr
                    key={r.className}
                    style={{ borderBottom: "1px solid #222" }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: "700",
                      }}
                    >
                      {r.className}
                      {r.pendingReview > 0 && (
                        <span
                          style={{
                            marginLeft: "8px",
                            backgroundColor: "rgba(96,165,250,0.2)",
                            color: "#60a5fa",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px",
                          }}
                        >
                          {r.pendingReview} pending
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          backgroundColor:
                            r.category === "NITA"
                              ? "rgba(254,194,0,0.1)"
                              : "rgba(96,165,250,0.1)",
                          color: r.category === "NITA" ? "#FEC200" : "#60a5fa",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {r.category}
                      </span>
                    </td>
                    <Cell
                      value={r.PLACED_AND_REPORTED}
                      type="PLACED_AND_REPORTED"
                    />
                    <Cell
                      value={r.PLACED_NOT_REPORTED}
                      type="PLACED_NOT_REPORTED"
                    />
                    <Cell value={r.NOT_PLACED} type="NOT_PLACED" />
                    <Cell value={r.DISCIPLINARY} type="DISCIPLINARY" />
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "#FEC200",
                        textAlign: "center",
                        fontWeight: "700",
                      }}
                    >
                      {r.total}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr
                  style={{
                    backgroundColor: "#111",
                    borderTop: "2px solid #333",
                  }}
                >
                  <td
                    colSpan={2}
                    style={{
                      padding: "14px 16px",
                      color: "#FEC200",
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                  >
                    TOTALS
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#4ade80",
                      textAlign: "center",
                      fontWeight: "700",
                    }}
                  >
                    {data?.totals.PLACED_AND_REPORTED}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#60a5fa",
                      textAlign: "center",
                      fontWeight: "700",
                    }}
                  >
                    {data?.totals.PLACED_NOT_REPORTED}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#CC0000",
                      textAlign: "center",
                      fontWeight: "700",
                    }}
                  >
                    {data?.totals.NOT_PLACED}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#fb923c",
                      textAlign: "center",
                      fontWeight: "700",
                    }}
                  >
                    {data?.totals.DISCIPLINARY}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#FEC200",
                      textAlign: "center",
                      fontWeight: "700",
                    }}
                  >
                    {data?.totals.total}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
