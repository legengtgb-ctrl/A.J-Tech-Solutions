const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cloudinary = require("cloudinary").v2;
const { run, get, all } = require("../config/database");
const strong = (p) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p || "");
const storeProfilePicture = async (file) => {
  if (process.env.CLOUDINARY_URL) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "aj-tech-solutions/profile-pictures", resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            if (!result?.secure_url)
              return reject(new Error("Image upload did not return a secure URL."));
            resolve(result.secure_url);
          },
        )
        .end(file.buffer);
    });
  }
  if (process.env.NODE_ENV === "production") {
    const error = new Error("Image storage is not configured. Contact support.");
    error.statusCode = 503;
    throw error;
  }
  const filename =
    crypto.randomUUID() + path.extname(file.originalname).toLowerCase();
  const uploads = path.join(__dirname, "../uploads");
  await fs.promises.mkdir(uploads, { recursive: true });
  await fs.promises.writeFile(path.join(uploads, filename), file.buffer, {
    flag: "wx",
  });
  return `/uploads/${filename}`;
};
exports.profile = async (req, res) => res.json({ user: req.user });
exports.updateProfile = async (req, res, next) => {
  try {
    const { username, phone, email } = req.body;
    const updates = [], params = [];
    if (username !== undefined && username.trim()) {
      const normalized = username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(normalized))
        return res.status(400).json({ message: "Use a 3–30 character username with letters, numbers, or underscores." });
      const used = await get("SELECT id FROM users WHERE username=? AND id!=?", [normalized, req.user.id]);
      if (used) return res.status(409).json({ message: "That username is already in use." });
      updates.push("username=?"); params.push(normalized);
    }
    if (email !== undefined && email.trim()) {
      const normalized = email.trim().toLowerCase();
      if (!validator.isEmail(normalized)) return res.status(400).json({ message: "Enter a valid email address." });
      const used = await get("SELECT id FROM users WHERE email=? AND id!=?", [normalized, req.user.id]);
      if (used) return res.status(409).json({ message: "That email is already in use." });
      updates.push("email=?"); params.push(normalized);
    }
    if (phone !== undefined && phone.trim()) { updates.push("phone=?"); params.push(phone.trim()); }
    let pic = req.user.profile_picture;
    if (req.file) {
      pic = await storeProfilePicture(req.file);
      updates.push("profile_picture=?");
      params.push(pic);
    }
    if (!updates.length) return res.status(400).json({ message: "Choose at least one profile detail to update." });
    params.push(req.user.id);
    await run(`UPDATE users SET ${updates.join(",")},updated_at=CURRENT_TIMESTAMP WHERE id=?`, params);
    res.json({ message: "Profile updated.", profilePicture: pic });
  } catch (e) {
    next(e);
  }
};
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, password, confirmPassword } = req.body;
    const user = await get("SELECT password_hash FROM users WHERE id=?", [
      req.user.id,
    ]);
    if (!(await bcrypt.compare(currentPassword || "", user.password_hash)))
      return res
        .status(400)
        .json({ message: "Your current password is incorrect." });
    if (!strong(password) || password !== confirmPassword)
      return res.status(400).json({
        message: "New passwords must match and meet the security requirements.",
      });
    await run("UPDATE users SET password_hash=? WHERE id=?", [
      await bcrypt.hash(password, 12),
      req.user.id,
    ]);
    await run("DELETE FROM user_sessions WHERE user_id=? AND session_id!=?", [
      req.user.id,
      req.sessionID,
    ]);
    res.json({ message: "Password updated. Other devices were signed out." });
  } catch (e) {
    next(e);
  }
};
exports.requests = async (req, res) =>
  res.json({
    requests: await all(
      "SELECT * FROM service_requests WHERE user_id=? ORDER BY created_at DESC",
      [req.user.id],
    ),
  });
exports.createRequest = async (req, res) => {
  const { service, details } = req.body;
  if (!service) return res.status(400).json({ message: "Choose a service." });
  await run(
    "INSERT INTO service_requests(user_id,service,details,status) VALUES(?,?,?,'pending_review')",
    [req.user.id, service, details || ""],
  );
  res.status(201).json({
    message: "Your request was sent securely for administrator review.",
  });
};
exports.notifications = async (req, res) =>
  res.json({
    notifications: await all(
      "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC",
      [req.user.id],
    ),
  });
exports.clearNotifications = async (req, res) => {
  const result = await run("DELETE FROM notifications WHERE user_id=?", [
    req.user.id,
  ]);
  res.json({ message: "Notifications cleared.", cleared: result.changes });
};
exports.supportMessages = async (req, res) =>
  res.json({
    messages: await all(
      `SELECT m.*, u.full_name AS sender_name, u.role AS sender_role
       FROM support_messages m JOIN users u ON u.id=m.sender_id
       WHERE m.client_id=? ORDER BY m.created_at ASC`,
      [req.user.id],
    ),
  });
exports.sendSupportMessage = async (req, res) => {
  const body = String(req.body.body || "").trim();
  if (!body || body.length > 2000)
    return res.status(400).json({ message: "Enter a message of up to 2,000 characters." });
  await run(
    "INSERT INTO support_messages(client_id,sender_id,body) VALUES(?,?,?)",
    [req.user.id, req.user.id, body],
  );
  const admins = await all(
    "SELECT id FROM users WHERE role='admin' AND account_status='active' AND admin_approved=1",
  );
  await Promise.all(
    admins.map((admin) =>
      run("INSERT INTO notifications(user_id,title,body,kind) VALUES(?,?,?,?)", [
        admin.id,
        "New client support message",
        `${req.user.full_name} sent a support message.`,
        "support",
      ]),
    ),
  );
  res.status(201).json({ message: "Message sent." });
};
exports.invoices = async (req, res) =>
  res.json({
    invoices: await all(
      "SELECT * FROM invoices WHERE user_id=? AND status != ? ORDER BY created_at DESC",
      [req.user.id, "draft"],
    ),
  });
