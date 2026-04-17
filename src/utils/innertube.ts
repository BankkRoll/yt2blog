/**
 * @fileoverview Shared InnerTube API configuration constants
 * @module utils/innertube
 */

/** InnerTube API endpoint for player requests */
export const INNERTUBE_API_URL =
  "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

/** InnerTube client version for API requests */
export const INNERTUBE_CLIENT_VERSION = "20.10.38";

/** InnerTube context object for API requests */
export const INNERTUBE_CONTEXT = {
  client: {
    clientName: "ANDROID",
    clientVersion: INNERTUBE_CLIENT_VERSION,
  },
} as const;

/** User agent string for InnerTube API requests */
export const INNERTUBE_USER_AGENT = `com.google.android.youtube/${INNERTUBE_CLIENT_VERSION} (Linux; U; Android 14)`;

/** Standard web user agent for YouTube page scraping */
export const YOUTUBE_WEB_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)";

/** oEmbed API endpoint for video metadata */
export const YOUTUBE_OEMBED_URL = "https://www.youtube.com/oembed";
