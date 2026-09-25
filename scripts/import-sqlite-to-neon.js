require("dotenv").config();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { createSchema, pool } = require("../server/config/database");

const tables = [
  "users",
  "service_requests",
  "activity_logs",
  "notifications",
  "support_messages",
  "invoices",
];
const sqlitePath = path.resolve(
  process.argv[2] || path.join(__dirname, "../database/ajtech.db"),
);
const openSQLite = (filename) =>
  new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      filename,
      sqlite3.OPEN_READONLY,
      (error) => (error ? reject(error) : resolve(db)),
    );
  });
const sqliteAll = (db, sql, params = []) =>
  new Promise((resolve, reject) =>
    db.all(sql, params, (error, rows) =>
      error ? reject(error) : resolve(rows),
    ),
  );
const sqliteClose = (db) =>
  new Promise((resolve, reject) => {
    db.close((error) => (error ? reject(error) : resolve()));
  });

async function importTable(source, client, table) {
  const sourceInfo = await sqliteAll(source, `PRAGMA table_info("${table}")`);
  if (!sourceInfo.length) throw new Error(`SQLite table is missing: ${table}`);
  const sourceColumns = new Set(sourceInfo.map((column) => column.name));
  const targetInfo = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1",
    [table],
  );
  const columns = targetInfo.rows
    .map((column) => column.column_name)
    .filter((column) => column !== "email_verified" && sourceColumns.has(column));
  const rows = await sqliteAll(source, `SELECT * FROM "${table}"`);
  if (!columns.length || !rows.length) return rows.length;

  const batchSize = Math.max(1, Math.floor(50000 / columns.length));
  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize);
    const values = [];
    const groups = batch.map((row) => {
      const placeholders = columns.map((column) => {
        values.push(row[column]);
        return `$${values.length}`;
      });
      return `(${placeholders.join(",")})`;
    });
    const quotedColumns = columns.map((column) => `"${column}"`).join(",");
    await client.query(
      `INSERT INTO "${table}" (${quotedColumns}) VALUES ${groups.join(",")}`,
      values,
    );
  }
  return rows.length;
}

async function main() {
  if (!process.env.DATABASE_URL)
    throw new Error("Set DATABASE_URL to your Neon connection string first.");
  const source = await openSQLite(sqlitePath);
  let client;
  try {
    await createSchema();
    client = await pool.connect();
    await client.query("BEGIN");
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
      if (result.rows[0].count !== 0)
        throw new Error(
          `Neon table ${table} is not empty. Import stopped without modifying data.`,
        );
    }

    const imported = {};
    for (const table of tables)
      imported[table] = await importTable(source, client, table);

    for (const table of tables) {
      await client.query(
        `SELECT setval(pg_get_serial_sequence('public."${table}"','id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1), EXISTS(SELECT 1 FROM "${table}"))`,
      );
    }
    await client.query("COMMIT");
    for (const [table, count] of Object.entries(imported))
      console.log(`${table}: ${count} rows imported`);
    console.log(
      "Skipped password-reset tokens, email-verification codes, and active sessions.",
    );
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    throw error;
  } finally {
    if (client) client.release();
    await sqliteClose(source);
    await pool.end();
  }
}

main().catch((error) => {
  console.error("SQLite import failed:", error.message);
  process.exitCode = 1;
});