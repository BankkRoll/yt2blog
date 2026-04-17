/**
 * @fileoverview Blog outline generation from content analysis
 * @module pipeline/outliner
 */

import { completeJSON } from "../gateway/index.js";
import type {
  ContentAnalysis,
  BlogOutline,
  BlogConfig,
} from "../gateway/types.js";

const OUTLINE_PROMPT = `Create a blog outline based on this content analysis.

ANALYSIS:
{analysis}

SETTINGS:
- Style: {style}
- Target sections: {sections}
- Target word count: {wordCount}
- Tone: {tone}

Return a JSON object:
{
  "title": "Blog title optimized for {style}",
  "sections": [
    {
      "heading": "Section heading",
      "goal": "What this section achieves",
      "keyPoints": ["Points to cover"]
    }
  ]
}

Style-specific rules:
- SEO: Include H2s optimized for search, clear structure
- Medium: Narrative flow, personal insights, story arc
- Newsletter: Conversational, actionable takeaways, "you" focused
- Thread: Punchy hooks, numbered insights, tweetable sentences
- Technical: Deep explanations, code examples, precise language

Create exactly {sections} sections plus intro and conclusion.`;

/** Generates a structured blog outline from content analysis using AI. */
export async function generateOutline(
  analysis: ContentAnalysis,
  config: BlogConfig,
  model: string,
): Promise<BlogOutline> {
  const prompt = OUTLINE_PROMPT.replace("{analysis}", JSON.stringify(analysis))
    .replace(/\{style\}/g, config.style)
    .replace(/\{sections\}/g, String(config.sections))
    .replace("{wordCount}", String(config.wordCount))
    .replace("{tone}", config.tone || analysis.tone);

  return completeJSON(model, prompt);
}

/** Distributes target word count across sections (intro/conclusion get less). */
export function calculateSectionWordCounts(
  outline: BlogOutline,
  totalWords: number,
): Map<string, number> {
  const sectionCount = outline.sections.length;
  const wordsPerSection = Math.floor(totalWords / sectionCount);
  const distribution = new Map<string, number>();

  outline.sections.forEach((section, i) => {
    let words = wordsPerSection;
    if (i === 0) {
      words = Math.floor(wordsPerSection * 0.7);
    } else if (i === sectionCount - 1) {
      words = Math.floor(wordsPerSection * 0.6);
    }
    distribution.set(section.heading, words);
  });

  return distribution;
}

/** Validates outline meets configuration requirements. */
export function validateOutline(
  outline: BlogOutline,
  config: BlogConfig,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!outline.title) {
    issues.push("Missing title");
  }

  if (!outline.sections || outline.sections.length === 0) {
    issues.push("No sections defined");
  }

  if (outline.sections.length < config.sections - 1) {
    issues.push(
      `Only ${outline.sections.length} sections, expected ~${config.sections}`,
    );
  }

  for (const section of outline.sections) {
    if (!section.heading) {
      issues.push("Section missing heading");
    }
    if (!section.keyPoints || section.keyPoints.length === 0) {
      issues.push(`Section "${section.heading}" has no key points`);
    }
  }

  return { valid: issues.length === 0, issues };
}

/** Adjusts outline based on feedback using AI. */
export async function refineOutline(
  outline: BlogOutline,
  feedback: string,
  model: string,
): Promise<BlogOutline> {
  const prompt = `Refine this blog outline based on the feedback.

CURRENT OUTLINE:
${JSON.stringify(outline, null, 2)}

FEEDBACK:
${feedback}

Return the improved outline in the same JSON format.`;

  return completeJSON(model, prompt);
}
