import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutCubic, easeInOutCubic } from "../utils/easing";

const COMMAND = "npx yt2blog";

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Colors
  const primary = "#00ffff";
  const textMuted = "#888888";

  // Typing animation for command
  const typeStart = 30;
  const charsPerFrame = 0.15; // Slower typing
  const typedChars = Math.min(
    COMMAND.length,
    Math.floor((frame - typeStart) * charsPerFrame)
  );
  const typedCommand = frame >= typeStart ? COMMAND.slice(0, typedChars) : "";
  const isTypingComplete = typedChars >= COMMAND.length;

  // Staggered fade ins
  const taglineOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  const commandOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  const commandY = interpolate(frame, [20, 45], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutExpo,
  });

  // Divider appears after typing completes
  const dividerStart = typeStart + COMMAND.length / charsPerFrame + 10;
  const dividerOpacity = interpolate(frame, [dividerStart, dividerStart + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dividerWidth = interpolate(frame, [dividerStart, dividerStart + 40], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutExpo,
  });

  const repoOpacity = interpolate(frame, [dividerStart + 20, dividerStart + 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  // Fade out to black at end for loop
  const fadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOutCubic,
  });

  // Subtle glow pulse
  const glowIntensity = Math.sin(frame * 0.04) * 0.3 + 0.7;

  // Cursor blink - only show while typing or after complete
  const cursorVisible = frame >= typeStart && Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        opacity: fadeOut,
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.5,
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 600,
          background: `radial-gradient(ellipse at center, rgba(0, 255, 255, ${0.06 * glowIntensity}) 0%, transparent 60%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            fontSize: 24,
            color: textMuted,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Get Started
        </div>

        {/* Main command - types out */}
        <div
          style={{
            opacity: commandOpacity,
            transform: `translateY(${commandY}px)`,
            display: "flex",
            alignItems: "center",
            fontSize: 72,
            fontWeight: 600,
            letterSpacing: -2,
          }}
        >
          <span style={{ color: "#4b5563", marginRight: 20 }}>$</span>
          <span
            style={{
              color: "#fff",
              textShadow: isTypingComplete
                ? `0 0 40px rgba(0, 255, 255, ${0.4 * glowIntensity})`
                : "none",
            }}
          >
            {typedCommand}
          </span>
          {cursorVisible && (
            <span
              style={{
                display: "inline-block",
                width: 4,
                height: 64,
                backgroundColor: isTypingComplete ? primary : "#fff",
                marginLeft: 4,
                boxShadow: isTypingComplete ? `0 0 20px ${primary}` : "none",
              }}
            />
          )}
        </div>

        {/* Animated divider */}
        <div
          style={{
            opacity: dividerOpacity,
            width: 400,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${primary}40, transparent)`,
            transform: `scaleX(${dividerWidth / 100})`,
          }}
        />

        {/* GitHub repo */}
        <div
          style={{
            opacity: repoOpacity,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 20,
          }}
        >
          <span style={{ color: textMuted }}>★</span>
          <span style={{ color: primary }}>github.com/</span>
          <span style={{ color: "#fff" }}>BankkRoll/yt2blog</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
