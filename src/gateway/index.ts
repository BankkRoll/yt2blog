/**
 * @fileoverview AI Gateway client for multi-provider LLM access
 * @module gateway
 */

import { generateText, streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import type { Message } from "./types.js";

/** Model information returned from the AI Gateway */
export interface GatewayModel {
  id: string;
  name: string;
  description?: string;
  modelType?: "language" | "embedding" | "image" | "video";
  provider?: string;
  pricing?: {
    input?: number;
    output?: number;
    inputTiers?: Array<{ min: number; max?: number; cost: number }>;
    cachedInputTokens?: number;
  };
  contextWindow?: number;
  maxOutputTokens?: number;
}

/** Fetches available models from AI Gateway, falls back to defaults if unavailable. */
export async function getAvailableModels(): Promise<GatewayModel[]> {
  const hasGatewayKey = !!process.env.AI_GATEWAY_API_KEY;

  if (!hasGatewayKey) {
    return getDefaultModels();
  }

  try {
    const result = await gateway.getAvailableModels();
    return result.models
      .filter((m: any) => m.modelType === "language")
      .map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        description: m.description,
        modelType: m.modelType,
        provider: m.id.split("/")[0],
        pricing: m.pricing,
        contextWindow: m.contextWindow,
        maxOutputTokens: m.maxOutputTokens,
      }));
  } catch (error) {
    return getDefaultModels();
  }
}

export function getDefaultModels(): GatewayModel[] {
  return [
    {
      id: "openai/gpt-4o",
      name: "GPT-4o",
      provider: "openai",
      pricing: { input: 0.0000025, output: 0.00001 },
    },
    {
      id: "openai/gpt-4o-mini",
      name: "GPT-4o Mini",
      provider: "openai",
      pricing: { input: 0.00000015, output: 0.0000006 },
    },
    {
      id: "openai/gpt-4-turbo",
      name: "GPT-4 Turbo",
      provider: "openai",
      pricing: { input: 0.00001, output: 0.00003 },
    },
    {
      id: "anthropic/claude-sonnet-4-20250514",
      name: "Claude Sonnet 4",
      provider: "anthropic",
      pricing: { input: 0.000003, output: 0.000015 },
    },
    {
      id: "anthropic/claude-3-5-sonnet-20241022",
      name: "Claude 3.5 Sonnet",
      provider: "anthropic",
      pricing: { input: 0.000003, output: 0.000015 },
    },
    {
      id: "anthropic/claude-3-5-haiku-20241022",
      name: "Claude 3.5 Haiku",
      provider: "anthropic",
      pricing: { input: 0.0000008, output: 0.000004 },
    },
    {
      id: "anthropic/claude-3-opus-20240229",
      name: "Claude 3 Opus",
      provider: "anthropic",
      pricing: { input: 0.000015, output: 0.000075 },
    },
    {
      id: "google/gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      provider: "google",
      pricing: { input: 0.0000001, output: 0.0000004 },
    },
    {
      id: "google/gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      provider: "google",
      pricing: { input: 0.00000125, output: 0.000005 },
    },
    {
      id: "google/gemini-1.5-flash",
      name: "Gemini 1.5 Flash",
      provider: "google",
      pricing: { input: 0.000000075, output: 0.0000003 },
    },
    {
      id: "groq/llama-3.3-70b-versatile",
      name: "Llama 3.3 70B",
      provider: "groq",
      pricing: { input: 0.00000059, output: 0.00000079 },
    },
    {
      id: "groq/llama-3.1-8b-instant",
      name: "Llama 3.1 8B",
      provider: "groq",
      pricing: { input: 0.00000005, output: 0.00000008 },
    },
    {
      id: "groq/mixtral-8x7b-32768",
      name: "Mixtral 8x7B",
      provider: "groq",
      pricing: { input: 0.00000024, output: 0.00000024 },
    },
    {
      id: "mistral/mistral-large-latest",
      name: "Mistral Large",
      provider: "mistral",
      pricing: { input: 0.000002, output: 0.000006 },
    },
    {
      id: "mistral/mistral-small-latest",
      name: "Mistral Small",
      provider: "mistral",
      pricing: { input: 0.0000002, output: 0.0000006 },
    },
    {
      id: "cohere/command-r-plus",
      name: "Command R+",
      provider: "cohere",
      pricing: { input: 0.0000025, output: 0.00001 },
    },
    {
      id: "cohere/command-r",
      name: "Command R",
      provider: "cohere",
      pricing: { input: 0.00000015, output: 0.0000006 },
    },
    {
      id: "perplexity/llama-3.1-sonar-large-128k-online",
      name: "Sonar Large Online",
      provider: "perplexity",
      pricing: { input: 0.000001, output: 0.000001 },
    },
    {
      id: "xai/grok-2",
      name: "Grok 2",
      provider: "xai",
      pricing: { input: 0.000002, output: 0.00001 },
    },
    {
      id: "deepseek/deepseek-chat",
      name: "DeepSeek Chat",
      provider: "deepseek",
      pricing: { input: 0.00000014, output: 0.00000028 },
    },
  ];
}

/** Parsed model string components */
interface ParsedModel {
  provider: string;
  model: string;
}

/** AI Gateway internal format for provider-specific API keys */
interface ProviderOptions {
  gateway: {
    byok: Record<string, Array<{ apiKey: string }>>;
  };
}

/** Options for text generation */
export interface GenerateOptions {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
}

/** Result from text generation */
export interface GenerateResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

/** Environment variable names for provider-specific keys */
const PROVIDER_ENV_KEYS: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_API_KEY",
  groq: "GROQ_API_KEY",
  mistral: "MISTRAL_API_KEY",
  cohere: "COHERE_API_KEY",
  perplexity: "PERPLEXITY_API_KEY",
  xai: "XAI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
};

/**
 * Resolves API key for a provider using priority:
 * 1. Provider-specific env var (e.g., OPENAI_API_KEY)
 * 2. AI Gateway key (handles all providers)
 */
export function resolveApiKey(provider: string): string | undefined {
  const envKey = PROVIDER_ENV_KEYS[provider];
  if (envKey && process.env[envKey]) return process.env[envKey];
  return process.env.AI_GATEWAY_API_KEY;
}

/** Checks if a provider has a valid API key available */
export function hasApiKey(provider: string): boolean {
  return !!resolveApiKey(provider);
}

/** Returns list of providers that have API keys configured */
export function getAvailableProviders(): string[] {
  const providers = Object.keys(PROVIDER_ENV_KEYS);
  if (process.env.AI_GATEWAY_API_KEY) return providers;
  return providers.filter((p) => hasApiKey(p));
}

function parseModel(modelString: string): ParsedModel {
  const [provider, ...modelParts] = modelString.split("/");
  return {
    provider,
    model: modelParts.join("/"),
  };
}

function buildProviderOptions(provider: string): ProviderOptions | undefined {
  const key = resolveApiKey(provider);
  if (!key || key === process.env.AI_GATEWAY_API_KEY) return undefined;

  return {
    gateway: {
      byok: {
        [provider]: [{ apiKey: key }],
      },
    },
  };
}

/** Generates text using the specified model via AI Gateway. */
export async function generate(
  options: GenerateOptions,
): Promise<GenerateResult> {
  const { model, messages, temperature = 0.7, maxTokens = 4096 } = options;
  const { provider } = parseModel(model);

  const result = await generateText({
    model,
    messages,
    temperature,
    maxTokens: maxTokens as any,
    providerOptions: buildProviderOptions(provider),
  } as any);

  const usage = result.usage as any;
  return {
    text: result.text,
    usage: usage
      ? {
          promptTokens: usage.promptTokens || usage.input_tokens || 0,
          completionTokens: usage.completionTokens || usage.output_tokens || 0,
          totalTokens:
            usage.totalTokens ||
            usage.promptTokens + usage.completionTokens ||
            0,
        }
      : undefined,
    model,
    provider,
  };
}

/** Streams text using the specified model via AI Gateway. */
export function generateStream(options: GenerateOptions) {
  const { model, messages, temperature = 0.7, maxTokens = 4096 } = options;
  const { provider } = parseModel(model);

  const result = streamText({
    model,
    messages,
    temperature,
    maxTokens: maxTokens as any,
    providerOptions: buildProviderOptions(provider),
  } as any);

  return result;
}

/** Simple completion helper for single prompts. */
export async function complete(model: string, prompt: string): Promise<string> {
  const result = await generate({
    model,
    messages: [{ role: "user", content: prompt }],
  });
  return result.text;
}

/** Generates JSON output with automatic parsing. */
export async function completeJSON<T = unknown>(
  model: string,
  prompt: string,
): Promise<T> {
  const result = await generate({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a JSON generator. Output ONLY valid JSON, no markdown, no explanation.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3, // Lower temp for structured output
  });

  let jsonStr = result.text.trim();
  if (jsonStr.startsWith("```json")) {
    jsonStr = jsonStr.slice(7);
  }
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith("```")) {
    jsonStr = jsonStr.slice(0, -3);
  }

  return JSON.parse(jsonStr.trim()) as T;
}
