import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import Companies from "./pages/admin/Companies";
import Departments from "./pages/admin/Departments";
import Periods from "./pages/admin/Periods";
import Scores from "./pages/admin/Scores";
import Ranking from "./pages/admin/Ranking";
import PlacementSummary from "./pages/admin/PlacementSummary";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="companies" element={<Companies />} />
        <Route path="departments" element={<Departments />} />
        <Route path="periods" element={<Periods />} />
        <Route path="scores" element={<Scores />} />
        <Route path="ranking" element={<Ranking />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="summary" element={<PlacementSummary />} />
    </Routes>
  );
}
