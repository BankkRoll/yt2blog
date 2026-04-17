import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEMES, Theme } from "../themes";

import React from "react";
import { TerminalWindow } from "../components/TerminalWindow";

// Match CLIFlowScene ending output - showing bottom of scrolled content
const SAMPLE_LINES = [
  {
    type: "text",
    text: "Don't undervalue your product. If you're solving a real",
  },
  { type: "text", text: "problem, customers expect to pay for it." },
  { type: "empty", text: "" },
  { type: "h2", text: "## Conclusion" },
  { type: "empty", text: "" },
  {
    type: "text",
    text: "Success in SaaS comes from iteration, user feedback, and",
  },
  {
    type: "text",
    text: "a willingness to adapt. Start small, validate fast, and",
  },
  { type: "text", text: "scale what works." },
  { type: "empty", text: "" },
  { type: "text", text: "---" },
  { type: "text", text: "Generated with yt2blog • Powered by AI Gateway" },
];

export const ThemesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each theme shows for 1 second
  const framesPerTheme = 1 * fps;
  const totalThemes = THEMES.length;

  // Current theme index
  const themeIndex = Math.min(
    Math.floor(frame / framesPerTheme),
    totalThemes - 1,
  );
  const currentTheme = THEMES[themeIndex];

  // Transition scale effect
  const localFrame = frame % framesPerTheme;
  const scaleProgress = interpolate(localFrame, [0, 8], [0.97, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Theme label opacity
  const labelOpacity = interpolate(
    localFrame,
    [0, 8, framesPerTheme - 5, framesPerTheme],
    [0, 1, 1, 0.5],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Render line with theme colors - matching CLIFlowScene
  const renderLine = (
    line: (typeof SAMPLE_LINES)[0],
    index: number,
    t: Theme,
  ) => {
    const style: React.CSSProperties = { minHeight: 18 };

    switch (line.type) {
      case "h1":
        return (
          <div
            key={index}
            style={{ ...style, color: t.palette.primary, fontWeight: "bold" }}
          >
            {line.text}
          </div>
        );
      case "h2":
        return (
          <div
            key={index}
            style={{ ...style, color: t.palette.success, fontWeight: "bold" }}
          >
            {line.text}
          </div>
        );
      case "h3":
        return (
          <div
            key={index}
            style={{ ...style, color: t.palette.warning, fontWeight: "bold" }}
          >
            {line.text}
          </div>
        );
      case "list":
        return (
          <div key={index} style={style}>
            <span style={{ color: t.palette.primary }}>•</span>
            <span style={{ color: t.palette.text }}>{line.text.slice(1)}</span>
          </div>
        );
      case "empty":
        return <div key={index} style={{ ...style, height: 18 }} />;
      default:
        return (
          <div key={index} style={{ ...style, color: t.palette.text }}>
            {line.text}
          </div>
        );
    }
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 60,
          fontSize: 42,
          fontWeight: "bold",
          color: "#fff",
        }}
      >
        9 Beautiful Themes
      </div>

      {/* Theme name badge */}
      <div
        style={{
          position: "absolute",
          top: 130,
          opacity: labelOpacity,
          padding: "6px 20px",
          backgroundColor: `${currentTheme.palette.primary}20`,
          borderRadius: 6,
          border: `2px solid ${currentTheme.palette.primary}`,
          fontSize: 20,
          color: currentTheme.palette.primary,
        }}
      >
        {currentTheme.name}
      </div>

      {/* Terminal with theme applied - matching CLIFlowScene size */}
      <div style={{ transform: `scale(${scaleProgress})`, marginTop: 40 }}>
        <div
          style={{
            width: 1100,
            height: 650,
            backgroundColor: currentTheme.palette.background,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: `
              0 0 0 1px ${currentTheme.palette.border},
              0 25px 50px -12px rgba(0, 0, 0, 0.5),
              0 0 80px ${currentTheme.palette.primary}10
            `,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Title bar */}
          <div
            style={{
              height: 40,
              backgroundColor: currentTheme.palette.textDim + "30",
              display: "flex",
              alignItems: "center",
              paddingLeft: 16,
              paddingRight: 16,
              borderBottom: `1px solid ${currentTheme.palette.border}`,
              flexShrink: 0,
            }}
          >
            {/* Window controls */}
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#ff5f57",
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#febc2e",
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#28c840",
                }}
              />
            </div>

            {/* Title */}
            <span
              style={{
                flex: 1,
                textAlign: "center",
                color: currentTheme.palette.textMuted,
                fontSize: 13,
              }}
            >
              yt2blog - {currentTheme.name}
            </span>

            <div style={{ width: 52 }} />
          </div>

          {/* Terminal content - matching CLIFlowScene output phase */}
          <div style={{ padding: 20, flex: 1, fontSize: 14, lineHeight: 1.6 }}>
            {/* Header - matching CLIFlowScene */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div>
                <span style={{ color: currentTheme.palette.success }}>✓</span>
                <span
                  style={{
                    color: currentTheme.palette.success,
                    fontWeight: "bold",
                    marginLeft: 8,
                  }}
                >
                  Blog Generated
                </span>
                <span style={{ color: currentTheme.palette.textMuted }}>
                  {" "}
                  — 2,847 words
                </span>
              </div>
              <span style={{ color: currentTheme.palette.success }}>
                Saved: blog-1713345600.md
              </span>
            </div>

            {/* Stats box - matching CLIFlowScene */}
            <div
              style={{
                border: `1px solid ${currentTheme.palette.textDim}`,
                borderRadius: 4,
                padding: 8,
                marginBottom: 12,
                display: "flex",
                gap: 24,
              }}
            >
              <span>
                <span style={{ color: currentTheme.palette.textDim }}>
                  Lines:
                </span>{" "}
                <span style={{ color: currentTheme.palette.text }}>42</span>
              </span>
              <span>
                <span style={{ color: currentTheme.palette.textDim }}>
                  Words:
                </span>{" "}
                <span style={{ color: currentTheme.palette.text }}>2,847</span>
              </span>
              <span>
                <span style={{ color: currentTheme.palette.textDim }}>
                  Format:
                </span>{" "}
                <span style={{ color: currentTheme.palette.text }}>
                  Markdown
                </span>
              </span>
            </div>

            {/* Scroll indicator - matching CLIFlowScene ending state */}
            <div style={{ marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: currentTheme.palette.textDim }}>[</span>
              <span style={{ color: currentTheme.palette.primary }}>
                {"█".repeat(20)}
              </span>
              <span style={{ color: currentTheme.palette.textDim }}>]</span>
              <span
                style={{ color: currentTheme.palette.textMuted, marginLeft: 8 }}
              >
                Line 31-42 of 42
              </span>
            </div>

            {/* Lines above indicator */}
            <div
              style={{
                color: currentTheme.palette.textDim,
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              ↑ 30 more lines above
            </div>

            {/* Content box - matching CLIFlowScene */}
            <div
              style={{
                border: `1px solid ${currentTheme.palette.textDim}`,
                borderRadius: 4,
                padding: 8,
                height: 220,
                overflow: "hidden",
              }}
            >
              {SAMPLE_LINES.map((line, i) => renderLine(line, i, currentTheme))}
            </div>

            {/* Footer - matching CLIFlowScene */}
            <div
              style={{
                marginTop: 16,
                borderTop: `1px solid ${currentTheme.palette.textDim}`,
                paddingTop: 8,
                color: currentTheme.palette.textDim,
                fontSize: 12,
              }}
            >
              ↑↓ scroll • PgUp/PgDn page • c copy • s save • r restart • q quit
            </div>
          </div>
        </div>
      </div>

      {/* Theme indicators */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          display: "flex",
          gap: 10,
        }}
      >
        {THEMES.map((t, i) => (
          <div
            key={t.id}
            style={{
              width: i === themeIndex ? 28 : 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: i === themeIndex ? t.palette.primary : "#374151",
              boxShadow:
                i === themeIndex ? `0 0 12px ${t.palette.primary}` : "none",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
