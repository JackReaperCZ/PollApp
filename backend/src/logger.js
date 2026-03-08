import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}] ${stack || message}`;
});

const fileTransport = new winston.transports.DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), logFormat),
});

const consoleTransport = new winston.transports.Console({
  format: combine(
    colorize({ all: true }),
    timestamp({ format: "HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
});

const logger = winston.createLogger({
  level: "info",
  transports: [consoleTransport, fileTransport],
});

export default logger;
