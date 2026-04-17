/**
 * @fileoverview Structured logging utility for yt2blog
 * @module utils/logger
 */

/** Log levels in order of severity */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/** Log entry structure */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

/** Logger interface */
export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

/** Logger options */
export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  timestamp?: boolean;
  colors?: boolean;
}

/** ANSI color codes */
const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
} as const;

/** Level labels and colors */
const LEVEL_CONFIG: Record<LogLevel, { label: string; color: string }> = {
  [LogLevel.DEBUG]: { label: "DEBUG", color: COLORS.gray },
  [LogLevel.INFO]: { label: "INFO", color: COLORS.cyan },
  [LogLevel.WARN]: { label: "WARN", color: COLORS.yellow },
  [LogLevel.ERROR]: { label: "ERROR", color: COLORS.red },
  [LogLevel.SILENT]: { label: "", color: "" },
};

/** Formats timestamp for log output */
function formatTimestamp(date: Date): string {
  return date.toISOString().slice(11, 23);
}

/** Formats context object for log output */
function formatContext(context: Record<string, unknown>): string {
  const entries = Object.entries(context)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(" ");
  return entries ? ` ${COLORS.dim}${entries}${COLORS.reset}` : "";
}

/** Creates a logger instance */
export function createLogger(options: LoggerOptions = {}): Logger {
  const {
    level = LogLevel.INFO,
    prefix = "yt2blog",
    timestamp = true,
    colors = true,
  } = options;

  let currentLevel = level;

  const log = (entry: LogEntry): void => {
    if (entry.level < currentLevel) return;

    const config = LEVEL_CONFIG[entry.level];
    const parts: string[] = [];

    if (timestamp) {
      const ts = formatTimestamp(entry.timestamp);
      parts.push(colors ? `${COLORS.dim}${ts}${COLORS.reset}` : ts);
    }

    if (prefix) {
      parts.push(
        colors ? `${COLORS.dim}[${prefix}]${COLORS.reset}` : `[${prefix}]`,
      );
    }

    const levelLabel = colors
      ? `${config.color}${config.label}${COLORS.reset}`
      : config.label;
    parts.push(levelLabel);

    parts.push(entry.message);

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(
        colors ? formatContext(entry.context) : JSON.stringify(entry.context),
      );
    }

    const output = parts.join(" ");

    if (entry.level === LogLevel.ERROR) {
      console.error(output);
    } else if (entry.level === LogLevel.WARN) {
      console.warn(output);
    } else {
      console.log(output);
    }
  };

  return {
    debug(message: string, context?: Record<string, unknown>): void {
      log({ level: LogLevel.DEBUG, message, timestamp: new Date(), context });
    },

    info(message: string, context?: Record<string, unknown>): void {
      log({ level: LogLevel.INFO, message, timestamp: new Date(), context });
    },

    warn(message: string, context?: Record<string, unknown>): void {
      log({ level: LogLevel.WARN, message, timestamp: new Date(), context });
    },

    error(message: string, context?: Record<string, unknown>): void {
      log({ level: LogLevel.ERROR, message, timestamp: new Date(), context });
    },

    setLevel(newLevel: LogLevel): void {
      currentLevel = newLevel;
    },

    getLevel(): LogLevel {
      return currentLevel;
    },
  };
}

/** Default logger instance */
let defaultLogger: Logger | null = null;

/**
 * Gets or creates the default logger.
 * @param options - Options for initial creation only (ignored if logger already exists)
 * @returns The singleton logger instance
 */
export function getLogger(options?: LoggerOptions): Logger {
  if (!defaultLogger) {
    defaultLogger = createLogger(options);
  }
  return defaultLogger;
}

/** Resets the default logger instance (useful for testing) */
export function resetLogger(): void {
  defaultLogger = null;
}
