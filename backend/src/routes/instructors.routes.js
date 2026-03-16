const express = require("express");
const prisma = require("../prisma");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

// GET all instructors — ADMIN only
router.get("/", authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const instructors = await prisma.instructor.findMany({
      include: { department: true },
    });
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET current instructor profile
router.get("/me", authorizeRoles("INSTRUCTOR"), async (req, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { userID: req.user.userID }, // ← userID not id
      include: { department: true },
    });
    if (!instructor)
      return res.status(404).json({ message: "Instructor not found" });
    res.json(instructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET instructor's students (by department)
router.get("/my-students", authorizeRoles("INSTRUCTOR"), async (req, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { userID: req.user.userID }, // ← userID not id
    });
    if (!instructor)
      return res.status(404).json({ message: "Instructor not found" });
    if (!instructor.departmentID) return res.json([]);

    const students = await prisma.student.findMany({
      where: { departmentID: instructor.departmentID },
      include: {
        department: true,
        ojtPlacements: {
          include: { company: true },
          orderBy: { placementID: "desc" },
          take: 1,
        },
        scores: {
          orderBy: { scoreID: "desc" },
          take: 1,
        },
      },
      orderBy: [{ course: "asc" }, { level: "asc" }],
    });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// POST create instructor — ADMIN only
router.post("/", authorizeRoles("ADMIN"), async (req, res) => {
  const { firstName, lastName, email, userID, departmentID } = req.body;
  try {
    const instructor = await prisma.instructor.create({
      data: {
        firstName,
        lastName,
        email,
        userID,
        departmentID: departmentID ? parseInt(departmentID) : null,
      },
      include: { department: true },
    });
    res.status(201).json(instructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH update instructor department — ADMIN only
router.patch("/:id/department", authorizeRoles("ADMIN"), async (req, res) => {
  const { departmentID } = req.body;
  try {
    const instructor = await prisma.instructor.update({
      where: { instructorID: parseInt(req.params.id) },
      data: { departmentID: parseInt(departmentID) },
      include: { department: true },
    });
    res.json(instructor);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
