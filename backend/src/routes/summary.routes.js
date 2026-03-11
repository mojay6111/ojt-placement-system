const express = require("express");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

router.get("/", authorizeRoles("ADMIN", "COORDINATOR", "INSTRUCTOR"), async (req, res) => {
  try {
    const { periodID } = req.query;

    const where = periodID ? { periodID: parseInt(periodID) } : {};

    const placements = await prisma.oJTPlacement.findMany({
      where,
      include: {
        student: { include: { department: true } },
      },
    });

    const classMap = {};

    for (const p of placements) {
      const s = p.student;
      if (!s) continue;

      const className = `${s.course} ${s.level}`;
      const key = `${s.category}__${className}`;

      if (!classMap[key]) {
        classMap[key] = {
          className,
          category: s.category,
          course: s.course,
          level: s.level,
          PLACED_AND_REPORTED: 0,
          PLACED_NOT_REPORTED: 0,
          NOT_PLACED: 0,
          DISCIPLINARY: 0,
          total: 0,
          pendingReview: 0,
        };
      }

      classMap[key][p.placementStatus]++;
      classMap[key].total++;

      if (p.studentReported && p.placementStatus === "PLACED_NOT_REPORTED") {
        classMap[key].pendingReview++;
      }
    }

    const rows = Object.values(classMap).sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      if (a.course !== b.course) return a.course.localeCompare(b.course);
      return a.level.localeCompare(b.level);
    });

    const totals = {
      PLACED_AND_REPORTED: rows.reduce((s, r) => s + r.PLACED_AND_REPORTED, 0),
      PLACED_NOT_REPORTED: rows.reduce((s, r) => s + r.PLACED_NOT_REPORTED, 0),
      NOT_PLACED: rows.reduce((s, r) => s + r.NOT_PLACED, 0),
      DISCIPLINARY: rows.reduce((s, r) => s + r.DISCIPLINARY, 0),
      total: rows.reduce((s, r) => s + r.total, 0),
      pendingReview: rows.reduce((s, r) => s + r.pendingReview, 0),
    };

    res.json({ rows, totals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;