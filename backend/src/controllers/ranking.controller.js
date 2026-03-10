const prisma = require("../prisma");

exports.getRankingByPeriod = async (req, res) => {
  const periodID = parseInt(req.params.periodID);
  try {
    const scores = await prisma.studentScore.findMany({
      where: { periodID },
      include: {
        student: {
          include: { department: true },
        },
      },
      orderBy: { totalScore: "desc" },
    });

    // Build ranked leaderboard
    const ranking = scores.map((entry, index) => ({
      rank: index + 1,
      studentID: entry.student.studentID,
      name: `${entry.student.firstName} ${entry.student.lastName}`,
      admissionNumber: entry.student.admissionNumber,
      department: entry.student.department.name,
      attendance: entry.attendance,
      academic: entry.academic,
      behavior: entry.behavior,
      totalScore: entry.totalScore,
    }));

    res.json({
      periodID,
      totalStudents: ranking.length,
      ranking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching ranking" });
  }
};
