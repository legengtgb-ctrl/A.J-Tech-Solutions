const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const dbPath = path.join(__dirname, "../../database/ajtech.db");
const db = new sqlite3.Database(dbPath);
const run = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      err ? reject(err) : resolve({ id: this.lastID, changes: this.changes });
    }),
  );
const get = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row))),
  );
const all = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))),
  );
async function migrateUsersForRoles() {
  const definition = await get(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='users'",
  );
  if (!definition || definition.sql.includes("super_admin")) return;
  await run("PRAGMA foreign_keys = OFF");
  await run(`CREATE TABLE users_role_migration (
    id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL, username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE, phone TEXT NOT NULL, password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('super_admin','admin','client')),
    profile_picture TEXT DEFAULT '/images/default-avatar.svg', account_status TEXT NOT NULL DEFAULT 'active'
    CHECK(account_status IN ('active','inactive')),
    failed_login_attempts INTEGER DEFAULT 0, locked_until DATETIME, admin_approved INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, last_login DATETIME
  )`);
  await run(`INSERT INTO users_role_migration(id,full_name,username,email,phone,password_hash,role,profile_picture,account_status,failed_login_attempts,locked_until,admin_approved,created_at,updated_at,last_login)
    SELECT id,full_name,username,email,phone,password_hash,role,profile_picture,account_status,failed_login_attempts,locked_until,1,created_at,updated_at,last_login FROM users`);
  await run("DROP TABLE users");
  await run("ALTER TABLE users_role_migration RENAME TO users");
  await run("PRAGMA foreign_keys = ON");
}
async function seedSuperAdmin() {
  const bcrypt = require("bcrypt");
  const email = process.env.SUPER_ADMIN_EMAIL || "tgbtheprogrammer@gmail.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "@Arhmerdtgb1";
  if (await get("SELECT id FROM users WHERE email=?", [email])) return;
  await run(
    "INSERT INTO users(full_name,username,email,phone,password_hash,role,admin_approved) VALUES(?,?,?,?,?,'super_admin',1)",
    [
      "TGB The Programmer",
      "tgbtheprogrammer",
      email,
      "Not provided",
      await bcrypt.hash(password, 12),
    ],
  );
}
async function initialize() {
  const schema = fs.readFileSync(
    path.join(__dirname, "../../database/schema.sql"),
    "utf8",
  );
  for (const statement of schema
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean))
    await run(statement);
  await migrateUsersForRoles();
  const columns = await all("PRAGMA table_info(service_requests)");
  const names = new Set(columns.map((column) => column.name));
  const extras = {
    admin_note: "TEXT",
    reviewed_by: "INTEGER",
    reviewed_at: "DATETIME",
    estimated_cost: "TEXT",
    due_date: "DATETIME",
    progress: "INTEGER NOT NULL DEFAULT 0",
  };
  for (const [name, definition] of Object.entries(extras)) {
    if (!names.has(name)) {
      await run(
        `ALTER TABLE service_requests ADD COLUMN ${name} ${definition}`,
      );
    }
  }
  const userColumns = await all("PRAGMA table_info(users)");
  if (!userColumns.some((column) => column.name === "client_tier")) {
    await run(
      "ALTER TABLE users ADD COLUMN client_tier TEXT NOT NULL DEFAULT 'Regular Client' CHECK(client_tier IN ('Premium Client','Standard Client','Regular Client'))",
    );
  }
  await run("DROP TABLE IF EXISTS email_verification_codes");
  await run(
    "UPDATE service_requests SET status='pending_review' WHERE status='pending'",
  );
  await seedSuperAdmin();
}
module.exports = { db, run, get, all, initialize };
