/**
 * @fileoverview Type definitions for AI Gateway and blog pipeline
 * @module gateway/types
 */

import { z } from "zod";

/** Zod schema for validating model strings in provider/model format */
export const ModelStringSchema = z
  .string()
  .regex(
    /^[a-z]+\/[a-z0-9\-\.]+$/i,
    "Model must be in format: provider/model (e.g., openai/gpt-4o)",
  );

export type ModelString = z.infer<typeof ModelStringSchema>;

/** Options for AI Gateway requests. */
export interface GatewayOptions {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/** Chat message format (OpenAI-compatible). */
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Response from the AI Gateway. */
export interface GatewayResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

/** Streaming response chunk. */
export interface StreamChunk {
  text: string;
  done: boolean;
}

/** Available blog styles */
export const BLOG_STYLES = [
  "seo",
  "medium",
  "newsletter",
  "thread",
  "technical",
  "podcast",
  "tutorial",
  "recap",
  "sports",
] as const;

export type BlogStyle = (typeof BLOG_STYLES)[number];

/** Blog generation configuration */
export interface BlogConfig {
  style: BlogStyle;
  sections: number;
  wordCount: number;
  tone?: string;
}

export type StepStatus = "pending" | "running" | "done" | "error";

/** Pipeline step for progress tracking. */
export interface PipelineStep {
  id: string;
  label: string;
  status: StepStatus;
  progress: number;
  statusText?: string;
}

/** Token usage tracking across pipeline. */
export interface TokenUsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** Transcript chunk with timestamps. */
export interface TranscriptChunk {
  start: number;
  end: number;
  text: string;
}

/** Result of content analysis. */
export interface ContentAnalysis {
  title: string;
  topics: Array<{ name: string; importance: number }>;
  keyPoints: string[];
  tone: string;
  audience: string;
  quotes: string[];
}

/** Blog outline structure. */
export interface BlogOutline {
  title: string;
  sections: Array<{
    heading: string;
    goal: string;
    keyPoints: string[];
  }>;
}
