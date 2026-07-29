const router = require("express").Router();
const controller = require("../controllers/superAdminController");
const { requireAuth, requireRole } = require("../middleware/auth");
router.use(requireAuth, requireRole("super_admin"));
router.get("/admins", controller.adminRegistrations);
router.patch("/admins/:id", controller.reviewAdmin);
router.delete("/admins/:id", controller.deleteAdmin);
module.exports = router;
