const express = require("express");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// Protect all routes
router.use(authenticate);

// GET all departments – ADMIN only
router.get("/", authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET single department – ADMIN only
router.get("/:id", authorizeRoles("ADMIN"), async (req, res) => {
  const departmentID = parseInt(req.params.id);
  try {
    const department = await prisma.department.findUnique({ where: { departmentID } });
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
