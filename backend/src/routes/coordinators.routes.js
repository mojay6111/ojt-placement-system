const express = require("express");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

// GET all coordinators – ADMIN only
router.get("/", authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const coordinators = await prisma.industrialCoordinator.findMany();
    res.json(coordinators);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET coordinator by ID – ADMIN or themselves
router.get("/:id", async (req, res) => {
  const coordinatorID = parseInt(req.params.id);
  try {
    if (req.user.role === "ADMIN") {
      const coordinator = await prisma.industrialCoordinator.findUnique({ where: { coordinatorID } });
      return res.json(coordinator);
    }

    if (req.user.role === "COORDINATOR" && req.user.userID === coordinatorID) {
      const coordinator = await prisma.industrialCoordinator.findUnique({ where: { coordinatorID } });
      return res.json(coordinator);
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
