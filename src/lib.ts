/**
 * @fileoverview Library entry point for programmatic usage
 * @module yt2blog
 *
 * @example
 * ```ts
 * import { runPipeline, getTranscript } from 'yt2blog'
 *
 * const result = await runPipeline({
 *   videoUrl: 'https://youtube.com/watch?v=...',
 *   model: 'openai/gpt-4o',
 *   config: { style: 'seo', sections: 5, wordCount: 1500 }
 * })
 * ```
 */

// ============================================================================
// Pipeline (Main API)
// ============================================================================

export {
  runPipeline,
  streamPipeline,
  type PipelineOptions,
  type PipelineResult,
} from "./pipeline/index.js";

export {
  chunkTranscript,
  createOverlappingChunks,
  groupByTopic,
  type ChunkOptions,
} from "./pipeline/chunker.js";

export {
  analyzeContent,
  analyzeInBatches,
  extractHighlights,
} from "./pipeline/analyzer.js";

export {
  generateOutline,
  validateOutline,
  refineOutline,
  calculateSectionWordCounts,
} from "./pipeline/outliner.js";

export {
  generateSection,
  generateAllSections,
  assembleBlog,
  streamBlog,
  type GeneratorOptions,
} from "./pipeline/generator.js";

export {
  refineBlog,
  generateSEO,
  validateBlog,
  convertToFormat,
  type RefinerOptions,
} from "./pipeline/refiner.js";

// ============================================================================
// Transcription
// ============================================================================

export {
  getTranscript,
  type TranscriptionResult,
  type GetTranscriptOptions,
} from "./transcription/index.js";

export {
  extractVideoId,
  fetchTranscript,
  getFullTranscript,
  getVideoInfo,
  YoutubeTranscript,
  YoutubeTranscriptError,
  YoutubeTranscriptTooManyRequestError,
  YoutubeTranscriptVideoUnavailableError,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptNotAvailableLanguageError,
  type TranscriptConfig,
  type TranscriptEntry,
  type VideoInfo,
} from "./transcription/youtube.js";

export {
  transcribeWithWhisper,
  cleanTranscript,
  splitIntoChunks,
  checkWhisperDependencies,
  checkLocalWhisperAvailable,
  checkYtDlpAvailable,
  type WhisperOptions,
  type WhisperModel,
} from "./transcription/whisper.js";

export {
  getVideoMetadata,
  getThumbnailUrl,
  formatDuration,
  formatViewCount,
  type VideoMetadata,
} from "./transcription/metadata.js";

// ============================================================================
// Gateway (LLM Access)
// ============================================================================

export {
  generate,
  generateStream,
  complete,
  completeJSON,
  getAvailableModels,
  getDefaultModels,
  resolveApiKey,
  hasApiKey,
  getAvailableProviders,
  type GatewayModel,
  type GenerateOptions,
  type GenerateResult,
} from "./gateway/index.js";

// ============================================================================
// Prompts & Styles
// ============================================================================

export {
  getStylePrompt,
  getStyleInfo,
  getAllStyles,
  DEFAULT_MODEL,
  BLOG_STYLES,
  type StyleInfo,
} from "./prompts/styles.js";

// ============================================================================
// Types
// ============================================================================

export type {
  BlogConfig,
  BlogStyle,
  BlogOutline,
  ContentAnalysis,
  Message,
  GatewayOptions,
  GatewayResponse,
  StreamChunk,
  PipelineStep,
  StepStatus,
  TokenUsageStats,
  TranscriptChunk,
  ModelString,
} from "./gateway/types.js";

export { ModelStringSchema } from "./gateway/types.js";

// ============================================================================
// Utilities
// ============================================================================

export {
  Cache,
  getCache,
  CacheNamespaces,
  type CacheOptions,
  type CacheNamespace,
} from "./utils/cache.js";

export {
  withRetry,
  retryable,
  isRetryableError,
  RetryPresets,
  type RetryOptions,
} from "./utils/retry.js";

export {
  loadConfig,
  loadConfigAsync,
  defineConfig,
  QUALITY_PRESETS,
  DEFAULT_CONFIG,
  type Yt2BlogConfig,
  type CustomPrompts,
  type QualityPreset,
  type OutputOptions,
} from "./utils/config.js";

export {
  createLogger,
  getLogger,
  LogLevel,
  type Logger,
  type LoggerOptions,
} from "./utils/logger.js";

// ============================================================================
// Formatting
// ============================================================================

export {
  formatBlogOutput,
  generateFrontmatter,
  createFrontmatterFromMetadata,
  createTimestampLink,
  embedTimestampLinks,
  extractTitle,
  stripFrontmatter,
  parseFrontmatter,
  type Frontmatter,
  type FormatOptions,
} from "./pipeline/formatter.js";
