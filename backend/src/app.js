const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "OJT Placement System API is running",
  });
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/periods", require("./routes/placementPeriod.routes"));
app.use("/api/studentscores", require("./routes/studentScore.routes"));
app.use("/api/departments", require("./routes/departments.routes"));
app.use("/api/students", require("./routes/students.routes"));
app.use("/api/instructors", require("./routes/instructors.routes"));
app.use("/api/coordinators", require("./routes/coordinators.routes"));
app.use("/api/placements", require("./routes/placements.routes"));
app.use("/api/visits", require("./routes/visits.routes"));
app.use("/api/companies", require("./routes/company.routes"));
app.use("/api/ranking", require("./routes/ranking.routes"));
app.use("/api/summary", require("./routes/summary.routes"));

module.exports = app;
