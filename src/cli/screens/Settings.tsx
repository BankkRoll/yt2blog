/**
 * @fileoverview Settings screen for configuring app preferences
 * @module cli/screens/Settings
 */

import { Box, Text, useInput } from "ink";
import React, { useState } from "react";
import { THEMES, useTheme } from "../theme/index.js";

import { DEFAULT_MODEL } from "../../prompts/styles.js";
import { ModelSelector } from "../components/ModelSelector.js";

const CATEGORIES = [
  { id: "theme", label: "Theme", icon: "◆" },
  { id: "model", label: "Default Model", icon: "◇" },
  { id: "output", label: "Output", icon: "○" },
  { id: "advanced", label: "Advanced", icon: "●" },
];

const OUTPUT_FORMATS = [
  {
    id: "markdown",
    label: "Markdown (.md)",
    description: "Standard markdown file",
  },
  { id: "html", label: "HTML", description: "Ready-to-publish HTML" },
  { id: "clipboard", label: "Clipboard", description: "Copy to clipboard" },
  { id: "stdout", label: "Terminal", description: "Print to terminal only" },
];

interface SettingsProps {
  onBack: () => void;
  onSave: (settings: any) => void;
  currentSettings?: any;
}

/** Settings screen component with theme, model, output, and advanced options. */
export function Settings({ onBack, onSave, currentSettings }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const [category, setCategory] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [mode, setMode] = useState<"category" | "items">("category");

  const [settings, setSettings] = useState({
    theme: theme.id,
    defaultModel: currentSettings?.defaultModel || DEFAULT_MODEL,
    outputFormat: currentSettings?.outputFormat || "markdown",
    autoSave: currentSettings?.autoSave ?? true,
    showTokenUsage: currentSettings?.showTokenUsage ?? true,
    streamOutput: currentSettings?.streamOutput ?? true,
    ...currentSettings,
  });

  useInput((input, key) => {
    if (key.escape) {
      if (mode === "items") {
        setMode("category");
        setItemIndex(0);
      } else {
        onBack();
      }
      return;
    }

    if (mode === "category") {
      if (key.upArrow) {
        setCategory((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setCategory((prev) => Math.min(CATEGORIES.length - 1, prev + 1));
      } else if (key.return) {
        setMode("items");
        setItemIndex(0);
      }
    } else {
      const currentCategory = CATEGORIES[category].id;
      let maxItems = 0;

      if (currentCategory === "theme") maxItems = THEMES.length;
      else if (currentCategory === "model")
        maxItems = 0; // ModelSelector handles its own navigation
      else if (currentCategory === "output") maxItems = OUTPUT_FORMATS.length;
      else if (currentCategory === "advanced") maxItems = 3;

      if (key.upArrow) {
        setItemIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setItemIndex((prev) => Math.min(maxItems - 1, prev + 1));
      } else if (key.return || input === " ") {
        if (currentCategory === "theme") {
          const selectedTheme = THEMES[itemIndex];
          setSettings((s) => ({ ...s, theme: selectedTheme.id }));
          setTheme(selectedTheme.id);
        } else if (currentCategory === "model") {
          // ModelSelector handles selection
        } else if (currentCategory === "output") {
          setSettings((s) => ({
            ...s,
            outputFormat: OUTPUT_FORMATS[itemIndex].id,
          }));
        } else if (currentCategory === "advanced") {
          if (itemIndex === 0)
            setSettings((s) => ({ ...s, autoSave: !s.autoSave }));
          if (itemIndex === 1)
            setSettings((s) => ({ ...s, showTokenUsage: !s.showTokenUsage }));
          if (itemIndex === 2)
            setSettings((s) => ({ ...s, streamOutput: !s.streamOutput }));
        }
      }
    }

    if (key.ctrl && input === "s") {
      onSave(settings);
    }
  });

  const currentCategoryId = CATEGORIES[category].id;

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color={theme.palette.primary}>
          ◆ Settings
        </Text>
        <Text color={theme.palette.textMuted}>
          {" "}
          — Configure your preferences
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color={theme.palette.textDim}>
          {mode === "category"
            ? "↑↓ Navigate • Enter Select • Esc Back"
            : "↑↓ Navigate • Enter/Space Select • Esc Back"}
        </Text>
      </Box>

      <Box>
        <Box
          flexDirection="column"
          width={25}
          borderStyle="single"
          borderColor={theme.palette.border}
          paddingX={1}
        >
          {CATEGORIES.map((cat, i) => (
            <Box key={cat.id}>
              <Text
                color={
                  i === category ? theme.palette.primary : theme.palette.text
                }
                bold={i === category}
              >
                {mode === "category" && i === category ? "❯ " : "  "}
                {cat.icon} {cat.label}
              </Text>
            </Box>
          ))}
        </Box>

        <Box flexDirection="column" paddingLeft={2} flexGrow={1}>
          {currentCategoryId === "theme" && (
            <Box flexDirection="column">
              <Text bold color={theme.palette.primary} underline>
                Choose Theme
              </Text>
              <Box height={1} />
              {THEMES.map((t, i) => (
                <Box key={t.id}>
                  <Text
                    color={
                      mode === "items" && i === itemIndex
                        ? theme.palette.primary
                        : theme.palette.text
                    }
                  >
                    {mode === "items" && i === itemIndex ? "❯ " : "  "}
                    {settings.theme === t.id ? "● " : "○ "}
                    {t.name}
                  </Text>
                  {settings.theme === t.id && (
                    <Text color={theme.palette.success}> (active)</Text>
                  )}
                </Box>
              ))}

              <Box marginTop={1} flexDirection="column">
                <Text color={theme.palette.textMuted}>Preview:</Text>
                <Box
                  marginTop={1}
                  flexDirection="column"
                  borderStyle="round"
                  borderColor={theme.palette.border}
                  padding={1}
                >
                  <Text color={theme.palette.primary}>Primary text</Text>
                  <Text color={theme.palette.success}>Success message</Text>
                  <Text color={theme.palette.error}>Error message</Text>
                  <Text color={theme.palette.warning}>Warning message</Text>
                  <Text color={theme.palette.textMuted}>Muted text</Text>
                </Box>
              </Box>
            </Box>
          )}

          {currentCategoryId === "model" && (
            <Box flexDirection="column">
              <Text bold color={theme.palette.primary} underline>
                Default Model
              </Text>
              <Box height={1} />
              <Box marginBottom={1}>
                <Text color={theme.palette.textMuted}>
                  Current: {settings.defaultModel}
                </Text>
              </Box>
              <ModelSelector
                defaultModel={settings.defaultModel}
                showPricing={true}
                onSelect={(modelId) => {
                  setSettings((s) => ({ ...s, defaultModel: modelId }));
                }}
                onCancel={() => setMode("category")}
              />
            </Box>
          )}

          {currentCategoryId === "output" && (
            <Box flexDirection="column">
              <Text bold color={theme.palette.primary} underline>
                Output Format
              </Text>
              <Box height={1} />
              {OUTPUT_FORMATS.map((f, i) => (
                <Box key={f.id} flexDirection="column">
                  <Box>
                    <Text
                      color={
                        mode === "items" && i === itemIndex
                          ? theme.palette.primary
                          : theme.palette.text
                      }
                    >
                      {mode === "items" && i === itemIndex ? "❯ " : "  "}
                      {settings.outputFormat === f.id ? "● " : "○ "}
                      {f.label}
                    </Text>
                  </Box>
                  <Text color={theme.palette.textDim}> {f.description}</Text>
                </Box>
              ))}
            </Box>
          )}

          {currentCategoryId === "advanced" && (
            <Box flexDirection="column">
              <Text bold color={theme.palette.primary} underline>
                Advanced Options
              </Text>
              <Box height={1} />

              <Box>
                <Text
                  color={
                    mode === "items" && itemIndex === 0
                      ? theme.palette.primary
                      : theme.palette.text
                  }
                >
                  {mode === "items" && itemIndex === 0 ? "❯ " : "  "}
                  {settings.autoSave ? "[✓]" : "[ ]"} Auto-save output
                </Text>
              </Box>

              <Box>
                <Text
                  color={
                    mode === "items" && itemIndex === 1
                      ? theme.palette.primary
                      : theme.palette.text
                  }
                >
                  {mode === "items" && itemIndex === 1 ? "❯ " : "  "}
                  {settings.showTokenUsage ? "[✓]" : "[ ]"} Show token usage
                </Text>
              </Box>

              <Box>
                <Text
                  color={
                    mode === "items" && itemIndex === 2
                      ? theme.palette.primary
                      : theme.palette.text
                  }
                >
                  {mode === "items" && itemIndex === 2 ? "❯ " : "  "}
                  {settings.streamOutput ? "[✓]" : "[ ]"} Stream output in
                  real-time
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        marginTop={2}
        borderStyle="single"
        borderColor={theme.palette.border}
        paddingX={1}
      >
        <Text color={theme.palette.textMuted}>Ctrl+S Save • Esc Back</Text>
      </Box>
    </Box>
  );
}
