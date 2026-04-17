/**
 * @fileoverview Compound component for bordered info panels with header, rows, and key-value pairs
 * @module cli/components/InfoBox
 */

import { Box, Text } from "ink";
import React from "react";

import { useTheme } from "../theme/index.js";

interface InfoBoxProps {
  borderStyle?: "single" | "double" | "round" | "bold" | "classic";
  width?: number | "full";
  children: React.ReactNode;
}

function InfoBoxRoot({
  borderStyle = "single",
  width,
  children,
}: InfoBoxProps) {
  const { theme } = useTheme();

  return (
    <Box
      borderStyle={borderStyle}
      borderColor={theme.palette.border}
      flexDirection="column"
      paddingX={1}
      width={width === "full" ? undefined : width}
      flexGrow={width === "full" ? 1 : undefined}
    >
      {children}
    </Box>
  );
}

interface HeaderProps {
  icon?: string;
  label: string;
  description?: string;
  version?: string;
}

function Header({ icon, label, description, version }: HeaderProps) {
  const { theme } = useTheme();

  return (
    <Box flexDirection="row" gap={1}>
      {icon && <Text color={theme.palette.success}>{icon}</Text>}
      <Text bold>{label}</Text>
      {description && (
        <Text color={theme.palette.textMuted}>{description}</Text>
      )}
      {version && <Text color={theme.palette.info}>{version}</Text>}
    </Box>
  );
}

interface RowProps {
  label: string;
  value?: string;
  valueDetail?: string;
  tree?: boolean;
  bold?: boolean;
}

function Row({
  label,
  value,
  valueDetail,
  tree = false,
  bold = false,
}: RowProps) {
  const { theme } = useTheme();
  const prefix = tree ? "└─ " : "";

  return (
    <Box flexDirection="row">
      <Text color={theme.palette.textMuted}>
        {prefix}
        {label}
        {value ? ":" : ""}
      </Text>
      {value && <Text bold={bold}> {value}</Text>}
      {valueDetail && <Text color={theme.palette.info}> {valueDetail}</Text>}
    </Box>
  );
}

interface DividerProps {
  char?: string;
}

function Divider({ char = "─" }: DividerProps) {
  const { theme } = useTheme();

  return (
    <Box marginY={0}>
      <Text color={theme.palette.textDim}>{char.repeat(40)}</Text>
    </Box>
  );
}

interface KeyValueProps {
  items: Array<{ key: string; value: string }>;
  keyWidth?: number;
}

function KeyValue({ items, keyWidth = 15 }: KeyValueProps) {
  const { theme } = useTheme();

  return (
    <Box flexDirection="column">
      {items.map((item, i) => (
        <Box key={i}>
          <Box width={keyWidth}>
            <Text color={theme.palette.textMuted}>{item.key}</Text>
          </Box>
          <Text>{item.value}</Text>
        </Box>
      ))}
    </Box>
  );
}

export const InfoBox = Object.assign(InfoBoxRoot, {
  Header,
  Row,
  Divider,
  KeyValue,
});
