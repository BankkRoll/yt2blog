/**
 * @fileoverview Retry utility with exponential backoff for API calls
 * @module utils/retry
 */

/** Retry options configuration */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Jitter factor 0-1 to randomize delays (default: 0.1) */
  jitter?: number;
  /** Function to determine if error is retryable (default: all errors) */
  isRetryable?: (error: unknown) => boolean;
  /** Callback for each retry attempt */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

/** Default retry configuration */
const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "onRetry" | "isRetryable">> =
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: 0.1,
  };

/** Common retryable error patterns */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];
const RETRYABLE_ERROR_CODES = [
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "ECONNREFUSED",
  "EAI_AGAIN",
];

/** Checks if an error is retryable by default */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  // Check HTTP status codes
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    // Response status check
    if (
      typeof err.status === "number" &&
      RETRYABLE_STATUS_CODES.includes(err.status)
    ) {
      return true;
    }

    // Error code check (Node.js network errors)
    if (
      typeof err.code === "string" &&
      RETRYABLE_ERROR_CODES.includes(err.code)
    ) {
      return true;
    }

    // Rate limit check
    if (err.message && typeof err.message === "string") {
      const msg = err.message.toLowerCase();
      if (
        msg.includes("rate limit") ||
        msg.includes("too many requests") ||
        msg.includes("quota")
      ) {
        return true;
      }
    }
  }

  return true; // Default to retrying unknown errors
}

/** Calculates delay with exponential backoff and jitter */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  jitter: number,
): number {
  const exponentialDelay =
    initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  const clampedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter to prevent thundering herd
  const jitterAmount = clampedDelay * jitter * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(clampedDelay + jitterAmount));
}

/** Sleeps for specified milliseconds */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes a function with retry logic and exponential backoff.
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => fetchFromAPI(),
 *   { maxRetries: 5, onRetry: (err, attempt) => console.log(`Retry ${attempt}`) }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = DEFAULT_OPTIONS.maxRetries,
    initialDelay = DEFAULT_OPTIONS.initialDelay,
    maxDelay = DEFAULT_OPTIONS.maxDelay,
    backoffMultiplier = DEFAULT_OPTIONS.backoffMultiplier,
    jitter = DEFAULT_OPTIONS.jitter,
    isRetryable = isRetryableError,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts or error isn't retryable
      if (attempt > maxRetries || !isRetryable(error)) {
        throw error;
      }

      const delay = calculateDelay(
        attempt,
        initialDelay,
        maxDelay,
        backoffMultiplier,
        jitter,
      );
      onRetry?.(error, attempt, delay);

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Creates a retryable version of an async function.
 *
 * @example
 * ```ts
 * const fetchWithRetry = retryable(fetchFromAPI, { maxRetries: 3 });
 * const result = await fetchWithRetry();
 * ```
 */
export function retryable<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: RetryOptions = {},
): T {
  return ((...args: Parameters<T>) =>
    withRetry(() => fn(...args), options)) as T;
}

/** Preset retry configurations */
export const RetryPresets = {
  /** Quick retries for fast failures (2 retries, 500ms initial) */
  fast: {
    maxRetries: 2,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 2,
  } satisfies RetryOptions,

  /** Standard retry configuration (3 retries, 1s initial) */
  standard: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  } satisfies RetryOptions,

  /** Aggressive retries for critical operations (5 retries, 2s initial) */
  aggressive: {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 60000,
    backoffMultiplier: 2,
  } satisfies RetryOptions,

  /** Rate limit handling (longer delays, more retries) */
  rateLimit: {
    maxRetries: 5,
    initialDelay: 5000,
    maxDelay: 120000,
    backoffMultiplier: 2.5,
    jitter: 0.2,
  } satisfies RetryOptions,
} as const;
