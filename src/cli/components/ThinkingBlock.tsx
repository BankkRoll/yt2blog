/**
 * @fileoverview UI components for displaying AI thinking state and streaming text
 * @module cli/components/ThinkingBlock
 */

import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { useTheme } from "../theme/index.js";

interface ThinkingBlockProps {
  title?: string;
  content?: string;
  expanded?: boolean;
  isThinking?: boolean;
  animate?: boolean;
}

const THINKING_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const DOT_FRAMES = [".", "..", "..."];

/** Collapsible block displaying AI thinking/reasoning state. */
export function ThinkingBlock({
  title = "Thinking",
  content,
  expanded = false,
  isThinking = false,
  animate = true,
}: ThinkingBlockProps) {
  const { theme } = useTheme();
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [dotFrame, setDotFrame] = useState(0);

  useEffect(() => {
    if (!isThinking || !animate) return;

    const spinnerInterval = setInterval(() => {
      setSpinnerFrame((f) => (f + 1) % THINKING_FRAMES.length);
    }, 80);

    const dotInterval = setInterval(() => {
      setDotFrame((f) => (f + 1) % DOT_FRAMES.length);
    }, 500);

    return () => {
      clearInterval(spinnerInterval);
      clearInterval(dotInterval);
    };
  }, [isThinking, animate]);

  return (
    <Box flexDirection="column">
      <Box>
        {isThinking ? (
          <Text color={theme.palette.secondary}>
            {THINKING_FRAMES[spinnerFrame]}
          </Text>
        ) : (
          <Text color={theme.palette.textMuted}>{expanded ? "▼" : "▶"}</Text>
        )}
        <Text
          color={isThinking ? theme.palette.secondary : theme.palette.textMuted}
        >
          {" "}
          {title}
        </Text>
        {isThinking && (
          <Text color={theme.palette.textDim}>{DOT_FRAMES[dotFrame]}</Text>
        )}
      </Box>

      {(expanded || isThinking) && content && (
        <Box
          marginLeft={2}
          marginTop={1}
          borderStyle="round"
          borderColor={theme.palette.secondary}
          paddingX={1}
        >
          <Text color={theme.palette.textMuted} wrap="wrap">
            {content}
          </Text>
        </Box>
      )}
    </Box>
  );
}

interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  showCursor?: boolean;
  cursor?: string;
}

/** Displays text with an optional blinking cursor during streaming. */
export function StreamingText({
  text,
  isStreaming = false,
  showCursor = true,
  cursor = "▌",
}: StreamingTextProps) {
  const { theme } = useTheme();
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!isStreaming || !showCursor) return;

    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);

    return () => clearInterval(interval);
  }, [isStreaming, showCursor]);

  return (
    <Text>
      {text}
      {isStreaming && showCursor && (
        <Text color={theme.palette.primary}>
          {cursorVisible ? cursor : " "}
        </Text>
      )}
    </Text>
  );
}
