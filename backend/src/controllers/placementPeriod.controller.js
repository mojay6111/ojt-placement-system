const prisma = require("../prisma");

exports.getAllPeriods = async (req, res) => {
  try {
    const periods = await prisma.placementPeriod.findMany({
      include: { studentScores: true },
    });
    res.json(periods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching periods" });
  }
};

exports.createPeriod = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    const period = await prisma.placementPeriod.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    res.status(201).json(period);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating period" });
  }
};
