const express = require("express");
const router = express.Router();
const controller = require("../controllers/placementPeriod.controller");

// Get all periods
router.get("/", controller.getAllPeriods);

// Create new period
router.post("/", controller.createPeriod);

module.exports = router;
