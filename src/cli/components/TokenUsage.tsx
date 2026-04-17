/**
 * @fileoverview Token usage display components with cost estimation and context metering
 * @module cli/components/TokenUsage
 */

import { Box, Text } from "ink";
import { useTheme } from "../theme/index.js";

/** Formats large numbers with K/M suffixes */
function formatK(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

interface TokenUsageProps {
  promptTokens: number;
  completionTokens: number;
  totalTokens?: number;
  contextLimit?: number;
  promptCost?: number;
  completionCost?: number;
  compact?: boolean;
  showContextMeter?: boolean;
}

/** Displays token consumption with optional cost estimate. */
export function TokenUsage({
  promptTokens,
  completionTokens,
  totalTokens,
  contextLimit,
  promptCost,
  completionCost,
  compact = false,
  showContextMeter = false,
}: TokenUsageProps) {
  const { theme } = useTheme();

  const total = totalTokens ?? promptTokens + completionTokens;
  const hasContext = contextLimit !== undefined && contextLimit > 0;

  const cost =
    promptCost !== undefined && completionCost !== undefined
      ? (promptTokens / 1000) * promptCost +
        (completionTokens / 1000) * completionCost
      : undefined;

  const fmt = (n: number) => n.toLocaleString();

  if (compact) {
    return (
      <Box>
        <Text color={theme.palette.textMuted}>
          tokens: {fmt(promptTokens)}↑ {fmt(completionTokens)}↓
        </Text>
        {cost !== undefined && (
          <Text color={theme.palette.success}> (~${cost.toFixed(4)})</Text>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={theme.palette.textMuted}>Tokens: </Text>
        <Text color={theme.palette.info}>{fmt(promptTokens)}</Text>
        <Text color={theme.palette.textDim}> prompt</Text>
        <Text color={theme.palette.textMuted}> + </Text>
        <Text color={theme.palette.warning}>{fmt(completionTokens)}</Text>
        <Text color={theme.palette.textDim}> completion</Text>
        <Text color={theme.palette.textMuted}> = </Text>
        <Text bold>{fmt(total)}</Text>
        <Text color={theme.palette.textDim}> total</Text>
      </Box>

      {showContextMeter && hasContext && (
        <ContextMeter used={total} limit={contextLimit!} />
      )}

      {cost !== undefined && (
        <Box>
          <Text color={theme.palette.textMuted}>Cost: </Text>
          <Text color={theme.palette.success}>~${cost.toFixed(4)}</Text>
        </Box>
      )}
    </Box>
  );
}

interface ContextMeterProps {
  used: number;
  limit: number;
  width?: number;
}

/** Visual progress bar showing context window usage. */
export function ContextMeter({ used, limit, width = 30 }: ContextMeterProps) {
  const { theme } = useTheme();

  const percent = Math.min(100, (used / limit) * 100);
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  const getColor = () => {
    if (percent > 90) return theme.palette.error;
    if (percent > 70) return theme.palette.warning;
    return theme.palette.success;
  };

  return (
    <Box>
      <Text color={theme.palette.textMuted}>Context: </Text>
      <Text color={theme.palette.textDim}>[</Text>
      <Text color={getColor()}>{"█".repeat(filled)}</Text>
      <Text color={theme.palette.textDim}>{"░".repeat(empty)}</Text>
      <Text color={theme.palette.textDim}>]</Text>
      <Text color={theme.palette.textMuted}>
        {" "}
        {formatK(used)}/{formatK(limit)} ({percent.toFixed(1)}%)
      </Text>
    </Box>
  );
}

interface ModelInfoProps {
  model: string;
  provider?: string;
  contextWindow?: number;
}

/** Displays model name, provider, and context window size. */
export function ModelInfo({ model, provider, contextWindow }: ModelInfoProps) {
  const { theme } = useTheme();

  return (
    <Box>
      <Text color={theme.palette.textMuted}>Model: </Text>
      <Text bold color={theme.palette.primary}>
        {model}
      </Text>
      {provider && <Text color={theme.palette.textDim}> ({provider})</Text>}
      {contextWindow && (
        <Text color={theme.palette.textMuted}>
          {" "}
          • {formatK(contextWindow)} ctx
        </Text>
      )}
    </Box>
  );
}
