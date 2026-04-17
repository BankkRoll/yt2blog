# Contributing to yt2blog

Thank you for considering contributing to yt2blog!

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples (YouTube URLs, model strings, etc.)
- Describe the behavior you observed and what you expected
- Include your environment details (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain why this enhancement would be useful
- List any alternative solutions you've considered

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Install dependencies: `pnpm install`
3. Make your changes and ensure they follow our coding style
4. Run type checking: `pnpm typecheck`
5. Format your code: `pnpm format`
6. Write a clear commit message
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/BankkRoll/yt2blog.git
cd yt2blog

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
# Add your API key(s)

# Run in development mode
pnpm dev

# Run type checking
pnpm typecheck

# Format code
pnpm format

# Build for production
pnpm build
```

## Project Structure

```
src/
├── gateway/        # AI Gateway (model routing, dynamic model fetching)
├── transcription/  # YouTube transcript fetching
├── pipeline/       # Content processing pipeline
├── prompts/        # Blog style prompts
└── cli/            # Terminal UI
    ├── screens/    # App screens
    ├── components/ # Reusable components (ModelSelector, ProgressBar, etc.)
    └── theme/      # Theme system (9 themes)
```

## Coding Guidelines

### TypeScript

- Use TypeScript with explicit types for function parameters and return values
- Use interfaces for object shapes
- Avoid `any` where possible

### React/Ink

- Use functional components with hooks
- Keep components focused and composable
- Use the theme system for colors (`useTheme()`)

### Naming Conventions

- Files: `camelCase.ts` for utilities, `PascalCase.tsx` for components
- Functions: `camelCase`
- Components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

### Commits

- Use clear, descriptive commit messages
- Start with a verb: "Add", "Fix", "Update", "Remove"
- Reference issues when applicable: "Fix #123"

## Adding New Features

### New Blog Style

1. Add the style to `BLOG_STYLES` in `src/gateway/types.ts`
2. Add the prompt in `src/prompts/styles.ts`
3. Update documentation

### New Theme

1. Add the theme object to `src/cli/theme/index.ts`
2. Follow the existing `Theme` interface structure
3. Add it to the `THEMES` array

## Testing

Currently, the project relies on manual testing. When adding features:

1. Test with multiple YouTube URLs
2. Test with different models
3. Test on your platform (Windows/Mac/Linux)
4. Test keyboard navigation

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for exported functions
- Update CHANGELOG.md for releases

## Questions?

Feel free to open an issue with your question.
