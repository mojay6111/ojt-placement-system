const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

// GET all students
router.get("/", async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { department: true }, // Include department info
    });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// GET student by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: { department: true },
    });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// POST create new student
router.post("/", async (req, res) => {
  const { firstName, lastName, email, departmentId } = req.body;

  try {
    const existing = await prisma.student.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Student email already exists" });
    }

    const student = await prisma.student.create({
      data: { firstName, lastName, email, departmentId },
    });
    res.status(201).json(student);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ error: "Failed to create student" });
  }
});

// PUT update student
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, departmentId } = req.body;

  try {
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { firstName, lastName, email, departmentId },
    });
    res.status(200).json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
});

// DELETE student
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.student.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

module.exports = router;
