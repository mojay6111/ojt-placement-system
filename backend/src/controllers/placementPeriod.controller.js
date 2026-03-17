const prisma = require("../prisma");

// Helper: check if today falls within period date range
const isCurrentByDate = (period) => {
  const now = new Date();
  return new Date(period.startDate) <= now && now <= new Date(period.endDate);
};

exports.getAllPeriods = async (req, res) => {
  try {
    const periods = await prisma.placementPeriod.findMany({
      orderBy: { startDate: "desc" },
    });

    // Attach isCurrent flag based on date range OR isActive flag
    const enriched = periods.map((p) => ({
      ...p,
      isCurrent: p.isActive || isCurrentByDate(p),
    }));

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching periods" });
  }
};

exports.createPeriod = async (req, res) => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    const period = await prisma.placementPeriod.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive || false,
      },
    });
    res
      .status(201)
      .json({
        ...period,
        isCurrent: period.isActive || isCurrentByDate(period),
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating period" });
  }
};

// PATCH toggle active period — only one can be active at a time
exports.setActivePeriod = async (req, res) => {
  const periodID = parseInt(req.params.id);
  try {
    // Deactivate all periods first
    await prisma.placementPeriod.updateMany({
      data: { isActive: false },
    });
    // Activate the selected one
    const period = await prisma.placementPeriod.update({
      where: { periodID },
      data: { isActive: true },
    });
    res.json({ ...period, isCurrent: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error setting active period" });
  }
};
