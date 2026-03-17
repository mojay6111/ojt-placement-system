const express = require("express");
const prisma = require("../prisma");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

// GET all placements — ADMIN, COORDINATOR, INSTRUCTOR
router.get(
  "/",
  authorizeRoles("ADMIN", "INSTRUCTOR", "COORDINATOR"),
  async (req, res) => {
    try {
      let placements;

      if (req.user.role === "INSTRUCTOR") {
        console.log("INSTRUCTOR userID:", req.user.userID); // ← added this
        const instructor = await prisma.instructor.findUnique({
          where: { userID: req.user.userID },
        });
        console.log("Found instructor:", instructor); // ← added this

        if (instructor?.departmentID) {
          // Get all students in instructor's department first
          const deptStudents = await prisma.student.findMany({
            where: { departmentID: instructor.departmentID },
            select: { studentID: true },
          });
          const studentIDs = deptStudents.map((s) => s.studentID);

          placements = await prisma.oJTPlacement.findMany({
            where: { studentID: { in: studentIDs } },
            include: {
              student: { include: { department: true } },
              company: true,
            },
            orderBy: { placementID: "desc" },
          });
        } else {
          placements = [];
        }
      } else {
        placements = await prisma.oJTPlacement.findMany({
          include: {
            student: { include: { department: true } },
            company: true,
          },
          orderBy: { placementID: "desc" },
        });
      }

      res.json(placements);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// GET placement by ID
router.get("/:id", async (req, res) => {
  const placementID = parseInt(req.params.id);
  try {
    const placement = await prisma.oJTPlacement.findUnique({
      where: { placementID },
      include: {
        student: { include: { department: true } },
        company: true,
        coordinator: true,
      },
    });
    if (!placement)
      return res.status(404).json({ message: "Placement not found" });
    if (req.user.role === "ADMIN") return res.json(placement);
    if (req.user.role === "INSTRUCTOR") return res.json(placement);
    if (
      req.user.role === "COORDINATOR" &&
      req.user.userID === placement.coordinatorID
    )
      return res.json(placement);
    if (req.user.role === "STUDENT" && req.user.userID === placement.studentID)
      return res.json(placement);
    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE placement — ADMIN, INSTRUCTOR, COORDINATOR
router.post(
  "/",
  authorizeRoles("ADMIN", "INSTRUCTOR", "COORDINATOR"),
  async (req, res) => {
    const {
      studentID,
      coordinatorID,
      companyID,
      startDate,
      endDate,
      periodID,
    } = req.body;
    try {
      // If instructor, verify student is in their department
      if (req.user.role === "INSTRUCTOR") {
        const instructor = await prisma.instructor.findUnique({
          where: { userID: req.user.userID },
        });
        if (!instructor)
          return res.status(403).json({ message: "Instructor not found" });

        const student = await prisma.student.findUnique({
          where: { studentID: parseInt(studentID) },
        });
        if (!student)
          return res.status(404).json({ message: "Student not found" });

        if (student.departmentID !== instructor.departmentID) {
          return res
            .status(403)
            .json({
              message: "You can only place students from your department",
            });
        }
      }

      const placement = await prisma.oJTPlacement.create({
        data: {
          studentID: parseInt(studentID),
          coordinatorID: parseInt(coordinatorID),
          companyID: companyID ? parseInt(companyID) : null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          periodID: parseInt(periodID),
          placementStatus: "NOT_PLACED",
        },
        include: {
          student: { include: { department: true } },
          company: true,
        },
      });
      res.status(201).json(placement);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// STUDENT self-reports — sets flag + changes status to PLACED_NOT_REPORTED
router.patch("/:id/report", authorizeRoles("STUDENT"), async (req, res) => {
  const placementID = parseInt(req.params.id);
  try {
    const placement = await prisma.oJTPlacement.update({
      where: { placementID },
      data: {
        studentReported: true,
        reportedAt: new Date(),
        placementStatus: "PLACED_NOT_REPORTED",
      },
    });
    res.json({ message: "Reported successfully", placement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// INSTRUCTOR/ADMIN updates placement status
router.patch(
  "/:id/status",
  authorizeRoles("ADMIN", "INSTRUCTOR", "COORDINATOR"),
  async (req, res) => {
    const placementID = parseInt(req.params.id);
    const { placementStatus, instructorNote } = req.body;
    try {
      const placement = await prisma.oJTPlacement.update({
        where: { placementID },
        data: {
          placementStatus,
          instructorNote,
        },
        include: {
          student: { include: { department: true } },
          company: true,
        },
      });
      res.json(placement);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
