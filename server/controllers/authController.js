const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const validator = require("validator");
const { run, get } = require("../config/database");
const strong = (p) =>
  typeof p === "string" &&
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p);
const hashValue = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");
const codeFrom = (digits = 6) =>
  String(Math.floor(10 ** (digits - 1) + Math.random() * 9 * 10 ** (digits - 1))).padStart(digits, "0");
const log = (id, action, req) =>
  run("INSERT INTO activity_logs (user_id,action,ip_address) VALUES (?,?,?)", [
    id,
    action,
    req.ip,
  ]).catch(() => {});
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.info(`EMAIL SIMULATION: ${subject} -> ${to}`);
    console.info(text || html);
    return { simulated: true };
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });
  return { simulated: false };
};
const saveCode = async (userId, code, tableName, expiryMinutes, hashColumn) => {
  const codeHash = hashValue(code);
  const expiresSql = `datetime('now', '+${expiryMinutes} minutes')`;
  await run(`DELETE FROM ${tableName} WHERE user_id=?`, [userId]);
  await run(
    `INSERT INTO ${tableName}(user_id,${hashColumn},expires_at) VALUES(?,?,${expiresSql})`,
    [userId, codeHash],
  );
};
const verifyStoredCode = async (userId, code, tableName, hashColumn) => {
  const record = await get(
    `SELECT * FROM ${tableName} WHERE user_id=? AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  if (!record) return false;
  return hashValue(code) === record[hashColumn];
};
const sendResetCode = async (user) => {
  const code = codeFrom();
  await saveCode(user.id, code, "password_resets", 15, "token_hash");
  await sendEmail({
    to: user.email,
    subject: "Reset your AJ Tech password",
    text: `Your AJ Tech password reset code is ${code}. It expires in 15 minutes.`,
    html: `<p>Your AJ Tech password reset code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>`,
  });
  return code;
};
exports.register = async (req, res, next) => {
  try {
    const {
      fullName,
      username,
      email,
      phone,
      password,
      confirmPassword,
      terms,
      role = "client",
    } = req.body;
    if (
      ![fullName, username, email, phone, password].every(Boolean) ||
      terms !== "true"
    )
      return res.status(400).json({
        message: "Complete all required fields and accept the terms.",
      });
    if (!validator.isEmail(email) || !/^[a-zA-Z0-9_]{3,30}$/.test(username))
      return res.status(400).json({
        message: "Enter a valid email and a 3–30 character username.",
      });
    if (!strong(password) || password !== confirmPassword)
      return res.status(400).json({
        message: "Passwords must match and meet all security requirements.",
      });
    if (!["client", "admin"].includes(role))
      return res.status(403).json({
        message:
          "Super Admin accounts are securely provisioned and cannot be self-registered.",
      });
    const existing = await get(
      "SELECT id FROM users WHERE username=? OR email=?",
      [username.toLowerCase(), email.toLowerCase()],
    );
    if (existing)
      return res.status(409).json({
        message: "That username or email address is already registered.",
      });
    const hash = await bcrypt.hash(password, 12);
    const result = await run(
      "INSERT INTO users(full_name,username,email,phone,password_hash,role,admin_approved) VALUES(?,?,?,?,?,?,?)",
      [
        fullName,
        username.toLowerCase(),
        email.toLowerCase(),
        phone,
        hash,
        role,
        role === "admin" ? 0 : 1,
      ],
    );
    await log(result.id, "Account registered", req);
    res.status(201).json({
      message:
        role === "admin"
          ? "Admin registration submitted. A Super Admin must approve it before you can sign in."
          : "Account created successfully. Please sign in.",
    });
  } catch (e) {
    next(e);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { identity, password, rememberMe } = req.body;
    if (!identity || !password)
      return res
        .status(400)
        .json({ message: "Enter your username/email and password." });
    const user = await get("SELECT * FROM users WHERE username=? OR email=?", [
      identity.toLowerCase(),
      identity.toLowerCase(),
    ]);
    const now = Date.now();
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      if (user) {
        const attempts = user.failed_login_attempts + 1;
        const locked =
          attempts >= 5 ? new Date(now + 15 * 60e3).toISOString() : null;
        await run(
          "UPDATE users SET failed_login_attempts=?,locked_until=? WHERE id=?",
          [attempts, locked, user.id],
        );
      }
      return res
        .status(401)
        .json({ message: "Invalid username/email or password." });
    }
    if (user.account_status !== "active")
      return res.status(403).json({
        message: "This account has been deactivated. Contact support.",
      });
    if (user.role === "admin" && !user.admin_approved)
      return res.status(403).json({
        message: "Your admin registration is awaiting Super Admin approval.",
      });
    if (user.locked_until && new Date(user.locked_until) > now)
      return res
        .status(423)
        .json({ message: "Too many attempts. Try again in 15 minutes." });
    req.session.userId = user.id;
    req.session.cookie.maxAge =
      rememberMe === "true" ? 30 * 24 * 60 * 60e3 : 30 * 60e3;
    await run(
      "UPDATE users SET failed_login_attempts=0,locked_until=NULL,last_login=CURRENT_TIMESTAMP WHERE id=?",
      [user.id],
    );
    await run("INSERT INTO user_sessions(user_id,session_id) VALUES(?,?)", [
      user.id,
      req.sessionID,
    ]);
    await log(user.id, "Signed in", req);
    res.json({
      message: "Welcome back!",
      role: user.role,
      redirect:
        user.role === "super_admin"
          ? "/super-admin-dashboard.html"
          : user.role === "admin"
            ? "/admin-dashboard.html"
            : "/portal/",
    });
  } catch (e) {
    next(e);
  }
};
exports.logout = async (req, res) => {
  if (req.session.userId)
    await run("DELETE FROM user_sessions WHERE session_id=?", [req.sessionID]);
  req.session.destroy(() =>
    res
      .clearCookie("ajtech.sid")
      .json({ message: "You have been logged out." }),
  );
};
exports.forgot = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!validator.isEmail(email || ""))
      return res.status(400).json({ message: "Enter a valid email address." });
    const user = await get("SELECT id,email FROM users WHERE email=?", [
      email.toLowerCase(),
    ]);
    if (user) {
      await sendResetCode(user);
    }
    res.json({ message: "If an account exists, a 6-digit reset code has been sent to the email on file." });
  } catch (e) {
    next(e);
  }
};
exports.reset = async (req, res, next) => {
  try {
    const { email, code, token, password, confirmPassword } = req.body;
    const resetCode = code || token;
    if (!validator.isEmail(email || "") || !resetCode || !password || !confirmPassword)
      return res
        .status(400)
        .json({ message: "Use a valid email, code, and matching password." });
    if (!strong(password) || password !== confirmPassword)
      return res
        .status(400)
        .json({ message: "Use a strong password and make sure both fields match." });
    const user = await get("SELECT id FROM users WHERE email=?", [
      email.toLowerCase(),
    ]);
    if (!user)
      return res.status(404).json({ message: "Account not found." });
    const valid = await verifyStoredCode(user.id, resetCode, "password_resets", "token_hash");
    if (!valid)
      return res.status(400).json({ message: "This reset code is invalid or has expired." });
    await run(
      "UPDATE users SET password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [await bcrypt.hash(password, 12), user.id],
    );
    await run("DELETE FROM password_resets WHERE user_id=?", [user.id]);
    await run("DELETE FROM user_sessions WHERE user_id=?", [user.id]);
    res.json({ message: "Password changed. Please sign in again." });
  } catch (e) {
    next(e);
  }
};
