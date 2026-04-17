/**
 * @fileoverview Whisper transcription with local and API support
 * @module transcription/whisper
 */

import { spawn } from "child_process";
import {
  createReadStream,
  readFileSync,
  unlinkSync,
  existsSync,
  mkdirSync,
} from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { complete, resolveApiKey, hasApiKey } from "../gateway/index.js";
import { extractVideoId } from "./youtube.js";
import type { TranscriptChunk } from "../gateway/types.js";

/** Available Whisper model sizes (local only) */
export type WhisperModel =
  | "tiny"
  | "base"
  | "small"
  | "medium"
  | "large"
  | "turbo";

/** Whisper transcription options */
export interface WhisperOptions {
  model?: string;
  whisperModel?: WhisperModel;
  language?: string;
  preferLocal?: boolean;
  onProgress?: (stage: string, progress: number) => void;
}

/** Whisper segment from JSON output */
interface WhisperSegment {
  id?: number;
  start: number;
  end: number;
  text: string;
}

/** Whisper JSON response format */
interface WhisperResponse {
  text: string;
  segments: WhisperSegment[];
  language?: string;
  duration?: number;
}

const YT_DLP_INSTALL_MSG =
  "yt-dlp is not installed. Install with:\n" +
  "  Windows: winget install yt-dlp\n" +
  "  macOS: brew install yt-dlp\n" +
  "  Linux: pip install yt-dlp";

const LOCAL_WHISPER_INSTALL_MSG =
  "Local Whisper not found. Install with:\n" +
  "  pip install -U openai-whisper\n" +
  "Also requires FFmpeg: https://ffmpeg.org/download.html";

/** Check if a command is available on the system */
async function isCommandAvailable(
  cmd: string,
  args: string[] = ["--version"],
): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { stdio: "ignore" });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

/** Check if local Whisper CLI is available */
export async function checkLocalWhisperAvailable(): Promise<boolean> {
  return isCommandAvailable("whisper", ["--help"]);
}

/** Check if yt-dlp is available on the system */
export async function checkYtDlpAvailable(): Promise<boolean> {
  return isCommandAvailable("yt-dlp");
}

/** Check all Whisper-related dependencies */
export async function checkWhisperDependencies(): Promise<{
  ytdlp: boolean;
  localWhisper: boolean;
  apiKey: boolean;
  canTranscribe: boolean;
}> {
  const [ytdlp, localWhisper] = await Promise.all([
    checkYtDlpAvailable(),
    checkLocalWhisperAvailable(),
  ]);
  const apiKey = hasApiKey("openai");

  return {
    ytdlp,
    localWhisper,
    apiKey,
    canTranscribe: ytdlp && (localWhisper || apiKey),
  };
}

/** Downloads audio from YouTube using yt-dlp */
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

    ytdlp.stdout.on("data", (data) => {
      const match = data.toString().match(/(\d+\.?\d*)%/);
      if (match && onProgress) onProgress(parseFloat(match[1]));
    });

    ytdlp.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ytdlp.on("close", (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        const isNotFound =
          stderr.includes("command not found") ||
          stderr.includes("not recognized");
        reject(
          new Error(
            isNotFound
              ? YT_DLP_INSTALL_MSG
              : `Audio download failed: ${stderr || "Unknown error"}`,
          ),
        );
      }
    });

    ytdlp.on("error", (err) => {
      const isNotFound = (err as NodeJS.ErrnoException).code === "ENOENT";
      reject(new Error(isNotFound ? YT_DLP_INSTALL_MSG : err.message));
    });
  });
}

/** Transcribe using local Whisper CLI (keyless) */
async function transcribeLocal(
  audioPath: string,
  options: { model?: WhisperModel; language?: string } = {},
): Promise<WhisperResponse> {
  const outputDir = join(tmpdir(), "yt2blog-whisper");
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  const model = options.model || "base";
  const baseName = audioPath
    .replace(/\.[^/.]+$/, "")
    .split(/[/\\]/)
    .pop();
  const jsonPath = join(outputDir, `${baseName}.json`);

  return new Promise((resolve, reject) => {
    const args = [
      audioPath,
      "--model",
      model,
      "--output_format",
      "json",
      "--output_dir",
      outputDir,
    ];

    if (options.language) {
      args.push("--language", options.language);
    }

    const whisper = spawn("whisper", args);
    let stderr = "";

    whisper.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    whisper.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Whisper failed: ${stderr || "Unknown error"}`));
        return;
      }

      try {
        const jsonContent = readFileSync(jsonPath, "utf-8");
        const result = JSON.parse(jsonContent) as WhisperResponse;
        try {
          unlinkSync(jsonPath);
        } catch {}
        resolve(result);
      } catch (err) {
        reject(new Error(`Failed to read Whisper output: ${err}`));
      }
    });

    whisper.on("error", (err) => {
      const isNotFound = (err as NodeJS.ErrnoException).code === "ENOENT";
      reject(new Error(isNotFound ? LOCAL_WHISPER_INSTALL_MSG : err.message));
    });
  });
}

/** Transcribe using OpenAI Whisper API (requires key) */
async function transcribeAPI(
  audioPath: string,
  apiKey: string,
  options: { language?: string } = {},
): Promise<WhisperResponse> {
  const FormData = (await import("form-data")).default;
  const fetch = (await import("node-fetch")).default;

  const form = new FormData();
  form.append("file", createReadStream(audioPath));
  form.append("model", "whisper-1");
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

/** Transcribe a YouTube video using Whisper (auto-selects local or API) */
export async function transcribeWithWhisper(
  videoUrl: string,
  options: WhisperOptions = {},
): Promise<TranscriptChunk[]> {
  const { onProgress, language, whisperModel, preferLocal = true } = options;

  const deps = await checkWhisperDependencies();

  if (!deps.ytdlp) {
    throw new Error(YT_DLP_INSTALL_MSG);
  }

  if (!deps.localWhisper && !deps.apiKey) {
    throw new Error(
      "No Whisper backend available.\n\n" +
        "Option 1 (Free, Local):\n" +
        LOCAL_WHISPER_INSTALL_MSG +
        "\n\n" +
        "Option 2 (Paid, API):\n" +
        "  Set OPENAI_API_KEY or AI_GATEWAY_API_KEY environment variable",
    );
  }

  const useLocal = preferLocal
    ? deps.localWhisper
    : deps.localWhisper && !deps.apiKey;

  const tempDir = join(tmpdir(), "yt2blog");
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const videoId = extractVideoId(videoUrl);
  if (!videoId) throw new Error(`Invalid YouTube URL: ${videoUrl}`);

  const audioPath = join(tempDir, `${videoId}.mp3`);

  try {
    onProgress?.("downloading", 0);
    await downloadAudio(videoUrl, audioPath, (p) =>
      onProgress?.("downloading", p),
    );
    onProgress?.("downloading", 100);

    onProgress?.("transcribing", 0);

    let result: WhisperResponse;
    if (useLocal) {
      result = await transcribeLocal(audioPath, {
        model: whisperModel,
        language,
      });
    } else {
      const apiKey = resolveApiKey("openai");
      if (!apiKey) throw new Error("OpenAI API key not found");
      result = await transcribeAPI(audioPath, apiKey, { language });
    }

    onProgress?.("transcribing", 100);

    return result.segments.map((seg) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    }));
  } finally {
    try {
      if (existsSync(audioPath)) unlinkSync(audioPath);
    } catch {}
  }
}

/** Clean and structure raw transcript text using AI */
export async function cleanTranscript(
  rawText: string,
  model: string,
): Promise<string> {
  const prompt = `Clean and format this transcript. Fix punctuation, remove filler words (um, uh, like, you know), and organize into paragraphs. Keep the content accurate and preserve the speaker's meaning.

Transcript:
${rawText}

Cleaned transcript:`;

  return complete(model, prompt);
}

/** Split transcript into chunks with estimated timestamps */
export function splitIntoChunks(
  text: string,
  targetChunkSize = 500,
): TranscriptChunk[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: TranscriptChunk[] = [];
  let currentChunk = "";
  let chunkStart = 0;
  const charsPerSecond = (150 * 5) / 60; // ~150 wpm, ~5 chars/word

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
      chunkStart += duration;
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
