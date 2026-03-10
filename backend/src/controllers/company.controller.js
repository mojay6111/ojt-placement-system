const prisma = require("../prisma");

// GET all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { placements: true },
    });
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching companies" });
  }
};

// GET single company
exports.getCompanyById = async (req, res) => {
  const companyID = parseInt(req.params.id);
  try {
    const company = await prisma.company.findUnique({
      where: { companyID },
      include: { placements: true },
    });
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching company" });
  }
};

// CREATE company
exports.createCompany = async (req, res) => {
  const {
    name,
    industry,
    location,
    contactName,
    contactEmail,
    contactPhone,
    capacity,
  } = req.body;
  try {
    const company = await prisma.company.create({
      data: {
        name,
        industry,
        location,
        contactName,
        contactEmail,
        contactPhone,
        capacity,
      },
    });
    res.status(201).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating company" });
  }
};

// UPDATE company
exports.updateCompany = async (req, res) => {
  const companyID = parseInt(req.params.id);
  const {
    name,
    industry,
    location,
    contactName,
    contactEmail,
    contactPhone,
    capacity,
  } = req.body;
  try {
    const company = await prisma.company.update({
      where: { companyID },
      data: {
        name,
        industry,
        location,
        contactName,
        contactEmail,
        contactPhone,
        capacity,
      },
    });
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating company" });
  }
};

// DELETE company
exports.deleteCompany = async (req, res) => {
  const companyID = parseInt(req.params.id);
  try {
    await prisma.company.delete({ where: { companyID } });
    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting company" });
  }
};
