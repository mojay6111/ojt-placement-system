const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

// GET all coordinators
router.get("/", async (req, res) => {
  try {
    const coordinators = await prisma.industrialCoordinator.findMany({
      include: { department: true }, // Include department info
    });
    res.status(200).json(coordinators);
  } catch (error) {
    console.error("Error fetching coordinators:", error);
    res.status(500).json({ error: "Failed to fetch coordinators" });
  }
});

// GET coordinator by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const coordinator = await prisma.industrialCoordinator.findUnique({
      where: { id: parseInt(id) },
      include: { department: true },
    });
    if (!coordinator) return res.status(404).json({ error: "Coordinator not found" });
    res.status(200).json(coordinator);
  } catch (error) {
    console.error("Error fetching coordinator:", error);
    res.status(500).json({ error: "Failed to fetch coordinator" });
  }
});

// POST create new coordinator
router.post("/", async (req, res) => {
  const { firstName, lastName, email, departmentId } = req.body;

  try {
    const existing = await prisma.industrialCoordinator.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Coordinator email already exists" });
    }

    const coordinator = await prisma.industrialCoordinator.create({
      data: { firstName, lastName, email, departmentId },
    });
    res.status(201).json(coordinator);
  } catch (error) {
    console.error("Error creating coordinator:", error);
    res.status(500).json({ error: "Failed to create coordinator" });
  }
});

// PUT update coordinator
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, departmentId } = req.body;

  try {
    const coordinator = await prisma.industrialCoordinator.update({
      where: { id: parseInt(id) },
      data: { firstName, lastName, email, departmentId },
    });
    res.status(200).json(coordinator);
  } catch (error) {
    console.error("Error updating coordinator:", error);
    res.status(500).json({ error: "Failed to update coordinator" });
  }
});

// DELETE coordinator
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.industrialCoordinator.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting coordinator:", error);
    res.status(500).json({ error: "Failed to delete coordinator" });
  }
});

module.exports = router;
