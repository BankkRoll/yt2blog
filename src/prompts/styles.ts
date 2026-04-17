/**
 * @fileoverview Blog style prompts and metadata for content generation
 * @module prompts/styles
 */

const STYLE_PROMPTS = {
  seo: `SEO BLOG STYLE:
- Use H2 headings optimized for search (include target keywords)
- Write clear, scannable paragraphs (3-4 sentences max)
- Include a compelling hook in the intro
- Use bullet points and numbered lists
- Write a meta-description-friendly conclusion
- Natural keyword density (don't stuff)
- Use transition phrases between sections
- Include internal link opportunities marked as [LINK: topic]
- Write for featured snippets (direct answers to questions)`,

  medium: `MEDIUM ESSAY STYLE:
- Write with a personal, introspective voice
- Use "I" and share your perspective
- Long-form narrative paragraphs that flow
- Story arc: hook → tension → insight → resolution
- Include personal anecdotes or observations
- Thoughtful, not clickbaity
- Use pull quotes for key insights
- Write like you're explaining to a smart friend
- End with a thought-provoking conclusion
- No bullet points unless absolutely necessary`,

  newsletter: `NEWSLETTER STYLE:
- Conversational, "you" focused tone
- Feel like a letter from a friend
- Short paragraphs (1-2 sentences often)
- Clear takeaways and action items
- Use "→" or "•" for quick lists
- Include a personal sign-off
- TL;DR at the top or bottom
- Write scannable but engaging
- End with a CTA or question
- Feel exclusive, like insider knowledge`,

  thread: `TWITTER THREAD STYLE:
- Each section = potential standalone tweet
- Punchy, hook-driven sentences
- Use numbers: "5 things I learned..."
- Short paragraphs (1-2 sentences)
- Include "insight drops" that are quotable
- Use emoji sparingly for emphasis
- Write for retweets and saves
- End each section with a mini-hook
- Final section = call to action
- Feel like rapid-fire value bombs`,

  technical: `TECHNICAL BREAKDOWN STYLE:
- Clear, precise language
- Define terms when first used
- Use code blocks for examples (if applicable)
- Step-by-step explanations
- Include "why" not just "what"
- Anticipate and address edge cases
- Use diagrams described in text [DIAGRAM: description]
- Reference sources and data
- Write for developers/experts
- Conclusion summarizes key technical insights`,
};

const STYLE_INFO = {
  seo: {
    name: "SEO Blog",
    description: "Search-optimized, scannable content",
    wordCountRange: [1200, 2500],
    idealSections: 5,
  },
  medium: {
    name: "Medium Essay",
    description: "Long-form narrative with personal voice",
    wordCountRange: [1500, 3500],
    idealSections: 4,
  },
  newsletter: {
    name: "Newsletter",
    description: "Conversational, actionable insights",
    wordCountRange: [800, 1500],
    idealSections: 4,
  },
  thread: {
    name: "Twitter Thread",
    description: "Punchy, quotable value bombs",
    wordCountRange: [600, 1200],
    idealSections: 7,
  },
  technical: {
    name: "Technical Breakdown",
    description: "Deep-dive for developers/experts",
    wordCountRange: [2000, 4000],
    idealSections: 6,
  },
};

/** Returns the writing guidelines prompt for a blog style. */
export function getStylePrompt(style) {
  return STYLE_PROMPTS[style] || STYLE_PROMPTS.seo;
}

/** Returns metadata for a blog style. */
export function getStyleInfo(style) {
  return STYLE_INFO[style] || STYLE_INFO.seo;
}

export const DEFAULT_MODEL = "openai/gpt-4o";

export { BLOG_STYLES } from "../gateway/types.js";
