const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const c = require("../controllers/authController");
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});
router.post("/register", c.register);
router.post("/login", loginLimit, c.login);
router.post("/logout", c.logout);
router.post("/forgot-password", c.forgot);
router.post("/reset-password", c.reset);
module.exports = router;
