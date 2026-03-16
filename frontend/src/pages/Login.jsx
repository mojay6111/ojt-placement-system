import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userID", res.data.userID);

      const role = res.data.role;
      if (role === "ADMIN") navigate("/admin");
      else if (role === "INSTRUCTOR") navigate("/instructor");
      else if (role === "STUDENT") navigate("/student");
      else navigate("/login");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo + Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <img
            src="/ect-logo-dark.png"
            alt="ECT Logo"
            style={{
              width: "90px",
              height: "90px",
              objectFit: "cover",
              marginBottom: "16px",
              borderRadius: "50%",
              padding: "8px",
              backgroundColor: "#1a1a1a",
              border: "2px solid #FEC200",
            }}
          />
          <h1
            style={{
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: "700",
              letterSpacing: "1px",
              margin: 0,
              textAlign: "center",
            }}
          >
            EASTLANDS COLLEGE OF TECHNOLOGY
          </h1>
          <p style={{ color: "#FEC200", fontSize: "13px", marginTop: "6px" }}>
            OJT Placement Management System
          </p>
          <div
            style={{
              marginTop: "12px",
              height: "3px",
              width: "60px",
              backgroundColor: "#CC0000",
              borderRadius: "2px",
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              color: "#aaa",
              fontSize: "13px",
              marginBottom: "6px",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="admin@ojt.com"
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "#111",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              color: "#aaa",
              fontSize: "13px",
              marginBottom: "6px",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "#111",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p
            style={{
              color: "#CC0000",
              fontSize: "13px",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            backgroundColor: "#FEC200",
            color: "#000",
            fontWeight: "700",
            fontSize: "15px",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginTop: "8px",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Footer */}
        <p
          style={{
            color: "#555",
            fontSize: "12px",
            textAlign: "center",
            marginTop: "24px",
          }}
        >
          Eastlands College of Technology © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
