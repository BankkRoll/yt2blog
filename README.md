<img width="1280" height="720" alt="yt2blog-ad" src="https://github.com/user-attachments/assets/a1443f23-db8e-4a01-94d0-c98f9e7ffdd6" />

> Transform any YouTube video into a polished blog post using AI

[![npm version](https://img.shields.io/npm/v/yt2blog.svg)](https://www.npmjs.com/package/yt2blog)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Quick Start

```bash
npx yt2blog
```

That's it! The CLI will guide you through the rest.

```
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║   ██╗   ██╗████████╗ ██████╗ ██████╗  ██╗      ██████╗  ██████╗    ║
║   ╚██╗ ██╔╝╚══██╔══╝╚════██╗ ██╔══██╗ ██║     ██╔═══██╗██╔═════╝   ║
║    ╚████╔╝    ██║    █████╔╝ ██████╔╝ ██║     ██║   ██║██║  ███╗   ║
║     ╚██╔╝     ██║   ██╔═══╝  ██╔══██╗ ██║     ██║   ██║██║   ██║   ║
║      ██║      ██║   ███████╗ ██████╔╝ ███████╗╚██████╔╝╚██████╔╝   ║
║      ╚═╝      ╚═╝   ╚══════╝ ╚═════╝  ╚══════╝ ╚═════╝  ╚═════╝    ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

## Installation

```bash
# Run directly (no install)
npx yt2blog

# Or install globally
npm install -g yt2blog
yt2blog
```

## Configuration

Set your API key before running:

```bash
# Option 1: Inline (easiest)
AI_GATEWAY_API_KEY=your-key npx yt2blog

# Option 2: Export in shell
export AI_GATEWAY_API_KEY=your-key
npx yt2blog

# Option 3: System environment variable
# Set via your OS settings
```

### AI Gateway (Recommended)

Get your key from [Vercel Dashboard](https://vercel.com/dashboard) → AI Gateway

### Provider-Specific Keys

If not using AI Gateway, set keys for the providers you want to use:

| Variable             | Provider   | Notes                                        |
| -------------------- | ---------- | -------------------------------------------- |
| `OPENAI_API_KEY`     | OpenAI     | Also used for Whisper transcription fallback |
| `ANTHROPIC_API_KEY`  | Anthropic  | Claude models                                |
| `GOOGLE_API_KEY`     | Google AI  | Gemini models                                |
| `GROQ_API_KEY`       | Groq       | Fast inference                               |
| `MISTRAL_API_KEY`    | Mistral    |                                              |
| `COHERE_API_KEY`     | Cohere     | Command models                               |
| `PERPLEXITY_API_KEY` | Perplexity | Online search models                         |
| `XAI_API_KEY`        | xAI        | Grok models                                  |
| `DEEPSEEK_API_KEY`   | DeepSeek   |                                              |

### App Settings

| Variable        | Description      | Default   |
| --------------- | ---------------- | --------- |
| `YT2BLOG_THEME` | Default theme ID | `default` |

Available themes: `default`, `dracula`, `nord`, `catppuccin`, `tokyo-night`, `monokai`, `high-contrast`, `neo-brutalism`, `windows-98`

## Features

- **YouTube → Transcript → AI → Blog** - Full pipeline from video URL to polished markdown
- **Dynamic Model Selection** - Search, sort, and filter from 20+ AI models with live pricing info
- **Multiple Blog Styles** - SEO, Medium essay, Newsletter, Twitter thread, Technical breakdown
- **9 Built-in Themes** - Default, Dracula, Nord, Catppuccin, Tokyo Night, Monokai, High Contrast, Neo Brutalism, Windows 98
- **Multi-Provider Support** - Use AI Gateway or provider-specific API keys
- **Interactive CLI** - Beautiful terminal UI with progress tracking

## Supported Models

The model selector dynamically fetches available models from AI Gateway. When offline or without a gateway key, these defaults are available:

| Provider   | Models                                                              |
| ---------- | ------------------------------------------------------------------- |
| OpenAI     | GPT-4o, GPT-4o Mini, GPT-4 Turbo                                    |
| Anthropic  | Claude Sonnet 4, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus |
| Google     | Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash                  |
| Groq       | Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B                           |
| Mistral    | Mistral Large, Mistral Small                                        |
| Cohere     | Command R+, Command R                                               |
| Perplexity | Sonar Large Online                                                  |
| xAI        | Grok 2                                                              |
| DeepSeek   | DeepSeek Chat                                                       |

## Development

For local development setup, see [DEVELOPMENT.md](DEVELOPMENT.md).

```bash
git clone https://github.com/BankkRoll/yt2blog.git
cd yt2blog
pnpm install
pnpm dev
```

## Documentation

| Document                                 | Description                                            |
| ---------------------------------------- | ------------------------------------------------------ |
| [DEVELOPMENT.md](DEVELOPMENT.md)         | Development setup, architecture, and project structure |
| [CONTRIBUTING.md](CONTRIBUTING.md)       | Contribution guidelines and workflow                   |
| [CHANGELOG.md](CHANGELOG.md)             | Version history and release notes                      |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community guidelines                                   |
| [LICENSE](LICENSE)                       | MIT License                                            |

## Acknowledgments

- [Vercel AI SDK](https://ai-sdk.dev) - AI Gateway and model routing
- [Ink](https://github.com/vadimdemedes/ink) - React for CLI
- YouTube InnerTube API - Transcript fetching
