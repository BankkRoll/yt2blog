/**
 * @fileoverview File-based caching for transcripts, analysis, and pipeline state
 * @module utils/cache
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  readdirSync,
  statSync,
} from "fs";
import { join } from "path";
import { createHash } from "crypto";

/** Cache entry with metadata */
interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt: number | null;
  version: string;
}

/** Cache options */
export interface CacheOptions {
  /** Cache directory path (default: .yt2blog-cache in cwd) */
  cacheDir?: string;
  /** Time-to-live in milliseconds (default: 24 hours, null for no expiry) */
  ttl?: number | null;
  /** Cache version for invalidation */
  version?: string;
}

const DEFAULT_CACHE_DIR = ".yt2blog-cache";
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_VERSION = "1.0.0";

/** File-based cache manager for yt2blog pipeline data */
export class Cache {
  private cacheDir: string;
  private ttl: number | null;
  private version: string;

  constructor(options: CacheOptions = {}) {
    this.cacheDir = options.cacheDir || join(process.cwd(), DEFAULT_CACHE_DIR);
    this.ttl = options.ttl === undefined ? DEFAULT_TTL : options.ttl;
    this.version = options.version || CACHE_VERSION;
    this.ensureCacheDir();
  }

  /** Ensures cache directory exists */
  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /** Generates cache key from input */
  private generateKey(namespace: string, identifier: string): string {
    const hash = createHash("sha256")
      .update(`${namespace}:${identifier}:${this.version}`)
      .digest("hex")
      .slice(0, 16);
    return `${namespace}-${hash}.json`;
  }

  /** Gets file path for a cache key */
  private getFilePath(key: string): string {
    return join(this.cacheDir, key);
  }

  /** Checks if cache entry is expired */
  private isExpired(entry: CacheEntry<unknown>): boolean {
    if (entry.expiresAt === null) return false;
    return Date.now() > entry.expiresAt;
  }

  /** Checks if cache entry version matches */
  private isValidVersion(entry: CacheEntry<unknown>): boolean {
    return entry.version === this.version;
  }

  /** Gets cached data by namespace and identifier */
  get<T>(namespace: string, identifier: string): T | null {
    const key = this.generateKey(namespace, identifier);
    const filePath = this.getFilePath(key);

    if (!existsSync(filePath)) return null;

    try {
      const content = readFileSync(filePath, "utf-8");
      const entry = JSON.parse(content) as CacheEntry<T>;

      if (!this.isValidVersion(entry)) {
        this.delete(namespace, identifier);
        return null;
      }

      if (this.isExpired(entry)) {
        this.delete(namespace, identifier);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  }

  /** Sets cached data by namespace and identifier */
  set<T>(
    namespace: string,
    identifier: string,
    data: T,
    ttl?: number | null,
  ): void {
    const key = this.generateKey(namespace, identifier);
    const filePath = this.getFilePath(key);

    const effectiveTtl = ttl === undefined ? this.ttl : ttl;
    const entry: CacheEntry<T> = {
      data,
      createdAt: Date.now(),
      expiresAt: effectiveTtl === null ? null : Date.now() + effectiveTtl,
      version: this.version,
    };

    writeFileSync(filePath, JSON.stringify(entry, null, 2));
  }

  /** Checks if cache entry exists and is valid */
  has(namespace: string, identifier: string): boolean {
    return this.get(namespace, identifier) !== null;
  }

  /** Deletes cached data by namespace and identifier */
  delete(namespace: string, identifier: string): boolean {
    const key = this.generateKey(namespace, identifier);
    const filePath = this.getFilePath(key);

    if (!existsSync(filePath)) return false;

    try {
      unlinkSync(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /** Clears all cache entries for a namespace */
  clearNamespace(namespace: string): number {
    let cleared = 0;
    const files = readdirSync(this.cacheDir);

    for (const file of files) {
      if (file.startsWith(`${namespace}-`)) {
        try {
          unlinkSync(join(this.cacheDir, file));
          cleared++;
        } catch {
          // Ignore deletion errors
        }
      }
    }

    return cleared;
  }

  /** Clears all cache entries */
  clearAll(): number {
    let cleared = 0;
    const files = readdirSync(this.cacheDir);

    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          unlinkSync(join(this.cacheDir, file));
          cleared++;
        } catch {
          // Ignore deletion errors
        }
      }
    }

    return cleared;
  }

  /** Clears expired cache entries */
  clearExpired(): number {
    let cleared = 0;
    const files = readdirSync(this.cacheDir);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = join(this.cacheDir, file);
      try {
        const content = readFileSync(filePath, "utf-8");
        const entry = JSON.parse(content) as CacheEntry<unknown>;

        if (this.isExpired(entry) || !this.isValidVersion(entry)) {
          unlinkSync(filePath);
          cleared++;
        }
      } catch {
        // Ignore parse errors
      }
    }

    return cleared;
  }

  /** Gets cache statistics */
  getStats(): {
    totalEntries: number;
    totalSize: number;
    namespaces: Record<string, number>;
  } {
    const files = readdirSync(this.cacheDir);
    const namespaces: Record<string, number> = {};
    let totalSize = 0;

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = join(this.cacheDir, file);
      const stats = statSync(filePath);
      totalSize += stats.size;

      const namespace = file.split("-")[0];
      namespaces[namespace] = (namespaces[namespace] || 0) + 1;
    }

    return {
      totalEntries: files.filter((f) => f.endsWith(".json")).length,
      totalSize,
      namespaces,
    };
  }
}

/** Default cache instance */
let defaultCache: Cache | null = null;

/**
 * Gets or creates the default cache instance.
 * @param options - Options for initial creation only (ignored if cache already exists)
 * @returns The singleton cache instance
 */
export function getCache(options?: CacheOptions): Cache {
  if (!defaultCache) {
    defaultCache = new Cache(options);
  }
  return defaultCache;
}

/** Resets the default cache instance (useful for testing) */
export function resetCache(): void {
  defaultCache = null;
}

/** Cache namespaces for different data types */
export const CacheNamespaces = {
  TRANSCRIPT: "transcript",
  METADATA: "metadata",
  ANALYSIS: "analysis",
  OUTLINE: "outline",
  PIPELINE_STATE: "pipeline-state",
} as const;

export type CacheNamespace =
  (typeof CacheNamespaces)[keyof typeof CacheNamespaces];
