/**
 * @fileoverview Main pipeline orchestration for YouTube-to-blog conversion
 * @module pipeline/index
 */

import { getTranscript } from "../transcription/index.js";
import { chunkTranscript } from "./chunker.js";
import { analyzeContent } from "./analyzer.js";
import { generateOutline } from "./outliner.js";
import { generateAllSections, assembleBlog, streamBlog } from "./generator.js";
import { refineBlog, generateSEO } from "./refiner.js";
import type {
  BlogConfig,
  BYOKConfig,
  PipelineStep,
  TokenUsageStats,
} from "../gateway/types.js";

export interface PipelineOptions {
  videoUrl: string;
  model: string;
  config: BlogConfig;
  byok?: BYOKConfig;
  onStep?: (step: PipelineStep) => void;
  onTokenUsage?: (usage: TokenUsageStats) => void;
  stream?: boolean;
}

export interface PipelineResult {
  blog: string;
  seo?: {
    title: string;
    metaDescription: string;
    keywords: string[];
    slug: string;
  };
  metadata: {
    videoId: string;
    model: string;
    style: string;
    wordCount: number;
    sections: number;
  };
  tokenUsage: TokenUsageStats;
}

/** Runs the full YouTube-to-blog pipeline with progress callbacks. */
export async function runPipeline(
  options: PipelineOptions,
): Promise<PipelineResult> {
  const { videoUrl, model, config, byok, onStep } = options;

  const tokenUsage: TokenUsageStats = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  };

  const steps: PipelineStep[] = [
    {
      id: "transcript",
      label: "Fetching transcript",
      status: "pending",
      progress: 0,
    },
    {
      id: "chunk",
      label: "Processing content",
      status: "pending",
      progress: 0,
    },
    {
      id: "analyze",
      label: "Analyzing topics",
      status: "pending",
      progress: 0,
    },
    {
      id: "outline",
      label: "Creating outline",
      status: "pending",
      progress: 0,
    },
    {
      id: "generate",
      label: "Writing sections",
      status: "pending",
      progress: 0,
    },
    { id: "refine", label: "Polishing blog", status: "pending", progress: 0 },
  ];

  const updateStep = (id: string, update: Partial<PipelineStep>) => {
    const step = steps.find((s) => s.id === id);
    if (step) {
      Object.assign(step, update);
      onStep?.({ ...step });
    }
  };

  const withProgress = async <T>(
    stepId: string,
    operation: () => Promise<T>,
    estimatedDurationMs: number = 2000,
  ): Promise<T> => {
    updateStep(stepId, { status: "running", progress: 0 });

    let progress = 0;
    const progressInterval = setInterval(() => {
      const remaining = 90 - progress;
      const increment = Math.max(1, remaining * 0.1);
      progress = Math.min(90, progress + increment);
      updateStep(stepId, { progress: Math.round(progress) });
    }, estimatedDurationMs / 20);

    try {
      const result = await operation();
      clearInterval(progressInterval);
      updateStep(stepId, { status: "done", progress: 100 });
      return result;
    } catch (error) {
      clearInterval(progressInterval);
      updateStep(stepId, { status: "error", progress });
      throw error;
    }
  };

  const transcriptResult = await withProgress(
    "transcript",
    () => getTranscript(videoUrl),
    3000,
  );

  updateStep("chunk", { status: "running", progress: 0 });
  const chunks = chunkTranscript(transcriptResult.chunks);
  for (let i = 0; i <= 100; i += 25) {
    updateStep("chunk", { progress: i });
    await new Promise((r) => setTimeout(r, 50));
  }
  updateStep("chunk", { status: "done", progress: 100 });

  const analysis = await withProgress(
    "analyze",
    () => analyzeContent(chunks, model, byok),
    5000,
  );

  const outline = await withProgress(
    "outline",
    () => generateOutline(analysis, config, model, byok),
    3000,
  );

  updateStep("generate", { status: "running", progress: 0 });
  const sections = await generateAllSections(
    outline,
    chunks,
    config,
    analysis,
    {
      model,
      byok,
      onProgress: (current, total) => {
        const progress = Math.round((current / total) * 100);
        updateStep("generate", { progress });
      },
    },
  );
  updateStep("generate", { status: "done", progress: 100 });

  const rawBlog = assembleBlog(outline.title, sections);
  const blog = await withProgress(
    "refine",
    () => refineBlog(rawBlog, config, { model, byok }),
    4000,
  );

  let seo;
  if (config.style === "seo") {
    seo = await generateSEO(blog, model, byok);
  }

  return {
    blog,
    seo,
    metadata: {
      videoId: transcriptResult.videoId,
      model,
      style: config.style,
      wordCount: blog.split(/\s+/).length,
      sections: outline.sections.length,
    },
    tokenUsage,
  };
}

/** Streams pipeline output for real-time display. */
export async function* streamPipeline(
  options: PipelineOptions,
): AsyncGenerator<{ type: "step" | "text"; data: PipelineStep | string }> {
  const { videoUrl, model, config, byok } = options;

  yield {
    type: "step",
    data: {
      id: "transcript",
      label: "Fetching transcript",
      status: "running",
      progress: 0,
    },
  };
  const transcriptResult = await getTranscript(videoUrl);
  yield {
    type: "step",
    data: {
      id: "transcript",
      label: "Fetching transcript",
      status: "done",
      progress: 100,
    },
  };

  yield {
    type: "step",
    data: { id: "chunk", label: "Processing", status: "running", progress: 0 },
  };
  const chunks = chunkTranscript(transcriptResult.chunks);
  yield {
    type: "step",
    data: { id: "chunk", label: "Processing", status: "done", progress: 100 },
  };

  yield {
    type: "step",
    data: { id: "analyze", label: "Analyzing", status: "running", progress: 0 },
  };
  const analysis = await analyzeContent(chunks, model, byok);
  yield {
    type: "step",
    data: { id: "analyze", label: "Analyzing", status: "done", progress: 100 },
  };

  yield {
    type: "step",
    data: { id: "outline", label: "Outlining", status: "running", progress: 0 },
  };
  const outline = await generateOutline(analysis, config, model, byok);
  yield {
    type: "step",
    data: { id: "outline", label: "Outlining", status: "done", progress: 100 },
  };

  yield {
    type: "step",
    data: { id: "generate", label: "Writing", status: "running", progress: 0 },
  };
  for await (const text of streamBlog(outline, chunks, config, analysis, {
    model,
    byok,
  })) {
    yield { type: "text", data: text };
  }
  yield {
    type: "step",
    data: { id: "generate", label: "Writing", status: "done", progress: 100 },
  };
}

export { chunkTranscript } from "./chunker.js";
export {
  analyzeContent,
  analyzeInBatches,
  extractHighlights,
} from "./analyzer.js";
export { generateOutline, validateOutline, refineOutline } from "./outliner.js";
export {
  generateSection,
  generateAllSections,
  assembleBlog,
  streamBlog,
} from "./generator.js";
export {
  refineBlog,
  generateSEO,
  validateBlog,
  convertToFormat,
} from "./refiner.js";
