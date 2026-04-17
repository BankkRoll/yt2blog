/**
 * @fileoverview Multi-step setup wizard with composable input components
 * @module cli/components/SetupFlow
 */

import React, { useState, useEffect, createContext, useContext } from "react";
import { Box, Text, useInput } from "ink";
import { useTheme } from "../theme/index.js";

export type StepStatus = "done" | "active" | "pending" | "success" | "error";

const SetupFlowContext = createContext<{
  connectorChar: string;
  connectorColor: string;
}>({
  connectorChar: "│",
  connectorColor: "gray",
});

interface SetupFlowProps {
  title?: string;
  subtitle?: string;
  connectorChar?: string;
  children: React.ReactNode;
}

function SetupFlowRoot({
  title,
  subtitle,
  connectorChar = "│",
  children,
}: SetupFlowProps) {
  const { theme } = useTheme();

  return (
    <SetupFlowContext.Provider
      value={{ connectorChar, connectorColor: theme.palette.textDim }}
    >
      <Box flexDirection="column">
        {title && (
          <Box marginBottom={1}>
            <Text bold color={theme.palette.primary}>
              ◆ {title}
            </Text>
            {subtitle && (
              <Text color={theme.palette.textMuted}> — {subtitle}</Text>
            )}
          </Box>
        )}

        {React.Children.map(children, (child, i) => (
          <React.Fragment key={i}>
            {child}
            {i < React.Children.count(children) - 1 && (
              <Box paddingLeft={1}>
                <Text color={theme.palette.textDim}>{connectorChar}</Text>
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>
    </SetupFlowContext.Provider>
  );
}

interface StepProps {
  status?: StepStatus;
  label: string;
  hint?: string;
  children?: React.ReactNode;
}

const STATUS_ICONS: Record<StepStatus, { icon: string; color: string }> = {
  done: { icon: "●", color: "green" },
  active: { icon: "◇", color: "cyan" },
  pending: { icon: "○", color: "gray" },
  success: { icon: "✓", color: "green" },
  error: { icon: "✗", color: "red" },
};

function Step({ status = "pending", label, hint, children }: StepProps) {
  const { theme } = useTheme();
  const { icon, color } = STATUS_ICONS[status];

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={color}>{icon}</Text>
        <Text
          color={
            status === "active"
              ? theme.palette.primary
              : status === "done"
                ? theme.palette.success
                : theme.palette.textMuted
          }
          bold={status === "active"}
        >
          {" "}
          {label}
        </Text>
        {hint && status === "active" && (
          <Text color={theme.palette.textDim}> ({hint})</Text>
        )}
      </Box>
      {children && status === "active" && (
        <Box marginLeft={2} flexDirection="column">
          {children}
        </Box>
      )}
    </Box>
  );
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  mask?: boolean;
}

function TextInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  mask = false,
}: TextInputProps) {
  const { theme } = useTheme();

  useInput((input, key) => {
    if (key.return && onSubmit) {
      onSubmit(value);
    } else if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
    } else if (input && !key.ctrl && !key.meta) {
      onChange(value + input);
    }
  });

  const displayValue = mask ? "•".repeat(value.length) : value;

  return (
    <Box>
      <Text color={theme.palette.primary}>❯ </Text>
      <Text>{displayValue || ""}</Text>
      <Text color={theme.palette.primary}>█</Text>
      {!value && placeholder && (
        <Text color={theme.palette.textDim}> {placeholder}</Text>
      )}
    </Box>
  );
}

interface SelectProps {
  options: Array<{ value: string; label: string; description?: string }>;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onSubmit?: (value: string) => void;
}

function Select({ options, selectedIndex, onSelect, onSubmit }: SelectProps) {
  const { theme } = useTheme();

  useInput((input, key) => {
    if (key.upArrow) {
      onSelect(Math.max(0, selectedIndex - 1));
    } else if (key.downArrow) {
      onSelect(Math.min(options.length - 1, selectedIndex + 1));
    } else if (key.return && onSubmit) {
      onSubmit(options[selectedIndex].value);
    }
  });

  return (
    <Box flexDirection="column">
      {options.map((opt, i) => (
        <Box key={opt.value}>
          <Text
            color={
              i === selectedIndex ? theme.palette.primary : theme.palette.text
            }
          >
            {i === selectedIndex ? "❯ " : "  "}
            {opt.label}
          </Text>
          {opt.description && (
            <Text color={theme.palette.textDim}> — {opt.description}</Text>
          )}
        </Box>
      ))}
    </Box>
  );
}

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onSubmit?: (value: number) => void;
  format?: (value: number) => string;
}

function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  onSubmit,
  format = (v) => String(v),
}: SliderProps) {
  const { theme } = useTheme();

  useInput((input, key) => {
    if (key.leftArrow) {
      onChange(Math.max(min, value - step));
    } else if (key.rightArrow) {
      onChange(Math.min(max, value + step));
    } else if (key.return && onSubmit) {
      onSubmit(value);
    }
  });

  return (
    <Box>
      <Text color={theme.palette.primary}>◀ </Text>
      <Text bold>{format(value)}</Text>
      <Text color={theme.palette.primary}> ▶</Text>
      <Text color={theme.palette.textDim}> (←/→ to adjust)</Text>
    </Box>
  );
}

interface SpinnerProps {
  label: string;
}

function Spinner({ label }: SpinnerProps) {
  const { theme } = useTheme();
  const [frame, setFrame] = useState(0);
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Text color={theme.palette.primary}>◆</Text>
      <Text color={theme.palette.primary}> {frames[frame]}</Text>
      <Text> {label}</Text>
    </Box>
  );
}

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
}

function Badge({ label, color = "black", bgColor = "cyan" }: BadgeProps) {
  return (
    <Box marginBottom={1}>
      <Text backgroundColor={bgColor} color={color}>
        {` ┌ ${label} ┐ `}
      </Text>
    </Box>
  );
}

interface InfoProps {
  children: React.ReactNode;
}

function Info({ children }: InfoProps) {
  const { theme } = useTheme();

  return (
    <Box>
      <Text color={theme.palette.info}>ℹ</Text>
      <Text color={theme.palette.textMuted}> {children}</Text>
    </Box>
  );
}

/** Multi-step setup wizard with composable input sub-components. */
export const SetupFlow = Object.assign(SetupFlowRoot, {
  Step,
  TextInput,
  Select,
  Slider,
  Spinner,
  Badge,
  Info,
});
