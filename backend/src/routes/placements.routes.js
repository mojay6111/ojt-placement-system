const express = require("express");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

// GET all placements – ADMIN only
router.get("/", authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const placements = await prisma.oJTPlacement.findMany();
    res.json(placements);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET placement by ID – ADMIN, STUDENT (own), COORDINATOR (own)
router.get("/:id", async (req, res) => {
  const placementID = parseInt(req.params.id);

  try {
    const placement = await prisma.oJTPlacement.findUnique({ where: { placementID } });
    if (!placement) return res.status(404).json({ message: "Placement not found" });

    if (req.user.role === "ADMIN") return res.json(placement);

    if (req.user.role === "STUDENT" && req.user.userID === placement.studentID) return res.json(placement);

    if (req.user.role === "COORDINATOR" && req.user.userID === placement.coordinatorID) return res.json(placement);

    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
