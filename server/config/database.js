const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 10000,
});
const toPostgres = (sql) => {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
};
const run = async (sql, params = []) => {
  const statement = /^\s*INSERT\s+INTO\b/i.test(sql) && !/\bRETURNING\b/i.test(sql)
    ? `${sql} RETURNING id`
    : sql;
  const result = await pool.query(toPostgres(statement), params);
  return { id: result.rows[0]?.id, changes: result.rowCount };
};
const get = async (sql, params = []) => {
  const result = await pool.query(toPostgres(sql), params);
  return result.rows[0];
};
const all = async (sql, params = []) => {
  const result = await pool.query(toPostgres(sql), params);
  return result.rows;
};
async function seedSuperAdmin() {
  const bcrypt = require("bcrypt");
  if (await get("SELECT id FROM users WHERE role='super_admin' LIMIT 1")) return;
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password)
    throw new Error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required when no Super Admin exists.",
    );
  const username =
    process.env.SUPER_ADMIN_USERNAME || email.split("@")[0].toLowerCase();
  await run(
    "INSERT INTO users(full_name,username,email,phone,password_hash,role,admin_approved) VALUES(?,?,?,?,?,'super_admin',1)",
    [
      process.env.SUPER_ADMIN_FULL_NAME || "Super Admin",
      username,
      email,
      "Not provided",
      await bcrypt.hash(password, 12),
    ],
  );
}
async function createSchema() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is required to connect to PostgreSQL.");
  const schema = fs.readFileSync(
    path.join(__dirname, "../../database/schema.sql"),
    "utf8",
  );
  for (const statement of schema
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean))
    await run(statement);
}
async function initialize() {
  await createSchema();
  await run(
    "UPDATE service_requests SET status='pending_review' WHERE status='pending'",
  );
  await seedSuperAdmin();
}
module.exports = { pool, run, get, all, createSchema, initialize };
