/**
 * Retry Utility with Exponential Backoff
 *
 * Provides resilient network operations for Supabase writes.
 */

import { createLogger } from './logger';

const logger = createLogger('Retry');

interface RetryConfig {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalTimeMs: number;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  retryableErrors: [
    'network',
    'timeout',
    'PGRST',
    'connection',
    'ETIMEDOUT',
    'ECONNRESET',
    'fetch failed',
  ],
};

/**
 * Check if an error is retryable
 */
function isRetryable(error: Error, retryableErrors: string[]): boolean {
  const message = error.message.toLowerCase();
  return retryableErrors.some(keyword => message.includes(keyword.toLowerCase()));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  multiplier: number
): number {
  // Exponential backoff
  const exponentialDelay = baseDelayMs * Math.pow(multiplier, attempt);

  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);

  // Add jitter (±25%)
  const jitter = cappedDelay * (0.75 + Math.random() * 0.5);

  return Math.round(jitter);
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry and exponential backoff
 */
export async function withRetry<T>(
  operation: string,
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries,
    baseDelayMs,
    maxDelayMs,
    backoffMultiplier,
    retryableErrors,
  } = { ...DEFAULT_CONFIG, ...config };

  const startTime = performance.now();
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();

      if (attempt > 0) {
        logger.info(`${operation} succeeded after ${attempt + 1} attempts`, {
          operation,
          duration: Math.round(performance.now() - startTime),
        });
      }

      return {
        success: true,
        result,
        attempts: attempt + 1,
        totalTimeMs: Math.round(performance.now() - startTime),
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt < maxRetries && isRetryable(lastError, retryableErrors)) {
        const delay = calculateDelay(attempt, baseDelayMs, maxDelayMs, backoffMultiplier);

        logger.warn(`${operation} failed, retrying in ${delay}ms`, {
          operation,
          error: lastError.message,
          metadata: { attempt: attempt + 1, maxRetries, delay },
        });

        await sleep(delay);
      } else if (attempt >= maxRetries) {
        logger.error(`${operation} failed after ${maxRetries + 1} attempts`, {
          operation,
          error: lastError.message,
          duration: Math.round(performance.now() - startTime),
        });
      } else {
        // Non-retryable error
        logger.error(`${operation} failed with non-retryable error`, {
          operation,
          error: lastError.message,
        });
        break;
      }
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: maxRetries + 1,
    totalTimeMs: Math.round(performance.now() - startTime),
  };
}

/**
 * Wrap a function to automatically retry on failure
 */
export function createRetryableFunction<TArgs extends unknown[], TResult>(
  operation: string,
  fn: (...args: TArgs) => Promise<TResult>,
  config: RetryConfig = {}
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const result = await withRetry(operation, () => fn(...args), config);

    if (result.success && result.result !== undefined) {
      return result.result;
    }

    throw result.error || new Error(`${operation} failed after retries`);
  };
}

/**
 * Circuit breaker state
 */
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const circuitBreakers = new Map<string, CircuitBreakerState>();

/**
 * Simple circuit breaker for repeated failures
 */
export function checkCircuitBreaker(
  name: string,
  failureThreshold: number = 5,
  resetTimeMs: number = 30000
): { isOpen: boolean; canRetry: boolean } {
  const state = circuitBreakers.get(name);

  if (!state) {
    return { isOpen: false, canRetry: true };
  }

  // Check if enough time has passed to reset
  if (state.isOpen && Date.now() - state.lastFailure > resetTimeMs) {
    // Half-open state - allow one retry
    return { isOpen: true, canRetry: true };
  }

  return {
    isOpen: state.isOpen,
    canRetry: !state.isOpen,
  };
}

/**
 * Record a success, resetting the circuit breaker
 */
export function recordSuccess(name: string): void {
  circuitBreakers.delete(name);
}

/**
 * Record a failure, potentially opening the circuit breaker
 */
export function recordFailure(
  name: string,
  failureThreshold: number = 5
): void {
  const state = circuitBreakers.get(name) || {
    failures: 0,
    lastFailure: 0,
    isOpen: false,
  };

  state.failures += 1;
  state.lastFailure = Date.now();

  if (state.failures >= failureThreshold) {
    state.isOpen = true;
    logger.warn(`Circuit breaker opened for ${name}`, {
      metadata: { failures: state.failures },
    });
  }

  circuitBreakers.set(name, state);
}

/**
 * Get circuit breaker status for monitoring
 */
export function getCircuitBreakerStatus(): Record<string, CircuitBreakerState> {
  const status: Record<string, CircuitBreakerState> = {};
  Array.from(circuitBreakers.entries()).forEach(([name, state]) => {
    status[name] = { ...state };
  });
  return status;
}
