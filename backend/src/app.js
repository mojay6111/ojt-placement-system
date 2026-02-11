const express = require("express");
const app = express();
const placementPeriodRoutes = require("./routes/placementPeriod.routes");
const studentScoreRoutes = require("./routes/studentScore.routes");

// Middleware
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "OJT Placement System API is running",
  });
});

// Mount all routes

app.use("/api/periods", placementPeriodRoutes);
app.use("/api/studentscores", studentScoreRoutes);
app.use("/api/departments", require("./routes/departments.routes"));
app.use("/api/students", require("./routes/students.routes"));
app.use("/api/instructors", require("./routes/instructors.routes"));
app.use("/api/coordinators", require("./routes/coordinators.routes"));
app.use("/api/placements", require("./routes/placements.routes"));
app.use("/api/visits", require("./routes/visits.routes"));

module.exports = app;

// // Departments routes
// const departmentRoutes = require("./routes/departments.routes");
// app.use("/api/departments", departmentRoutes);

// // Students routes
// const studentRoutes = require("./routes/students.routes");
// app.use("/api/students", studentRoutes);

// // Instructors routes
// const instructorRoutes = require("./routes/instructors.routes");
// app.use("/api/instructors", instructorRoutes);

// // Coordinators routes
// const coordinatorRoutes = require("./routes/coordinators.routes");
// app.use("/api/coordinators", coordinatorRoutes);

// // Auth routes
// const authRoutes = require("./routes/auth.routes");
// app.use("/api/auth", authRoutes);
