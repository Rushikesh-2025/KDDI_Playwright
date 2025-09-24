import * as winston from "winston";
import moment from "moment-timezone";
import * as path from "path";

const currentDir = __dirname;
// Go one level above (back to 'src')
const srcDir = path.resolve(currentDir, "..");

// Change to 'logging' folder
const loggingDir = path.resolve(srcDir, "logging");

// Function to format log entries with timestamp and timezone
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Set the desired timezone
const timeZone = "Asia/Kolkata"; // For India

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss")
    }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({ level: "debug" }),
    new winston.transports.File({
      filename: path.join(loggingDir, "test_run.log"),
      maxFiles: 5,
      maxsize: 300 * 1024, // 300 KB
      level: "info",
    }),
    new winston.transports.File({
      filename: path.join(loggingDir, "test_error.log"),
      maxFiles: 5,
      maxsize: 10 * 1024, // 10 KB
      level: "error",
    }),
  ],
});

export default logger;

