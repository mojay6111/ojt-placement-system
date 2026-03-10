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
  authorizeRoles("ADMIN", "COORDINATOR", "INSTRUCTOR"),
  controller.getAllCompanies,
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
