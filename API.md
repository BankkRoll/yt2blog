# yt2blog API Reference

> Programmatic API for converting YouTube videos to blog posts

## Installation

```bash
npm install yt2blog
```

## Quick Start

```typescript
import { runPipeline } from 'yt2blog'

const result = await runPipeline({
  videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
  model: 'openai/gpt-4o',
  config: { style: 'seo', sections: 5, wordCount: 1500 }
})

console.log(result.blog)
```

---

## Pipeline

### `runPipeline(options): Promise<PipelineResult>`

Main entry point for video-to-blog conversion.

```typescript
interface PipelineOptions {
  videoUrl: string
  model: string              // e.g., 'openai/gpt-4o'
  config: BlogConfig
  onStep?: (step: PipelineStep) => void
  onTokenUsage?: (usage: TokenUsageStats) => void
  stream?: boolean
}

interface PipelineResult {
  blog: string
  seo?: { title: string; metaDescription: string; keywords: string[]; slug: string }
  metadata: { videoId: string; model: string; style: string; wordCount: number; sections: number }
  tokenUsage: TokenUsageStats
}
```

### `streamPipeline(options): AsyncGenerator`

Streams pipeline output for real-time display.

```typescript
for await (const event of streamPipeline(options)) {
  if (event.type === 'step') console.log(event.data.label)
  if (event.type === 'text') process.stdout.write(event.data)
}
```

---

## Transcription

### `getTranscript(videoUrl, options?): Promise<TranscriptionResult>`

Fetches transcript from YouTube (with optional AI cleaning).

```typescript
const transcript = await getTranscript('https://youtube.com/watch?v=...')
console.log(transcript.fullText)
console.log(transcript.chunks) // Array of timestamped segments
```

### `extractVideoId(url): string | null`

Extracts video ID from any YouTube URL format.

```typescript
extractVideoId('https://youtu.be/dQw4w9WgXcQ')  // 'dQw4w9WgXcQ'
extractVideoId('https://youtube.com/watch?v=abc&t=60')  // 'abc'
```

### `transcribeWithWhisper(videoUrl, options): Promise<TranscriptChunk[]>`

Transcribes using Whisper (local or API).

```typescript
// Uses local Whisper if available (free), falls back to OpenAI API
const chunks = await transcribeWithWhisper(videoUrl, {
  whisperModel: 'base',  // tiny, base, small, medium, large, turbo
  preferLocal: true,     // Try local first
  language: 'en'
})
```

### `checkWhisperDependencies(): Promise<object>`

Checks what transcription options are available.

```typescript
const deps = await checkWhisperDependencies()
// { ytdlp: true, localWhisper: true, apiKey: false, canTranscribe: true }
```

---

## Gateway (LLM Access)

### `generate(options): Promise<GenerateResult>`

Generate text using any supported model.

```typescript
const result = await generate({
  model: 'anthropic/claude-sonnet-4',
  messages: [{ role: 'user', content: 'Hello!' }],
  temperature: 0.7,
  maxTokens: 1000
})
console.log(result.text)
```

### `generateStream(options)`

Stream text generation.

```typescript
const stream = await generateStream({ model: 'openai/gpt-4o', messages })
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk)
}
```

### `complete(model, prompt): Promise<string>`

Simple completion helper.

```typescript
const text = await complete('openai/gpt-4o-mini', 'Summarize: ...')
```

### `completeJSON<T>(model, prompt): Promise<T>`

Generate and parse JSON output.

```typescript
const data = await completeJSON<{ topics: string[] }>(model, 'Extract topics...')
```

### `getAvailableModels(): Promise<GatewayModel[]>`

Get available models from AI Gateway.

### `resolveApiKey(provider): string | undefined`

Resolves API key using priority: provider env var → gateway key.

### `hasApiKey(provider): boolean`

Checks if a provider has an API key available.

### `getAvailableProviders(): string[]`

Returns providers that have API keys configured.

---

## Pipeline Components

### Chunking

```typescript
import { chunkTranscript, createOverlappingChunks } from 'yt2blog'

const chunks = chunkTranscript(rawChunks, { targetSize: 1500, maxSize: 3000 })
const overlapping = createOverlappingChunks(chunks, 100)
```

### Analysis

```typescript
import { analyzeContent, extractHighlights } from 'yt2blog'

const analysis = await analyzeContent(chunks, model)
// { title, topics, keyPoints, tone, audience, quotes }

const highlights = await extractHighlights(chunks, model)
// [{ timestamp, text, reason }]
```

### Outline

```typescript
import { generateOutline, validateOutline, refineOutline } from 'yt2blog'

const outline = await generateOutline(analysis, config, model)
const { valid, issues } = validateOutline(outline, config)
const refined = await refineOutline(outline, 'Add more detail', model)
```

### Generation

```typescript
import { generateSection, generateAllSections, assembleBlog, streamBlog } from 'yt2blog'

const sections = await generateAllSections(outline, chunks, config, analysis, { model })
const blog = assembleBlog(outline.title, sections)

// Or stream:
for await (const text of streamBlog(outline, chunks, config, analysis, { model })) {
  process.stdout.write(text)
}
```

### Refinement

```typescript
import { refineBlog, generateSEO, validateBlog, convertToFormat } from 'yt2blog'

const polished = await refineBlog(draft, config, { model })
const seo = await generateSEO(polished, model)
const { score, issues, suggestions } = await validateBlog(polished, model)
const html = convertToFormat(polished, 'html')
```

---

## Styles

### Available Styles

| Style | Description | Words | Sections |
|-------|-------------|-------|----------|
| `seo` | Search-optimized | 1200-2500 | 5 |
| `medium` | Long-form narrative | 1500-3500 | 4 |
| `newsletter` | Conversational | 800-1500 | 4 |
| `thread` | Twitter thread | 600-1200 | 7 |
| `technical` | Deep-dive | 2000-4000 | 6 |
| `podcast` | Episode recap | 1000-2000 | 5 |
| `tutorial` | Step-by-step guide | 1200-2500 | 6 |
| `recap` | Quick summary | 600-1200 | 4 |
| `sports` | Game coverage | 1000-2000 | 5 |

### Style Helpers

```typescript
import { getStylePrompt, getStyleInfo, getAllStyles, BLOG_STYLES } from 'yt2blog'

const prompt = getStylePrompt('podcast')
const info = getStyleInfo('podcast')  // { name, description, wordCountRange, idealSections }
const all = getAllStyles()  // [{ id, info }]
```

---

## Types

```typescript
import type {
  // Config
  BlogConfig,
  BlogStyle,

  // Pipeline
  PipelineOptions,
  PipelineResult,
  PipelineStep,
  StepStatus,
  TokenUsageStats,

  // Content
  TranscriptChunk,
  ContentAnalysis,
  BlogOutline,

  // Gateway
  Message,
  GatewayModel,
  GenerateOptions,
  GenerateResult,
  GatewayOptions,
  GatewayResponse,

  // Whisper
  WhisperOptions,
  WhisperModel,
  TranscriptionResult,
} from 'yt2blog'
```

---

## Environment Variables

```bash
# AI Gateway (recommended - handles all providers)
AI_GATEWAY_API_KEY=your-key

# Or provider-specific keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
GROQ_API_KEY=gsk_...
MISTRAL_API_KEY=...
COHERE_API_KEY=...
PERPLEXITY_API_KEY=pplx-...
XAI_API_KEY=...
DEEPSEEK_API_KEY=...
```

Key resolution priority:
1. Provider-specific env var (e.g., OPENAI_API_KEY)
2. AI Gateway key (AI_GATEWAY_API_KEY)

---

## Error Handling

```typescript
import {
  YoutubeTranscriptError,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
} from 'yt2blog'

try {
  const result = await runPipeline(options)
} catch (err) {
  if (err instanceof YoutubeTranscriptDisabledError) {
    // Captions disabled on video
  }
}
```

---

## Usage with Next.js

```typescript
// app/api/generate/route.ts
import { runPipeline } from 'yt2blog'

export async function POST(req: Request) {
  const { videoUrl, style } = await req.json()

  const result = await runPipeline({
    videoUrl,
    model: 'openai/gpt-4o-mini',
    config: { style, sections: 5, wordCount: 1500 }
  })

  return Response.json(result)
}
```

---

## License

MIT
