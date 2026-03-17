import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MapPin,
  Bell,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/instructor", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/instructor/students", label: "Students", icon: Users },
  { to: "/instructor/placements", label: "Placements", icon: MapPin },
  { to: "/instructor/pending", label: "Pending Confirmations", icon: Bell },
];

export default function InstructorLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#0a0a0a",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "260px",
          backgroundColor: "#0f0f0f",
          borderRight: "1px solid #1a1a1a",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid #1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <img
            src="/ect-logo-dark.png"
            alt="ECT"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              objectFit: "cover",
            }}
          />
          <div>
            <p
              style={{
                color: "#FEC200",
                fontWeight: "700",
                fontSize: "16px",
                margin: 0,
              }}
            >
              ECT
            </p>
            <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>
              Instructor Portal
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                backgroundColor: isActive
                  ? "rgba(254,194,0,0.1)"
                  : "transparent",
                color: isActive ? "#FEC200" : "#888",
                fontWeight: isActive ? "600" : "400",
                fontSize: "14px",
                transition: "all 0.15s",
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid #1a1a1a" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "1px solid #222",
              color: "#666",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
        <Outlet />
      </div>
    </div>
  );
}
