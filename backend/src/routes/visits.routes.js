const express = require("express");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

// GET all visits – ADMIN only
router.get("/", authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const visits = await prisma.oJTVisit.findMany();
    res.json(visits);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET visit by ID – ADMIN or Instructor (own)
router.get("/:id", async (req, res) => {
  const visitID = parseInt(req.params.id);
  try {
    const visit = await prisma.oJTVisit.findUnique({ where: { visitID } });
    if (!visit) return res.status(404).json({ message: "Visit not found" });

    if (req.user.role === "ADMIN") return res.json(visit);

    if (req.user.role === "INSTRUCTOR" && req.user.userID === visit.instructorID) return res.json(visit);

    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
