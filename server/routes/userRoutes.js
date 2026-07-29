const router = require("express").Router(),
  c = require("../controllers/userController"),
  { requireAuth } = require("../middleware/auth"),
  upload = require("../middleware/upload");
router.use(requireAuth);
router.get("/profile", c.profile);
router.put("/profile", upload.single("profilePicture"), c.updateProfile);
router.put("/change-password", c.changePassword);
router.get("/requests", c.requests);
router.post("/requests", c.createRequest);
router.get("/notifications", c.notifications);
router.delete("/notifications", c.clearNotifications);
router.get("/support/messages", c.supportMessages);
router.post("/support/messages", c.sendSupportMessage);
router.get("/invoices", c.invoices);
module.exports = router;
