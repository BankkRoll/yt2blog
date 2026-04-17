# Development Guide

## Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm
- Git

## Setup

```bash
# Clone the repository
git clone https://github.com/BankkRoll/yt2blog.git
cd yt2blog

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
# Edit .env with your API keys
```

## Environment Variables

See `.env.example` for all available options. Key variables:

| Variable             | Required | Description                                |
| -------------------- | -------- | ------------------------------------------ |
| `AI_GATEWAY_API_KEY` | Yes\*    | Vercel AI Gateway key (recommended)        |
| `OPENAI_API_KEY`     | Yes\*    | OpenAI key (also enables Whisper fallback) |
| `YT2BLOG_THEME`      | No       | Default theme ID                           |

\*At least one AI key is required (Gateway or provider-specific)

## Scripts

```bash
pnpm dev        # Run in development mode
pnpm build      # Build for production
pnpm start      # Run production build
pnpm typecheck  # Type check with TypeScript
pnpm format     # Format code with Prettier
```

## Project Structure

```
src/
├── index.tsx              # Entry point
├── gateway/               # AI Gateway (model routing)
│   ├── index.ts          # generate(), generateStream(), completeJSON()
│   └── types.ts          # Type definitions
│
├── transcription/         # YouTube → Text
│   ├── index.ts          # Main transcript fetcher
│   ├── youtube.ts        # InnerTube API + fallback
│   └── whisper.ts        # Whisper API fallback
│
├── pipeline/              # Content processing
│   ├── index.ts          # runPipeline(), streamPipeline()
│   ├── chunker.ts        # Transcript segmentation
│   ├── analyzer.ts       # Content analysis
│   ├── outliner.ts       # Outline generation
│   ├── generator.ts      # Section writing
│   └── refiner.ts        # Final polish
│
├── prompts/               # AI prompts
│   └── styles.ts         # Blog style prompts
│
└── cli/                   # Terminal UI
    ├── App.tsx           # Main app component
    ├── theme/            # Theme system
    │   ├── index.ts      # Theme definitions
    │   └── ThemeProvider.tsx
    ├── screens/          # App screens
    │   ├── Splash.tsx
    │   ├── Setup.tsx
    │   ├── Pipeline.tsx
    │   ├── Output.tsx
    │   └── Settings.tsx
    └── components/       # Reusable components
        ├── AppShell.tsx
        ├── InfoBox.tsx
        ├── ModelSelector.tsx  # Dynamic model picker
        ├── ProgressBar.tsx
        ├── SetupFlow.tsx
        ├── Spinner.tsx
        ├── ToolCall.tsx
        ├── TokenUsage.tsx
        └── ThinkingBlock.tsx
```

## Architecture

### AI Gateway

The gateway provides a unified interface for all AI providers using string-based routing:

```typescript
// Use any model with the same API
await generate({ model: "openai/gpt-5.4", messages: [...] });
await generate({ model: "anthropic/claude-sonnet-4.6", messages: [...] });
```

### Pipeline

The content pipeline transforms YouTube transcripts into blog posts:

1. **Transcript** - Fetch captions via InnerTube or Whisper
2. **Chunk** - Split into semantic segments
3. **Analyze** - Extract topics, key points, tone
4. **Outline** - Generate blog structure
5. **Generate** - Write sections in parallel
6. **Refine** - Final editing pass

### Model Selector

The ModelSelector component (`src/cli/components/ModelSelector.tsx`) provides:

- Dynamic model fetching from AI Gateway (`getAvailableModels()`)
- Fallback to default models when offline or no gateway key
- Search, sort, and filter capabilities
- Live pricing display (per million tokens)
- Custom model input for any `provider/model` string

```typescript
<ModelSelector
  onSelect={(modelId) => setModel(modelId)}
  defaultModel="openai/gpt-4o"
  showPricing={true}
/>
```

### Theme System

Themes are defined in `src/cli/theme/index.ts`:

```typescript
export const myTheme: Theme = {
  id: "my-theme",
  name: "My Theme",
  palette: {
    primary: "#ff0000",
    secondary: "#00ff00",
    // ... other colors
  },
};
```

### Components

CLI components use Ink (React for terminals):

```tsx
import { Box, Text } from "ink";
import { useTheme } from "../theme";

export function MyComponent() {
  const { theme } = useTheme();
  return (
    <Box>
      <Text color={theme.palette.primary}>Hello!</Text>
    </Box>
  );
}
```

## Adding Features

### New Blog Style

1. Add style definition to `src/prompts/styles.ts`
2. Export in `STYLES` object
3. Add to `BLOG_STYLES` type in `src/gateway/types.ts`

### New Theme

1. Add theme object to `src/cli/theme/index.ts`
2. Add to `THEMES` array
3. Theme will appear in Settings automatically

### New AI Provider

1. Update `PROVIDERS` in `src/gateway/types.ts`
2. Add env var to `PROVIDER_ENV_KEYS` in `src/gateway/index.ts`
3. Handle in `buildProviderOptions` if needed

## Testing

Currently manual testing. Test with:

- Multiple YouTube URLs (with/without captions)
- Different AI models
- All blog styles
- All themes
- Different output formats
- Streaming mode on/off

## Debugging

```bash
# Enable debug output
DEBUG=* pnpm dev

# Check TypeScript errors
pnpm typecheck

# Verbose Ink output
TERM=xterm-256color pnpm dev
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Push to GitHub
5. GitHub Actions will build and publish
