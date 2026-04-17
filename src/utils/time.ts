/**
 * @fileoverview Unified time formatting utilities
 * @module utils/time
 */

/**
 * Formats seconds into a human-readable timestamp string.
 * @param seconds - Time in seconds
 * @returns Formatted string (e.g., "1:30" or "1:05:30")
 */
export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Parses a timestamp string into seconds.
 * @param timeStr - Time string (e.g., "1:30" or "1:05:30")
 * @returns Time in seconds
 */
export function parseTimestamp(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * Formats duration in milliseconds to human-readable string.
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "2m 30s" or "1h 5m")
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }
  if (minutes > 0) {
    const remainingSecs = seconds % 60;
    return remainingSecs > 0 ? `${minutes}m ${remainingSecs}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * Estimates reading time based on word count.
 * @param wordCount - Number of words
 * @param wordsPerMinute - Reading speed (default: 200)
 * @returns Estimated reading time in minutes
 */
export function estimateReadingTime(
  wordCount: number,
  wordsPerMinute = 200,
): number {
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Calculates estimated duration from text length.
 * Assumes ~150 words per minute speaking rate, ~5 chars per word.
 * @param charCount - Number of characters
 * @returns Estimated duration in seconds
 */
export function estimateDurationFromChars(charCount: number): number {
  const charsPerSecond = (150 * 5) / 60; // ~150 wpm, ~5 chars/word
  return charCount / charsPerSecond;
}
