const { get } = require("../config/database");
async function requireAuth(req, res, next) {
  if (!req.session.userId)
    return res
      .status(401)
      .json({ message: "Please log in to continue.", redirect: "/login.html" });
  const user = await get(
    "SELECT id, full_name, username, email, phone, role, profile_picture, client_tier, account_status, admin_approved, email_verified, created_at, last_login FROM users WHERE id=?",
    [req.session.userId],
  );
  if (!user || user.account_status !== "active") {
    req.session.destroy(() => {});
    return res.status(403).json({ message: "Your account is unavailable." });
  }
  req.user = user;
  next();
}
const requireRole = (role) => (req, res, next) =>
  req.user.role === role
    ? next()
    : res
        .status(403)
        .json({ message: "You do not have permission for this action." });
module.exports = { requireAuth, requireRole };
