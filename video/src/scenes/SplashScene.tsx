import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { draculaTheme as theme } from "../themes";

// Exact ASCII logo from the CLI
const LOGO_LINES = [
  "╔════════════════════════════════════════════════════════════════════╗",
  "║                                                                    ║",
  "║   ██╗   ██╗████████╗ ██████╗ ██████╗  ██╗      ██████╗  ██████╗    ║",
  "║   ╚██╗ ██╔╝╚══██╔══╝╚════██╗ ██╔══██╗ ██║     ██╔═══██╗██╔═════╝   ║",
  "║    ╚████╔╝    ██║    █████╔╝ ██████╔╝ ██║     ██║   ██║██║  ███╗   ║",
  "║     ╚██╔╝     ██║   ██╔═══╝  ██╔══██╗ ██║     ██║   ██║██║   ██║   ║",
  "║      ██║      ██║   ███████╗ ██████╔╝ ███████╗╚██████╔╝╚██████╔╝   ║",
  "║      ╚═╝      ╚═╝   ╚══════╝ ╚═════╝  ╚══════╝ ╚═════╝  ╚═════╝    ║",
  "║                                                                    ║",
  "╚════════════════════════════════════════════════════════════════════╝",
];

const FEATURES = [
  "YouTube → Transcript → AI → Blog",
  "Any model via string routing",
  "SEO • Medium • Newsletter • Thread • Technical",
  "BYOK (Bring Your Own Key)",
];

export const SplashScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo reveal - line by line
  const getLineOpacity = (lineIndex: number) => {
    const lineDelay = lineIndex * 3;
    return interpolate(frame, [lineDelay, lineDelay + 6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  // Badges appear after logo (around frame 30)
  const badgesProgress = interpolate(frame, [fps, fps + 0.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Tagline
  const taglineProgress = interpolate(frame, [1.5 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Features - one by one
  const getFeatureOpacity = (index: number) => {
    const delay = 2.2 * fps + index * 0.3 * fps;
    return interpolate(frame, [delay, delay + 0.3 * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  // Press any key prompt
  const promptProgress = interpolate(frame, [3.5 * fps, 4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const promptBlink = Math.sin(frame * 0.2) > 0 ? 1 : 0.5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.palette.background,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* ASCII Logo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {LOGO_LINES.map((line, i) => {
          const isBorder = i === 0 || i === LOGO_LINES.length - 1;
          return (
            <div
              key={i}
              style={{
                opacity: getLineOpacity(i),
                color: isBorder ? theme.palette.textDim : theme.palette.primary,
                fontSize: 14,
                whiteSpace: "pre",
                letterSpacing: 0,
                lineHeight: 1.1,
                textShadow: isBorder ? "none" : `0 0 20px ${theme.palette.primary}40`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>

      {/* Version and AI Gateway badges */}
      <div
        style={{
          opacity: badgesProgress,
          display: "flex",
          gap: 12,
          marginTop: 20,
        }}
      >
        <span
          style={{
            backgroundColor: theme.palette.primary,
            color: "#000",
            padding: "4px 12px",
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          {" v1.0.0 "}
        </span>
        <span
          style={{
            backgroundColor: theme.palette.secondary,
            color: "#fff",
            padding: "4px 12px",
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          {" AI Gateway "}
        </span>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineProgress,
          marginTop: 16,
          color: theme.palette.text,
          fontSize: 18,
          fontWeight: "bold",
        }}
      >
        Transform YouTube videos into polished blog posts
      </div>

      {/* Features list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 20,
          gap: 6,
        }}
      >
        {FEATURES.map((feature, i) => (
          <div
            key={i}
            style={{
              opacity: getFeatureOpacity(i),
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: theme.palette.success }}>✓</span>
            <span style={{ color: theme.palette.textMuted, fontSize: 16 }}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* Press any key prompt */}
      <div
        style={{
          opacity: promptProgress * promptBlink,
          marginTop: 30,
          color: theme.palette.warning,
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        ▶ Press any key to start
      </div>

      {/* Divider and powered by */}
      <div
        style={{
          opacity: promptProgress,
          marginTop: 12,
          color: theme.palette.textDim,
          fontSize: 14,
        }}
      >
        ───────────────────────────────────
      </div>
      <div
        style={{
          opacity: promptProgress,
          marginTop: 12,
          fontSize: 14,
        }}
      >
        <span style={{ color: theme.palette.textMuted }}>Powered by </span>
        <span style={{ color: theme.palette.info }}>openai/gpt-4o</span>
        <span style={{ color: theme.palette.textMuted }}> • </span>
        <span style={{ color: theme.palette.secondary }}>anthropic/claude-sonnet-4</span>
      </div>
    </AbsoluteFill>
  );
};
