// src/controllers/departments.controller.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET all departments
const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

// GET one department by ID
const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
    });
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.json(department);
  } catch (err) {
    console.error("Error fetching department:", err);
    res.status(500).json({ error: "Failed to fetch department" });
  }
};

// CREATE a new department
const createDepartment = async (req, res) => {
  const { name, code } = req.body;
  try {
    const newDept = await prisma.department.create({
      data: { name, code },
    });
    res.status(201).json(newDept);
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).json({ error: "Failed to create department" });
  }
};

// UPDATE a department
const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  try {
    const updatedDept = await prisma.department.update({
      where: { id: parseInt(id) },
      data: { name, code },
    });
    res.json(updatedDept);
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ error: "Failed to update department" });
  }
};

// DELETE a department
const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.department.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ error: "Failed to delete department" });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
