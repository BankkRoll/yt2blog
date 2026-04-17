import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutCubic, easeInOutCubic } from "../utils/easing";

const BLOG_CONTENT = [
  "# How to Build a Successful SaaS Product in 2024",
  "",
  "## Introduction",
  "",
  "Building a successful SaaS product requires more than just great",
  "code-it demands a deep understanding of your users, a clear value",
  "proposition, and relentless focus on solving real problems.",
  "",
  "## Key Takeaways from the Video",
  "",
  "### 1. Start with the Problem, Not the Solution",
  "",
  "The most successful SaaS founders don't start by asking \"what",
  "can I build?\" Instead, they ask \"what problem is worth solving?\"",
  "",
  "- Identify pain points through customer interviews",
  "- Validate demand before writing code",
  "- Focus on problems people will pay to solve",
  "",
  "### 2. Build an MVP That Actually Works",
  "",
  "Your minimum viable product should be minimal, but it must be",
  "viable. Users won't tolerate broken software, even for free.",
  "",
  "### 3. Pricing Strategy Matters",
  "",
  "Don't undervalue your product. If you're solving a real problem,",
  "customers expect to pay for it.",
  "",
  "## Conclusion",
  "",
  "Success in SaaS comes from iteration, user feedback, and a",
  "willingness to adapt. Start small, validate fast, and scale",
  "what works.",
];

export const OutputScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Colors (consistent with scene 1)
  const primary = "#8b5cf6";
  const success = "#22c55e";
  const warning = "#eab308";
  const info = "#3b82f6";
  const textMuted = "#9ca3af";
  const textDim = "#6b7280";
  const border = "#374151";

  // Fade in/out
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  const fadeOutStart = 7.5 * fps;
  const fadeOut = interpolate(frame, [fadeOutStart, fadeOutStart + 15], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOutCubic,
  });

  // Scroll animation
  const scrollStart = 1 * fps;
  const scrollEnd = 5.5 * fps;
  const maxScroll = Math.max(0, BLOG_CONTENT.length - 14);
  const scrollOffset = Math.floor(interpolate(frame, [scrollStart, scrollEnd], [0, maxScroll], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  const visibleLines = BLOG_CONTENT.slice(scrollOffset, scrollOffset + 14);

  // Copy action
  const copyStart = 5.5 * fps;
  const copyOpacity = interpolate(frame, [copyStart, copyStart + 5, copyStart + 1.5 * fps, copyStart + 2 * fps], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Save action
  const saveStart = 6 * fps;
  const saveOpacity = interpolate(frame, [saveStart, saveStart + 5, saveStart + 1.5 * fps, saveStart + 2 * fps], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stats
  const wordCount = BLOG_CONTENT.join(" ").split(/\s+/).filter(Boolean).length;
  const lineCount = BLOG_CONTENT.length;
  const scrollProgress = maxScroll > 0 ? (scrollOffset / maxScroll) * 100 : 0;

  // Render markdown line with theme colors
  const renderLine = (line: string) => {
    if (line.startsWith("# ")) return <span style={{ color: primary, fontWeight: "bold" }}>{line}</span>;
    if (line.startsWith("## ")) return <span style={{ color: success, fontWeight: "bold" }}>{line}</span>;
    if (line.startsWith("### ")) return <span style={{ color: warning, fontWeight: "bold" }}>{line}</span>;
    if (line.startsWith("- ")) return <span><span style={{ color: primary }}>-</span>{line.slice(1)}</span>;
    return <span style={{ color: "#e5e7eb" }}>{line}</span>;
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 15,
        color: "#e5e7eb",
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

      <div style={{ width: 800 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <span style={{ color: success }}>+</span>
            <span style={{ color: success, fontWeight: "bold", marginLeft: 8 }}>Blog Generated</span>
            <span style={{ color: textMuted }}> - {wordCount.toLocaleString()} words</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {frame >= copyStart && <span style={{ color: success, opacity: copyOpacity }}>Copied to clipboard!</span>}
            {frame >= saveStart && <span style={{ color: success, opacity: saveOpacity }}>Saved: blog-1713345600.md</span>}
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={{
            border: `1px solid ${border}`,
            borderRadius: 8,
            padding: 12,
            display: "flex",
            gap: 32,
            marginBottom: 20,
          }}
        >
          <div><span style={{ color: textDim }}>Lines:</span> <span style={{ color: textMuted }}>{lineCount}</span></div>
          <div><span style={{ color: textDim }}>Words:</span> <span style={{ color: textMuted }}>{wordCount.toLocaleString()}</span></div>
          <div><span style={{ color: textDim }}>Format:</span> <span style={{ color: textMuted }}>Markdown</span></div>
        </div>

        {/* Scroll position */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 14 }}>
          <span style={{ color: textDim }}>[</span>
          <span style={{ color: primary }}>{"=".repeat(Math.max(1, Math.floor(scrollProgress / 5)))}</span>
          <span style={{ color: textDim }}>{"-".repeat(20 - Math.max(1, Math.floor(scrollProgress / 5)))}</span>
          <span style={{ color: textDim }}>]</span>
          <span style={{ color: textMuted }}>
            Line {scrollOffset + 1}-{Math.min(scrollOffset + 14, lineCount)} of {lineCount}
          </span>
        </div>

        {/* Up indicator */}
        {scrollOffset > 0 && (
          <div style={{ color: textDim, marginBottom: 8, fontSize: 14 }}>^ {scrollOffset} more lines above</div>
        )}

        {/* Blog content */}
        <div
          style={{
            border: `1px solid ${border}`,
            borderRadius: 8,
            padding: 16,
            minHeight: 300,
          }}
        >
          {visibleLines.map((line, i) => (
            <div key={i} style={{ minHeight: 20, lineHeight: 1.5 }}>{renderLine(line)}</div>
          ))}
        </div>

        {/* Down indicator */}
        {scrollOffset + 14 < lineCount && (
          <div style={{ color: textDim, marginTop: 8, fontSize: 14 }}>v {lineCount - scrollOffset - 14} more lines below</div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: 16,
            borderTop: `1px solid ${border}`,
            paddingTop: 16,
            color: textDim,
            fontSize: 14,
          }}
        >
          up/down scroll - PgUp/PgDn page - c copy - s save - r restart - q quit
        </div>
      </div>
    </AbsoluteFill>
  );
};
