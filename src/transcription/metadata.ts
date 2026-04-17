/**
 * @fileoverview YouTube video metadata fetching via oEmbed and InnerTube APIs
 * @module transcription/metadata
 */

import { extractVideoId } from "./youtube.js";
import {
  INNERTUBE_API_URL,
  INNERTUBE_CONTEXT,
  INNERTUBE_USER_AGENT,
  YOUTUBE_OEMBED_URL,
} from "../utils/innertube.js";
import { formatSeconds } from "../utils/time.js";

/** Video metadata from YouTube */
export interface VideoMetadata {
  videoId: string;
  title: string;
  author: string;
  authorUrl: string;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  publishedAt?: string;
  duration?: number;
  viewCount?: number;
  description?: string;
}

/** oEmbed response from YouTube */
interface OEmbedResponse {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
}

/**
 * Fetches video metadata using YouTube's oEmbed API (fast, reliable).
 * Falls back to InnerTube for additional details.
 */
export async function getVideoMetadata(
  videoUrl: string,
  options: { includeDescription?: boolean } = {},
): Promise<VideoMetadata> {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error(`Invalid YouTube URL: ${videoUrl}`);
  }

  const oembedData = await fetchOEmbed(videoId);

  let extraData: Partial<VideoMetadata> = {};
  if (options.includeDescription) {
    extraData = await fetchInnerTubeMetadata(videoId);
  }

  return {
    videoId,
    title: oembedData.title,
    author: oembedData.author_name,
    authorUrl: oembedData.author_url,
    thumbnailUrl: oembedData.thumbnail_url,
    thumbnailWidth: oembedData.thumbnail_width,
    thumbnailHeight: oembedData.thumbnail_height,
    ...extraData,
  };
}

/** Fetches basic metadata via oEmbed API */
async function fetchOEmbed(videoId: string): Promise<OEmbedResponse> {
  const url = `${YOUTUBE_OEMBED_URL}?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch video metadata: ${response.status}`);
  }

  return response.json() as Promise<OEmbedResponse>;
}

/** Fetches extended metadata via InnerTube API */
async function fetchInnerTubeMetadata(
  videoId: string,
): Promise<Partial<VideoMetadata>> {
  try {
    const response = await fetch(INNERTUBE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": INNERTUBE_USER_AGENT,
      },
      body: JSON.stringify({
        context: INNERTUBE_CONTEXT,
        videoId,
      }),
    });

    if (!response.ok) return {};

    const data = await response.json();
    const videoDetails = data?.videoDetails;

    if (!videoDetails) return {};

    return {
      description: videoDetails.shortDescription,
      duration: parseInt(videoDetails.lengthSeconds, 10) || undefined,
      viewCount: parseInt(videoDetails.viewCount, 10) || undefined,
      publishedAt: data?.microformat?.playerMicroformatRenderer?.publishDate,
    };
  } catch {
    return {};
  }
}

/** Generates a high-quality thumbnail URL for a video */
export function getThumbnailUrl(
  videoId: string,
  quality: "default" | "medium" | "high" | "standard" | "maxres" = "maxres",
): string {
  const qualityMap: Record<string, string> = {
    default: "default",
    medium: "mqdefault",
    high: "hqdefault",
    standard: "sddefault",
    maxres: "maxresdefault",
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/** Formats video duration from seconds to human-readable string */
export function formatDuration(seconds: number): string {
  return formatSeconds(seconds);
}

/** Formats view count with K/M suffixes */
export function formatViewCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M views`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K views`;
  }
  return `${count} views`;
}
