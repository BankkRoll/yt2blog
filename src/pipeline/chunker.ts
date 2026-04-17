/**
 * @fileoverview Splits transcripts into manageable chunks at sentence boundaries.
 * @module pipeline/chunker
 */

import type { TranscriptChunk } from "../gateway/types.js";

/** Configuration for transcript chunking behavior. */
export interface ChunkOptions {
  targetSize?: number;
  maxSize?: number;
  overlap?: number;
}

const DEFAULT_OPTIONS: ChunkOptions = {
  targetSize: 1500,
  maxSize: 3000,
  overlap: 100,
};

/** Splits transcript into chunks at sentence boundaries. */
export function chunkTranscript(
  chunks: TranscriptChunk[],
  options: ChunkOptions = {},
): TranscriptChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fullText = chunks.map((c) => c.text).join(" ");
  const sentences = splitSentences(fullText);

  const result: TranscriptChunk[] = [];
  let currentChunk = "";
  let currentStart = 0;
  let currentEnd = 0;
  let charCount = 0;

  for (const sentence of sentences) {
    const wouldExceed = currentChunk.length + sentence.length > opts.maxSize!;
    const atTarget = currentChunk.length >= opts.targetSize!;

    if (wouldExceed || (atTarget && sentence.endsWith("."))) {
      if (currentChunk.trim()) {
        result.push({
          start: currentStart,
          end: currentEnd,
          text: currentChunk.trim(),
        });
        currentStart = currentEnd;
        currentChunk = "";
      }
    }

    currentChunk += sentence + " ";
    charCount += sentence.length;
    currentEnd = (charCount / 5 / 150) * 60; // ~150 wpm, ~5 chars/word
  }

  if (currentChunk.trim()) {
    result.push({
      start: currentStart,
      end: currentEnd,
      text: currentChunk.trim(),
    });
  }

  return result;
}

function splitSentences(text: string): string[] {
  const pattern = /[^.!?]*[.!?]+/g;
  const matches = text.match(pattern);
  return matches || [text];
}

/** Adds text overlap between adjacent chunks for better context continuity. */
export function createOverlappingChunks(
  chunks: TranscriptChunk[],
  overlapChars: number = 100,
): TranscriptChunk[] {
  if (chunks.length <= 1) return chunks;

  return chunks.map((chunk, i) => {
    let text = chunk.text;

    if (i > 0) {
      const prevText = chunks[i - 1].text;
      const overlap = prevText.slice(-overlapChars);
      text = `...${overlap} ${text}`;
    }

    if (i < chunks.length - 1) {
      const nextText = chunks[i + 1].text;
      const overlap = nextText.slice(0, overlapChars);
      text = `${text} ${overlap}...`;
    }

    return { ...chunk, text };
  });
}

/** Groups chunks into ~5 sequential sections. Use analyzer for semantic grouping. */
export function groupByTopic(
  chunks: TranscriptChunk[],
): Map<string, TranscriptChunk[]> {
  const groups = new Map<string, TranscriptChunk[]>();
  const groupSize = Math.ceil(chunks.length / 5);

  for (let i = 0; i < chunks.length; i++) {
    const groupIndex = Math.floor(i / groupSize);
    const key = `section_${groupIndex + 1}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(chunks[i]);
  }

  return groups;
}
