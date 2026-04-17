/**
 * @fileoverview Tool call status display with progress indicators
 * @module cli/components/ToolCall
 */

import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { useTheme } from "../theme/index.js";

export type ToolCallStatus = "pending" | "running" | "success" | "error";

interface ToolCallProps {
  name: string;
  description?: string;
  status: ToolCallStatus;
  progress?: number;
  elapsed?: number;
  result?: string;
  error?: string;
  expanded?: boolean;
}

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/** Displays a tool/pipeline step with status indicator and optional progress bar. */
export function ToolCall({
  name,
  description,
  status,
  progress = 0,
  elapsed,
  result,
  error,
  expanded = false,
}: ToolCallProps) {
  const { theme } = useTheme();
  const [spinnerFrame, setSpinnerFrame] = useState(0);

  useEffect(() => {
    if (status !== "running") return;

    const interval = setInterval(() => {
      setSpinnerFrame((f) => (f + 1) % SPINNER_FRAMES.length);
    }, 80);

    return () => clearInterval(interval);
  }, [status]);

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Text color={theme.palette.textDim}>○</Text>;
      case "running":
        return (
          <Text color={theme.palette.primary}>
            {SPINNER_FRAMES[spinnerFrame]}
          </Text>
        );
      case "success":
        return <Text color={theme.palette.success}>✓</Text>;
      case "error":
        return <Text color={theme.palette.error}>✗</Text>;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return theme.palette.textDim;
      case "running":
        return theme.palette.primary;
      case "success":
        return theme.palette.success;
      case "error":
        return theme.palette.error;
    }
  };

  const formatElapsed = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const renderProgressBar = () => {
    if (status !== "running" || progress === undefined) return null;

    const width = 20;
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;

    return (
      <Box marginLeft={2}>
        <Text color={theme.palette.textDim}>[</Text>
        <Text color={theme.palette.primary}>{"█".repeat(filled)}</Text>
        <Text color={theme.palette.textDim}>{"░".repeat(empty)}</Text>
        <Text color={theme.palette.textDim}>]</Text>
        <Text color={theme.palette.textMuted}> {Math.round(progress)}%</Text>
      </Box>
    );
  };

  return (
    <Box flexDirection="column">
      <Box>
        <Box width={2}>{getStatusIcon()}</Box>
        <Text color={getStatusColor()} bold={status === "running"}>
          {name}
        </Text>
        {description && status !== "success" && (
          <Text color={theme.palette.textMuted}> — {description}</Text>
        )}
        {elapsed !== undefined && status !== "pending" && (
          <Text color={theme.palette.textDim}> ({formatElapsed(elapsed)})</Text>
        )}
      </Box>

      {renderProgressBar()}

      {expanded && result && status === "success" && (
        <Box marginLeft={2} marginTop={1}>
          <Text color={theme.palette.textMuted}>└─ {result}</Text>
        </Box>
      )}

      {error && status === "error" && (
        <Box marginLeft={2} marginTop={1}>
          <Text color={theme.palette.error}>└─ {error}</Text>
        </Box>
      )}
    </Box>
  );
}

interface ToolCallGroupProps {
  title?: string;
  children: React.ReactNode;
}

/** Groups multiple ToolCall components under an optional title. */
export function ToolCallGroup({ title, children }: ToolCallGroupProps) {
  const { theme } = useTheme();

  return (
    <Box flexDirection="column">
      {title && (
        <Box marginBottom={1}>
          <Text bold color={theme.palette.primary}>
            ◆ {title}
          </Text>
        </Box>
      )}
      <Box flexDirection="column" marginLeft={1}>
        {children}
      </Box>
    </Box>
  );
}
