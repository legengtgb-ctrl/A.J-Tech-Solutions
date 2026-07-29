const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  filename: (req, file, cb) =>
    cb(
      null,
      crypto.randomUUID() + path.extname(file.originalname).toLowerCase(),
    ),
});
module.exports = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});
