const express = require("express");
const prisma = require("../prisma");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const multer = require("multer");
const { parse } = require("csv-parse/sync");
const bcrypt = require("bcryptjs");
const upload = multer({ storage: multer.memoryStorage() });

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

// GET student's rank in their period
router.get("/me/rank", authorizeRoles("STUDENT"), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userID: req.user.userID },
      include: { scores: { orderBy: { scoreID: "desc" }, take: 1 } },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const latestScore = student.scores?.[0];
    if (!latestScore) return res.json({ rank: null, total: 0, score: null });

    // Get all scores for that period
    const allScores = await prisma.studentScore.findMany({
      where: { periodID: latestScore.periodID },
      orderBy: { totalScore: "desc" },
    });

    const rank =
      allScores.findIndex((s) => s.studentID === student.studentID) + 1;

    res.json({
      rank,
      total: allScores.length,
      score: latestScore.totalScore,
      periodID: latestScore.periodID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET student's visit history
router.get("/me/visits", authorizeRoles("STUDENT"), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userID: req.user.userID },
      include: { ojtPlacements: { orderBy: { placementID: "desc" }, take: 1 } },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const placement = student.ojtPlacements?.[0];
    if (!placement) return res.json([]);

    const visits = await prisma.oJTVisit.findMany({
      where: { placementID: placement.placementID },
      include: { instructor: true },
      orderBy: { visitDate: "desc" },
    });
    res.json(visits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET student's all scores across periods
router.get("/me/scores", authorizeRoles("STUDENT"), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userID: req.user.userID },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const scores = await prisma.studentScore.findMany({
      where: { studentID: student.studentID },
      include: { period: true },
      orderBy: { periodID: "asc" },
    });
    res.json(scores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// INSTRUCTOR creates a student (dept restricted)
router.post(
  "/register",
  authorizeRoles("ADMIN", "INSTRUCTOR"),
  async (req, res) => {
    const {
      firstName,
      lastName,
      admissionNumber,
      phone,
      yearAdmitted,
      category,
      course,
      level,
      departmentID,
    } = req.body;
    try {
      // If instructor, force their department
      let finalDeptID = parseInt(departmentID);
      if (req.user.role === "INSTRUCTOR") {
        const instructor = await prisma.instructor.findUnique({
          where: { userID: req.user.userID },
        });
        if (!instructor?.departmentID)
          return res
            .status(403)
            .json({ message: "Instructor has no department assigned" });
        finalDeptID = instructor.departmentID;
      }

      // Check admission number not taken
      const existing = await prisma.student.findUnique({
        where: { admissionNumber },
      });
      if (existing)
        return res.status(400).json({
          message: `Admission number ${admissionNumber} already exists`,
        });

      // Create user with admissionNumber as password
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(admissionNumber, 10);

      const user = await prisma.user.create({
        data: {
          email: `${admissionNumber}@ect.ac.ke`,
          passwordHash: hashedPassword,
          role: "STUDENT",
          isFirstLogin: true,
          phone: phone || null,
          yearAdmitted: yearAdmitted ? parseInt(yearAdmitted) : null,
        },
      });

      const student = await prisma.student.create({
        data: {
          firstName,
          lastName,
          admissionNumber,
          departmentID: finalDeptID,
          userID: user.id,
          category: category || "NITA",
          course: course || "ATC",
          level: level || "G3",
          phone: phone || null,
          yearAdmitted: yearAdmitted ? parseInt(yearAdmitted) : null,
        },
        include: { department: true },
      });

      res.status(201).json({
        message: "Student registered successfully",
        student,
        loginDetails: {
          username: admissionNumber,
          password: admissionNumber,
          note: "Student must change password on first login",
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", detail: err.message });
    }
  },
);


// BULK upload students via CSV
router.post(
  "/bulk-upload",
  authorizeRoles("ADMIN", "INSTRUCTOR"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      // If instructor, get their department
      let forcedDeptID = null;
      if (req.user.role === "INSTRUCTOR") {
        const instructor = await prisma.instructor.findUnique({
          where: { userID: req.user.userID },
        });
        if (!instructor?.departmentID)
          return res
            .status(403)
            .json({ message: "Instructor has no department assigned" });
        forcedDeptID = instructor.departmentID;
      }

      const records = parse(req.file.buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const results = { added: [], skipped: [], errors: [] };

      for (const row of records) {
        const admNo = row.admissionNumber?.trim();
        if (!admNo) {
          results.errors.push({ row, reason: "Missing admission number" });
          continue;
        }

        // Check duplicate
        const existing = await prisma.student.findUnique({
          where: { admissionNumber: admNo },
        });
        if (existing) {
          results.skipped.push({ admNo, reason: "Already exists" });
          continue;
        }

        try {
          const hashedPassword = await bcrypt.hash(admNo, 10);
          const deptID = forcedDeptID || parseInt(row.departmentID);

          const user = await prisma.user.create({
            data: {
              email: `${admNo}@ect.ac.ke`,
              passwordHash: hashedPassword,
              role: "STUDENT",
              isFirstLogin: true,
              phone: row.phone || null,
              yearAdmitted: row.yearAdmitted
                ? parseInt(row.yearAdmitted)
                : null,
            },
          });

          await prisma.student.create({
            data: {
              firstName: row.firstName?.trim(),
              lastName: row.lastName?.trim(),
              admissionNumber: admNo,
              departmentID: deptID,
              userID: user.id,
              category: row.category?.trim() || "NITA",
              course: row.course?.trim() || "ATC",
              level: row.level?.trim() || "G3",
              phone: row.phone || null,
              yearAdmitted: row.yearAdmitted
                ? parseInt(row.yearAdmitted)
                : null,
            },
          });

          results.added.push(admNo);
        } catch (err) {
          results.errors.push({ admNo, reason: err.message });
        }
      }

      res.json({
        message: `Upload complete: ${results.added.length} added, ${results.skipped.length} skipped, ${results.errors.length} errors`,
        results,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", detail: err.message });
    }
  },
);


module.exports = router;
