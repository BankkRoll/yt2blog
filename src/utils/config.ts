/**
 * @fileoverview Configuration file loader for yt2blog
 * @module utils/config
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { BlogStyle } from "../gateway/types.js";

/** Custom system prompt configuration */
export interface CustomPrompts {
  /** System prompt prepended to all LLM calls */
  system?: string;
  /** Per-style prompt overrides */
  styles?: Partial<Record<BlogStyle, string>>;
  /** Brand voice description */
  brandVoice?: string;
}

/** Quality preset configuration */
export type QualityPreset = "fast" | "balanced" | "thorough";

/** Output format options */
export interface OutputOptions {
  /** Include YAML frontmatter */
  frontmatter?: boolean;
  /** Include YouTube timestamp links */
  timestampLinks?: boolean;
  /** Output format */
  format?: "markdown" | "html" | "text";
}

/** Full configuration schema */
export interface Yt2BlogConfig {
  /** Default LLM model (provider/model format) */
  defaultModel?: string;
  /** Default blog style */
  defaultStyle?: BlogStyle;
  /** Default section count */
  defaultSections?: number;
  /** Default word count */
  defaultWordCount?: number;
  /** Quality preset */
  quality?: QualityPreset;
  /** Custom prompts */
  prompts?: CustomPrompts;
  /** Output options */
  output?: OutputOptions;
  /** Cache settings */
  cache?: {
    enabled?: boolean;
    ttl?: number;
    directory?: string;
  };
  /** Retry settings */
  retry?: {
    maxRetries?: number;
    initialDelay?: number;
  };
  /** Provider API keys (alternative to env vars) */
  apiKeys?: Record<string, string>;
}

/** Config file names to search for */
const CONFIG_FILES = [
  "yt2blog.config.ts",
  "yt2blog.config.js",
  "yt2blog.config.json",
  ".yt2blogrc",
  ".yt2blogrc.json",
];

/** Default configuration values */
export const DEFAULT_CONFIG: Required<Yt2BlogConfig> = {
  defaultModel: "openai/gpt-4o",
  defaultStyle: "seo",
  defaultSections: 5,
  defaultWordCount: 1500,
  quality: "balanced",
  prompts: {},
  output: {
    frontmatter: false,
    timestampLinks: false,
    format: "markdown",
  },
  cache: {
    enabled: true,
    ttl: 24 * 60 * 60 * 1000,
    directory: ".yt2blog-cache",
  },
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
  },
  apiKeys: {},
};

/** Quality preset mappings */
export const QUALITY_PRESETS: Record<
  QualityPreset,
  { model?: string; sections: number; refinementPasses: number }
> = {
  fast: { sections: 3, refinementPasses: 0 },
  balanced: { sections: 5, refinementPasses: 1 },
  thorough: { sections: 7, refinementPasses: 2 },
};

/**
 * Loads configuration from file or returns defaults.
 * Searches for config files in the current directory.
 */
export function loadConfig(basePath: string = process.cwd()): Yt2BlogConfig {
  for (const filename of CONFIG_FILES) {
    const filepath = join(basePath, filename);

    if (!existsSync(filepath)) continue;

    try {
      if (filename.endsWith(".json") || filename === ".yt2blogrc") {
        const content = readFileSync(filepath, "utf-8");
        return mergeConfig(JSON.parse(content));
      }

      // For .ts/.js files, we'd need dynamic import which is async
      // For now, only support JSON config files in sync mode
    } catch {
      // Continue to next file on parse error
    }
  }

  return DEFAULT_CONFIG;
}

/**
 * Loads configuration asynchronously (supports .ts/.js files).
 */
export async function loadConfigAsync(
  basePath: string = process.cwd(),
): Promise<Yt2BlogConfig> {
  for (const filename of CONFIG_FILES) {
    const filepath = join(basePath, filename);

    if (!existsSync(filepath)) continue;

    try {
      if (filename.endsWith(".json") || filename === ".yt2blogrc") {
        const content = readFileSync(filepath, "utf-8");
        return mergeConfig(JSON.parse(content));
      }

      if (filename.endsWith(".ts") || filename.endsWith(".js")) {
        const module = await import(filepath);
        return mergeConfig(module.default || module);
      }
    } catch {
      // Continue to next file on error
    }
  }

  return DEFAULT_CONFIG;
}

/** Merges user config with defaults */
function mergeConfig(userConfig: Partial<Yt2BlogConfig>): Yt2BlogConfig {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    prompts: { ...DEFAULT_CONFIG.prompts, ...userConfig.prompts },
    output: { ...DEFAULT_CONFIG.output, ...userConfig.output },
    cache: { ...DEFAULT_CONFIG.cache, ...userConfig.cache },
    retry: { ...DEFAULT_CONFIG.retry, ...userConfig.retry },
    apiKeys: { ...DEFAULT_CONFIG.apiKeys, ...userConfig.apiKeys },
  };
}

/**
 * Helper for defining typed configuration.
 * @example
 * ```ts
 * // yt2blog.config.ts
 * import { defineConfig } from 'yt2blog';
 * export default defineConfig({
 *   defaultModel: 'anthropic/claude-sonnet-4',
 *   quality: 'thorough',
 * });
 * ```
 */
export function defineConfig(config: Yt2BlogConfig): Yt2BlogConfig {
  return config;
}
