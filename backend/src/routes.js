import express from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import pool from "./db.js";
import logger from "./logger.js";

const router = express.Router();

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Příliš mnoho požadavků. Zkuste to později." },
});

// GET /api/poll — vrátí otázku a výsledky
router.get("/", async (req, res) => {
  logger.info("📊 Zobrazení výsledků ankety.");
  try {
    const { rows } = await pool.query("SELECT id, label, votes FROM poll_options ORDER BY id");
    res.json({
      question: "Jaký typ programovacího jazyka preferujete?",
      options: rows,
    });
  } catch (err) {
    logger.error("❌ Chyba při načítání výsledků: " + err.message, { stack: err.stack });
    res.status(500).json({ error: "Chyba serveru." });
  }
});

// POST /api/poll/vote — uloží hlas
router.post("/vote", voteLimiter, async (req, res) => {
  const { optionId } = req.body;
  logger.info(`📥 Přijetí požadavku na hlasování pro možnost ID: ${optionId}`);

  if (!optionId || typeof optionId !== "number") {
    logger.warn(`⚠️ Neplatný optionId: ${optionId}`);
    return res.status(400).json({ error: "Neplatná možnost." });
  }

  try {
    const xf = req.headers["x-forwarded-for"];
    const ipRaw = Array.isArray(xf) ? xf[0] : typeof xf === "string" ? xf.split(",")[0].trim() : req.ip;
    const salt = process.env.IP_HASH_SALT || "webpoll-salt";
    const ipHash = crypto.createHash("sha256").update(salt + "|" + ipRaw).digest("hex");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const ins = await client.query(
        "INSERT INTO poll_votes (ip_hash) VALUES ($1) ON CONFLICT (ip_hash) DO NOTHING RETURNING id",
        [ipHash]
      );
      if (ins.rowCount === 0) {
        logger.warn("⚠️ Pokus o opakované hlasování z již registrované IP.");
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "Již jste hlasovali." });
      }

      const result = await client.query(
        "UPDATE poll_options SET votes = votes + 1 WHERE id = $1 RETURNING id",
        [optionId]
      );

      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        logger.warn(`⚠️ Možnost ID ${optionId} neexistuje.`);
        return res.status(404).json({ error: "Možnost nenalezena." });
      }

      await client.query("COMMIT");
      logger.info(`🗳 Úspěšně přidán hlas pro možnost ID: ${optionId}`);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    const { rows } = await pool.query("SELECT id, label, votes FROM poll_options ORDER BY id");
    res.json({ success: true, options: rows });
  } catch (err) {
    logger.error("❌ Chyba při hlasování: " + err.message, { stack: err.stack });
    res.status(500).json({ error: "Chyba serveru." });
  }
});

// POST /api/poll/reset — reset hlasování (chráněno tokenem)
router.post("/reset", async (req, res) => {
  const { token } = req.body;
  const RESET_TOKEN = process.env.RESET_TOKEN;

  const a = Buffer.from(token || "", "utf8");
  const b = Buffer.from(RESET_TOKEN || "", "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    logger.warn("🔐 Neúspěšný pokus o reset – špatný token.");
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    await pool.query("UPDATE poll_options SET votes = 0");
    await pool.query("TRUNCATE poll_votes");
    logger.info("🔐 Úspěšný reset hlasování.");
    res.status(200).json({ success: true, message: "Hlasování bylo resetováno." });
  } catch (err) {
    logger.error("❌ Chyba při resetu: " + err.message, { stack: err.stack });
    res.status(500).json({ error: "Chyba serveru." });
  }
});

export default router;
