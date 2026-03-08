import express from "express";
import pool from "./db.js";
import logger from "./logger.js";

const router = express.Router();

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
router.post("/vote", async (req, res) => {
  const { optionId } = req.body;
  logger.info(`📥 Přijetí požadavku na hlasování pro možnost ID: ${optionId}`);

  if (!optionId || typeof optionId !== "number") {
    logger.warn(`⚠️ Neplatný optionId: ${optionId}`);
    return res.status(400).json({ error: "Neplatná možnost." });
  }

  try {
    const result = await pool.query(
      "UPDATE poll_options SET votes = votes + 1 WHERE id = $1 RETURNING id",
      [optionId]
    );

    if (result.rowCount === 0) {
      logger.warn(`⚠️ Možnost ID ${optionId} neexistuje.`);
      return res.status(404).json({ error: "Možnost nenalezena." });
    }

    logger.info(`🗳 Úspěšně přidán hlas pro možnost ID: ${optionId}`);

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

  if (!token || token !== RESET_TOKEN) {
    logger.warn("🔐 Neúspěšný pokus o reset – špatný token.");
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    await pool.query("UPDATE poll_options SET votes = 0");
    logger.info("🔐 Úspěšný reset hlasování.");
    res.status(200).json({ success: true, message: "Hlasování bylo resetováno." });
  } catch (err) {
    logger.error("❌ Chyba při resetu: " + err.message, { stack: err.stack });
    res.status(500).json({ error: "Chyba serveru." });
  }
});

export default router;
