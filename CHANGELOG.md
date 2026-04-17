# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-04-17

### Added

- **Comprehensive input/output validation** with Zod schemas
  - `src/utils/validation.ts` - YouTube URL, model string, blog config, content analysis, blog outline schemas
  - `YouTubeUrlSchema` validates all YouTube URL formats (watch, shorts, embed, youtu.be)
  - `ModelStringSchema` validates provider/model format
  - `ContentAnalysisSchema`, `BlogOutlineSchema`, `SEOMetadataSchema` for LLM output validation
  - `validate()`, `validateSafe()`, `parseAndValidate()` helper functions
- **Unified time formatting utilities** (`src/utils/time.ts`)
  - `formatSeconds()` - HH:MM:SS formatting
  - `formatDuration()` - Human-readable duration (e.g., "2m 30s")
  - `parseTimestamp()` - Parse timestamp strings to seconds
  - `estimateReadingTime()` - Reading time estimation
- **Structured logging throughout pipeline**
  - All pipeline modules now use `getLogger()` for consistent logging
  - Added logging to `analyzer.ts`, `outliner.ts`, `generator.ts`, `refiner.ts`
  - Debug-level logs for operation timing, token usage, and progress
  - Error-level logs with context for failures
- **Shared InnerTube configuration** (`src/utils/innertube.ts`)
  - Centralized YouTube API constants: `INNERTUBE_API_URL`, `INNERTUBE_CONTEXT`, `INNERTUBE_USER_AGENT`
  - `YOUTUBE_WEB_USER_AGENT` for web scraping fallback
  - `YOUTUBE_OEMBED_URL` for metadata fetching
  - Eliminates duplicate configuration across `youtube.ts` and `metadata.ts`
- **Request timeout support** in gateway
  - `timeoutMs` option in `GenerateOptions` (default: 120 seconds)
  - AbortController-based timeout handling
  - Clear error messages on timeout: "Request timed out after Xms for model Y"
- **Chunk/section ratio validation** in generator
  - `validateChunkSectionRatio()` prevents empty sections when transcript is short
  - Automatically adjusts section count with warning log
  - Throws error if no transcript chunks available
- **Token usage accumulation** in pipeline
  - `SectionResult` and `GeneratorResult` types track per-section usage
  - `generateAllSections()` returns accumulated `totalUsage`
  - Pipeline aggregates token counts across all generation calls

### Changed

- **Gateway type safety improvements**
  - Removed `as any` casts in favor of proper type assertions
  - Added model string validation before API calls
  - Improved SDK type compatibility handling (V2/V3 format)
  - Better error messages for missing API keys
- **Pipeline robustness improvements**
  - Input validation at pipeline entry point
  - Error context (statusText) in step failures
  - Consistent cache key generation across all operations
  - Progress tracking with meaningful status messages
- **Improved `completeJSON()` validation logging**
  - Warns when called without schema validation (recommended for production)
  - Debug logs for schema validation and unvalidated response keys

### Fixed

- Type compatibility issues with Vercel AI SDK v2/v3 response formats
- Cache key inconsistency between `runPipeline` and `streamPipeline`
- Missing error context in pipeline step failures
- Duplicate InnerTube configuration across transcription modules
- Incorrect user agent constant names in `youtube.ts` imports

---

## [1.0.1] - 2026-04-17

### Changed

- **Simplified API key handling** - Removed BYOK config in favor of environment variables only
  - Use `AI_GATEWAY_API_KEY` for all providers, or provider-specific keys (e.g., `OPENAI_API_KEY`)
  - Cleaner API: functions no longer accept `byok` parameter
- **Code quality improvements**
  - Removed barrel exports for cleaner imports
  - Fixed singleton patterns in cache and logger utilities
  - Added DRY helper `getCachedOrFetch` for cached operations
  - Simplified type exports in `lib.ts`

### Removed

- `BYOKConfig` type - no longer needed
- `byok` parameter from all public API functions
- Barrel export files (`src/cli/components/index.ts`, `src/utils/index.ts`)

### Added

- `src/lib.ts` - Clean library entry point
- `src/utils/config.ts` - Configuration file support
- `src/utils/cache.ts` - File-based caching with TTL
- `src/utils/logger.ts` - Structured logging
- `src/utils/retry.ts` - Exponential backoff retry logic
- `src/pipeline/formatter.ts` - Output formatting utilities
- `src/transcription/metadata.ts` - Video metadata extraction
- `API.md` - Comprehensive API documentation
- `CLI.md` - CLI usage documentation
- `tsup.config.ts` - Dual build configuration (lib + cli)

## [1.0.0] - 2026-04-17

Initial release.

### Features

- YouTube transcript fetching via InnerTube API
- Whisper API fallback for videos without captions
- AI-powered blog generation pipeline
- Dynamic model selection with search, sort, and filter
- 5 blog styles: SEO, Medium, Newsletter, Thread, Technical
- 9 themes: Default, Dracula, Nord, Catppuccin, Tokyo Night, Monokai, High Contrast, Neo Brutalism, Windows 98
- Real-time streaming output
- Multi-provider support via environment variables
- Interactive CLI with Ink/React
- Cross-platform clipboard support
- Markdown and HTML output formats

### Supported Providers

- OpenAI
- Anthropic
- Google
- Groq
- Mistral
- Cohere
- Perplexity
- xAI
- DeepSeek
