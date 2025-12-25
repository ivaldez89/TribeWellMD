/**
 * Observability Logger
 *
 * Lightweight logging utility for flashcard operations.
 * Provides structured logging with timing metrics.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  operation?: string;
  duration?: number;
  count?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

interface TimingResult<T> {
  result: T;
  duration: number;
}

// Log levels for filtering
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level (can be configured via environment)
const MIN_LOG_LEVEL: LogLevel =
  (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

/**
 * Format log message with context
 */
function formatMessage(
  namespace: string,
  message: string,
  context?: LogContext
): string {
  const parts = [`[${namespace}] ${message}`];

  if (context) {
    if (context.duration !== undefined) {
      parts.push(`(${context.duration}ms)`);
    }
    if (context.count !== undefined) {
      parts.push(`count=${context.count}`);
    }
    if (context.operation) {
      parts.push(`op=${context.operation}`);
    }
  }

  return parts.join(' ');
}

/**
 * Create a namespaced logger
 */
export function createLogger(namespace: string) {
  return {
    debug(message: string, context?: LogContext) {
      if (shouldLog('debug')) {
        console.debug(formatMessage(namespace, message, context), context?.metadata || '');
      }
    },

    info(message: string, context?: LogContext) {
      if (shouldLog('info')) {
        console.info(formatMessage(namespace, message, context), context?.metadata || '');
      }
    },

    warn(message: string, context?: LogContext) {
      if (shouldLog('warn')) {
        console.warn(formatMessage(namespace, message, context), context?.metadata || '');
      }
    },

    error(message: string, context?: LogContext) {
      if (shouldLog('error')) {
        console.error(formatMessage(namespace, message, context), context?.metadata || '');
      }
    },

    /**
     * Time an async operation and log the result
     */
    async time<T>(
      operation: string,
      fn: () => Promise<T>,
      level: LogLevel = 'debug'
    ): Promise<TimingResult<T>> {
      const start = performance.now();
      try {
        const result = await fn();
        const duration = Math.round(performance.now() - start);

        if (shouldLog(level)) {
          this[level](`${operation} completed`, { operation, duration });
        }

        return { result, duration };
      } catch (error) {
        const duration = Math.round(performance.now() - start);
        this.error(`${operation} failed`, {
          operation,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    },

    /**
     * Time a sync operation and log the result
     */
    timeSync<T>(
      operation: string,
      fn: () => T,
      level: LogLevel = 'debug'
    ): TimingResult<T> {
      const start = performance.now();
      try {
        const result = fn();
        const duration = Math.round(performance.now() - start);

        if (shouldLog(level)) {
          this[level](`${operation} completed`, { operation, duration });
        }

        return { result, duration };
      } catch (error) {
        const duration = Math.round(performance.now() - start);
        this.error(`${operation} failed`, {
          operation,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    },
  };
}

// Pre-configured loggers for different domains
export const flashcardLogger = createLogger('Flashcards');
export const migrationLogger = createLogger('Migration');
export const sessionLogger = createLogger('Session');
export const authLogger = createLogger('Auth');

/**
 * Client-side metrics collector
 * Collects timing data for performance analysis
 */
interface Metric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private maxMetrics = 100; // Rolling buffer

  record(name: string, value: number, metadata?: Record<string, unknown>) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverages(): Record<string, number> {
    const groups = new Map<string, number[]>();

    for (const metric of this.metrics) {
      const existing = groups.get(metric.name) || [];
      existing.push(metric.value);
      groups.set(metric.name, existing);
    }

    const averages: Record<string, number> = {};
    Array.from(groups.entries()).forEach(([name, values]) => {
      averages[name] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    });

    return averages;
  }

  clear() {
    this.metrics = [];
  }
}

export const metrics = new MetricsCollector();

// Metric names for consistency
export const METRIC_NAMES = {
  FLASHCARD_LOAD: 'flashcard.load',
  FLASHCARD_SAVE: 'flashcard.save',
  FLASHCARD_REVIEW: 'flashcard.review',
  MIGRATION_TOTAL: 'migration.total',
  MIGRATION_BATCH: 'migration.batch',
  SESSION_START: 'session.start',
  SESSION_END: 'session.end',
} as const;
