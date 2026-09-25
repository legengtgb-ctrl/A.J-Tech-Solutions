require("dotenv").config();
const express = require("express"),
  session = require("express-session"),
  PgSession = require("connect-pg-simple")(session),
  helmet = require("helmet"),
  path = require("path"),
  fs = require("fs");
const { initialize, pool } = require("./server/config/database");
const { csrf, sanitize, csrfToken } = require("./server/middleware/security");
const app = express();
const uploads = path.join(__dirname, "server/uploads");
fs.mkdirSync(uploads, { recursive: true });
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "web_sessions",
      createTableIfMissing: true,
    }),
    name: "ajtech.sid",
    secret: process.env.SESSION_SECRET || "replace-this-development-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60 * 1000,
    },
  }),
);
app.use(sanitize);
app.use(csrf);
app.get("/api/csrf-token", csrfToken);
app.get("/healthz", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});
app.use("/api/auth", require("./server/routes/authRoutes"));
app.use("/api/user", require("./server/routes/userRoutes"));
app.use("/api/admin", require("./server/routes/adminRoutes"));
app.use("/api/super-admin", require("./server/routes/superAdminRoutes"));
app.use("/uploads", express.static(uploads));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/portal", express.static(path.join(__dirname, "AJ user auth")));
// The public entry point is always the sign-in screen. Dashboard pages remain
// available only after their own authenticated API checks succeed.
app.get("/", (req, res) => res.redirect("/login.html"));
app.use(express.static(path.join(__dirname, "client")));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === "LIMIT_FILE_SIZE")
    return res.status(400).json({ message: "Image must be 2 MB or smaller." });
  res.status(500).json({ message: "Something went wrong. Please try again." });
});
initialize()
  .then(() =>
    app.listen(process.env.PORT || 3000, () =>
      console.log(
        "AJ Tech Solutions running on port " + (process.env.PORT || 3000),
      ),
    ),
  )
  .catch(async (error) => {
    console.error("Application startup failed:", error);
    await pool.end();
    process.exitCode = 1;
  });
