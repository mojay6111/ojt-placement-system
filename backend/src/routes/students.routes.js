const express = require("express");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// Protect all student routes
router.use(authenticate);

// GET all students – ADMIN only
router.get("/", authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET a student by ID
router.get("/:id", async (req, res) => {
  const studentID = parseInt(req.params.id);
  try {
    // ADMIN can see all
    if (req.user.role === "ADMIN") {
      const student = await prisma.student.findUnique({ where: { studentID } });
      return res.json(student);
    }

    // STUDENT can only see own profile
    if (req.user.role === "STUDENT" && req.user.userID === studentID) {
      const student = await prisma.student.findUnique({ where: { studentID } });
      return res.json(student);
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
