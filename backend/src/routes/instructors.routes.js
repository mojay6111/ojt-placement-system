const express = require("express");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

// GET all instructors – ADMIN only
router.get("/", authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const instructors = await prisma.instructor.findMany();
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET instructor by ID – ADMIN or the instructor themselves
router.get("/:id", async (req, res) => {
  const instructorID = parseInt(req.params.id);
  try {
    if (req.user.role === "ADMIN") {
      const instructor = await prisma.instructor.findUnique({ where: { instructorID } });
      return res.json(instructor);
    }

    if (req.user.role === "INSTRUCTOR" && req.user.userID === instructorID) {
      const instructor = await prisma.instructor.findUnique({ where: { instructorID } });
      return res.json(instructor);
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
