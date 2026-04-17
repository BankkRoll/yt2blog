/**
 * @fileoverview Visual progress indicator with multiple style presets
 * @module cli/components/ProgressBar
 */

import { Box, Text } from "ink";

import React from "react";
import { useTheme } from "../theme/index.js";

export type ProgressBarStyle =
  | "default"
  | "smooth"
  | "block"
  | "arrow"
  | "line";

interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Total width in characters */
  width?: number;
  /** Show percentage label */
  showPercent?: boolean;
  /** Show value/total label (e.g., "3/10") */
  showValue?: { current: number; total: number };
  /** Style preset */
  style?: ProgressBarStyle;
  /** Custom fill character */
  fillChar?: string;
  /** Custom empty character */
  emptyChar?: string;
  /** Color for filled portion */
  color?: string;
  /** Label text */
  label?: string;
}

const STYLES: Record<ProgressBarStyle, { fill: string; empty: string }> = {
  default: { fill: "█", empty: "░" },
  smooth: { fill: "▓", empty: "░" },
  block: { fill: "■", empty: "□" },
  arrow: { fill: "▶", empty: "─" },
  line: { fill: "━", empty: "─" },
};

/** Visual progress indicator with multiple style presets. */
export function ProgressBar({
  value,
  width = 30,
  showPercent = true,
  showValue,
  style = "default",
  fillChar,
  emptyChar,
  color,
  label,
}: ProgressBarProps) {
  const { theme } = useTheme();

  const clampedValue = Math.max(0, Math.min(100, value));
  const styleConfig = STYLES[style];
  const fill = fillChar || styleConfig.fill;
  const empty = emptyChar || styleConfig.empty;
  const filledLength = Math.round((clampedValue / 100) * width);
  const emptyLength = width - filledLength;
  const filledStr = fill.repeat(filledLength);
  const emptyStr = empty.repeat(emptyLength);

  return (
    <Box>
      {label && <Text color={theme.palette.text}>{label} </Text>}

      <Text color={theme.palette.textDim}>[</Text>
      <Text color={color || theme.palette.primary}>{filledStr}</Text>
      <Text color={theme.palette.textDim}>{emptyStr}</Text>
      <Text color={theme.palette.textDim}>]</Text>

      {showPercent && (
        <Text color={theme.palette.textMuted}>
          {" "}
          {Math.round(clampedValue)}%
        </Text>
      )}

      {showValue && (
        <Text color={theme.palette.textMuted}>
          {" "}
          {showValue.current}/{showValue.total}
        </Text>
      )}
    </Box>
  );
}

interface MultiProgressItem {
  id: string;
  label: string;
  value: number;
  status?: "pending" | "running" | "done" | "error";
}

interface MultiProgressProps {
  items: MultiProgressItem[];
  width?: number;
}

/** Displays multiple progress bars with status indicators. */
export function MultiProgress({ items, width = 25 }: MultiProgressProps) {
  const { theme } = useTheme();

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pending":
        return <Text color={theme.palette.textDim}>○</Text>;
      case "running":
        return <Text color={theme.palette.primary}>●</Text>;
      case "done":
        return <Text color={theme.palette.success}>✓</Text>;
      case "error":
        return <Text color={theme.palette.error}>✗</Text>;
      default:
        return <Text color={theme.palette.textDim}>○</Text>;
    }
  };

  const getColor = (status?: string) => {
    switch (status) {
      case "running":
        return theme.palette.primary;
      case "done":
        return theme.palette.success;
      case "error":
        return theme.palette.error;
      default:
        return theme.palette.textDim;
    }
  };

  const maxLabelLength = Math.max(...items.map((item) => item.label.length));

  return (
    <Box flexDirection="column">
      {items.map((item) => (
        <Box key={item.id}>
          <Box width={2}>{getStatusIcon(item.status)}</Box>

          <Box width={maxLabelLength + 1}>
            <Text color={getColor(item.status)}>{item.label}</Text>
          </Box>

          <ProgressBar
            value={item.value}
            width={width}
            showPercent={item.status === "running"}
            color={getColor(item.status)}
          />
        </Box>
      ))}
    </Box>
  );
}
