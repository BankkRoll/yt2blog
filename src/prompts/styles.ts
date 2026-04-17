/**
 * @fileoverview Blog style prompts and metadata for content generation
 * @module prompts/styles
 */

import type { BlogStyle } from "../gateway/types.js";

/**
 * Style-specific writing guidelines injected into LLM prompts.
 * These guide the model's output format, tone, and structure.
 */
const STYLE_PROMPTS: Record<BlogStyle, string> = {
  seo: `STYLE: SEO-Optimized Blog Post
VOICE: Professional, authoritative, helpful
FORMAT:
- Use H2 headings that include target keywords naturally
- Keep paragraphs short (2-4 sentences) for scannability
- Include bullet points or numbered lists for key information
- Write clear topic sentences that could appear in featured snippets
- Use transition words between sections (However, Additionally, Therefore)
DO:
- Front-load important information
- Include specific numbers, stats, or examples when available
- Write meta-description-friendly conclusions
DON'T:
- Stuff keywords unnaturally
- Write walls of text
- Use clickbait or sensational language`,

  medium: `STYLE: Medium-Style Essay
VOICE: Personal, reflective, authentic
FORMAT:
- Write with "I" statements and personal perspective
- Use longer, flowing paragraphs that build narratives
- Include moments of insight or revelation
- Structure with story arc: setup → tension → insight → resolution
DO:
- Share genuine observations and reactions
- Use vivid descriptions and specific details
- End with a thought that lingers
DON'T:
- Use bullet points (unless absolutely necessary)
- Be surface-level or generic
- Write like corporate content`,

  newsletter: `STYLE: Email Newsletter
VOICE: Friendly, direct, like a smart friend sharing notes
FORMAT:
- Very short paragraphs (1-2 sentences often)
- Use "you" to speak directly to the reader
- Include a TL;DR at top or bottom
- End with a question or call-to-action
DO:
- Get to the point quickly
- Make takeaways actionable
- Feel conversational, not formal
DON'T:
- Over-explain or pad content
- Be dry or academic
- Bury the insights`,

  thread: `STYLE: Twitter/X Thread
VOICE: Punchy, confident, quotable
FORMAT:
- Each paragraph should work as a standalone insight
- Use numbers ("5 things I learned", "The 3 key takeaways")
- Short sentences that hit hard
- Hook readers at the start of each section
DO:
- Deliver value in every sentence
- Make it easy to screenshot and share
- End with a summary or call-to-action
DON'T:
- Use filler words or meandering sentences
- Write anything that wouldn't get engagement
- Be boring or predictable`,

  technical: `STYLE: Technical Deep-Dive
VOICE: Precise, knowledgeable, educational
FORMAT:
- Define technical terms when first introduced
- Use code blocks for any code or commands
- Explain the "why" behind concepts, not just the "what"
- Include practical examples and edge cases
DO:
- Be accurate and specific
- Anticipate questions a technical reader would ask
- Reference relevant tools, frameworks, or standards
DON'T:
- Oversimplify to the point of losing accuracy
- Assume knowledge without explaining
- Skip the reasoning behind recommendations`,

  podcast: `STYLE: Podcast Episode Recap
VOICE: Engaging, like retelling a great conversation
FORMAT:
- Capture the energy and dynamic of the discussion
- Include notable quotes with speaker attribution
- Highlight key topics and when they occurred
- Provide context for references or inside jokes
DO:
- Make readers feel the conversation's highlights
- Note moments of disagreement or debate
- Include actionable insights from guests
DON'T:
- Just list topics without color
- Miss the personality of the speakers
- Forget to mention standout moments`,

  tutorial: `STYLE: Step-by-Step Tutorial
VOICE: Clear, patient, instructional
FORMAT:
- Number each step clearly
- State prerequisites and expected outcomes upfront
- Include verification steps ("You should see...")
- Note common mistakes and how to avoid them
DO:
- Make each step atomic and actionable
- Include expected results after each major step
- Provide troubleshooting tips
DON'T:
- Assume prior knowledge without stating it
- Skip steps that seem "obvious"
- Leave readers stuck without next steps`,

  recap: `STYLE: Quick Video Summary
VOICE: Efficient, informative, get-to-the-point
FORMAT:
- Lead with the most important takeaways
- Use brief timestamps or section markers
- Pull out key quotes worth remembering
- Highlight what makes this content valuable
DO:
- Save readers time with efficient summaries
- Capture the essence without the fluff
- Make it easy to decide if they should watch the full video
DON'T:
- Include unnecessary context or backstory
- Miss the main points
- Make it longer than needed`,

  sports: `STYLE: Sports Event Coverage
VOICE: Energetic, knowledgeable, fan-friendly
FORMAT:
- Open with the key result or moment
- Include relevant stats and performance highlights
- Cover pivotal plays or turning points
- Add context about significance (standings, records, rivalries)
DO:
- Capture the drama and stakes
- Use specific details (scores, times, stats)
- Quote players or coaches when available
DON'T:
- Just list what happened without analysis
- Miss the emotional beats of the event
- Be bland or robotic about exciting moments`,
};

/** Style metadata including word count recommendations */
export interface StyleInfo {
  name: string;
  description: string;
  wordCountRange: [number, number];
  idealSections: number;
}

const STYLE_INFO: Record<BlogStyle, StyleInfo> = {
  seo: {
    name: "SEO Blog",
    description: "Search-optimized, scannable",
    wordCountRange: [1200, 2500],
    idealSections: 5,
  },
  medium: {
    name: "Medium Essay",
    description: "Long-form narrative",
    wordCountRange: [1500, 3500],
    idealSections: 4,
  },
  newsletter: {
    name: "Newsletter",
    description: "Conversational, actionable",
    wordCountRange: [800, 1500],
    idealSections: 4,
  },
  thread: {
    name: "Twitter Thread",
    description: "Punchy, quotable",
    wordCountRange: [600, 1200],
    idealSections: 7,
  },
  technical: {
    name: "Technical Deep-Dive",
    description: "Detailed for experts",
    wordCountRange: [2000, 4000],
    idealSections: 6,
  },
  podcast: {
    name: "Podcast Recap",
    description: "Episode summary with quotes",
    wordCountRange: [1000, 2000],
    idealSections: 5,
  },
  tutorial: {
    name: "Tutorial/How-To",
    description: "Step-by-step guide",
    wordCountRange: [1200, 2500],
    idealSections: 6,
  },
  recap: {
    name: "Video Recap",
    description: "Quick summary highlights",
    wordCountRange: [600, 1200],
    idealSections: 4,
  },
  sports: {
    name: "Sports Coverage",
    description: "Game/event breakdown",
    wordCountRange: [1000, 2000],
    idealSections: 5,
  },
};

/** Returns the writing guidelines prompt for a blog style */
export function getStylePrompt(style: BlogStyle): string {
  return STYLE_PROMPTS[style] || STYLE_PROMPTS.seo;
}

/** Returns metadata for a blog style */
export function getStyleInfo(style: BlogStyle): StyleInfo {
  return STYLE_INFO[style] || STYLE_INFO.seo;
}

/** Returns all available styles with their info */
export function getAllStyles(): Array<{ id: BlogStyle; info: StyleInfo }> {
  return Object.entries(STYLE_INFO).map(([id, info]) => ({
    id: id as BlogStyle,
    info,
  }));
}

export const DEFAULT_MODEL = "openai/gpt-4o";

export { BLOG_STYLES } from "../gateway/types.js";
