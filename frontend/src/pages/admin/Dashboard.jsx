import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  BookOpen,
  Trophy,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../../api/axios";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div
    style={{
      backgroundColor: "#1a1a1a",
      border: "1px solid #2a2a2a",
      borderRadius: "12px",
      padding: "24px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      flex: 1,
      minWidth: "200px",
    }}
  >
    <div
      style={{
        backgroundColor: `${color}18`,
        borderRadius: "10px",
        padding: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={24} color={color} />
    </div>
    <div>
      <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>{label}</p>
      <p
        style={{
          color: "#fff",
          fontSize: "28px",
          fontWeight: "700",
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

const COLORS = ["#FEC200", "#CC0000", "#4ade80", "#60a5fa"];

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    departments: 0,
    periods: 0,
  });
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [students, companies, departments, periods] = await Promise.all([
          api.get("/students"),
          api.get("/companies"),
          api.get("/departments"),
          api.get("/periods"),
        ]);

        setStats({
          students: students.data.length,
          companies: companies.data.length,
          departments: departments.data.length,
          periods: periods.data.length,
        });

        // fetch ranking for period 1 if exists
        if (periods.data.length > 0) {
          const rankRes = await api.get(`/ranking/${periods.data[0].periodID}`);
          setRanking(rankRes.data.ranking.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const barData = ranking.map((r) => ({
    name: r.name.split(" ")[0],
    score: r.totalScore,
  }));

  const pieData = [
    { name: "Students", value: stats.students },
    { name: "Companies", value: stats.companies },
    { name: "Departments", value: stats.departments },
    { name: "Periods", value: stats.periods },
  ];

  if (loading) {
    return (
      <div style={{ color: "#FEC200", fontSize: "16px", padding: "32px" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            color: "#fff",
            fontSize: "24px",
            fontWeight: "700",
            margin: 0,
          }}
        >
          Admin Dashboard
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
          Eastlands College of Technology — OJT Management
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

      {/* Stat Cards */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "32px",
        }}
      >
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.students}
          color="#FEC200"
        />
        <StatCard
          icon={Building2}
          label="Companies"
          value={stats.companies}
          color="#CC0000"
        />
        <StatCard
          icon={BookOpen}
          label="Departments"
          value={stats.departments}
          color="#4ade80"
        />
        <StatCard
          icon={Calendar}
          label="Periods"
          value={stats.periods}
          color="#60a5fa"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {/* Bar Chart — Top Students */}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <Trophy size={18} color="#FEC200" />
            <h2
              style={{
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                margin: 0,
              }}
            >
              Top 5 — Green List
            </h2>
          </div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis
                  dataKey="name"
                  stroke="#555"
                  tick={{ fill: "#888", fontSize: 12 }}
                />
                <YAxis
                  stroke="#555"
                  tick={{ fill: "#888", fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#FEC200" }}
                />
                <Bar dataKey="score" fill="#FEC200" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p
              style={{
                color: "#555",
                fontSize: "14px",
                textAlign: "center",
                paddingTop: "60px",
              }}
            >
              No scores recorded yet
            </p>
          )}
        </div>

        {/* Pie Chart — System Overview */}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <TrendingUp size={18} color="#CC0000" />
            <h2
              style={{
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                margin: 0,
              }}
            >
              System Overview
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            {pieData.map((entry, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: COLORS[index],
                  }}
                />
                <span style={{ color: "#888", fontSize: "12px" }}>
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Ranking Table */}
      {ranking.length > 0 && (
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
            padding: "24px",
            marginTop: "16px",
          }}
        >
          <h2
            style={{
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              margin: "0 0 16px 0",
            }}
          >
            🏆 Current Green List Rankings
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                {[
                  "Rank",
                  "Student",
                  "Department",
                  "Attendance",
                  "Academic",
                  "Total Score",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      textAlign: "left",
                      padding: "8px 12px",
                      fontWeight: "600",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranking.map((r) => (
                <tr
                  key={r.studentID}
                  style={{ borderBottom: "1px solid #1f1f1f" }}
                >
                  <td
                    style={{
                      padding: "12px",
                      color: r.rank === 1 ? "#FEC200" : "#fff",
                      fontWeight: r.rank === 1 ? "700" : "400",
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
                    style={{ padding: "12px", color: "#fff", fontSize: "14px" }}
                  >
                    {r.name}
                  </td>
                  <td
                    style={{ padding: "12px", color: "#888", fontSize: "13px" }}
                  >
                    {r.department}
                  </td>
                  <td
                    style={{ padding: "12px", color: "#888", fontSize: "13px" }}
                  >
                    {r.attendance}%
                  </td>
                  <td
                    style={{ padding: "12px", color: "#888", fontSize: "13px" }}
                  >
                    {r.academic}%
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        backgroundColor: "rgba(254,194,0,0.15)",
                        color: "#FEC200",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      {r.totalScore.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
