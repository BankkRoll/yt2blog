/**
 * @fileoverview Blog output formatting with frontmatter and timestamp links
 * @module pipeline/formatter
 */

import type { VideoMetadata } from "../transcription/metadata.js";
import type { BlogStyle } from "../gateway/types.js";

/** Frontmatter data for static site generators */
export interface Frontmatter {
  title: string;
  description?: string;
  date: string;
  author?: string;
  tags?: string[];
  image?: string;
  videoUrl?: string;
  videoId?: string;
  style?: BlogStyle;
  wordCount?: number;
  [key: string]: unknown;
}

/** Format options for blog output */
export interface FormatOptions {
  /** Include YAML frontmatter */
  frontmatter?: boolean;
  /** Custom frontmatter fields */
  customFrontmatter?: Record<string, unknown>;
  /** Embed YouTube timestamp links */
  timestampLinks?: boolean;
  /** Video ID for timestamp links */
  videoId?: string;
  /** Output format */
  format?: "markdown" | "html" | "text";
}

/** Timestamp reference in blog content */
interface TimestampRef {
  seconds: number;
  text: string;
  position: number;
}

/**
 * Generates YAML frontmatter block from metadata.
 */
export function generateFrontmatter(data: Frontmatter): string {
  const lines = ["---"];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${JSON.stringify(item)}`);
      }
    } else if (typeof value === "object") {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    } else if (
      typeof value === "string" &&
      (value.includes(":") || value.includes("#"))
    ) {
      lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("---", "");
  return lines.join("\n");
}

/**
 * Creates frontmatter from video metadata and blog info.
 */
export function createFrontmatterFromMetadata(
  metadata: VideoMetadata,
  blogTitle: string,
  options: {
    description?: string;
    tags?: string[];
    style?: BlogStyle;
    wordCount?: number;
    custom?: Record<string, unknown>;
  } = {},
): Frontmatter {
  return {
    title: blogTitle,
    description: options.description,
    date: new Date().toISOString().split("T")[0],
    author: metadata.author,
    tags: options.tags,
    image: metadata.thumbnailUrl,
    videoUrl: `https://youtube.com/watch?v=${metadata.videoId}`,
    videoId: metadata.videoId,
    style: options.style,
    wordCount: options.wordCount,
    ...options.custom,
  };
}

/**
 * Generates a YouTube timestamp link.
 */
export function createTimestampLink(
  videoId: string,
  seconds: number,
  text?: string,
): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const timeStr =
    hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${minutes}:${secs.toString().padStart(2, "0")}`;

  const url = `https://youtube.com/watch?v=${videoId}&t=${Math.floor(seconds)}`;
  const displayText = text || timeStr;

  return `[${displayText}](${url})`;
}

/**
 * Finds timestamp references in text (e.g., "at 5:30", "around 1:23:45").
 */
export function findTimestampReferences(text: string): TimestampRef[] {
  const refs: TimestampRef[] = [];
  // Matches patterns like "5:30", "1:23:45", "at 5:30", "around 12:34"
  const regex = /(?:at|around|~)?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/gi;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const hours = match[3] ? parseInt(match[1], 10) : 0;
    const minutes = match[3] ? parseInt(match[2], 10) : parseInt(match[1], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : parseInt(match[2], 10);

    refs.push({
      seconds: hours * 3600 + minutes * 60 + seconds,
      text: match[0],
      position: match.index,
    });
  }

  return refs;
}

/**
 * Embeds timestamp links into blog content.
 */
export function embedTimestampLinks(content: string, videoId: string): string {
  const refs = findTimestampReferences(content);
  if (refs.length === 0) return content;

  // Process in reverse order to maintain positions
  let result = content;
  for (const ref of refs.reverse()) {
    const link = createTimestampLink(videoId, ref.seconds, ref.text.trim());
    result =
      result.slice(0, ref.position) +
      link +
      result.slice(ref.position + ref.text.length);
  }

  return result;
}

/**
 * Formats blog content with all options applied.
 */
export function formatBlogOutput(
  content: string,
  options: FormatOptions & {
    metadata?: VideoMetadata;
    title?: string;
    description?: string;
    tags?: string[];
    style?: BlogStyle;
  } = {},
): string {
  let output = content;

  // Embed timestamp links if requested
  if (options.timestampLinks && options.videoId) {
    output = embedTimestampLinks(output, options.videoId);
  }

  // Add frontmatter if requested
  if (options.frontmatter && options.metadata && options.title) {
    const frontmatter = createFrontmatterFromMetadata(
      options.metadata,
      options.title,
      {
        description: options.description,
        tags: options.tags,
        style: options.style,
        wordCount: output.split(/\s+/).length,
        custom: options.customFrontmatter,
      },
    );
    output = generateFrontmatter(frontmatter) + output;
  } else if (options.frontmatter && options.customFrontmatter) {
    // Frontmatter without video metadata
    const frontmatter: Frontmatter = {
      title: options.title || "Untitled",
      date: new Date().toISOString().split("T")[0],
      ...options.customFrontmatter,
    };
    output = generateFrontmatter(frontmatter) + output;
  }

  return output;
}

/**
 * Extracts title from markdown content (first # heading).
 */
export function extractTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Strips frontmatter from markdown content.
 */
export function stripFrontmatter(content: string): string {
  if (!content.startsWith("---")) return content;

  const endIndex = content.indexOf("---", 3);
  if (endIndex === -1) return content;

  return content.slice(endIndex + 3).trim();
}

/**
 * Parses frontmatter from markdown content.
 */
export function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  content: string;
} {
  if (!content.startsWith("---")) {
    return { frontmatter: {}, content };
  }

  const endIndex = content.indexOf("---", 3);
  if (endIndex === -1) {
    return { frontmatter: {}, content };
  }

  const yamlStr = content.slice(3, endIndex).trim();
  const bodyContent = content.slice(endIndex + 3).trim();

  // Simple YAML parsing (key: value pairs)
  const frontmatter: Record<string, unknown> = {};
  for (const line of yamlStr.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();

    // Parse common types
    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (/^\d+$/.test(value as string))
      value = parseInt(value as string, 10);
    else if (/^\d+\.\d+$/.test(value as string))
      value = parseFloat(value as string);
    else if (
      (value as string).startsWith('"') &&
      (value as string).endsWith('"')
    ) {
      value = (value as string).slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return { frontmatter, content: bodyContent };
}
