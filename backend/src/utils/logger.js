import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file"; // For log rotation

const { combine, timestamp, printf, errors } = winston.format;

// Custom log format
const logFormat = printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

// Environment-based configuration
const isProduction = process.env.NODE_ENV === "production";

// Define transports
const transports = [
  new winston.transports.Console({
    level: isProduction ? "info" : "debug", // More verbose in dev
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  }),
];

// Production-specific transports
if (isProduction) {
  transports.push(
    new DailyRotateFile({
      filename: "logs/server-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d", // Keep logs for 14 days
      maxSize: "20m", // Rotate if file exceeds 20MB
      level: "info",
      auditFile: "logs/audit.json", // Tracks rotated files
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      maxSize: "20m",
      level: "error",
    }),
    new DailyRotateFile({
      filename: "logs/recurring-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      maxSize: "20m",
      level: "info",
    })
  );
} else {
  transports.push(
    new winston.transports.File({ filename: "logs/server.log", level: "info" }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({
      filename: "logs/recurring.log",
      level: "info",
    })
  );
}

// Create logger
const logger = winston.createLogger({
  level: isProduction ? "info" : "debug", // Debug in dev, info in prod
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // Include stack traces for errors
    logFormat
  ),
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ], // Uncaught exceptions
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ], // Unhandled rejections
});

// Sanitize sensitive data (example)
const sanitizeLog = (data) => {
  const sanitized = { ...data };
  if (sanitized.password) delete sanitized.password; // Remove passwords
  if (sanitized.email) sanitized.email = "[REDACTED]"; // Mask emails
  return sanitized;
};

// Wrapper methods to add sanitization
const log = {
  debug: (message, meta) => logger.debug(message, sanitizeLog(meta || {})),
  info: (message, meta) => logger.info(message, sanitizeLog(meta || {})),
  warn: (message, meta) => logger.warn(message, sanitizeLog(meta || {})),
  error: (message, meta) => logger.error(message, sanitizeLog(meta || {})),
};

export default log;
