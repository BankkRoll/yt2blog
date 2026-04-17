/**
 * @fileoverview Main pipeline orchestration for YouTube-to-blog conversion
 * @module pipeline/index
 */

import { getTranscript } from "../transcription/index.js";
import { extractVideoId } from "../transcription/youtube.js";
import { chunkTranscript } from "./chunker.js";
import { analyzeContent } from "./analyzer.js";
import { generateOutline } from "./outliner.js";
import { generateAllSections, assembleBlog, streamBlog } from "./generator.js";
import { refineBlog, generateSEO } from "./refiner.js";
import {
  getCache,
  CacheNamespaces,
  type CacheOptions,
} from "../utils/cache.js";
import { withRetry, RetryPresets, type RetryOptions } from "../utils/retry.js";
import { createHash } from "crypto";
import type {
  BlogConfig,
  PipelineStep,
  TokenUsageStats,
  ContentAnalysis,
  BlogOutline,
} from "../gateway/types.js";
import type { TranscriptionResult } from "../transcription/index.js";

/** Cache configuration for pipeline */
export interface PipelineCacheConfig {
  enabled?: boolean;
  options?: CacheOptions;
}

export interface PipelineOptions {
  videoUrl: string;
  model: string;
  config: BlogConfig;
  onStep?: (step: PipelineStep) => void;
  onTokenUsage?: (usage: TokenUsageStats) => void;
  stream?: boolean;
  cache?: PipelineCacheConfig;
  retry?: RetryOptions;
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

/** Generates a deterministic hash for cache keys */
function generateConfigHash(config: BlogConfig, model: string): string {
  const content = JSON.stringify({ config, model });
  return createHash("sha256").update(content).digest("hex").slice(0, 12);
}

import type { Cache } from "../utils/cache.js";

/** Helper to get cached data or fetch and cache it */
async function getCachedOrFetch<T>(
  cache: Cache | null,
  namespace: string,
  key: string,
  fetchFn: () => Promise<T>,
): Promise<{ data: T; fromCache: boolean }> {
  if (cache) {
    const cached = cache.get<T>(namespace, key);
    if (cached) {
      return { data: cached, fromCache: true };
    }
  }
  const data = await fetchFn();
  cache?.set(namespace, key, data);
  return { data, fromCache: false };
}

/** Runs the full YouTube-to-blog pipeline with progress callbacks. */
export async function runPipeline(
  options: PipelineOptions,
): Promise<PipelineResult> {
  const {
    videoUrl,
    model,
    config,
    onStep,
    cache: cacheConfig,
    retry: retryConfig,
  } = options;

  const cacheEnabled = cacheConfig?.enabled ?? true;
  const cache = cacheEnabled ? getCache(cacheConfig?.options) : null;
  const retryOptions = retryConfig ?? RetryPresets.standard;

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error(`Invalid YouTube URL: ${videoUrl}`);
  }

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

  // Fetch transcript (with caching)
  const transcriptFetch = await getCachedOrFetch(
    cache,
    CacheNamespaces.TRANSCRIPT,
    videoId,
    () =>
      withProgress(
        "transcript",
        () => withRetry(() => getTranscript(videoUrl), retryOptions),
        3000,
      ),
  );
  if (transcriptFetch.fromCache) {
    updateStep("transcript", {
      status: "done",
      progress: 100,
      statusText: "cached",
    });
  }
  const transcriptResult = transcriptFetch.data;

  updateStep("chunk", { status: "running", progress: 0 });
  const chunks = chunkTranscript(transcriptResult.chunks);
  for (let i = 0; i <= 100; i += 25) {
    updateStep("chunk", { progress: i });
    await new Promise((r) => setTimeout(r, 50));
  }
  updateStep("chunk", { status: "done", progress: 100 });

  // Analyze content (with caching)
  const analysisKey = `${videoId}:${model}`;
  const analysisFetch = await getCachedOrFetch(
    cache,
    CacheNamespaces.ANALYSIS,
    analysisKey,
    () =>
      withProgress(
        "analyze",
        () => withRetry(() => analyzeContent(chunks, model), retryOptions),
        5000,
      ),
  );
  if (analysisFetch.fromCache) {
    updateStep("analyze", {
      status: "done",
      progress: 100,
      statusText: "cached",
    });
  }
  const analysis = analysisFetch.data;

  // Generate outline (with caching)
  const outlineKey = `${videoId}:${generateConfigHash(config, model)}`;
  const outlineFetch = await getCachedOrFetch(
    cache,
    CacheNamespaces.OUTLINE,
    outlineKey,
    () =>
      withProgress(
        "outline",
        () =>
          withRetry(
            () => generateOutline(analysis, config, model),
            retryOptions,
          ),
        3000,
      ),
  );
  if (outlineFetch.fromCache) {
    updateStep("outline", {
      status: "done",
      progress: 100,
      statusText: "cached",
    });
  }
  const outline = outlineFetch.data;

  updateStep("generate", { status: "running", progress: 0 });
  const sections = await generateAllSections(
    outline,
    chunks,
    config,
    analysis,
    {
      model,
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
    () => withRetry(() => refineBlog(rawBlog, config, { model }), retryOptions),
    4000,
  );

  let seo;
  if (config.style === "seo") {
    seo = await withRetry(() => generateSEO(blog, model), retryOptions);
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
  const {
    videoUrl,
    model,
    config,
    cache: cacheConfig,
    retry: retryConfig,
  } = options;

  const cacheEnabled = cacheConfig?.enabled ?? true;
  const cache = cacheEnabled ? getCache(cacheConfig?.options) : null;
  const retryOptions = retryConfig ?? RetryPresets.standard;

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error(`Invalid YouTube URL: ${videoUrl}`);
  }

  // Fetch transcript (with caching)
  const cachedTranscript = cache?.get<TranscriptionResult>(
    CacheNamespaces.TRANSCRIPT,
    videoId,
  );
  let transcriptResult: TranscriptionResult;

  if (cachedTranscript) {
    transcriptResult = cachedTranscript;
    yield {
      type: "step",
      data: {
        id: "transcript",
        label: "Fetching transcript",
        status: "done",
        progress: 100,
        statusText: "cached",
      },
    };
  } else {
    yield {
      type: "step",
      data: {
        id: "transcript",
        label: "Fetching transcript",
        status: "running",
        progress: 0,
      },
    };
    transcriptResult = await withRetry(
      () => getTranscript(videoUrl),
      retryOptions,
    );
    cache?.set(CacheNamespaces.TRANSCRIPT, videoId, transcriptResult);
    yield {
      type: "step",
      data: {
        id: "transcript",
        label: "Fetching transcript",
        status: "done",
        progress: 100,
      },
    };
  }

  yield {
    type: "step",
    data: { id: "chunk", label: "Processing", status: "running", progress: 0 },
  };
  const chunks = chunkTranscript(transcriptResult.chunks);
  yield {
    type: "step",
    data: { id: "chunk", label: "Processing", status: "done", progress: 100 },
  };

  // Analyze content (with caching)
  const analysisKey = `${videoId}:${model}`;
  const cachedAnalysis = cache?.get<ContentAnalysis>(
    CacheNamespaces.ANALYSIS,
    analysisKey,
  );
  let analysis: ContentAnalysis;

  if (cachedAnalysis) {
    analysis = cachedAnalysis;
    yield {
      type: "step",
      data: {
        id: "analyze",
        label: "Analyzing",
        status: "done",
        progress: 100,
        statusText: "cached",
      },
    };
  } else {
    yield {
      type: "step",
      data: {
        id: "analyze",
        label: "Analyzing",
        status: "running",
        progress: 0,
      },
    };
    analysis = await withRetry(
      () => analyzeContent(chunks, model),
      retryOptions,
    );
    cache?.set(CacheNamespaces.ANALYSIS, analysisKey, analysis);
    yield {
      type: "step",
      data: {
        id: "analyze",
        label: "Analyzing",
        status: "done",
        progress: 100,
      },
    };
  }

  // Generate outline (with caching)
  const outlineKey = `${videoId}:${generateConfigHash(config, model)}`;
  const cachedOutline = cache?.get<BlogOutline>(
    CacheNamespaces.OUTLINE,
    outlineKey,
  );
  let outline: BlogOutline;

  if (cachedOutline) {
    outline = cachedOutline;
    yield {
      type: "step",
      data: {
        id: "outline",
        label: "Outlining",
        status: "done",
        progress: 100,
        statusText: "cached",
      },
    };
  } else {
    yield {
      type: "step",
      data: {
        id: "outline",
        label: "Outlining",
        status: "running",
        progress: 0,
      },
    };
    outline = await withRetry(
      () => generateOutline(analysis, config, model),
      retryOptions,
    );
    cache?.set(CacheNamespaces.OUTLINE, outlineKey, outline);
    yield {
      type: "step",
      data: {
        id: "outline",
        label: "Outlining",
        status: "done",
        progress: 100,
      },
    };
  }

  yield {
    type: "step",
    data: { id: "generate", label: "Writing", status: "running", progress: 0 },
  };
  for await (const text of streamBlog(outline, chunks, config, analysis, {
    model,
  })) {
    yield { type: "text", data: text };
  }
  yield {
    type: "step",
    data: { id: "generate", label: "Writing", status: "done", progress: 100 },
  };
}
