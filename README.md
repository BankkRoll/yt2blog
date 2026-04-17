# yt2blog

<img width="1366" height="758" alt="yt2blog" src="https://github.com/user-attachments/assets/d563e9c6-9f50-443d-a738-a87613c220f5" />

> Transform any YouTube video into a polished blog post using AI

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

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

## Features

- **YouTube → Transcript → AI → Blog** - Full pipeline from video URL to polished markdown
- **Dynamic Model Selection** - Search, sort, and filter from 20+ AI models with live pricing info
- **Multiple Blog Styles** - SEO, Medium essay, Newsletter, Twitter thread, Technical breakdown
- **9 Built-in Themes** - Default, Dracula, Nord, Catppuccin, Tokyo Night, Monokai, High Contrast, Neo Brutalism, Windows 98
- **BYOK (Bring Your Own Key)** - Use your own API keys or AI Gateway
- **Interactive CLI** - Beautiful terminal UI with progress tracking

## Prerequisites

- **Node.js** >= 18
- **pnpm** (recommended) or npm
- **API Key** - Either AI Gateway key or provider-specific key (see below)
- **yt-dlp** (optional) - Only needed for Whisper fallback on videos without captions

## Quick Start

```bash
# Clone and install
git clone https://github.com/BankkRoll/yt2blog.git
cd yt2blog
pnpm install

# Set your API key
cp .env.example .env
# Edit .env and add your key(s)

# Run
pnpm dev
```

## Environment Variables

Environment variables can be set in multiple ways:

```bash
# Option 1: .env file (recommended)
cp .env.example .env
# Edit .env with your keys

# Option 2: Shell export
export AI_GATEWAY_API_KEY=your-key

# Option 3: Inline with command
AI_GATEWAY_API_KEY=your-key pnpm dev

# Option 4: System environment variables
# Set via your OS settings
```

### AI Gateway (Recommended)

```bash
AI_GATEWAY_API_KEY=your-gateway-key
```

Get your key from [Vercel Dashboard](https://vercel.com/dashboard) → AI Gateway

### Provider-Specific Keys (BYOK)

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
