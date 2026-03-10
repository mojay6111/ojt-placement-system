const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentScore.controller");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

router.use(authenticate);

// Instructor or Admin can view scores by student
router.get(
  "/student/:studentID",
  authorizeRoles("ADMIN", "INSTRUCTOR"),
  controller.getScoresByStudent,
);

// Admin or Coordinator can view scores by period
router.get(
  "/period/:periodID",
  authorizeRoles("ADMIN", "COORDINATOR", "INSTRUCTOR"),
  controller.getScoresByPeriod,
);

// Only Instructor can add scores
router.post("/", authorizeRoles("INSTRUCTOR", "ADMIN"), controller.addScore);

// Only Instructor or Admin can update scores
router.patch(
  "/:scoreID",
  authorizeRoles("INSTRUCTOR", "ADMIN"),
  controller.updateScore,
);

module.exports = router;
