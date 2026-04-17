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
import { getLogger } from "../utils/logger.js";

/** Result from generating a section including token usage */
export interface SectionResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/** Result from generating all sections */
export interface GeneratorResult {
  sections: string[];
  totalUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Validates that the section count is appropriate for the transcript length.
 * Prevents empty sections when there are too few chunks.
 */
export function validateChunkSectionRatio(
  chunksLength: number,
  sectionsCount: number,
): { adjustedSections: number; warning?: string } {
  if (chunksLength === 0) {
    throw new Error("Cannot generate blog: no transcript chunks available");
  }

  // If sections > chunks * 2, some sections would be empty or nearly empty
  if (sectionsCount > chunksLength * 2) {
    const adjustedSections = Math.max(1, Math.ceil(chunksLength / 2));
    return {
      adjustedSections,
      warning: `Section count (${sectionsCount}) is too high for transcript length (${chunksLength} chunks). Adjusted to ${adjustedSections} sections.`,
    };
  }

  return { adjustedSections: sectionsCount };
}

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
): Promise<SectionResult> {
  const logger = getLogger();
  logger.debug(`Generating section ${sectionIndex + 1}`, {
    heading: section.heading,
    chunks: relevantChunks.length,
  });

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

  logger.debug(`Section ${sectionIndex + 1} generated`, {
    chars: result.text.length,
    tokens: result.usage?.totalTokens,
  });

  return {
    text: result.text,
    usage: result.usage,
  };
}

/** Generates all blog sections in parallel and returns them in order */
export async function generateAllSections(
  outline: BlogOutline,
  chunks: TranscriptChunk[],
  config: BlogConfig,
  analysis: ContentAnalysis,
  options: GeneratorOptions,
): Promise<GeneratorResult> {
  const logger = getLogger();

  // Validate chunk/section ratio
  const validation = validateChunkSectionRatio(
    chunks.length,
    outline.sections.length,
  );
  if (validation.warning) {
    logger.warn(validation.warning);
  }

  const sectionsCount = validation.adjustedSections;
  const sectionsToGenerate = outline.sections.slice(0, sectionsCount);

  logger.info("Generating all sections in parallel", {
    sections: sectionsCount,
    chunks: chunks.length,
    model: options.model,
  });

  const sectionPromises = sectionsToGenerate.map((section, i) => {
    const relevantChunks = getChunksForSection(chunks, i, sectionsCount);

    return generateSection(
      i,
      section,
      relevantChunks,
      config,
      analysis,
      options,
    ).then((result) => {
      options.onProgress?.(i + 1, sectionsCount);
      return result;
    });
  });

  const results = await Promise.all(sectionPromises);

  // Accumulate token usage
  const totalUsage = results.reduce(
    (acc, r) => ({
      promptTokens: acc.promptTokens + (r.usage?.promptTokens ?? 0),
      completionTokens: acc.completionTokens + (r.usage?.completionTokens ?? 0),
      totalTokens: acc.totalTokens + (r.usage?.totalTokens ?? 0),
    }),
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  );

  const sections = results.map((r) => r.text);
  const totalChars = sections.reduce((sum, s) => sum + s.length, 0);

  logger.info("All sections generated", {
    sections: sectionsCount,
    totalChars,
    totalTokens: totalUsage.totalTokens,
  });

  return { sections, totalUsage };
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
  const logger = getLogger();

  // Validate chunk/section ratio
  const validation = validateChunkSectionRatio(
    chunks.length,
    outline.sections.length,
  );
  if (validation.warning) {
    logger.warn(validation.warning);
  }

  const sectionsCount = validation.adjustedSections;
  const sectionsToStream = outline.sections.slice(0, sectionsCount);

  logger.info("Streaming blog generation", {
    sections: sectionsCount,
    chunks: chunks.length,
    model: options.model,
  });

  yield `# ${outline.title}\n\n`;

  for (let i = 0; i < sectionsToStream.length; i++) {
    const section = sectionsToStream[i];
    logger.debug(`Streaming section ${i + 1}/${sectionsCount}`, {
      heading: section.heading,
    });

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

  logger.info("Blog streaming complete");
}
