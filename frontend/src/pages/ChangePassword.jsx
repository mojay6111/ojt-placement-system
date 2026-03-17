import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (form.newPassword.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    if (form.newPassword !== form.confirm) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/change-password", {
        newPassword: form.newPassword,
      });
      // Redirect based on role
      const role = localStorage.getItem("role");
      if (role === "ADMIN") navigate("/admin");
      else if (role === "INSTRUCTOR") navigate("/instructor");
      else navigate("/student");
    } catch (err) {
      setError(err.response?.data?.message || "Error changing password");
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
        fontFamily: "Inter, sans-serif",
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
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src="/ect-logo-dark.png"
            alt="ECT"
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              border: "2px solid #FEC200",
              marginBottom: "16px",
            }}
          />
          <h1
            style={{
              color: "#fff",
              fontSize: "20px",
              fontWeight: "700",
              margin: 0,
            }}
          >
            Set Your Password
          </h1>
          <p style={{ color: "#666", fontSize: "13px", marginTop: "8px" }}>
            This is your first login. Please create a new password to continue.
          </p>
          <div
            style={{
              margin: "12px auto 0",
              height: "3px",
              width: "48px",
              backgroundColor: "#FEC200",
              borderRadius: "2px",
            }}
          />
        </div>

        {/* Warning banner */}
        <div
          style={{
            backgroundColor: "rgba(254,194,0,0.08)",
            border: "1px solid rgba(254,194,0,0.2)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "24px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "18px" }}>🔐</span>
          <p style={{ color: "#FEC200", fontSize: "12px", margin: 0 }}>
            Your current password is your admission number. Create a secure new
            password.
          </p>
        </div>

        {/* New Password */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              color: "#aaa",
              fontSize: "13px",
              marginBottom: "6px",
            }}
          >
            New Password
          </label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            placeholder="Minimum 6 characters"
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

        {/* Confirm Password */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              color: "#aaa",
              fontSize: "13px",
              marginBottom: "6px",
            }}
          >
            Confirm Password
          </label>
          <input
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="Repeat your password"
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

        {/* Password strength indicator */}
        {form.newPassword.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: "4px",
                    borderRadius: "2px",
                    backgroundColor:
                      form.newPassword.length >= i * 3
                        ? i <= 1
                          ? "#CC0000"
                          : i <= 2
                            ? "#f59e0b"
                            : i <= 3
                              ? "#60a5fa"
                              : "#4ade80"
                        : "#222",
                  }}
                />
              ))}
            </div>
            <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>
              {form.newPassword.length < 6
                ? "Too short"
                : form.newPassword.length < 9
                  ? "Weak"
                  : form.newPassword.length < 12
                    ? "Good"
                    : "Strong"}
            </p>
          </div>
        )}

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
          }}
        >
          {loading ? "Saving..." : "Set Password & Continue →"}
        </button>

        <p
          style={{
            color: "#555",
            fontSize: "12px",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          Eastlands College of Technology © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
