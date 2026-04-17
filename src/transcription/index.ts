/**
 * @fileoverview Main transcription module with YouTube and Whisper support
 * @module transcription
 */

import {
  fetchTranscript,
  getFullTranscript,
  extractVideoId,
} from "./youtube.js";
import { cleanTranscript, splitIntoChunks } from "./whisper.js";

/** Result from transcribing a video. */
export interface TranscriptionResult {
  videoId: string;
  chunks: Array<{ start: number; end: number; text: string }>;
  fullText: string;
  duration: number;
  source: "youtube" | "whisper";
}

/** Fetches transcript from YouTube, with optional AI cleaning. */
export async function getTranscript(videoUrl, options: any = {}) {
  const opts = options || {};
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error(`Invalid YouTube URL: ${videoUrl}`);
  }

  try {
    const chunks = await fetchTranscript(videoUrl);
    const fullText = chunks.map((c) => c.text).join(" ");
    const lastChunk = chunks[chunks.length - 1];
    const duration = lastChunk
      ? (lastChunk.offset + lastChunk.duration) / 1000
      : 0;

    let finalText = fullText;
    if (opts.cleanWithAI && opts.model) {
      finalText = await cleanTranscript(fullText, opts.model, opts.byok);
    }

    const formattedChunks = opts.cleanWithAI
      ? splitIntoChunks(finalText)
      : chunks.map((c) => ({
          start: c.offset / 1000,
          end: (c.offset + c.duration) / 1000,
          text: c.text,
        }));

    return {
      videoId,
      chunks: formattedChunks,
      fullText: finalText,
      duration,
      source: "youtube",
    };
  } catch (error) {
    throw new Error(
      `Transcript not available. ${error instanceof Error ? error.message : ""}`,
    );
  }
}

export {
  extractVideoId,
  fetchTranscript,
  getFullTranscript,
} from "./youtube.js";
export { cleanTranscript, splitIntoChunks } from "./whisper.js";
