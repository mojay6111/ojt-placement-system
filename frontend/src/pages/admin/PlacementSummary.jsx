import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../../api/axios";

const STATUS_STYLES = {
  PLACED_AND_REPORTED: { color: "#4ade80", label: "Placed & Reported" },
  PLACED_NOT_REPORTED: { color: "#60a5fa", label: "Placed Not Reported" },
  NOT_PLACED: { color: "#f59e0b", label: "Not Placed" },
  DISCIPLINARY: { color: "#CC0000", label: "Disciplinary" },
};

const STATUS_KEYS = Object.keys(STATUS_STYLES);

const StatusCell = ({ value, type }) => {
  const style = STATUS_STYLES[type];
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
          backgroundColor: `${style.color}22`,
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

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="700"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "10px 14px",
        }}
      >
        <p
          style={{
            color: d.payload.color,
            fontWeight: "700",
            margin: "0 0 4px 0",
            fontSize: "13px",
          }}
        >
          {d.name}
        </p>
        <p style={{ color: "#fff", margin: 0, fontSize: "13px" }}>
          {d.value} students (
          {d.payload.total > 0
            ? ((d.value / d.payload.total) * 100).toFixed(1)
            : 0}
          %)
        </p>
      </div>
    );
  }
  return null;
};

const buildPieData = (row) =>
  STATUS_KEYS.map((key) => ({
    name: STATUS_STYLES[key].label,
    value: row[key] || 0,
    color: STATUS_STYLES[key].color,
    total: row.total || 0,
  })).filter((d) => d.value > 0);

const MiniPieCard = ({ row, size = 200, outerRadius = 80 }) => {
  const pieData = buildPieData(row);
  return (
    <div
      style={{
        backgroundColor: "#111",
        border: "1px solid #2a2a2a",
        borderRadius: "12px",
        padding: "16px",
        textAlign: "center",
        minWidth: "200px",
      }}
    >
      <p
        style={{
          color: "#FEC200",
          fontSize: "13px",
          fontWeight: "700",
          margin: "0 0 2px 0",
        }}
      >
        {row.className}
      </p>
      <p style={{ color: "#555", fontSize: "11px", margin: "0 0 8px 0" }}>
        <span style={{ color: "#aaa", fontWeight: "600" }}>{row.total}</span>{" "}
        students •{" "}
        <span
          style={{
            color: row.category === "NITA" ? "#FEC200" : "#60a5fa",
            fontSize: "11px",
          }}
        >
          {row.category}
        </span>
      </p>
      <PieChart width={size} height={size}>
        <Pie
          data={pieData}
          cx={size / 2 - 4}
          cy={size / 2 - 4}
          outerRadius={outerRadius}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {pieData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
      </PieChart>
      {/* Mini legend */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          marginTop: "8px",
          alignItems: "flex-start",
          paddingLeft: "12px",
        }}
      >
        {pieData.map((d) => (
          <div
            key={d.name}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "2px",
                backgroundColor: d.color,
                flexShrink: 0,
              }}
            />
            <span style={{ color: "#888", fontSize: "11px" }}>
              {d.name}:{" "}
              <span style={{ color: d.color, fontWeight: "600" }}>
                {d.value}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PlacementSummary() {
  const [data, setData] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [chartType, setChartType] = useState("pie");

  const fetchPeriods = async () => {
    try {
      const res = await api.get("/periods");
      setPeriods(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const url =
        selectedPeriod !== "all"
          ? `/summary?periodID=${selectedPeriod}`
          : "/summary";
      const res = await api.get(url);
      setData(res.data);
      setSelectedClass("ALL");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);
  useEffect(() => {
    fetchSummary();
  }, [selectedPeriod]);

  const filteredRows =
    data?.rows.filter(
      (r) => filterCategory === "ALL" || r.category === filterCategory,
    ) || [];

  const classOptions = ["ALL", ...(data?.rows.map((r) => r.className) || [])];

  const selectedRow =
    selectedClass !== "ALL"
      ? data?.rows.find((r) => r.className === selectedClass)
      : null;

  const overallPieData = data
    ? STATUS_KEYS.map((key) => ({
        name: STATUS_STYLES[key].label,
        value: data.totals[key],
        color: STATUS_STYLES[key].color,
        total: data.totals.total,
      })).filter((d) => d.value > 0)
    : [];

  const barData = filteredRows.map((r) => ({
    name: r.className,
    "Placed & Reported": r.PLACED_AND_REPORTED,
    "Placed Not Reported": r.PLACED_NOT_REPORTED,
    "Not Placed": r.NOT_PLACED,
    Disciplinary: r.DISCIPLINARY,
  }));

  const selectedPeriodName =
    periods.find((p) => String(p.periodID) === String(selectedPeriod))?.name ||
    "All Periods";

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
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Period Selector */}
          <div>
            <label
              style={{
                color: "#666",
                fontSize: "11px",
                display: "block",
                marginBottom: "4px",
              }}
            >
              PERIOD
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
                color: "#fff",
                padding: "9px 14px",
                fontSize: "13px",
                cursor: "pointer",
                outline: "none",
                minWidth: "180px",
              }}
            >
              <option value="all">All Periods</option>
              {periods.map((p) => (
                <option key={p.periodID} value={p.periodID}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {/* Class Selector */}
          <div>
            <label
              style={{
                color: "#666",
                fontSize: "11px",
                display: "block",
                marginBottom: "4px",
              }}
            >
              CLASS
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
                color: "#fff",
                padding: "9px 14px",
                fontSize: "13px",
                cursor: "pointer",
                outline: "none",
                minWidth: "140px",
              }}
            >
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All Classes" : c}
                </option>
              ))}
            </select>
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
              padding: "9px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: "pointer",
              marginTop: "15px",
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Active period badge */}
      <div style={{ marginBottom: "20px" }}>
        <span
          style={{
            backgroundColor: "rgba(254,194,0,0.1)",
            border: "1px solid rgba(254,194,0,0.2)",
            color: "#FEC200",
            padding: "5px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          📅 {selectedPeriodName}
        </span>
      </div>

      {/* Stat Cards */}
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
            { label: "Placed & Reported", key: "PLACED_AND_REPORTED" },
            { label: "Placed Not Reported", key: "PLACED_NOT_REPORTED" },
            { label: "Not Placed", key: "NOT_PLACED" },
            { label: "Disciplinary", key: "DISCIPLINARY" },
            { label: "Total Students", key: "total" },
          ].map(({ label, key }) => {
            const color = STATUS_STYLES[key]?.color || "#FEC200";
            return (
              <div
                key={key}
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "12px",
                  padding: "20px 24px",
                  flex: 1,
                  minWidth: "130px",
                  borderTop: `3px solid ${color}`,
                }}
              >
                <p
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    margin: "0 0 8px 0",
                  }}
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
                {key !== "total" && data.totals.total > 0 && (
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
            );
          })}
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
          <span>🔔</span>
          <p style={{ color: "#60a5fa", fontSize: "14px", margin: 0 }}>
            <strong>{data.totals.pendingReview}</strong> student
            {data.totals.pendingReview > 1 ? "s have" : " has"} self-reported
            and awaiting instructor confirmation
          </p>
        </div>
      )}

      {/* Charts Row */}
      {data && data.totals.total > 0 && (
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          {/* Overall Pie */}
          <div
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              padding: "24px",
              minWidth: "280px",
              flex: "0 0 auto",
            }}
          >
            <h2
              style={{
                color: "#fff",
                fontSize: "15px",
                fontWeight: "600",
                margin: "0 0 2px 0",
              }}
            >
              Overall
            </h2>
            <p
              style={{ color: "#555", fontSize: "12px", margin: "0 0 16px 0" }}
            >
              Total:{" "}
              <span style={{ color: "#FEC200", fontWeight: "700" }}>
                {data.totals.total} students
              </span>
            </p>
            <PieChart width={240} height={220}>
              <Pie
                data={overallPieData}
                cx={116}
                cy={100}
                outerRadius={90}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {overallPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
            {/* Legend */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginTop: "8px",
              }}
            >
              {overallPieData.map((d) => (
                <div
                  key={d.name}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "11px",
                      height: "11px",
                      borderRadius: "3px",
                      backgroundColor: d.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "#888", fontSize: "12px" }}>
                    {d.name}:{" "}
                    <span style={{ color: d.color, fontWeight: "600" }}>
                      {d.value} (
                      {data.totals.total > 0
                        ? ((d.value / data.totals.total) * 100).toFixed(1)
                        : 0}
                      %)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Class Pie */}
          {selectedRow ? (
            <div
              style={{
                backgroundColor: "#1a1a1a",
                border: "2px solid rgba(254,194,0,0.3)",
                borderRadius: "12px",
                padding: "24px",
                minWidth: "280px",
                flex: "0 0 auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2px",
                }}
              >
                <h2
                  style={{
                    color: "#FEC200",
                    fontSize: "15px",
                    fontWeight: "600",
                    margin: 0,
                  }}
                >
                  {selectedRow.className}
                </h2>
                <span
                  style={{
                    backgroundColor:
                      selectedRow.category === "NITA"
                        ? "rgba(254,194,0,0.1)"
                        : "rgba(96,165,250,0.1)",
                    color:
                      selectedRow.category === "NITA" ? "#FEC200" : "#60a5fa",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  {selectedRow.category}
                </span>
              </div>
              <p
                style={{
                  color: "#555",
                  fontSize: "12px",
                  margin: "0 0 16px 0",
                }}
              >
                Total:{" "}
                <span style={{ color: "#FEC200", fontWeight: "700" }}>
                  {selectedRow.total} students
                </span>
              </p>
              <PieChart width={240} height={220}>
                <Pie
                  data={buildPieData(selectedRow)}
                  cx={116}
                  cy={100}
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {buildPieData(selectedRow).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  marginTop: "8px",
                }}
              >
                {buildPieData(selectedRow).map((d) => (
                  <div
                    key={d.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "11px",
                        height: "11px",
                        borderRadius: "3px",
                        backgroundColor: d.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: "#888", fontSize: "12px" }}>
                      {d.name}:{" "}
                      <span style={{ color: d.color, fontWeight: "600" }}>
                        {d.value} (
                        {selectedRow.total > 0
                          ? ((d.value / selectedRow.total) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // All classes pie grid
            <div
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "12px",
                padding: "24px",
                flex: 1,
                minWidth: "300px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: "15px",
                      fontWeight: "600",
                      margin: "0 0 2px 0",
                    }}
                  >
                    Per Class
                  </h2>
                  <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
                    Select a class above for detailed view
                  </p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["pie", "bar"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setChartType(t)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: chartType === t ? "#FEC200" : "#111",
                        color: chartType === t ? "#000" : "#666",
                        border: chartType === t ? "none" : "1px solid #333",
                      }}
                    >
                      {t === "pie" ? "🥧 Pie" : "📊 Bar"}
                    </button>
                  ))}
                </div>
              </div>

              {chartType === "bar" ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={barData}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#888", fontSize: 11 }}
                      stroke="#333"
                    />
                    <YAxis
                      tick={{ fill: "#888", fontSize: 11 }}
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
                        <span style={{ color: "#aaa", fontSize: "11px" }}>
                          {v}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="Placed & Reported"
                      fill="#4ade80"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="Placed Not Reported"
                      fill="#60a5fa"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="Not Placed"
                      fill="#f59e0b"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="Disciplinary"
                      fill="#CC0000"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {filteredRows.map((r) => (
                    <MiniPieCard key={r.className} row={r} />
                  ))}
                  {filteredRows.length === 0 && (
                    <p
                      style={{
                        color: "#555",
                        fontSize: "14px",
                        padding: "32px",
                      }}
                    >
                      No data for selected filter
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Category Filter */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#555", fontSize: "12px" }}>Filter table:</span>
        {["ALL", "NITA", "Diploma"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: "7px 16px",
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
                  color: "#f59e0b",
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
                  color: "#CC0000",
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
                    onClick={() =>
                      setSelectedClass(
                        r.className === selectedClass ? "ALL" : r.className,
                      )
                    }
                    style={{
                      borderBottom: "1px solid #222",
                      cursor: "pointer",
                      backgroundColor:
                        selectedClass === r.className
                          ? "rgba(254,194,0,0.05)"
                          : "transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        color:
                          selectedClass === r.className ? "#FEC200" : "#fff",
                        fontSize: "14px",
                        fontWeight: "700",
                      }}
                    >
                      {selectedClass === r.className && (
                        <span style={{ marginRight: "6px" }}>▶</span>
                      )}
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
                    <StatusCell
                      value={r.PLACED_AND_REPORTED}
                      type="PLACED_AND_REPORTED"
                    />
                    <StatusCell
                      value={r.PLACED_NOT_REPORTED}
                      type="PLACED_NOT_REPORTED"
                    />
                    <StatusCell value={r.NOT_PLACED} type="NOT_PLACED" />
                    <StatusCell value={r.DISCIPLINARY} type="DISCIPLINARY" />
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
                      color: "#f59e0b",
                      textAlign: "center",
                      fontWeight: "700",
                    }}
                  >
                    {data?.totals.NOT_PLACED}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      color: "#CC0000",
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

      {/* Legend */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "12px",
          padding: "14px 24px",
          marginTop: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <p
          style={{
            color: "#555",
            fontSize: "12px",
            margin: 0,
            fontWeight: "600",
          }}
        >
          LEGEND:
        </p>
        {STATUS_KEYS.map((key) => (
          <div
            key={key}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                backgroundColor: STATUS_STYLES[key].color,
              }}
            />
            <span style={{ color: "#aaa", fontSize: "12px" }}>
              {STATUS_STYLES[key].label}
            </span>
          </div>
        ))}
        <span style={{ color: "#444", fontSize: "11px", marginLeft: "auto" }}>
          💡 Click a row to see its chart
        </span>
      </div>
    </div>
  );
}
