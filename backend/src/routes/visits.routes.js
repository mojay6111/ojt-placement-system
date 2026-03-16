const express = require("express");
const prisma = require("../prisma");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

// GET all visits — ADMIN only
router.get("/", authorizeRoles("ADMIN", "INSTRUCTOR"), async (req, res) => {
  try {
    const visits = await prisma.oJTVisit.findMany({
      include: {
        placement: { include: { student: true, company: true } },
        instructor: true,
      },
      orderBy: { visitDate: "desc" },
    });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST log a visit — INSTRUCTOR or ADMIN
router.post("/", authorizeRoles("ADMIN", "INSTRUCTOR"), async (req, res) => {
  const { placementID, instructorID, visitDate, notes } = req.body;
  try {
    const visit = await prisma.oJTVisit.create({
      data: {
        placementID: parseInt(placementID),
        instructorID: parseInt(instructorID),
        visitDate: new Date(visitDate),
        notes: notes || null,
      },
    });
    res.status(201).json(visit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET visit by ID
router.get("/:id", async (req, res) => {
  const visitID = parseInt(req.params.id);
  try {
    const visit = await prisma.oJTVisit.findUnique({ where: { visitID } });
    if (!visit) return res.status(404).json({ message: "Visit not found" });
    if (req.user.role === "ADMIN") return res.json(visit);
    if (req.user.role === "INSTRUCTOR") return res.json(visit);
    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
