/**
 * @fileoverview Compound component for full-screen TUI layout with header, content, input, and hints
 * @module cli/components/AppShell
 */

import { Box, Text, useInput } from "ink";
import React, { useState } from "react";

import { useTheme } from "../theme/index.js";

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellRoot({ children }: AppShellProps) {
  return (
    <Box flexDirection="column" flexGrow={1}>
      {children}
    </Box>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  version?: string;
}

function Header({ title, subtitle, icon = "◆", version }: HeaderProps) {
  const { theme } = useTheme();

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color={theme.palette.primary} bold>
          {icon} {title}
        </Text>
        {version && <Text color={theme.palette.textDim}> v{version}</Text>}
      </Box>
      {subtitle && <Text color={theme.palette.textMuted}>{subtitle}</Text>}
    </Box>
  );
}

interface TipProps {
  children: React.ReactNode;
}

function Tip({ children }: TipProps) {
  const { theme } = useTheme();

  return (
    <Box paddingLeft={2}>
      <Text color={theme.palette.warning}>💡 Tip: </Text>
      <Text color={theme.palette.textMuted}>{children}</Text>
    </Box>
  );
}

interface ContentProps {
  children: React.ReactNode;
  height?: number;
  scrollable?: boolean;
}

function Content({ children, height, scrollable = false }: ContentProps) {
  const [scrollTop, setScrollTop] = useState(0);

  useInput((_, key) => {
    if (!scrollable) return;
    if (key.upArrow) {
      setScrollTop((s) => Math.max(0, s - 1));
    } else if (key.downArrow) {
      setScrollTop((s) => s + 1);
    }
  });

  if (scrollable && height) {
    return (
      <Box flexDirection="column" height={height} overflow="hidden">
        <Box flexDirection="column" marginTop={-scrollTop}>
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      {children}
    </Box>
  );
}

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  borderStyle?: "single" | "double" | "round" | "bold";
}

function Input({
  value,
  onChange,
  onSubmit,
  placeholder = "Type something...",
  prefix = ">",
  borderStyle = "single",
}: InputProps) {
  const { theme } = useTheme();

  useInput((input, key) => {
    if (key.return && onSubmit) {
      onSubmit(value);
    } else if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
    } else if (input && !key.ctrl && !key.meta && !key.escape) {
      onChange(value + input);
    }
  });

  return (
    <Box
      borderStyle={borderStyle}
      borderColor={theme.palette.border}
      paddingX={1}
    >
      <Text color={theme.palette.primary} bold>
        {prefix}{" "}
      </Text>
      <Text>
        {value || <Text color={theme.palette.textDim}>{placeholder}</Text>}
      </Text>
      <Text color={theme.palette.primary}>█</Text>
    </Box>
  );
}

interface HintsProps {
  items?: string[];
  children?: React.ReactNode;
}

function Hints({ items, children }: HintsProps) {
  const { theme } = useTheme();
  const content = items ? items.join(" • ") : children;

  return (
    <Box
      marginTop={1}
      borderStyle="single"
      borderColor={theme.palette.border}
      paddingX={1}
    >
      <Text color={theme.palette.textDim}>{content}</Text>
    </Box>
  );
}

interface StatusBarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

function StatusBar({ left, center, right }: StatusBarProps) {
  const { theme } = useTheme();

  return (
    <Box
      borderStyle="single"
      borderColor={theme.palette.border}
      paddingX={1}
      justifyContent="space-between"
    >
      <Box>{left}</Box>
      <Box>{center}</Box>
      <Box>{right}</Box>
    </Box>
  );
}

export const AppShell = Object.assign(AppShellRoot, {
  Header,
  Tip,
  Content,
  Input,
  Hints,
  StatusBar,
});
