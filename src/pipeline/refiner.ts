/**
 * @fileoverview Blog refinement, SEO generation, and format conversion
 * @module pipeline/refiner
 */

import { generate, completeJSON } from "../gateway/index.js";
import type { BlogConfig } from "../gateway/types.js";
import { getStylePrompt } from "../prompts/styles.js";

export interface RefinerOptions {
  model: string;
  addSEO?: boolean;
}

/** Refines blog for consistency, flow, and style adherence. */
export async function refineBlog(
  blog: string,
  config: BlogConfig,
  options: RefinerOptions,
): Promise<string> {
  const styleGuide = getStylePrompt(config.style);

  const prompt = `Refine this blog post for publication.

BLOG:
${blog}

STYLE: ${config.style}
${styleGuide}

REFINEMENT TASKS:
1. Remove any repetitive phrases or ideas
2. Improve transitions between sections
3. Tighten wordy sentences
4. Ensure consistent tone throughout
5. Fix any awkward phrasing
6. Keep all content accurate (don't add new information)
${options.addSEO ? "7. Optimize headings for SEO" : ""}

RULES:
- Output the COMPLETE refined blog
- Keep all sections and structure
- Output ONLY markdown, no commentary
- Do not add "Here is the refined blog" or similar`;

  const result = await generate({
    model: options.model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5, // Lower temp for consistent refinement
    maxTokens: 8000,
  });

  return result.text;
}

/** Generates SEO metadata (title, description, keywords, slug). */
export async function generateSEO(
  blog: string,
  model: string,
): Promise<{
  title: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
}> {
  const prompt = `Generate SEO metadata for this blog post.

BLOG:
${blog.slice(0, 3000)}...

Return JSON:
{
  "title": "SEO-optimized title (50-60 chars)",
  "metaDescription": "Meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "slug": "url-friendly-slug"
}`;

  return completeJSON(model, prompt);
}

/** Validates blog quality and returns score with suggestions. */
export async function validateBlog(
  blog: string,
  model: string,
): Promise<{
  score: number;
  issues: string[];
  suggestions: string[];
}> {
  const prompt = `Evaluate this blog post quality.

BLOG:
${blog}

Return JSON:
{
  "score": 8.5,
  "issues": ["Issue 1", "Issue 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

Score from 1-10 based on:
- Clarity and readability
- Structure and flow
- Engagement factor
- Grammar and style`;

  return completeJSON(model, prompt);
}

/** Converts blog to markdown, HTML, or plaintext format. */
export function convertToFormat(
  blog: string,
  format: "markdown" | "html" | "plaintext",
): string {
  switch (format) {
    case "markdown":
      return blog;

    case "html":
      return convertMarkdownToHTML(blog);

    case "plaintext":
      return blog
        .replace(/#{1,6}\s/g, "") // Remove headings
        .replace(/\*\*/g, "") // Remove bold
        .replace(/\*/g, "") // Remove italic
        .replace(/`/g, "") // Remove code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Convert links

    default:
      return blog;
  }
}

function convertMarkdownToHTML(md: string): string {
  return md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith("<h") || match.startsWith("<p")) return match;
      return `<p>${match}</p>`;
    });
}
