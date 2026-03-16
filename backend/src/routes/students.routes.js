const express = require("express");
const prisma = require("../prisma");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

const COURSES = {
  NITA: ["ATC", "ELT", "MMT", "BCT", "ICT"],
  Diploma: ["DAE", "DEEE", "DME", "DICT"],
};
const LEVELS = {
  NITA: ["G3", "G2", "G1"],
  Diploma: ["MOD1", "MOD2", "MOD3"],
};

// GET course/level options
router.get("/options", (req, res) => {
  res.json({ COURSES, LEVELS });
});

// GET current student profile — MUST be before /:id
router.get("/me", authorizeRoles("STUDENT"), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userID: req.user.userID },
      include: {
        department: true,
        ojtPlacements: {
          include: { company: true, period: true },
          orderBy: { placementID: "desc" },
          take: 1,
        },
        scores: {
          orderBy: { scoreID: "desc" },
          take: 1,
        },
      },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST self-report arrival — MUST be before /:id
router.post("/me/report", authorizeRoles("STUDENT"), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userID: req.user.userID },
      include: {
        ojtPlacements: {
          orderBy: { placementID: "desc" },
          take: 1,
        },
      },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const placement = student.ojtPlacements?.[0];
    if (!placement)
      return res.status(400).json({ message: "No placement found" });
    if (placement.studentReported)
      return res.status(400).json({ message: "Already reported" });

    const updated = await prisma.oJTPlacement.update({
      where: { placementID: placement.placementID },
      data: {
        studentReported: true,
        reportedAt: new Date(),
        placementStatus: "PLACED_NOT_REPORTED",
      },
    });
    res.json({ message: "Arrival reported successfully", placement: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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
      console.error("GET /students error:", err);
      res.status(500).json({ message: "Server error", detail: err.message });
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
