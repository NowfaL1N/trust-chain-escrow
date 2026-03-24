/**
 * One-time: creates companies, users, transactions in Supabase PostgreSQL.
 * Uses DATABASE_URL (direct or session pooler — not transaction pooler for DDL on some hosts).
 *
 * Usage: npm run db:setup
 * Add to .env.local: DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require
 * (Copy from Supabase → Project Settings → Database → Connection string → URI)
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!url) {
  console.error(
    "Missing DATABASE_URL. Add it to .env.local from Supabase → Settings → Database → Connection string (URI).\n" +
      "Use Direct connection or Session pooler (port 5432). Transaction mode (6543) may not run DDL."
  );
  process.exit(1);
}

const sqlPath = path.join(__dirname, "..", "supabase", "RUN_IN_SQL_EDITOR.sql");
if (!fs.existsSync(sqlPath)) {
  console.error("Missing file:", sqlPath);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, "utf8");

(async () => {
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    await client.query(sql);
    console.log("Done. Tables created: companies, users, transactions. Try Register again.");
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
})();
