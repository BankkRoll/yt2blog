/**
 * @fileoverview Whisper API integration for audio transcription
 * @module transcription/whisper
 */

import { spawn } from "child_process";
import { createReadStream, unlinkSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { complete } from "../gateway/index.js";
import { extractVideoId } from "./youtube.js";
import type { TranscriptChunk, BYOKConfig } from "../gateway/types.js";

/** Whisper transcription options. */
export interface WhisperOptions {
  model?: string;
  byok?: BYOKConfig;
  whisperModel?: "tiny" | "base" | "small" | "medium" | "large-v3";
  language?: string;
  onProgress?: (stage: string, progress: number) => void;
}

interface WhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

interface WhisperResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments: WhisperSegment[];
}

async function downloadAudio(
  videoUrl: string,
  outputPath: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "-o",
      outputPath,
      "--no-playlist",
      "--no-warnings",
      "--progress",
      videoUrl,
    ];

    const ytdlp = spawn("yt-dlp", args);
    let stderr = "";
    let progressMatch: RegExpMatchArray | null;

    ytdlp.stdout.on("data", (data) => {
      const output = data.toString();
      progressMatch = output.match(/(\d+\.?\d*)%/);
      if (progressMatch && onProgress) {
        onProgress(parseFloat(progressMatch[1]));
      }
    });

    ytdlp.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ytdlp.on("close", (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        if (
          stderr.includes("command not found") ||
          stderr.includes("not recognized")
        ) {
          reject(
            new Error(
              "yt-dlp is not installed. Install it with:\n" +
                "  Windows: winget install yt-dlp\n" +
                "  macOS: brew install yt-dlp\n" +
                "  Linux: pip install yt-dlp",
            ),
          );
        } else {
          reject(
            new Error(`Audio download failed: ${stderr || "Unknown error"}`),
          );
        }
      }
    });

    ytdlp.on("error", (error) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        reject(
          new Error(
            "yt-dlp is not installed. Install it with:\n" +
              "  Windows: winget install yt-dlp\n" +
              "  macOS: brew install yt-dlp\n" +
              "  Linux: pip install yt-dlp",
          ),
        );
      } else {
        reject(error);
      }
    });
  });
}

async function callWhisperAPI(
  audioPath: string,
  apiKey: string,
  options: {
    model?: string;
    language?: string;
  } = {},
): Promise<WhisperResponse> {
  const FormData = (await import("form-data")).default;
  const fetch = (await import("node-fetch")).default;

  const form = new FormData();
  form.append("file", createReadStream(audioPath));
  form.append("model", options.model || "whisper-1");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "segment");

  if (options.language) {
    form.append("language", options.language);
  }

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...form.getHeaders(),
      },
      body: form,
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${response.status} - ${error}`);
  }

  return response.json() as Promise<WhisperResponse>;
}

function getOpenAIKey(byok?: BYOKConfig): string {
  if (byok?.openai) {
    return byok.openai;
  }

  const envKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (envKey) {
    return envKey;
  }

  throw new Error(
    "OpenAI API key required for Whisper transcription.\n" +
      "Set OPENAI_API_KEY in your environment or provide it via BYOK.",
  );
}

/** Transcribe a YouTube video using OpenAI Whisper API. */
export async function transcribeWithWhisper(
  videoUrl: string,
  options: WhisperOptions = {},
): Promise<TranscriptChunk[]> {
  const { onProgress, language, byok } = options;
  const apiKey = getOpenAIKey(byok);

  const tempDir = join(tmpdir(), "yt2blog");
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error(`Invalid YouTube URL: ${videoUrl}`);
  }
  const audioPath = join(tempDir, `${videoId}.mp3`);

  try {
    onProgress?.("downloading", 0);
    await downloadAudio(videoUrl, audioPath, (progress) => {
      onProgress?.("downloading", progress);
    });
    onProgress?.("downloading", 100);

    onProgress?.("transcribing", 0);
    const result = await callWhisperAPI(audioPath, apiKey, {
      model: "whisper-1",
      language,
    });
    onProgress?.("transcribing", 100);

    const chunks: TranscriptChunk[] = result.segments.map((segment) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text.trim(),
    }));

    return chunks;
  } finally {
    try {
      if (existsSync(audioPath)) {
        unlinkSync(audioPath);
      }
    } catch {}
  }
}

/** Clean and structure raw transcript text using AI. */
export async function cleanTranscript(
  rawText: string,
  model: string,
  byok?: BYOKConfig,
): Promise<string> {
  const prompt = `Clean and format this transcript. Fix punctuation, remove filler words (um, uh, like, you know), and organize into paragraphs. Keep the content accurate and preserve the speaker's meaning.

Transcript:
${rawText}

Cleaned transcript:`;

  return complete(model, prompt, byok);
}

/** Split transcript into chunks with estimated timestamps. */
export function splitIntoChunks(
  text: string,
  targetChunkSize: number = 500,
): TranscriptChunk[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: TranscriptChunk[] = [];
  let currentChunk = "";
  let chunkStart = 0;
  const charsPerSecond = (150 * 5) / 60;

  for (const sentence of sentences) {
    if (
      currentChunk.length + sentence.length > targetChunkSize &&
      currentChunk
    ) {
      const duration = currentChunk.length / charsPerSecond;
      chunks.push({
        start: chunkStart,
        end: chunkStart + duration,
        text: currentChunk.trim(),
      });
      chunkStart = chunkStart + duration;
      currentChunk = "";
    }
    currentChunk += sentence;
  }

  if (currentChunk.trim()) {
    const duration = currentChunk.length / charsPerSecond;
    chunks.push({
      start: chunkStart,
      end: chunkStart + duration,
      text: currentChunk.trim(),
    });
  }

  return chunks;
}

/** Check if yt-dlp is available on the system. */
export async function checkYtDlpAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const ytdlp = spawn("yt-dlp", ["--version"]);

    ytdlp.on("close", (code) => {
      resolve(code === 0);
    });

    ytdlp.on("error", () => {
      resolve(false);
    });
  });
}

/** Check if Whisper dependencies (yt-dlp, API key) are available. */
export async function checkWhisperDependencies(): Promise<{
  ytdlp: boolean;
  apiKey: boolean;
}> {
  const ytdlpAvailable = await checkYtDlpAvailable();
  const hasApiKey = !!(
    process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY
  );

  return {
    ytdlp: ytdlpAvailable,
    apiKey: hasApiKey,
  };
}
