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
import Placements from "./pages/admin/Placements";
import PlacementSummary from "./pages/admin/PlacementSummary";
import InstructorLayout from "./pages/instructor/InstructorLayout";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import StudentLayout from "./pages/students/StudentLayout";
import StudentDashboard from "./pages/students/StudentDashboard";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ADMIN routes */}
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
        <Route path="placements" element={<Placements />} />
        <Route path="summary" element={<PlacementSummary />} />
      </Route>

      {/* INSTRUCTOR routes */}
      <Route
        path="/instructor"
        element={
          <ProtectedRoute>
            <InstructorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InstructorDashboard />} />
      </Route>

      {/* STUDENT routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}