/**
 * @fileoverview YouTube transcript fetching via InnerTube API and web scraping
 * @module transcription/youtube
 */

import {
  INNERTUBE_API_URL,
  INNERTUBE_CONTEXT,
  INNERTUBE_USER_AGENT,
  YOUTUBE_WEB_USER_AGENT,
} from "../utils/innertube.js";

/** Configuration options for transcript fetching */
export interface TranscriptConfig {
  lang?: string;
  fetch?: typeof fetch;
}

/** Individual transcript entry */
export interface TranscriptEntry {
  text: string;
  duration: number;
  offset: number;
  lang: string;
}

/** Caption track from YouTube API */
interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
}

const RE_YOUTUBE =
  /(?:youtube\.com\/(?:shorts\/|[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
const RE_XML_TRANSCRIPT =
  /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;

export class YoutubeTranscriptError extends Error {
  constructor(message: string) {
    super(`[YoutubeTranscript] 🚨 ${message}`);
  }
}

export class YoutubeTranscriptTooManyRequestError extends YoutubeTranscriptError {
  constructor() {
    super(
      "YouTube is receiving too many requests from this IP and now requires solving a captcha to continue",
    );
  }
}

export class YoutubeTranscriptVideoUnavailableError extends YoutubeTranscriptError {
  constructor(videoId: string) {
    super(`The video is no longer available (${videoId})`);
  }
}

export class YoutubeTranscriptDisabledError extends YoutubeTranscriptError {
  constructor(videoId: string) {
    super(`Transcript is disabled on this video (${videoId})`);
  }
}

export class YoutubeTranscriptNotAvailableError extends YoutubeTranscriptError {
  constructor(videoId: string) {
    super(`No transcripts are available for this video (${videoId})`);
  }
}

export class YoutubeTranscriptNotAvailableLanguageError extends YoutubeTranscriptError {
  constructor(lang: string, availableLangs: string[], videoId: string) {
    super(
      `No transcripts are available in ${lang} this video (${videoId}). Available languages: ${availableLangs.join(
        ", ",
      )}`,
    );
  }
}

/** YouTube transcript retrieval with InnerTube API and web scraping fallback. */
export class YoutubeTranscript {
  /** Fetch transcript from a YouTube video. */
  static async fetchTranscript(
    videoId: string,
    config?: TranscriptConfig,
  ): Promise<TranscriptEntry[]> {
    const identifier = this.retrieveVideoId(videoId);

    const innerTubeResult = await this.fetchViaInnerTube(identifier, config);
    if (innerTubeResult) {
      return innerTubeResult;
    }
    return this.fetchViaWebPage(identifier, videoId, config);
  }

  static async fetchViaInnerTube(
    identifier: string,
    config?: TranscriptConfig,
  ): Promise<TranscriptEntry[] | undefined> {
    try {
      const fetchFn = config?.fetch ?? fetch;
      const resp = await fetchFn(INNERTUBE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": INNERTUBE_USER_AGENT,
        },
        body: JSON.stringify({
          context: INNERTUBE_CONTEXT,
          videoId: identifier,
        }),
      });

      if (!resp.ok) return undefined;

      const data = await resp.json();
      const captionTracks =
        data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

      if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
        return undefined;
      }

      return this.fetchTranscriptFromTracks(captionTracks, identifier, config);
    } catch {
      return undefined;
    }
  }

  static async fetchViaWebPage(
    identifier: string,
    originalVideoId: string,
    config?: TranscriptConfig,
  ): Promise<TranscriptEntry[]> {
    const fetchFn = config?.fetch ?? fetch;
    const videoPageResponse = await fetchFn(
      `https://www.youtube.com/watch?v=${identifier}`,
      {
        headers: {
          ...(config?.lang && { "Accept-Language": config.lang }),
          "User-Agent": YOUTUBE_WEB_USER_AGENT,
        },
      },
    );
    const videoPageBody = await videoPageResponse.text();

    if (videoPageBody.includes('class="g-recaptcha"')) {
      throw new YoutubeTranscriptTooManyRequestError();
    }
    if (!videoPageBody.includes('"playabilityStatus":')) {
      throw new YoutubeTranscriptVideoUnavailableError(originalVideoId);
    }

    const playerResponse = this.parseInlineJson(
      videoPageBody,
      "ytInitialPlayerResponse",
    );
    const captionTracks =
      playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
      throw new YoutubeTranscriptDisabledError(originalVideoId);
    }

    return this.fetchTranscriptFromTracks(
      captionTracks,
      originalVideoId,
      config,
    );
  }

  static parseInlineJson(html: string, globalName: string): any {
    const startToken = `var ${globalName} = `;
    const startIndex = html.indexOf(startToken);
    if (startIndex === -1) return null;

    const jsonStart = startIndex + startToken.length;
    let depth = 0;
    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === "{") depth++;
      else if (html[i] === "}") {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(html.slice(jsonStart, i + 1));
          } catch {
            return null;
          }
        }
      }
    }
    return null;
  }

  static async fetchTranscriptFromTracks(
    captionTracks: CaptionTrack[],
    videoId: string,
    config?: TranscriptConfig,
  ): Promise<TranscriptEntry[]> {
    if (
      config?.lang &&
      !captionTracks.some((track) => track.languageCode === config?.lang)
    ) {
      throw new YoutubeTranscriptNotAvailableLanguageError(
        config?.lang,
        captionTracks.map((track) => track.languageCode),
        videoId,
      );
    }

    const track = config?.lang
      ? captionTracks.find((track) => track.languageCode === config?.lang)
      : captionTracks[0];

    const transcriptURL = track.baseUrl;

    try {
      const captionUrl = new URL(transcriptURL);
      if (!captionUrl.hostname.endsWith(".youtube.com")) {
        throw new YoutubeTranscriptNotAvailableError(videoId);
      }
    } catch (e) {
      if (e instanceof YoutubeTranscriptError) throw e;
      throw new YoutubeTranscriptNotAvailableError(videoId);
    }
    const fetchFn = config?.fetch ?? fetch;
    const transcriptResponse = await fetchFn(transcriptURL, {
      headers: {
        ...(config?.lang && { "Accept-Language": config.lang }),
        "User-Agent": YOUTUBE_WEB_USER_AGENT,
      },
    });
    if (!transcriptResponse.ok) {
      throw new YoutubeTranscriptNotAvailableError(videoId);
    }
    const transcriptBody = await transcriptResponse.text();
    const lang = config?.lang ?? captionTracks[0].languageCode;

    return this.parseTranscriptXml(transcriptBody, lang);
  }

  static parseTranscriptXml(xml: string, lang: string): TranscriptEntry[] {
    const results: TranscriptEntry[] = [];

    // srv3 format: <p t="ms" d="ms"><s>word</s>...</p>
    const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    while ((match = pRegex.exec(xml)) !== null) {
      const startMs = parseInt(match[1], 10);
      const durMs = parseInt(match[2], 10);
      const inner = match[3];

      let text = "";
      const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
      let sMatch;
      while ((sMatch = sRegex.exec(inner)) !== null) {
        text += sMatch[1];
      }
      if (!text) {
        text = inner.replace(/<[^>]+>/g, "");
      }
      text = this.decodeEntities(text).trim();

      if (text) {
        results.push({
          text,
          duration: durMs,
          offset: startMs,
          lang,
        });
      }
    }

    if (results.length > 0) return results;

    // Classic format: <text start="s" dur="s">content</text>
    const classicResults = [...xml.matchAll(RE_XML_TRANSCRIPT)];
    return classicResults.map((result) => ({
      text: this.decodeEntities(result[3]),
      duration: parseFloat(result[2]),
      offset: parseFloat(result[1]),
      lang,
    }));
  }

  static decodeEntities(text: string): string {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
        String.fromCodePoint(parseInt(hex, 16)),
      )
      .replace(/&#(\d+);/g, (_, dec) =>
        String.fromCodePoint(parseInt(dec, 10)),
      );
  }

  static retrieveVideoId(videoId: string): string {
    if (videoId.length === 11) {
      return videoId;
    }
    const matchId = videoId.match(RE_YOUTUBE);
    if (matchId && matchId.length) {
      return matchId[1];
    }
    throw new YoutubeTranscriptError(
      "Impossible to retrieve Youtube video ID.",
    );
  }
}

/** Fetch transcript from YouTube. */
export function fetchTranscript(
  videoId: string,
  config: TranscriptConfig = {},
): Promise<TranscriptEntry[]> {
  return YoutubeTranscript.fetchTranscript(videoId, config);
}

/** Extract video ID from various YouTube URL formats. */
export function extractVideoId(url: string): string | null {
  if (url.length === 11) {
    return url;
  }
  const match = url.match(RE_YOUTUBE);
  return match ? match[1] : null;
}

/** Get the full transcript as a single string. */
export async function getFullTranscript(videoUrl: string): Promise<string> {
  const transcript = await fetchTranscript(videoUrl);
  return transcript.map((item) => item.text).join(" ");
}

/** Video info extracted from transcript */
export interface VideoInfo {
  videoId: string;
  estimatedDuration: number;
  chunkCount: number;
}

/** Get video metadata from transcript. */
export async function getVideoInfo(videoUrl: string): Promise<VideoInfo> {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error(`Invalid YouTube URL: ${videoUrl}`);
  }

  const transcript = await fetchTranscript(videoUrl);
  const lastItem = transcript[transcript.length - 1];

  return {
    videoId,
    estimatedDuration: lastItem
      ? (lastItem.offset + lastItem.duration) / 1000
      : 0,
    chunkCount: transcript.length,
  };
}
