const express = require("express");
const router = express.Router();
const controller = require("../controllers/placementPeriod.controller");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

router.use(authenticate);

// GET all periods — all authenticated users
router.get("/", controller.getAllPeriods);

// POST create period — ADMIN and COORDINATOR
router.post(
  "/",
  authorizeRoles("ADMIN", "COORDINATOR"),
  controller.createPeriod,
);

// PATCH set active period — ADMIN and COORDINATOR
router.patch(
  "/:id/activate",
  authorizeRoles("ADMIN", "COORDINATOR"),
  controller.setActivePeriod,
);

module.exports = router;
