import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { draculaTheme as theme } from "../themes";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation - fade in and slide up
  const titleProgress = interpolate(frame, [0, 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const titleOpacity = titleProgress;
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);

  // Subtitle animation - delayed
  const subtitleProgress = interpolate(frame, [0.8 * fps, 1.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Arrow animation - bouncing
  const arrowProgress = interpolate(frame, [1.5 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arrowBounce = Math.sin(frame * 0.15) * 8;

  // Tagline animation
  const taglineProgress = interpolate(frame, [2.5 * fps, 3 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${theme.palette.background} 0%, #1a1a2e 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* Logo */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 120,
          fontWeight: "bold",
          color: theme.palette.primary,
          textShadow: `0 0 60px ${theme.palette.primary}40`,
          letterSpacing: -2,
        }}
      >
        yt2blog
      </div>

      {/* YouTube -> Blog */}
      <div
        style={{
          opacity: subtitleProgress,
          marginTop: 24,
          fontSize: 36,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <span style={{ color: theme.palette.error }}>YouTube</span>
        <span
          style={{
            opacity: arrowProgress,
            transform: `translateX(${arrowBounce}px)`,
            color: theme.palette.warning,
          }}
        >
          {">>>"}
        </span>
        <span style={{ color: theme.palette.success }}>Blog</span>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineProgress,
          marginTop: 50,
          padding: "16px 32px",
          backgroundColor: `${theme.palette.primary}20`,
          borderRadius: 8,
          border: `1px solid ${theme.palette.primary}40`,
          fontSize: 24,
          color: theme.palette.textMuted,
        }}
      >
        Transform any video into a polished blog post in{" "}
        <span style={{ color: theme.palette.warning }}>seconds</span>
      </div>
    </AbsoluteFill>
  );
};
