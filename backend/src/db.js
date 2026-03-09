import pg from "pg";
import logger from "./logger.js";

const { Pool } = pg;

const ssl =
  process.env.DATABASE_SSL === "true"
    ? { rejectUnauthorized: false }
    : process.env.DATABASE_SSL === "false"
    ? false
    : process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS poll_options (
        id SERIAL PRIMARY KEY,
        label TEXT NOT NULL UNIQUE,
        votes INTEGER NOT NULL DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS poll_votes (
        id SERIAL PRIMARY KEY,
        ip_hash TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const { rows } = await client.query("SELECT COUNT(*) FROM poll_options");
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO poll_options (label, votes) VALUES
          ('Jazyk nízké úrovně (C, Assembly)', 0),
          ('Jazyk vysoké úrovně (Python, JavaScript)', 0),
          ('Silně typovaný jazyk (Rust, TypeScript)', 0),
          ('Funkcionální jazyk (Haskell, Elixir)', 0)
      `);
      logger.info("Poll options seeded into database.");
    }
    logger.info("Database initialized successfully.");
  } finally {
    client.release();
  }
}

export default pool;
