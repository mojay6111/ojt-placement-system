const express = require("express");
const prisma = require("../prisma");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authenticate);

// GET all departments
router.get(
  "/",
  authorizeRoles("ADMIN", "INSTRUCTOR", "COORDINATOR"),
  async (req, res) => {
    try {
      const departments = await prisma.department.findMany();
      res.json(departments);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// GET single department
router.get(
  "/:id",
  authorizeRoles("ADMIN", "INSTRUCTOR", "COORDINATOR"),
  async (req, res) => {
    const departmentID = parseInt(req.params.id);
    try {
      const department = await prisma.department.findUnique({
        where: { departmentID },
      });
      if (!department)
        return res.status(404).json({ message: "Department not found" });
      res.json(department);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// CREATE department
router.post("/", authorizeRoles("ADMIN"), async (req, res) => {
  const { name, code } = req.body;
  try {
    const department = await prisma.department.create({
      data: { name, code },
    });
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE department
router.patch("/:id", authorizeRoles("ADMIN"), async (req, res) => {
  const departmentID = parseInt(req.params.id);
  const { name, code } = req.body;
  try {
    const department = await prisma.department.update({
      where: { departmentID },
      data: { name, code },
    });
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE department
router.delete("/:id", authorizeRoles("ADMIN"), async (req, res) => {
  const departmentID = parseInt(req.params.id);
  try {
    await prisma.department.delete({ where: { departmentID } });
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
