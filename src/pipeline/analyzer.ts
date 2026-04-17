/**
 * @fileoverview Analyzes video transcripts to extract topics, key points, tone, and highlights.
 * @module pipeline/analyzer
 */

import { completeJSON } from "../gateway/index.js";
import type {
  TranscriptChunk,
  ContentAnalysis,
  BYOKConfig,
} from "../gateway/types.js";

const ANALYSIS_PROMPT = `Analyze this video transcript and extract structured information.

TRANSCRIPT:
{transcript}

Return a JSON object with this exact structure:
{
  "title": "Suggested blog title based on content",
  "topics": [
    { "name": "Topic name", "importance": 0.9 }
  ],
  "keyPoints": ["Main point 1", "Main point 2"],
  "tone": "Educational, casual, technical, etc.",
  "audience": "Who this content is for",
  "quotes": ["Notable quotes worth including"]
}

Rules:
- importance is 0-1 scale
- Include 3-7 topics
- Include 5-10 key points
- Include 2-5 memorable quotes
- Be specific, not generic`;

/** Extracts structured content analysis (topics, key points, tone) from transcript chunks. */
export async function analyzeContent(
  chunks: TranscriptChunk[],
  model: string,
  byok?: BYOKConfig,
): Promise<ContentAnalysis> {
  const transcript = chunks.map((c) => c.text).join("\n\n");
  const prompt = ANALYSIS_PROMPT.replace("{transcript}", transcript);

  return completeJSON(model, prompt, byok);
}

/** Analyzes long transcripts in batches, then merges results. */
export async function analyzeInBatches(
  chunks: TranscriptChunk[],
  model: string,
  byok?: BYOKConfig,
  batchSize: number = 10,
): Promise<ContentAnalysis> {
  if (chunks.length <= batchSize) {
    return analyzeContent(chunks, model, byok);
  }

  const batchResults: ContentAnalysis[] = [];
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const result = await analyzeContent(batch, model, byok);
    batchResults.push(result);
  }

  return mergeAnalyses(batchResults, model, byok);
}

async function mergeAnalyses(
  analyses: ContentAnalysis[],
  model: string,
  byok?: BYOKConfig,
): Promise<ContentAnalysis> {
  const mergePrompt = `Merge these content analyses into a single coherent analysis.

ANALYSES:
${JSON.stringify(analyses, null, 2)}

Return a JSON object with:
{
  "title": "Best unified title",
  "topics": [{ "name": "Topic", "importance": 0.9 }],
  "keyPoints": ["Deduplicated key points"],
  "tone": "Overall tone",
  "audience": "Target audience",
  "quotes": ["Best quotes across all analyses"]
}

Rules:
- Deduplicate topics and points
- Recalculate importance scores
- Keep only the best 3-5 quotes
- Title should capture the full content`;

  return completeJSON(model, mergePrompt, byok);
}

/** Finds compelling moments suitable for hooks, clips, or social quotes. */
export async function extractHighlights(
  chunks: TranscriptChunk[],
  model: string,
  byok?: BYOKConfig,
): Promise<Array<{ timestamp: number; text: string; reason: string }>> {
  const transcript = chunks
    .map((c) => `[${formatTime(c.start)}] ${c.text}`)
    .join("\n");

  const prompt = `Find the most compelling/viral moments in this transcript.

TRANSCRIPT:
${transcript}

Return JSON array:
[
  { "timestamp": 123.5, "text": "The quote", "reason": "Why it's compelling" }
]

Find 3-5 moments that would make good hooks, clips, or social quotes.`;

  return completeJSON(model, prompt, byok);
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
