const express = require("express");
const app = express();

// Middleware
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "OJT Placement System API is running",
  });
});

// Departments routes
const departmentRoutes = require("./routes/departments.routes");
app.use("/api/departments", departmentRoutes);

// Students routes
const studentRoutes = require("./routes/students.routes");
app.use("/api/students", studentRoutes);

// Instructors routes
const instructorRoutes = require("./routes/instructors.routes");
app.use("/api/instructors", instructorRoutes);

// Coordinators routes
const coordinatorRoutes = require("./routes/coordinators.routes");
app.use("/api/coordinators", coordinatorRoutes);

module.exports = app;
