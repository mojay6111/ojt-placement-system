// src/app.js
const express = require("express");

const app = express();

// Middleware
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "OJT Placement System API is running",
  });
});

module.exports = app;
