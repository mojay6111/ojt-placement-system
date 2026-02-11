const prisma = require("../prisma");

// Utility: calculate totalScore
function calculateTotal({ attendance, assignments, instructorEval, otherCriteria }) {
  // Example weights: attendance 30%, assignments 30%, instructorEval 30%, other 10%
  return (
    attendance * 0.3 +
    assignments * 0.3 +
    instructorEval * 0.3 +
    otherCriteria * 0.1
  );
}

exports.getScoresByStudent = async (req, res) => {
  const studentID = parseInt(req.params.studentID);
  try {
    const scores = await prisma.studentScore.findMany({
      where: { studentID },
      include: { placementPeriod: true },
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
      where: { placementPeriodID: periodID },
      include: { student: true },
    });
    res.json(scores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching period scores" });
  }
};

exports.addScore = async (req, res) => {
  const { studentID, placementPeriodID, attendance, assignments, instructorEval, otherCriteria } = req.body;
  try {
    const totalScore = calculateTotal({ attendance, assignments, instructorEval, otherCriteria });
    const score = await prisma.studentScore.create({
      data: {
        studentID,
        placementPeriodID,
        attendance,
        assignments,
        instructorEval,
        otherCriteria,
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
  const { attendance, assignments, instructorEval, otherCriteria } = req.body;
  try {
    const totalScore = calculateTotal({ attendance, assignments, instructorEval, otherCriteria });
    const score = await prisma.studentScore.update({
      where: { scoreID },
      data: {
        attendance,
        assignments,
        instructorEval,
        otherCriteria,
        totalScore,
      },
    });
    res.json(score);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating score" });
  }
};
