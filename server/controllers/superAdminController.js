const { all, get, run } = require("../config/database");

exports.adminRegistrations = async (req, res) =>
  res.json({
    admins: await all(
      "SELECT id,full_name,username,email,phone,account_status,admin_approved,created_at,last_login FROM users WHERE role='admin' ORDER BY admin_approved ASC, created_at DESC",
    ),
  });

exports.reviewAdmin = async (req, res) => {
  const { approved, action } = req.body;
  if (action && !["deactivate", "reactivate"].includes(action))
    return res.status(400).json({ message: "Choose a valid account action." });
  if (typeof approved !== "boolean")
    if (!action) return res.status(400).json({ message: "Choose an account action." });
  const admin = await get("SELECT * FROM users WHERE id=? AND role='admin'", [
    req.params.id,
  ]);
  if (!admin)
    return res.status(404).json({ message: "Admin registration not found." });
  const isApproval = typeof approved === "boolean";
  const activate = action === "reactivate" || (isApproval && approved);
  const status = activate ? "active" : "inactive";
  const approval = isApproval
    ? approved ? 1 : 0
    : action === "reactivate" ? 1 : admin.admin_approved;
  await run("UPDATE users SET admin_approved=?,account_status=? WHERE id=?", [
    approval,
    status,
    admin.id,
  ]);
  if (!activate) await run("DELETE FROM user_sessions WHERE user_id=?", [admin.id]);
  const label = isApproval
    ? approved
      ? "approved"
      : "rejected"
    : action === "reactivate"
      ? "reactivated"
      : "deactivated";
  await run(
    "INSERT INTO notifications(user_id,title,body,kind) VALUES(?,?,?,?)",
    [
      admin.id,
      activate ? "Admin account active" : "Admin account deactivated",
      activate
        ? "Your AJ Tech administrator account has been approved. You can now sign in."
        : "Your administrator account has been deactivated. Please contact the Super Admin for details.",
      "admin_access",
    ],
  );
  await run(
    "INSERT INTO activity_logs(user_id,action,ip_address) VALUES(?,?,?)",
    [
      req.user.id,
      `${label[0].toUpperCase() + label.slice(1)} admin account for ${admin.email}`,
      req.ip,
    ],
  );
  res.json({
    message: `Admin account ${label} and notified.`,
  });
};

exports.deleteAdmin = async (req, res) => {
  const admin = await get("SELECT id,email FROM users WHERE id=? AND role='admin'", [
    req.params.id,
  ]);
  if (!admin) return res.status(404).json({ message: "Admin account not found." });
  // Preserve invoices created by this admin: their creator is reassigned to the
  // Super Admin before the account is removed.
  await run("UPDATE invoices SET created_by=? WHERE created_by=?", [
    req.user.id,
    admin.id,
  ]);
  await run("DELETE FROM users WHERE id=?", [admin.id]);
  await run("INSERT INTO activity_logs(user_id,action,ip_address) VALUES(?,?,?)", [
    req.user.id,
    `Deleted admin account for ${admin.email}`,
    req.ip,
  ]);
  res.json({ message: "Admin account deleted." });
};
