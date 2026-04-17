/**
 * @fileoverview Animated spinner component with multiple style presets
 * @module cli/components/Spinner
 */

import { useState, useEffect } from "react";
import { Text } from "ink";
import { useTheme } from "../theme/index.js";

export const SPINNER_STYLES = {
  dots: {
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
    interval: 80,
  },
  line: {
    frames: ["-", "\\", "|", "/"],
    interval: 100,
  },
  arrow: {
    frames: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],
    interval: 100,
  },
  pulse: {
    frames: ["◐", "◓", "◑", "◒"],
    interval: 100,
  },
  bounce: {
    frames: ["⠁", "⠂", "⠄", "⠂"],
    interval: 120,
  },
  arc: {
    frames: ["◜", "◠", "◝", "◞", "◡", "◟"],
    interval: 100,
  },
  circle: {
    frames: ["◴", "◷", "◶", "◵"],
    interval: 100,
  },
  square: {
    frames: ["◰", "◳", "◲", "◱"],
    interval: 100,
  },
  star: {
    frames: ["✶", "✷", "✸", "✹", "✺", "✹", "✸", "✷"],
    interval: 80,
  },
  grow: {
    frames: ["▁", "▃", "▄", "▅", "▆", "▇", "█", "▇", "▆", "▅", "▄", "▃"],
    interval: 80,
  },
};

export type SpinnerStyle = keyof typeof SPINNER_STYLES;

interface SpinnerProps {
  style?: SpinnerStyle;
  color?: string;
  label?: string;
}

/** Animated loading indicator with configurable style. */
export function Spinner({ style = "dots", color, label }: SpinnerProps) {
  const { theme } = useTheme();
  const [frame, setFrame] = useState(0);

  const spinnerConfig = SPINNER_STYLES[style];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % spinnerConfig.frames.length);
    }, spinnerConfig.interval);

    return () => clearInterval(interval);
  }, [style, spinnerConfig.frames.length, spinnerConfig.interval]);

  return (
    <Text color={color || theme.palette.primary}>
      {spinnerConfig.frames[frame]}
      {label && <Text color={theme.palette.text}> {label}</Text>}
    </Text>
  );
}
