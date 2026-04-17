# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
