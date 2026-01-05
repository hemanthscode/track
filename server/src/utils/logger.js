import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { config } from "../config/env.js";

const { combine, timestamp, printf, errors, colorize, json } = winston.format;

// Custom format for console (human-readable with colors)
const consoleFormat = printf(({ timestamp, level, message, ...meta }) => {
  const metaString = Object.keys(meta).length > 0 
    ? `\n${JSON.stringify(meta, null, 2)}` 
    : '';
  return `${timestamp} ${level}: ${message}${metaString}`;
});

// File format (structured JSON for parsing)
const fileFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  json()
);

// Console format with colors
const coloredConsoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  consoleFormat
);

// Transports
const transports = [
  new winston.transports.Console({
    level: config.env === "production" ? "info" : "debug",
    format: coloredConsoleFormat,
  }),
];

// Add file transports in non-test environments
if (config.env !== "test") {
  transports.push(
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      maxSize: "20m",
      level: "info",
      format: fileFormat,
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      maxSize: "20m",
      level: "error",
      format: fileFormat,
    })
  );
}

// Create logger
const logger = winston.createLogger({
  level: config.logging.level,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
  exitOnError: false,
});

export default logger;
