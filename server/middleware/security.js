const crypto = require("crypto");
const csrf = (req, res, next) => {
  if (!req.session.csrfToken)
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (
    req.path.startsWith("/api") &&
    req.get("x-csrf-token") !== req.session.csrfToken
  )
    return res
      .status(403)
      .json({ message: "Invalid security token. Refresh and try again." });
  next();
};
const csrfToken = (req, res) => res.json({ csrfToken: req.session.csrfToken });
const clean = (value) =>
  typeof value === "string" ? value.trim().replace(/[<>]/g, "") : value;
const sanitize = (req, res, next) => {
  for (const bag of [req.body, req.query])
    if (bag) for (const key of Object.keys(bag)) bag[key] = clean(bag[key]);
  next();
};
module.exports = { csrf, csrfToken, sanitize };
