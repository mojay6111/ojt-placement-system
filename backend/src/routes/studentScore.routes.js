const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentScore.controller");

// Get all scores for a student
router.get("/student/:studentID", controller.getScoresByStudent);

// Get all scores in a period
router.get("/period/:periodID", controller.getScoresByPeriod);

// Add a score
router.post("/", controller.addScore);

// Update a score
router.patch("/:scoreID", controller.updateScore);



module.exports = router;
