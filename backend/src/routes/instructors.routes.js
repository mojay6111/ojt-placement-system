const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

// GET all instructors
router.get("/", async (req, res) => {
  try {
    const instructors = await prisma.instructor.findMany({
      include: { department: true }, // Include department info
    });
    res.status(200).json(instructors);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ error: "Failed to fetch instructors" });
  }
});

// GET instructor by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { id: parseInt(id) },
      include: { department: true },
    });
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });
    res.status(200).json(instructor);
  } catch (error) {
    console.error("Error fetching instructor:", error);
    res.status(500).json({ error: "Failed to fetch instructor" });
  }
});

// POST create new instructor
router.post("/", async (req, res) => {
  const { firstName, lastName, email, departmentId } = req.body;

  try {
    const existing = await prisma.instructor.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Instructor email already exists" });
    }

    const instructor = await prisma.instructor.create({
      data: { firstName, lastName, email, departmentId },
    });
    res.status(201).json(instructor);
  } catch (error) {
    console.error("Error creating instructor:", error);
    res.status(500).json({ error: "Failed to create instructor" });
  }
});

// PUT update instructor
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, departmentId } = req.body;

  try {
    const instructor = await prisma.instructor.update({
      where: { id: parseInt(id) },
      data: { firstName, lastName, email, departmentId },
    });
    res.status(200).json(instructor);
  } catch (error) {
    console.error("Error updating instructor:", error);
    res.status(500).json({ error: "Failed to update instructor" });
  }
});

// DELETE instructor
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.instructor.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting instructor:", error);
    res.status(500).json({ error: "Failed to delete instructor" });
  }
});

module.exports = router;
