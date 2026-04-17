/**
 * @fileoverview Zod schemas for input/output validation
 * @module utils/validation
 */

import { z } from "zod";

// ============================================================================
// Input Validation Schemas
// ============================================================================

/** Valid YouTube URL patterns */
const YOUTUBE_URL_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
  /^https?:\/\/youtu\.be\/[\w-]+/,
  /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
  /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/,
  /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
];

/** Validates YouTube video URL */
export const YouTubeUrlSchema = z
  .string()
  .refine((url) => YOUTUBE_URL_PATTERNS.some((pattern) => pattern.test(url)), {
    message:
      "Invalid YouTube URL. Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...",
  });

/** Validates model string format (provider/model) */
export const ModelStringSchema = z
  .string()
  .regex(
    /^[a-z]+\/[a-z0-9\-\.]+$/i,
    "Model must be in format: provider/model (e.g., openai/gpt-4o)",
  );

/** Validates blog style */
export const BlogStyleSchema = z.enum([
  "seo",
  "medium",
  "newsletter",
  "thread",
  "technical",
  "podcast",
  "tutorial",
  "recap",
  "sports",
]);

/** Validates blog configuration - matches BlogConfig in gateway/types.ts */
export const BlogConfigSchema = z.object({
  style: BlogStyleSchema,
  sections: z.number().int().min(1).max(15),
  wordCount: z.number().int().min(200).max(10000),
  tone: z.string().optional(),
});

/** Validates pipeline options */
export const PipelineOptionsSchema = z.object({
  videoUrl: YouTubeUrlSchema,
  model: ModelStringSchema,
  config: BlogConfigSchema,
  stream: z.boolean().optional(),
});

// ============================================================================
// Output Validation Schemas
// ============================================================================

/** Validates content analysis from LLM - matches ContentAnalysis in gateway/types.ts */
export const ContentAnalysisSchema = z.object({
  title: z.string().min(1, "Title is required"),
  topics: z
    .array(
      z.object({
        name: z.string(),
        importance: z.number().min(0).max(1),
      }),
    )
    .min(1, "At least one topic is required"),
  keyPoints: z.array(z.string()).min(1, "At least one key point is required"),
  tone: z.string(),
  audience: z.string(),
  quotes: z.array(z.string()),
});

/** Validates blog outline from LLM */
export const BlogOutlineSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1, "Section heading is required"),
        goal: z.string(),
        keyPoints: z.array(z.string()),
      }),
    )
    .min(1, "At least one section is required"),
});

/** Validates SEO metadata from LLM */
export const SEOMetadataSchema = z.object({
  title: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(170),
  keywords: z.array(z.string()).min(1).max(10),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be URL-friendly"),
});

/** Validates blog validation result from LLM */
export const BlogValidationSchema = z.object({
  score: z.number().min(1).max(10),
  issues: z.array(z.string()),
  suggestions: z.array(z.string()),
});

/** Validates highlight extraction from LLM */
export const HighlightSchema = z.object({
  timestamp: z.number().min(0),
  text: z.string(),
  reason: z.string(),
});

// ============================================================================
// Validation Helpers
// ============================================================================

/** Error thrown when validation fails */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: z.ZodError,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates input and returns typed result or throws ValidationError.
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param context - Context for error message (e.g., "pipeline options")
 * @returns Validated and typed data
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new ValidationError(`Invalid ${context}:\n${issues}`, result.error);
  }
  return result.data;
}

/**
 * Validates input and returns result with success flag.
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and data or error
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Parses JSON string and validates against schema.
 * @param schema - Zod schema to validate against
 * @param jsonString - JSON string to parse
 * @param context - Context for error message
 * @returns Validated and typed data
 */
export function parseAndValidate<T>(
  schema: z.ZodSchema<T>,
  jsonString: string,
  context: string,
): T {
  let parsed: unknown;
  try {
    // Strip markdown code blocks if present
    let cleaned = jsonString.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    }
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    parsed = JSON.parse(cleaned.trim());
  } catch (e) {
    throw new Error(`Failed to parse JSON for ${context}: ${e}`);
  }
  return validate(schema, parsed, context);
}

// ============================================================================
// Type Exports
// ============================================================================

export type YouTubeUrl = z.infer<typeof YouTubeUrlSchema>;
export type ModelString = z.infer<typeof ModelStringSchema>;
export type BlogStyle = z.infer<typeof BlogStyleSchema>;
export type BlogConfig = z.infer<typeof BlogConfigSchema>;
export type ContentAnalysis = z.infer<typeof ContentAnalysisSchema>;
export type BlogOutline = z.infer<typeof BlogOutlineSchema>;
export type SEOMetadata = z.infer<typeof SEOMetadataSchema>;
export type BlogValidation = z.infer<typeof BlogValidationSchema>;
export type Highlight = z.infer<typeof HighlightSchema>;
