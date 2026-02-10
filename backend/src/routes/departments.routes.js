const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

// GET all departments
router.get("/", async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

// GET department by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
    });
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.status(200).json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ error: "Failed to fetch department" });
  }
});

// POST create new department
router.post("/", async (req, res) => {
  const { name, code } = req.body;
  try {
    const existing = await prisma.department.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ error: "Department code already exists" });
    }

    const department = await prisma.department.create({
      data: { name, code },
    });
    res.status(201).json(department);
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ error: "Failed to create department" });
  }
});

// PUT update department
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;

  try {
    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: { name, code },
    });
    res.status(200).json(department);
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Failed to update department" });
  }
});

// DELETE department
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.department.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Failed to delete department" });
  }
});

module.exports = router;
