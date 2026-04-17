import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutCubic, easeInOutCubic } from "../utils/easing";
import { TerminalWindow } from "../components/TerminalWindow";

// All CLI output lines for the splash screen
const CLI_LINES = [
  { type: "command", text: "$ npx yt2blog" },
  { type: "empty", text: "" },
  { type: "ascii", text: "╔════════════════════════════════════════════════════════════════════╗" },
  { type: "ascii", text: "║                                                                    ║" },
  { type: "ascii", text: "║   ██╗   ██╗████████╗ ██████╗ ██████╗  ██╗      ██████╗  ██████╗    ║" },
  { type: "ascii", text: "║   ╚██╗ ██╔╝╚══██╔══╝╚════██╗ ██╔══██╗ ██║     ██╔═══██╗██╔═════╝   ║" },
  { type: "ascii", text: "║    ╚████╔╝    ██║    █████╔╝ ██████╔╝ ██║     ██║   ██║██║  ███╗   ║" },
  { type: "ascii", text: "║     ╚██╔╝     ██║   ██╔═══╝  ██╔══██╗ ██║     ██║   ██║██║   ██║   ║" },
  { type: "ascii", text: "║      ██║      ██║   ███████╗ ██████╔╝ ███████╗╚██████╔╝╚██████╔╝   ║" },
  { type: "ascii", text: "║      ╚═╝      ╚═╝   ╚══════╝ ╚═════╝  ╚══════╝ ╚═════╝  ╚═════╝    ║" },
  { type: "ascii", text: "║                                                                    ║" },
  { type: "ascii", text: "╚════════════════════════════════════════════════════════════════════╝" },
  { type: "empty", text: "" },
  { type: "badge", text: "  v1.0.0  AI Gateway" },
  { type: "empty", text: "" },
  { type: "tagline", text: "  Transform YouTube videos into polished blog posts" },
  { type: "empty", text: "" },
  { type: "feature", text: "  + YouTube -> Transcript -> AI -> Blog" },
  { type: "feature", text: "  + Any model via string routing" },
  { type: "feature", text: "  + SEO - Medium - Newsletter - Thread - Technical" },
  { type: "feature", text: "  + BYOK (Bring Your Own Key)" },
  { type: "empty", text: "" },
  { type: "ready", text: "  |> Press any key to start" },
  { type: "footer", text: "  ─────────────────────────────────────" },
  { type: "powered", text: "  Powered by AI Gateway" },
];

export const CLIExecutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Colors
  const primary = "#8b5cf6";
  const success = "#22c55e";
  const textMuted = "#9ca3af";
  const textDim = "#6b7280";

  // Fade in/out
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  const fadeOutStart = 5.5 * fps;
  const fadeOut = interpolate(frame, [fadeOutStart, fadeOutStart + 15], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOutCubic,
  });

  // Line reveal timing - each line appears with a delay
  const getLineOpacity = (index: number) => {
    const lineDelay = 2; // frames between each line
    const lineStart = 10 + index * lineDelay;
    return interpolate(frame, [lineStart, lineStart + 4], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  // Cursor blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Render line based on type
  const renderLine = (line: typeof CLI_LINES[0], index: number) => {
    const opacity = getLineOpacity(index);

    if (line.type === "empty") {
      return <div key={index} style={{ height: 20, opacity }} />;
    }

    if (line.type === "command") {
      return (
        <div key={index} style={{ opacity, display: "flex", alignItems: "center" }}>
          <span style={{ color: textDim }}>$</span>
          <span style={{ color: "#fff", marginLeft: 8 }}>npx yt2blog</span>
          {index === 0 && cursorVisible && frame < 20 && (
            <span style={{ width: 8, height: 16, backgroundColor: "#fff", marginLeft: 2 }} />
          )}
        </div>
      );
    }

    if (line.type === "ascii") {
      return (
        <div key={index} style={{ opacity, color: primary, whiteSpace: "pre", fontSize: 11 }}>
          {line.text}
        </div>
      );
    }

    if (line.type === "badge") {
      return (
        <div key={index} style={{ opacity, display: "flex", gap: 8 }}>
          <span style={{ padding: "2px 8px", backgroundColor: primary, borderRadius: 4, color: "#fff", fontSize: 11 }}>
            v1.0.0
          </span>
          <span style={{ padding: "2px 8px", backgroundColor: "#ec4899", borderRadius: 4, color: "#fff", fontSize: 11 }}>
            AI Gateway
          </span>
        </div>
      );
    }

    if (line.type === "tagline") {
      return (
        <div key={index} style={{ opacity, color: textMuted, fontSize: 14 }}>
          {line.text}
        </div>
      );
    }

    if (line.type === "feature") {
      return (
        <div key={index} style={{ opacity, display: "flex", alignItems: "center" }}>
          <span style={{ color: success, marginRight: 8 }}>+</span>
          <span style={{ color: "#e5e7eb" }}>{line.text.slice(4)}</span>
        </div>
      );
    }

    if (line.type === "ready") {
      return (
        <div key={index} style={{ opacity, display: "flex", alignItems: "center" }}>
          <span style={{ color: success }}>|&gt;</span>
          <span style={{ color: "#fff", marginLeft: 8 }}>Press any key to start</span>
          {cursorVisible && (
            <span style={{ width: 8, height: 16, backgroundColor: "#fff", marginLeft: 4 }} />
          )}
        </div>
      );
    }

    if (line.type === "footer") {
      return (
        <div key={index} style={{ opacity, color: textDim }}>
          {line.text}
        </div>
      );
    }

    if (line.type === "powered") {
      return (
        <div key={index} style={{ opacity, color: textDim, fontSize: 12 }}>
          {line.text}
        </div>
      );
    }

    return (
      <div key={index} style={{ opacity, color: "#e5e7eb" }}>
        {line.text}
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn * fadeOut,
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

      <TerminalWindow title="yt2blog" width={900} height={580}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {CLI_LINES.map((line, i) => renderLine(line, i))}
        </div>
      </TerminalWindow>
    </AbsoluteFill>
  );
};
