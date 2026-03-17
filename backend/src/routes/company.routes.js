const express = require("express");
const router = express.Router();
const controller = require("../controllers/company.controller");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

router.use(authenticate);

router.get(
  "/",
  authorizeRoles("ADMIN", "INSTRUCTOR", "COORDINATOR"),
  async (req, res) => {
    try {
      const coordinators = await prisma.industrialCoordinator.findMany({
        include: { department: true },
      });
      res.json(coordinators);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  },
);
router.get(
  "/:id",
  authorizeRoles("ADMIN", "COORDINATOR"),
  controller.getCompanyById,
);
router.post("/", authorizeRoles("ADMIN"), controller.createCompany);
router.patch("/:id", authorizeRoles("ADMIN"), controller.updateCompany);
router.delete("/:id", authorizeRoles("ADMIN"), controller.deleteCompany);

module.exports = router;
