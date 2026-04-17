/**
 * @fileoverview Type definitions for AI Gateway and blog pipeline
 * @module gateway/types
 */

import { z } from "zod";

/** Validates model strings in provider/model format. */
export const ModelStringSchema = z
  .string()
  .regex(
    /^[a-z]+\/[a-z0-9\-\.]+$/i,
    "Model must be in format: provider/model (e.g., openai/gpt-5.4)",
  );

export type ModelString = z.infer<typeof ModelStringSchema>;

export const PROVIDERS = ["openai", "anthropic", "google", "groq"];

export type Provider = "openai" | "anthropic" | "google" | "groq";

/** BYOK (Bring Your Own Key) configuration mapping providers to API keys. */
export interface BYOKConfig {
  openai?: string;
  anthropic?: string;
  google?: string;
  groq?: string;
}

/** Options for AI Gateway requests. */
export interface GatewayOptions {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  byok?: BYOKConfig;
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

/** Blog generation configuration. */
export interface BlogConfig {
  style: string;
  sections: number;
  wordCount: number;
  tone?: string;
}

export const BLOG_STYLES = [
  "seo",
  "medium",
  "newsletter",
  "thread",
  "technical",
];

export type BlogStyle =
  | "seo"
  | "medium"
  | "newsletter"
  | "thread"
  | "technical";

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
