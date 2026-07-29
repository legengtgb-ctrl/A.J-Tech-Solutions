const router = require("express").Router(),
  c = require("../controllers/adminController"),
  { requireAuth, requireRole } = require("../middleware/auth");
router.use(requireAuth, requireRole("admin"));
router.get("/users", c.users);
router.patch("/users/:id", c.updateUser);
router.delete("/users/:id", c.deleteUser);
router.get("/requests", c.requests);
router.patch("/requests/:id", c.reviewRequest);
router.get("/support/conversations", c.supportConversations);
router.get("/support/conversations/:clientId/messages", c.conversationMessages);
router.post("/support/conversations/:clientId/messages", c.sendSupportMessage);
router.get("/invoices", c.invoices);
router.post("/invoices", c.createInvoice);
router.get("/activity", c.activity);
module.exports = router;
