import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function AdminLayout() {
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#0a0a0a",
        minHeight: "100vh",
      }}
    >
      <Sidebar />
      <main style={{ marginLeft: "240px", flex: 1, padding: "32px" }}>
        <Outlet />
      </main>
    </div>
  );
}
