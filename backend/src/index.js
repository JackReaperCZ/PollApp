import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pollRouter from "./routes.js";
import { initDB } from "./db.js";
import logger from "./logger.js";

dotenv.config();

const requiredEnv = ["RESET_TOKEN"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    logger.error(`Chybí proměnná prostředí: ${key}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 4000;

app.set("trust proxy", 1);

// CORS — povolíme frontend origin z env nebo všechny při vývoji
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`→ ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/poll", pollRouter);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint nenalezen." });
});

// Global error handler
app.use((err, _req, res, _next) => {
  logger.error("❌ Neočekávaná chyba: " + err.message, { stack: err.stack });
  res.status(500).json({ error: "Interní chyba serveru." });
});

// Start
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      logger.info(`🚀 Backend běží na portu ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Nelze spustit server: " + err.message, { stack: err.stack });
    process.exit(1);
  }
}

start();
