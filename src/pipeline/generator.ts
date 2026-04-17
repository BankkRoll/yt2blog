/**
 * @fileoverview Generates blog sections from transcript chunks using LLM
 * @module pipeline/generator
 */

import { generate, generateStream } from "../gateway/index.js";
import type {
  TranscriptChunk,
  BlogOutline,
  BlogConfig,
  ContentAnalysis,
} from "../gateway/types.js";
import { getStylePrompt } from "../prompts/styles.js";

/** Options for blog generation including model and progress callbacks */
export interface GeneratorOptions {
  model: string;
  onProgress?: (section: number, total: number) => void;
}

/** Builds the prompt for generating a single blog section */
function buildSectionPrompt(
  sectionIndex: number,
  section: BlogOutline["sections"][number],
  chunkText: string,
  config: BlogConfig,
  analysis: ContentAnalysis,
): string {
  const styleGuide = getStylePrompt(config.style);
  const targetWords = Math.floor(config.wordCount / config.sections);

  return `Write section ${sectionIndex + 1} of a blog post.

SECTION:
Heading: ${section.heading}
Goal: ${section.goal}
Key points to cover: ${section.keyPoints.join(", ")}

TRANSCRIPT CONTENT (use ONLY this as source):
${chunkText}

STYLE GUIDE:
${styleGuide}

CONTENT CONTEXT:
- Overall topic: ${analysis.title}
- Tone: ${analysis.tone}
- Target audience: ${analysis.audience}

RULES:
- Write ONLY this section (no title, no other sections)
- Start with the heading as ## ${section.heading}
- Stay faithful to the transcript content
- Do not mention "transcript" or "video"
- Write in the specified style
- Target ~${targetWords} words
- Make it publication-ready`;
}

/** Gets relevant chunks for a section based on position */
function getChunksForSection(
  chunks: TranscriptChunk[],
  sectionIndex: number,
  totalSections: number,
): TranscriptChunk[] {
  const chunksPerSection = Math.ceil(chunks.length / totalSections);
  const startChunk = sectionIndex * chunksPerSection;
  const endChunk = Math.min(startChunk + chunksPerSection, chunks.length);
  return chunks.slice(startChunk, endChunk);
}

/** Generates a single blog section from transcript chunks */
export async function generateSection(
  sectionIndex: number,
  section: BlogOutline["sections"][number],
  relevantChunks: TranscriptChunk[],
  config: BlogConfig,
  analysis: ContentAnalysis,
  options: GeneratorOptions,
): Promise<string> {
  const chunkText = relevantChunks.map((c) => c.text).join("\n\n");
  const prompt = buildSectionPrompt(
    sectionIndex,
    section,
    chunkText,
    config,
    analysis,
  );

  const result = await generate({
    model: options.model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return result.text;
}

/** Generates all blog sections in parallel and returns them in order */
export async function generateAllSections(
  outline: BlogOutline,
  chunks: TranscriptChunk[],
  config: BlogConfig,
  analysis: ContentAnalysis,
  options: GeneratorOptions,
): Promise<string[]> {
  const sectionsCount = outline.sections.length;

  const sectionPromises = outline.sections.map((section, i) => {
    const relevantChunks = getChunksForSection(chunks, i, sectionsCount);

    return generateSection(
      i,
      section,
      relevantChunks,
      config,
      analysis,
      options,
    ).then((text) => {
      options.onProgress?.(i + 1, sectionsCount);
      return text;
    });
  });

  return Promise.all(sectionPromises);
}

/** Combines title and sections into final markdown */
export function assembleBlog(title: string, sections: string[]): string {
  return `# ${title}\n\n${sections.join("\n\n")}`;
}

/** Streams blog generation section-by-section for real-time output */
export async function* streamBlog(
  outline: BlogOutline,
  chunks: TranscriptChunk[],
  config: BlogConfig,
  analysis: ContentAnalysis,
  options: GeneratorOptions,
): AsyncGenerator<string> {
  yield `# ${outline.title}\n\n`;

  const sectionsCount = outline.sections.length;

  for (let i = 0; i < outline.sections.length; i++) {
    const section = outline.sections[i];
    const relevantChunks = getChunksForSection(chunks, i, sectionsCount);
    const chunkText = relevantChunks.map((c) => c.text).join("\n\n");
    const prompt = buildSectionPrompt(i, section, chunkText, config, analysis);

    const stream = await generateStream({
      model: options.model,
      messages: [{ role: "user", content: prompt }],
    });

    for await (const chunk of stream.textStream) {
      yield chunk;
    }

    yield "\n\n";
    options.onProgress?.(i + 1, sectionsCount);
  }
}
