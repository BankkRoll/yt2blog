/**
 * @fileoverview Analyzes video transcripts to extract topics, key points, tone, and highlights.
 * @module pipeline/analyzer
 */

import { completeJSON } from "../gateway/index.js";
import type { TranscriptChunk, ContentAnalysis } from "../gateway/types.js";
import { getLogger } from "../utils/logger.js";
import { formatSeconds } from "../utils/time.js";

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

/**
 * Extracts structured content analysis from transcript chunks.
 * @param chunks - Transcript chunks to analyze
 * @param model - Model identifier (e.g., "openai/gpt-4o")
 * @returns Analysis with topics, key points, tone, audience, and quotes
 */
export async function analyzeContent(
  chunks: TranscriptChunk[],
  model: string,
): Promise<ContentAnalysis> {
  const logger = getLogger();
  const charCount = chunks.reduce((sum, c) => sum + c.text.length, 0);
  logger.debug("Analyzing content", {
    chunks: chunks.length,
    chars: charCount,
    model,
  });

  const transcript = chunks.map((c) => c.text).join("\n\n");
  const prompt = ANALYSIS_PROMPT.replace("{transcript}", transcript);

  const result = await completeJSON<ContentAnalysis>(model, prompt);
  logger.debug("Content analysis complete", {
    title: result.title,
    topics: result.topics.length,
    keyPoints: result.keyPoints.length,
  });
  return result;
}

/**
 * Analyzes long transcripts in batches, then merges results.
 * @param chunks - Transcript chunks to analyze
 * @param model - Model identifier (e.g., "openai/gpt-4o")
 * @param batchSize - Number of chunks per batch (default: 10)
 * @returns Merged content analysis
 */
export async function analyzeInBatches(
  chunks: TranscriptChunk[],
  model: string,
  batchSize: number = 10,
): Promise<ContentAnalysis> {
  const logger = getLogger();

  if (chunks.length <= batchSize) {
    logger.debug("Chunks fit in single batch, using direct analysis");
    return analyzeContent(chunks, model);
  }

  const totalBatches = Math.ceil(chunks.length / batchSize);
  logger.info("Analyzing in batches", {
    chunks: chunks.length,
    batchSize,
    totalBatches,
  });

  const batchResults: ContentAnalysis[] = [];
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batchNum = Math.floor(i / batchSize) + 1;
    const batch = chunks.slice(i, i + batchSize);
    logger.debug(`Processing batch ${batchNum}/${totalBatches}`, {
      chunkRange: `${i}-${i + batch.length}`,
    });
    const result = await analyzeContent(batch, model);
    batchResults.push(result);
  }

  logger.debug("Merging batch results", { batches: batchResults.length });
  return mergeAnalyses(batchResults, model);
}

async function mergeAnalyses(
  analyses: ContentAnalysis[],
  model: string,
): Promise<ContentAnalysis> {
  const logger = getLogger();
  logger.debug("Merging analyses", { count: analyses.length });

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

  const result = await completeJSON<ContentAnalysis>(model, mergePrompt);
  logger.debug("Merge complete", {
    title: result.title,
    topics: result.topics.length,
  });
  return result;
}

/**
 * Finds compelling moments suitable for hooks, clips, or social quotes.
 * @param chunks - Transcript chunks to search
 * @param model - Model identifier (e.g., "openai/gpt-4o")
 * @returns Array of highlights with timestamp, text, and reason
 */
export async function extractHighlights(
  chunks: TranscriptChunk[],
  model: string,
): Promise<Array<{ timestamp: number; text: string; reason: string }>> {
  const logger = getLogger();
  const duration = chunks.length > 0 ? chunks[chunks.length - 1].end : 0;
  logger.debug("Extracting highlights", {
    chunks: chunks.length,
    duration: formatSeconds(duration),
  });

  const transcript = chunks
    .map((c) => `[${formatSeconds(c.start)}] ${c.text}`)
    .join("\n");

  const prompt = `Find the most compelling/viral moments in this transcript.

TRANSCRIPT:
${transcript}

Return JSON array:
[
  { "timestamp": 123.5, "text": "The quote", "reason": "Why it's compelling" }
]

Find 3-5 moments that would make good hooks, clips, or social quotes.`;

  const result = await completeJSON<
    Array<{ timestamp: number; text: string; reason: string }>
  >(model, prompt);
  logger.debug("Highlights extracted", { count: result.length });
  return result;
}
