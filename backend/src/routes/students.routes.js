const express = require("express");
const prisma = require("../prisma");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

// Fixed lists
const COURSES = {
  NITA: ["ATC", "ELT", "MMT", "BCT", "ICT"],
  Diploma: ["DAE", "DEEE", "DME", "DICT"],
};
const LEVELS = {
  NITA: ["G3", "G2", "G1"],
  Diploma: ["MOD1", "MOD2", "MOD3"],
};

// GET course/level options
router.get("/options", authenticate, (req, res) => {
  res.json({ COURSES, LEVELS });
});

// GET all students
router.get(
  "/",
  authorizeRoles("ADMIN", "INSTRUCTOR", "COORDINATOR"),
  async (req, res) => {
    try {
      const students = await prisma.student.findMany({
        include: { department: true },
        orderBy: [{ category: "asc" }, { course: "asc" }, { level: "asc" }],
      });
      res.json(students);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// GET student by ID
router.get("/:id", async (req, res) => {
  const studentID = parseInt(req.params.id);
  try {
    const student = await prisma.student.findUnique({
      where: { studentID },
      include: { department: true },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (req.user.role === "ADMIN") return res.json(student);
    if (req.user.role === "INSTRUCTOR") return res.json(student);
    if (req.user.role === "STUDENT" && req.user.userID === studentID)
      return res.json(student);
    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE student
router.post("/", authorizeRoles("ADMIN"), async (req, res) => {
  const {
    firstName,
    lastName,
    admissionNumber,
    departmentID,
    userID,
    category,
    course,
    level,
  } = req.body;
  try {
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        admissionNumber,
        departmentID,
        userID,
        category: category || "NITA",
        course: course || "ATC",
        level: level || "G3",
      },
      include: { department: true },
    });
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE student
router.patch("/:id", authorizeRoles("ADMIN"), async (req, res) => {
  const studentID = parseInt(req.params.id);
  const {
    firstName,
    lastName,
    admissionNumber,
    departmentID,
    category,
    course,
    level,
  } = req.body;
  try {
    const student = await prisma.student.update({
      where: { studentID },
      data: {
        firstName,
        lastName,
        admissionNumber,
        departmentID,
        category,
        course,
        level,
      },
      include: { department: true },
    });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE student
router.delete("/:id", authorizeRoles("ADMIN"), async (req, res) => {
  const studentID = parseInt(req.params.id);
  try {
    await prisma.student.delete({ where: { studentID } });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
