import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  Calendar,
  ClipboardList,
  Trophy,
  LogOut,
  BarChart2,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/companies", label: "Companies", icon: Building2 },
  { to: "/admin/departments", label: "Departments", icon: BookOpen },
  { to: "/admin/periods", label: "Periods", icon: Calendar },
  { to: "/admin/scores", label: "Scores", icon: ClipboardList },
  { to: "/admin/ranking", label: "Green List", icon: Trophy },
  { to: "/admin/summary", label: "Placement Summary", icon: BarChart2 },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      style={{
        width: "240px",
        minHeight: "100vh",
        backgroundColor: "#111",
        borderRight: "1px solid #222",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* Logo Area */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid #222",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <img
          src="/ect-logo-dark.png"
          alt="ECT"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "2px solid #FEC200",
            objectFit: "cover",
            padding: "3px",
            backgroundColor: "#1a1a1a",
          }}
        />
        <div>
          <p
            style={{
              color: "#FEC200",
              fontWeight: "700",
              fontSize: "13px",
              margin: 0,
            }}
          >
            ECT
          </p>
          <p style={{ color: "#666", fontSize: "11px", margin: 0 }}>
            OJT System
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "16px 0" }}>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 20px",
              color: isActive ? "#FEC200" : "#888",
              backgroundColor: isActive
                ? "rgba(254,194,0,0.08)"
                : "transparent",
              borderLeft: isActive
                ? "3px solid #FEC200"
                : "3px solid transparent",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: isActive ? "600" : "400",
              transition: "all 0.15s",
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px", borderTop: "1px solid #222" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "10px 12px",
            backgroundColor: "transparent",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#888",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
