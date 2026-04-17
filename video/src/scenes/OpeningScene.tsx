import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutQuint, easeInOutCubic } from "../utils/easing";

const COMMAND = "npx yt2blog";

// Typing timing - characters per frame with natural pauses
const getTypedText = (frame: number, fps: number): string => {
  // Start typing at frame 30 (1 second of cursor blink)
  const typeStart = 1 * fps;
  const relativeFrame = frame - typeStart;

  if (relativeFrame < 0) return "";

  // Natural typing speed with slight variations
  // Average ~3 chars per second with pauses
  const charTimings = [
    0,    // n
    4,    // p
    7,    // x
    12,   // (space)
    16,   // y
    19,   // t
    22,   // 2
    27,   // b
    30,   // l
    33,   // o
    36,   // g
  ];

  let charsToShow = 0;
  for (let i = 0; i < charTimings.length; i++) {
    if (relativeFrame >= charTimings[i]) {
      charsToShow = i + 1;
    }
  }

  return COMMAND.slice(0, charsToShow);
};

export const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline
  const cursorBlinkPhase = frame < 1 * fps;
  const typingPhase = frame >= 1 * fps && frame < 2.5 * fps;
  const typingComplete = frame >= 2.5 * fps;
  const enterPressFrame = 3 * fps;
  const enterPressed = frame >= enterPressFrame;
  const glowPulseStart = enterPressFrame;
  const glowPulseEnd = enterPressFrame + 0.5 * fps;
  const fadeOutStart = 4.5 * fps;
  const fadeOutEnd = 5 * fps;

  // Cursor blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Typed text
  const typedText = getTypedText(frame, fps);
  const showCursor = !enterPressed || frame < enterPressFrame + 5;

  // Glow pulse on enter
  const glowIntensity = enterPressed
    ? interpolate(frame, [glowPulseStart, glowPulseStart + 10, glowPulseEnd], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Scale pulse on enter
  const scalePulse = enterPressed
    ? interpolate(frame, [enterPressFrame, enterPressFrame + 8, enterPressFrame + 20], [1, 1.02, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeOutQuint,
      })
    : 1;

  // Fade out
  const fadeOut = interpolate(frame, [fadeOutStart, fadeOutEnd], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOutCubic,
  });

  // Y drift - subtle upward float on enter
  const yDrift = enterPressed
    ? interpolate(frame, [enterPressFrame, fadeOutEnd], [0, -30], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeOutQuint,
      })
    : 0;

  // Initial fade in
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutExpo,
  });

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
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.5,
        }}
      />

      {/* Radial glow behind command */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 400,
          background: `radial-gradient(ellipse at center, rgba(0, 255, 255, ${0.08 + glowIntensity * 0.15}) 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />

      {/* Command container */}
      <div
        style={{
          transform: `scale(${scalePulse}) translateY(${yDrift}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Terminal prompt */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
            fontSize: 64,
            fontWeight: 500,
            letterSpacing: -1,
          }}
        >
          {/* Dollar sign */}
          <span
            style={{
              color: "#6b7280",
              marginRight: 24,
            }}
          >
            $
          </span>

          {/* Typed command */}
          <span
            style={{
              color: "#fff",
              textShadow: glowIntensity > 0
                ? `0 0 ${20 + glowIntensity * 40}px rgba(0, 255, 255, ${0.5 + glowIntensity * 0.5})`
                : "none",
            }}
          >
            {typedText}
          </span>

          {/* Cursor */}
          {showCursor && (
            <span
              style={{
                display: "inline-block",
                width: 4,
                height: 56,
                backgroundColor: cursorVisible || typingPhase ? "#fff" : "transparent",
                marginLeft: 2,
                boxShadow: cursorVisible ? "0 0 10px rgba(255,255,255,0.5)" : "none",
              }}
            />
          )}
        </div>

        {/* Enter key hint - appears after typing complete */}
        {typingComplete && !enterPressed && (
          <div
            style={{
              opacity: interpolate(frame, [2.5 * fps, 2.8 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#4b5563",
              fontSize: 16,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            <span>press</span>
            <span
              style={{
                padding: "4px 12px",
                backgroundColor: "#1f2937",
                borderRadius: 6,
                border: "1px solid #374151",
                color: "#9ca3af",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
              }}
            >
              enter
            </span>
          </div>
        )}

        {/* Enter flash */}
        {enterPressed && frame < enterPressFrame + 10 && (
          <div
            style={{
              position: "absolute",
              width: 1200,
              height: 600,
              background: `radial-gradient(ellipse at center, rgba(255,255,255,${interpolate(frame, [enterPressFrame, enterPressFrame + 10], [0.3, 0], { extrapolateRight: "clamp" })}) 0%, transparent 50%)`,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
