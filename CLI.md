# yt2blog CLI Specification

> Interactive command-line interface for converting YouTube videos to blog posts

## Overview

yt2blog provides a rich, interactive terminal UI built with React and Ink. It guides users through a step-by-step wizard to configure and generate blog posts from YouTube videos.

---

## Installation

```bash
# Global installation (recommended)
npm install -g yt2blog

# Or run directly with npx
npx yt2blog

# Or run with pnpm
pnpm dlx yt2blog
```

---

## Quick Start

```bash
# Set your API key
export AI_GATEWAY_API_KEY="your-key-here"

# Run the CLI
yt2blog
```

---

## Interface Flow

The CLI uses a screen-based navigation system with 5 main screens:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Splash Screen  →  Setup Wizard  →  Pipeline  →  Output     │
│                         ↓                          ↓        │
│                    Settings ←────────────────────────       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Screens

### 1. Splash Screen

Welcome screen displayed on launch.

**Actions:**
- Press any key to continue to Setup

---

### 2. Setup Wizard

6-step configuration wizard:

#### Step 1: YouTube URL
```
┌─────────────────────────────────────────┐
│  Enter YouTube URL                      │
│  ────────────────────────────────────   │
│  > https://youtube.com/watch?v=...      │
│                                         │
│  Supported formats:                     │
│  • youtube.com/watch?v=VIDEO_ID         │
│  • youtu.be/VIDEO_ID                    │
│  • youtube.com/shorts/VIDEO_ID          │
└─────────────────────────────────────────┘
```

#### Step 2: Model Selection
```
┌─────────────────────────────────────────┐
│  Select AI Model                        │
│  ────────────────────────────────────   │
│  Search: [_______________]              │
│                                         │
│  Sort by: [Name ▼]  Filter: [All ▼]     │
│                                         │
│  > openai/gpt-4o          $2.50/$10.00  │
│    openai/gpt-4o-mini     $0.15/$0.60   │
│    anthropic/claude-sonnet-4  $3/$15   │
│    google/gemini-2.0-flash   $0.08/$0.30│
│    ...                                  │
│                                         │
│  [↑↓] Navigate  [Enter] Select          │
│  [/] Search  [Tab] Custom model         │
└─────────────────────────────────────────┘
```

**Model Selector Features:**
- **Search**: Type to filter models by name
- **Sort**: By name, provider, price (asc/desc), context window
- **Filter**: By provider (OpenAI, Anthropic, Google, etc.)
- **Custom**: Enter any model ID manually
- **Pricing**: Shows input/output cost per million tokens

#### Step 3: Blog Style
```
┌─────────────────────────────────────────┐
│  Select Blog Style                      │
│  ────────────────────────────────────   │
│                                         │
│  > SEO Optimized                        │
│    Search-optimized, scannable content  │
│    ~1200-2500 words, 5 sections         │
│                                         │
│    Medium Article                       │
│    Long-form narrative with voice       │
│    ~1500-3500 words, 4 sections         │
│                                         │
│    Newsletter                           │
│    Conversational, actionable           │
│    ~800-1500 words, 4 sections          │
│                                         │
│    Twitter Thread                       │
│    Punchy, shareable snippets           │
│    ~600-1200 words, 7 sections          │
│                                         │
│    Technical Deep-Dive                  │
│    Developer-focused, detailed          │
│    ~2000-4000 words, 6 sections         │
└─────────────────────────────────────────┘
```

#### Step 4: Number of Sections
```
┌─────────────────────────────────────────┐
│  Number of Sections                     │
│  ────────────────────────────────────   │
│                                         │
│  [3] ████████░░░░░░░░░░░░░░░░░░░░ [10]  │
│              ▲                          │
│              5                          │
│                                         │
│  [←→] Adjust  [Enter] Confirm           │
└─────────────────────────────────────────┘
```

#### Step 5: Word Count
```
┌─────────────────────────────────────────┐
│  Target Word Count                      │
│  ────────────────────────────────────   │
│                                         │
│  [500] ██████████████░░░░░░░░░░░ [5000] │
│                 ▲                       │
│               1500                      │
│                                         │
│  [←→] Adjust  [Enter] Confirm           │
└─────────────────────────────────────────┘
```

#### Step 6: API Key (if needed)
```
┌─────────────────────────────────────────┐
│  Enter API Key                          │
│  ────────────────────────────────────   │
│                                         │
│  Provider: OpenAI                       │
│  Key: [••••••••••••••••••]              │
│                                         │
│  Or set environment variable:           │
│  export OPENAI_API_KEY="sk-..."         │
└─────────────────────────────────────────┘
```

---

### 3. Pipeline Screen

Real-time progress display during generation:

```
┌─────────────────────────────────────────┐
│  Generating Blog                        │
│  ────────────────────────────────────   │
│                                         │
│  ✓ Fetching transcript         [done]   │
│  ✓ Processing content          [done]   │
│  ✓ Analyzing topics            [done]   │
│  ● Creating outline         [running]   │
│    ████████████░░░░░░░░░  58%           │
│  ○ Writing sections          [pending]  │
│  ○ Polishing blog            [pending]  │
│                                         │
│  ┌─ Thinking ─────────────────────────┐ │
│  │ Structuring the blog outline with  │ │
│  │ 5 sections covering main topics... │ │
│  └────────────────────────────────────┘ │
│                                         │
│  Elapsed: 00:45                         │
└─────────────────────────────────────────┘
```

**Pipeline Stages:**

| Stage | Description |
|-------|-------------|
| Fetching transcript | Downloads captions from YouTube |
| Processing content | Cleans and chunks transcript |
| Analyzing topics | Extracts themes, tone, key points |
| Creating outline | Generates blog structure |
| Writing sections | Writes each section (parallel) |
| Polishing blog | Final refinement and SEO |

**Streaming Mode:**

When enabled, shows real-time text generation:

```
┌─────────────────────────────────────────┐
│  Writing Section 3 of 5                 │
│  ────────────────────────────────────   │
│                                         │
│  ## Understanding the Core Concepts     │
│                                         │
│  The key insight from this video is     │
│  that modern software development       │
│  requires a fundamentally different     │
│  approach to█                           │
│                                         │
└─────────────────────────────────────────┘
```

---

### 4. Output Screen

Displays the generated blog with actions:

```
┌─────────────────────────────────────────┐
│  Blog Generated Successfully!           │
│  ────────────────────────────────────   │
│                                         │
│  # 10 Things You Need to Know About AI  │
│                                         │
│  Artificial intelligence has become     │
│  one of the most transformative         │
│  technologies of our generation...      │
│                                         │
│  ## 1. The Rise of Large Language...    │
│  ...                                    │
│                                         │
│  ─────────────────────────────────────  │
│  [c] Copy  [s] Save  [r] Restart  [q]   │
│                                         │
│  Tokens: 2,847 prompt / 1,523 output    │
│  Cost: ~$0.0234                         │
└─────────────────────────────────────────┘
```

**Keyboard Shortcuts:**

| Key | Action |
|-----|--------|
| `c` | Copy blog to clipboard |
| `s` | Save to file (prompts for filename) |
| `r` | Restart with new video |
| `q` | Quit application |
| `↑/↓` | Scroll content |
| `PgUp/PgDn` | Page scroll |
| `Home/End` | Jump to start/end |

---

### 5. Settings Screen

Configure application preferences:

```
┌─────────────────────────────────────────┐
│  Settings                               │
│  ────────────────────────────────────   │
│                                         │
│  Theme                                  │
│  > [Default    ▼]                       │
│                                         │
│  Default Model                          │
│  > [openai/gpt-4o ▼]                    │
│                                         │
│  Output Format                          │
│  > [Markdown ▼]                         │
│                                         │
│  ☑ Auto-save generated blogs            │
│  ☑ Show token usage                     │
│  ☐ Stream output in real-time           │
│                                         │
│  [Esc] Back  [Enter] Toggle/Select      │
└─────────────────────────────────────────┘
```

**Settings Options:**

| Setting | Values | Default |
|---------|--------|---------|
| Theme | 9 options (see below) | Default |
| Default Model | Any supported model | `openai/gpt-4o` |
| Output Format | Markdown, HTML, Text | Markdown |
| Auto-save | On/Off | Off |
| Show Token Usage | On/Off | On |
| Stream Output | On/Off | Off |

---

## Themes

9 built-in color themes:

| Theme | Description |
|-------|-------------|
| `default` | Clean, balanced colors |
| `dracula` | Dark purple/pink palette |
| `nord` | Arctic, bluish tones |
| `catppuccin` | Soothing pastel colors |
| `tokyo-night` | Dark with neon accents |
| `monokai` | Classic code editor theme |
| `high-contrast` | Maximum readability |
| `neo-brutalism` | Bold, stark design |
| `windows-98` | Retro nostalgia |

Set default theme via environment variable:

```bash
export YT2BLOG_THEME="dracula"
```

---

## Global Keyboard Shortcuts

Available from any screen:

| Key | Action |
|-----|--------|
| `q` | Quit application |
| `Ctrl+C` | Force quit |
| `s` | Open Settings (from Setup/Output) |
| `Esc` | Go back / Cancel |

---

## Environment Variables

### Required (at least one)

```bash
# Option 1: AI Gateway (single key for all providers)
export AI_GATEWAY_API_KEY="your-gateway-key"

# Option 2: Provider-specific keys
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GOOGLE_API_KEY="..."
export GROQ_API_KEY="gsk_..."
export MISTRAL_API_KEY="..."
export COHERE_API_KEY="..."
export PERPLEXITY_API_KEY="pplx-..."
export XAI_API_KEY="..."
export DEEPSEEK_API_KEY="..."
```

### Optional

```bash
# Default theme
export YT2BLOG_THEME="dracula"
```

---

## Configuration File

Create a `.env` file in your working directory:

```env
# .env
AI_GATEWAY_API_KEY=your-key-here
YT2BLOG_THEME=nord
```

Or in the project root for persistent configuration.

---

## Output Formats

### Markdown (default)

```markdown
# Blog Title

Introduction paragraph...

## Section 1

Content...

## Section 2

Content...
```

### HTML

```html
<article>
  <h1>Blog Title</h1>
  <p>Introduction paragraph...</p>
  <h2>Section 1</h2>
  <p>Content...</p>
</article>
```

### Text

```
BLOG TITLE
==========

Introduction paragraph...

SECTION 1
---------

Content...
```

---

## Blog Styles

### SEO Optimized
- **Purpose**: Search engine ranking
- **Word Count**: 1,200-2,500
- **Sections**: 5

### Medium Article
- **Purpose**: Long-form storytelling
- **Word Count**: 1,500-3,500
- **Sections**: 4

### Newsletter
- **Purpose**: Email subscribers
- **Word Count**: 800-1,500
- **Sections**: 4

### Twitter Thread
- **Purpose**: Social media sharing
- **Word Count**: 600-1,200
- **Sections**: 7

### Technical Deep-Dive
- **Purpose**: Developer education
- **Word Count**: 2,000-4,000
- **Sections**: 6

### Podcast Recap
- **Purpose**: Episode summary
- **Word Count**: 1,000-2,000
- **Sections**: 5

### Tutorial/How-To
- **Purpose**: Step-by-step guide
- **Word Count**: 1,200-2,500
- **Sections**: 6

### Video Recap
- **Purpose**: Quick summary
- **Word Count**: 600-1,200
- **Sections**: 4

### Sports Coverage
- **Purpose**: Game/event breakdown
- **Word Count**: 1,000-2,000
- **Sections**: 5

---

## Examples

### Basic Usage

```bash
# Run with default settings
yt2blog
```

### With Environment Variables

```bash
# One-liner with inline key
AI_GATEWAY_API_KEY="key" yt2blog
```

### Using .env File

```bash
# Create .env file
echo "OPENAI_API_KEY=sk-..." > .env

# Run (automatically loads .env)
yt2blog
```

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No API key found" | Missing credentials | Set environment variable or enter in CLI |
| "Failed to fetch transcript" | Video unavailable or no captions | Try different video, ensure captions exist |
| "Rate limited" | Too many requests | Wait and retry |
| "Invalid video URL" | Malformed URL | Check URL format |
| "Model not available" | Unsupported model | Choose from available models |

---

## Whisper Fallback

For videos without captions, yt2blog can use OpenAI Whisper:

**Requirements:**
1. `yt-dlp` installed and in PATH
2. `OPENAI_API_KEY` set

```bash
# Install yt-dlp
pip install yt-dlp
# or
brew install yt-dlp

# Set OpenAI key for Whisper
export OPENAI_API_KEY="sk-..."
```

When captions aren't available, the CLI will:
1. Download audio using yt-dlp
2. Transcribe with Whisper API
3. Clean up temporary files
4. Continue with normal pipeline

---

## Troubleshooting

### "Command not found: yt2blog"

```bash
# Ensure global install
npm install -g yt2blog

# Or use npx
npx yt2blog
```

### "Cannot find module"

```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install -g yt2blog
```

### "API key invalid"

- Verify key is correct
- Check key has proper permissions
- Ensure no extra whitespace

### Slow performance

- Use faster model (e.g., `gpt-4o-mini` instead of `gpt-4o`)
- Reduce section count
- Reduce word count
- Use Groq for fastest inference

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid configuration |
| 130 | User interrupt (Ctrl+C) |

---

## License

MIT
