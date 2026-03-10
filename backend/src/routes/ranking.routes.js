const express = require("express");
const router = express.Router();
const { getRankingByPeriod } = require("../controllers/ranking.controller");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

router.use(authenticate);

// Green List leaderboard for a period
router.get(
  "/:periodID",
  authorizeRoles("ADMIN", "COORDINATOR", "INSTRUCTOR"),
  getRankingByPeriod,
);

module.exports = router;
