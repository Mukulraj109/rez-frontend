// utils/logger.ts - Production-safe logging utility

/**
 * Production-safe logger utility
 * - In development: Logs to console with full details
 * - In production: Suppresses logs or sends to monitoring service
 */

const isDevelopment = __DEV__;

export const logger = {
  /**
   * General information logging
   * Only active in development mode
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Error logging
   * Active in both development and production
   * In production, should integrate with error tracking service (e.g., Sentry)
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // TODO: In production, send to error tracking service
      // Example: Sentry.captureException(args[0]);
      console.error(...args);
    }
  },

  /**
   * Warning logging
   * Only active in development mode
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Info logging with context
   * Only active in development mode
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Debug logging with context
   * Only active in development mode
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

export default logger;
