const express = require("express");
const prisma = require("../prisma");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

// GET all placements — ADMIN, COORDINATOR, INSTRUCTOR
router.get(
  "/",
  authorizeRoles("ADMIN", "COORDINATOR", "INSTRUCTOR"),
  async (req, res) => {
    try {
      const placements = await prisma.oJTPlacement.findMany({
        include: {
          student: { include: { department: true } },
          company: true,
          coordinator: true,
        },
      });
      res.json(placements);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// GET placement by ID
router.get("/:id", async (req, res) => {
  const placementID = parseInt(req.params.id);
  try {
    const placement = await prisma.oJTPlacement.findUnique({
      where: { placementID },
      include: {
        student: { include: { department: true } },
        company: true,
        coordinator: true,
      },
    });
    if (!placement)
      return res.status(404).json({ message: "Placement not found" });
    if (req.user.role === "ADMIN") return res.json(placement);
    if (req.user.role === "INSTRUCTOR") return res.json(placement);
    if (
      req.user.role === "COORDINATOR" &&
      req.user.userID === placement.coordinatorID
    )
      return res.json(placement);
    if (req.user.role === "STUDENT" && req.user.userID === placement.studentID)
      return res.json(placement);
    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE placement — ADMIN, COORDINATOR
router.post("/", authorizeRoles("ADMIN", "COORDINATOR"), async (req, res) => {
  const { studentID, coordinatorID, companyID, startDate, endDate, periodID } =
    req.body;
  try {
    const placement = await prisma.oJTPlacement.create({
      data: {
        studentID,
        coordinatorID,
        companyID,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        periodID,
        placementStatus: "NOT_PLACED",
      },
      include: {
        student: { include: { department: true } },
        company: true,
      },
    });
    res.status(201).json(placement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// STUDENT self-reports — sets flag + changes status to PLACED_NOT_REPORTED
router.patch("/:id/report", authorizeRoles("STUDENT"), async (req, res) => {
  const placementID = parseInt(req.params.id);
  try {
    const placement = await prisma.oJTPlacement.update({
      where: { placementID },
      data: {
        studentReported: true,
        reportedAt: new Date(),
        placementStatus: "PLACED_NOT_REPORTED",
      },
    });
    res.json({ message: "Reported successfully", placement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// INSTRUCTOR/ADMIN updates placement status
router.patch(
  "/:id/status",
  authorizeRoles("ADMIN", "INSTRUCTOR", "COORDINATOR"),
  async (req, res) => {
    const placementID = parseInt(req.params.id);
    const { placementStatus, instructorNote } = req.body;
    try {
      const placement = await prisma.oJTPlacement.update({
        where: { placementID },
        data: {
          placementStatus,
          instructorNote,
        },
        include: {
          student: { include: { department: true } },
          company: true,
        },
      });
      res.json(placement);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
