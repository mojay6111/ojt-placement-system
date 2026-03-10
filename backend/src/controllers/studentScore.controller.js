const prisma = require("../prisma");

function calculateTotal({ attendance, academic, behavior }) {
  // attendance 40%, academic 50%, behavior 10%
  return attendance * 0.4 + academic * 0.5 + (behavior ?? 0) * 0.1;
}

exports.getScoresByStudent = async (req, res) => {
  const studentID = parseInt(req.params.studentID);
  try {
    const scores = await prisma.studentScore.findMany({
      where: { studentID },
      include: { period: true },
    });
    res.json(scores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching student scores" });
  }
};

exports.getScoresByPeriod = async (req, res) => {
  const periodID = parseInt(req.params.periodID);
  try {
    const scores = await prisma.studentScore.findMany({
      where: { periodID },
      include: { student: true },
    });
    res.json(scores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching period scores" });
  }
};

exports.addScore = async (req, res) => {
  const { studentID, periodID, attendance, academic, behavior } = req.body;
  try {
    const totalScore = calculateTotal({ attendance, academic, behavior });
    const score = await prisma.studentScore.create({
      data: {
        studentID,
        periodID,
        attendance,
        academic,
        behavior,
        totalScore,
      },
    });
    res.status(201).json(score);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding score" });
  }
};

exports.updateScore = async (req, res) => {
  const scoreID = parseInt(req.params.scoreID);
  const { attendance, academic, behavior } = req.body;
  try {
    const totalScore = calculateTotal({ attendance, academic, behavior });
    const score = await prisma.studentScore.update({
      where: { scoreID },
      data: { attendance, academic, behavior, totalScore },
    });
    res.json(score);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating score" });
  }
};
