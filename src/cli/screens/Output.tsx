/**
 * @fileoverview Output screen displaying generated blog with scroll, copy, and save actions
 * @module cli/screens/Output
 */

import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { writeFileSync } from "fs";
import { join } from "path";
import clipboard from "clipboardy";
import { useTheme } from "../theme/index.js";
import { InfoBox } from "../components/InfoBox.js";
import { ProgressBar } from "../components/ProgressBar.js";

interface OutputProps {
  blog: string | null;
  error: string | null;
  onReset: () => void;
  settings?: {
    autoSave?: boolean;
    outputFormat?: "markdown" | "html" | "clipboard" | "stdout";
    [key: string]: any;
  };
}

function markdownToHtml(markdown: string): string {
  let html = markdown
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\* )(.+)$/gm, "<li>$2</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Blog</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1, h2, h3, h4 { margin-top: 2rem; }
    code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 3px solid #ccc; margin: 1rem 0; padding-left: 1rem; color: #666; }
    a { color: #0066cc; }
  </style>
</head>
<body>
<p>${html}</p>
</body>
</html>`;
}

/** Displays generated blog content with keyboard navigation and export options. */
export function Output({ blog, error, onReset, settings = {} }: OutputProps) {
  const { theme } = useTheme();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);

  const lines = blog?.split("\n") || [];
  const visibleLines = 20;
  const totalLines = lines.length;
  const scrollPercent =
    totalLines > visibleLines
      ? (scrollOffset / (totalLines - visibleLines)) * 100
      : 100;

  useEffect(() => {
    if (blog && settings.autoSave && !autoSaved) {
      const format = settings.outputFormat || "markdown";
      const ext = format === "html" ? "html" : "md";
      const filename = `blog-${Date.now()}.${ext}`;
      const filepath = join(process.cwd(), filename);

      try {
        const content = format === "html" ? markdownToHtml(blog) : blog;
        writeFileSync(filepath, content);
        setSaved(filename);
        setAutoSaved(true);
        setTimeout(() => setSaved(null), 3000);
      } catch (err) {}
    }
  }, [blog, settings.autoSave, settings.outputFormat, autoSaved]);

  useInput((input, key) => {
    if (key.upArrow) {
      setScrollOffset((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setScrollOffset((prev) =>
        Math.min(Math.max(0, lines.length - visibleLines), prev + 1),
      );
    } else if (key.pageUp) {
      setScrollOffset((prev) => Math.max(0, prev - visibleLines));
    } else if (key.pageDown) {
      setScrollOffset((prev) =>
        Math.min(Math.max(0, lines.length - visibleLines), prev + visibleLines),
      );
    } else if (input === "c" && blog) {
      const format = settings.outputFormat || "markdown";
      const content = format === "html" ? markdownToHtml(blog) : blog;
      clipboard.writeSync(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (input === "s" && blog) {
      const format = settings.outputFormat || "markdown";
      const ext = format === "html" ? "html" : "md";
      const filename = `blog-${Date.now()}.${ext}`;
      const filepath = join(process.cwd(), filename);

      try {
        const content = format === "html" ? markdownToHtml(blog) : blog;
        writeFileSync(filepath, content);
        setSaved(filename);
        setTimeout(() => setSaved(null), 3000);
      } catch (err) {}
    } else if (input === "r") {
      onReset();
    }
  });

  if (error) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color={theme.palette.error}>
            ✗ Error
          </Text>
        </Box>
        <InfoBox borderStyle="round">
          <Text color={theme.palette.error}>{error}</Text>
        </InfoBox>
        <Box marginTop={2}>
          <Text color={theme.palette.textMuted}>Press </Text>
          <Text color={theme.palette.warning}>r</Text>
          <Text color={theme.palette.textMuted}> to try again • </Text>
          <Text color={theme.palette.warning}>q</Text>
          <Text color={theme.palette.textMuted}> to quit</Text>
        </Box>
      </Box>
    );
  }

  if (!blog) {
    return (
      <Box flexDirection="column">
        <Text color={theme.palette.textMuted}>No content generated</Text>
        <Box marginTop={1}>
          <Text color={theme.palette.textMuted}>Press </Text>
          <Text color={theme.palette.warning}>r</Text>
          <Text color={theme.palette.textMuted}> to start over</Text>
        </Box>
      </Box>
    );
  }

  const displayLines = lines.slice(scrollOffset, scrollOffset + visibleLines);
  const wordCount = blog.split(/\s+/).length;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} justifyContent="space-between">
        <Box>
          <Text bold color={theme.palette.success}>
            ✓ Blog Generated
          </Text>
          <Text color={theme.palette.textMuted}>
            {" "}
            — {wordCount.toLocaleString()} words
          </Text>
        </Box>
        <Box>
          {copied && (
            <Text color={theme.palette.success}>Copied to clipboard! </Text>
          )}
          {saved && (
            <Text color={theme.palette.success}>
              {autoSaved ? "Auto-saved: " : "Saved: "}
              {saved}
            </Text>
          )}
        </Box>
      </Box>

      <InfoBox borderStyle="round" width={60}>
        <Box justifyContent="space-between">
          <InfoBox.Row label="Lines" value={String(totalLines)} />
          <InfoBox.Row label="Words" value={wordCount.toLocaleString()} />
          <InfoBox.Row
            label="Format"
            value={settings.outputFormat === "html" ? "HTML" : "Markdown"}
          />
        </Box>
      </InfoBox>

      <Box height={1} />

      {totalLines > visibleLines && (
        <Box marginBottom={1}>
          <ProgressBar
            value={scrollPercent}
            width={40}
            showPercent={false}
            label="Position"
            style="line"
          />
          <Text color={theme.palette.textMuted}>
            {" "}
            Line {scrollOffset + 1}-
            {Math.min(scrollOffset + visibleLines, totalLines)} of {totalLines}
          </Text>
        </Box>
      )}

      {scrollOffset > 0 && (
        <Text color={theme.palette.textDim}>
          ↑ {scrollOffset} more lines above
        </Text>
      )}

      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={theme.palette.border}
        paddingX={1}
        height={visibleLines + 2}
      >
        {displayLines.map((line, i) => (
          <Text key={i + scrollOffset}>{renderMarkdownLine(line, theme)}</Text>
        ))}
      </Box>

      {scrollOffset + visibleLines < totalLines && (
        <Text color={theme.palette.textDim}>
          ↓ {totalLines - scrollOffset - visibleLines} more lines below
        </Text>
      )}

      <Box
        marginTop={1}
        borderStyle="single"
        borderColor={theme.palette.border}
        paddingX={1}
      >
        <Text color={theme.palette.textDim}>
          <Text color={theme.palette.primary}>↑↓</Text> scroll •{" "}
          <Text color={theme.palette.primary}>PgUp/PgDn</Text> page •{" "}
          <Text color={theme.palette.primary}>c</Text> copy •{" "}
          <Text color={theme.palette.primary}>s</Text> save •{" "}
          <Text color={theme.palette.primary}>r</Text> restart •{" "}
          <Text color={theme.palette.primary}>q</Text> quit
        </Text>
      </Box>
    </Box>
  );
}

function renderMarkdownLine(line: string, theme: any): React.ReactNode {
  if (line.startsWith("# ")) {
    return (
      <Text bold color={theme.palette.primary}>
        {line}
      </Text>
    );
  }
  if (line.startsWith("## ")) {
    return (
      <Text bold color={theme.palette.success}>
        {line}
      </Text>
    );
  }
  if (line.startsWith("### ")) {
    return (
      <Text bold color={theme.palette.warning}>
        {line}
      </Text>
    );
  }
  if (line.startsWith("#### ")) {
    return (
      <Text bold color={theme.palette.info}>
        {line}
      </Text>
    );
  }
  if (line.startsWith("```")) {
    return <Text color={theme.palette.secondary}>{line}</Text>;
  }
  if (line.startsWith("> ")) {
    return <Text color={theme.palette.textMuted}>{line}</Text>;
  }
  if (line.startsWith("- ") || line.startsWith("* ")) {
    return (
      <Text>
        <Text color={theme.palette.primary}> •</Text>
        <Text>{line.slice(2)}</Text>
      </Text>
    );
  }
  if (/^\d+\.\s/.test(line)) {
    const match = line.match(/^(\d+\.)\s(.*)$/);
    if (match) {
      return (
        <Text>
          <Text color={theme.palette.primary}> {match[1]}</Text>
          <Text> {match[2]}</Text>
        </Text>
      );
    }
  }
  if (line.includes("[") && line.includes("](")) {
    return <Text color={theme.palette.link}>{line}</Text>;
  }
  return <Text>{line}</Text>;
}
