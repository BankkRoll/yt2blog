import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutExpo, easeOutCubic, easeInOutCubic } from "../utils/easing";

const YOUTUBE_URL = "https://youtube.com/watch?v=dQw4w9WgXcQ";

const MODELS = [
  { name: "GPT-4o", provider: "OpenAI", input: "$2.50/M", output: "$10/M", context: "128K" },
  { name: "Claude Sonnet 4", provider: "Anthropic", input: "$3/M", output: "$15/M", context: "200K" },
  { name: "Gemini 2.0 Flash", provider: "Google", input: "$0.08/M", output: "$0.30/M", context: "1M" },
  { name: "Llama 3.3 70B", provider: "Groq", input: "$0.59/M", output: "$0.79/M", context: "128K" },
];

const STYLES = [
  { name: "SEO Optimized", desc: "Best for search engine rankings" },
  { name: "Medium Article", desc: "Polished, shareable format" },
  { name: "Newsletter", desc: "Engaging monthly content style" },
  { name: "Twitter Thread", desc: "Concise, viral-ready format" },
  { name: "Technical", desc: "In-depth developer documentation" },
];

export const SetupScene: React.FC = () => {
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

  // Timeline for each step
  const urlTypingEnd = 2 * fps;
  const modelStart = 2.3 * fps;
  const modelEnd = 5 * fps;
  const styleStart = 5.3 * fps;
  const styleEnd = 7.5 * fps;
  const sectionsStart = 7.8 * fps;
  const sectionsEnd = 8.8 * fps;
  const wordCountStart = 9.1 * fps;
  const wordCountEnd = 10 * fps;

  // Fade in/out
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOutCubic,
  });

  const fadeOutStart = 9.5 * fps;
  const fadeOut = interpolate(frame, [fadeOutStart, fadeOutStart + 15], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOutCubic,
  });

  // URL typing animation
  const urlChars = Math.floor(
    interpolate(frame, [15, urlTypingEnd], [0, YOUTUBE_URL.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Model selection
  const modelSelecting = frame >= modelStart && frame < modelEnd;
  const modelIndex = modelSelecting
    ? Math.min(Math.floor((frame - modelStart) / (0.6 * fps)), 1)
    : 1;
  const modelDone = frame >= modelEnd;

  // Style selection
  const styleSelecting = frame >= styleStart && frame < styleEnd;
  const styleDone = frame >= styleEnd;

  // Sections
  const sectionsActive = frame >= sectionsStart && frame < sectionsEnd;
  const sectionsValue = sectionsActive
    ? 5 + Math.floor((frame - sectionsStart) / (0.3 * fps))
    : frame >= sectionsEnd ? 6 : 5;

  // Word count
  const wordCountActive = frame >= wordCountStart && frame < wordCountEnd;
  const wordCountValue = wordCountActive
    ? 1500 + Math.floor((frame - wordCountStart) / (0.1 * fps)) * 100
    : frame >= wordCountEnd ? 2000 : 1500;

  // Helper for step icons
  const getStepStatus = (start: number, end: number) => {
    if (frame < start) return "pending";
    if (frame < end) return "active";
    return "done";
  };

  const StepIcon: React.FC<{ status: "pending" | "active" | "done" }> = ({ status }) => {
    const color = status === "done" ? success : status === "active" ? primary : textDim;
    const icon = status === "done" ? "+" : status === "active" ? ">" : "o";
    return <span style={{ color, marginRight: 12, fontWeight: "bold" }}>{icon}</span>;
  };

  // Cursor blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 16,
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

      <div style={{ width: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ color: primary, fontWeight: "bold" }}>* Setup</span>
          <span style={{ color: textMuted }}> - Configure your blog generation</span>
        </div>

        {/* API Key status */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: success }}>+</span>
          <span style={{ color: success }}>AI_GATEWAY_API_KEY detected</span>
        </div>

        {/* Step 1: YouTube URL */}
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
          <StepIcon status={getStepStatus(0, urlTypingEnd)} />
          <span style={{
            color: frame < urlTypingEnd ? "#fff" : success,
            fontWeight: frame < urlTypingEnd ? "bold" : "normal"
          }}>YouTube URL</span>
          {frame < urlTypingEnd && <span style={{ color: textDim, marginLeft: 12 }}>paste video URL</span>}
        </div>
        <div style={{ marginLeft: 32, marginBottom: 20 }}>
          {frame < urlTypingEnd + 10 ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ color: primary, marginRight: 8 }}>|&gt;</span>
              <span style={{ color: "#fff" }}>{YOUTUBE_URL.slice(0, urlChars)}</span>
              {cursorVisible && frame < urlTypingEnd && (
                <span style={{ width: 8, height: 18, backgroundColor: "#fff", marginLeft: 1 }} />
              )}
              {urlChars === 0 && <span style={{ color: textDim }}>https://youtube.com/watch?v=...</span>}
            </div>
          ) : (
            <span style={{ color: textMuted }}>{YOUTUBE_URL.slice(0, 45)}...</span>
          )}
        </div>

        {frame >= urlTypingEnd && <div style={{ color: textDim, marginLeft: 8, marginBottom: 8 }}>|</div>}

        {/* Step 2: Model Selection */}
        {frame >= modelStart - 10 && (
          <>
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
              <StepIcon status={getStepStatus(modelStart, modelEnd)} />
              <span style={{
                color: modelDone ? success : (modelSelecting ? "#fff" : textDim),
                fontWeight: modelSelecting ? "bold" : "normal"
              }}>Model</span>
              {modelSelecting && <span style={{ color: textDim, marginLeft: 12 }}>up/down /, c custom</span>}
            </div>

            {modelSelecting && (
              <div style={{ marginLeft: 32, marginBottom: 20 }}>
                <div style={{ display: "flex", marginBottom: 8, color: textDim, fontSize: 14 }}>
                  <span style={{ width: 24 }}></span>
                  <span style={{ width: 180 }}>Model</span>
                  <span style={{ width: 100 }}>Provider</span>
                  <span style={{ width: 80 }}>Input</span>
                  <span style={{ width: 80 }}>Output</span>
                  <span style={{ width: 70 }}>Context</span>
                </div>
                {MODELS.map((model, i) => {
                  const isSelected = i === modelIndex;
                  return (
                    <div key={i} style={{ display: "flex", fontSize: 15 }}>
                      <span style={{ width: 24, color: isSelected ? primary : "transparent" }}>
                        {isSelected ? ">" : " "}
                      </span>
                      <span style={{
                        width: 180,
                        color: isSelected ? "#fff" : textMuted,
                        fontWeight: isSelected ? "bold" : "normal"
                      }}>
                        {model.name}
                      </span>
                      <span style={{ width: 100, color: textDim }}>{model.provider}</span>
                      <span style={{ width: 80, color: success }}>{model.input}</span>
                      <span style={{ width: 80, color: warning }}>{model.output}</span>
                      <span style={{ width: 70, color: info }}>{model.context}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {modelDone && (
              <div style={{ marginLeft: 32, marginBottom: 20 }}>
                <span style={{ color: textMuted }}>anthropic/claude-sonnet-4</span>
              </div>
            )}
          </>
        )}

        {modelDone && <div style={{ color: textDim, marginLeft: 8, marginBottom: 8 }}>|</div>}

        {/* Step 3: Style Selection */}
        {frame >= styleStart - 10 && (
          <>
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
              <StepIcon status={getStepStatus(styleStart, styleEnd)} />
              <span style={{
                color: styleDone ? success : (styleSelecting ? "#fff" : textDim),
                fontWeight: styleSelecting ? "bold" : "normal"
              }}>Blog Style</span>
              {styleSelecting && <span style={{ color: textDim, marginLeft: 12 }}>up/down select</span>}
            </div>

            {styleSelecting && (
              <div style={{ marginLeft: 32, marginBottom: 20 }}>
                {STYLES.map((style, i) => {
                  const isSelected = i === 0;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", fontSize: 15 }}>
                      <span style={{ color: isSelected ? primary : "transparent", marginRight: 8 }}>
                        {isSelected ? ">" : " "}
                      </span>
                      <span style={{ color: isSelected ? "#fff" : textMuted, fontWeight: isSelected ? "bold" : "normal" }}>
                        {style.name}
                      </span>
                      <span style={{ color: textDim, marginLeft: 12 }}>- {style.desc}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {styleDone && (
              <div style={{ marginLeft: 32, marginBottom: 20 }}>
                <span style={{ color: textMuted }}>SEO Optimized</span>
              </div>
            )}
          </>
        )}

        {styleDone && <div style={{ color: textDim, marginLeft: 8, marginBottom: 8 }}>|</div>}

        {/* Step 4: Sections */}
        {frame >= sectionsStart - 10 && (
          <>
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
              <StepIcon status={getStepStatus(sectionsStart, sectionsEnd)} />
              <span style={{
                color: frame >= sectionsEnd ? success : (sectionsActive ? "#fff" : textDim),
                fontWeight: sectionsActive ? "bold" : "normal"
              }}>Sections</span>
              {sectionsActive && <span style={{ color: textDim, marginLeft: 12 }}>left/right adjust</span>}
            </div>
            <div style={{ marginLeft: 32, marginBottom: 20 }}>
              {sectionsActive ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ color: primary }}>&lt; </span>
                  <span style={{ fontWeight: "bold", color: "#fff" }}>{sectionsValue}</span>
                  <span style={{ color: primary }}> &gt;</span>
                  <span style={{ color: textDim, marginLeft: 8 }}>sections</span>
                </div>
              ) : frame >= sectionsEnd ? (
                <span style={{ color: textMuted }}>{sectionsValue} sections</span>
              ) : null}
            </div>
          </>
        )}

        {frame >= sectionsEnd && <div style={{ color: textDim, marginLeft: 8, marginBottom: 8 }}>|</div>}

        {/* Step 5: Word Count */}
        {frame >= wordCountStart - 10 && (
          <>
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
              <StepIcon status={getStepStatus(wordCountStart, wordCountEnd)} />
              <span style={{
                color: frame >= wordCountEnd ? success : (wordCountActive ? "#fff" : textDim),
                fontWeight: wordCountActive ? "bold" : "normal"
              }}>Word Count</span>
              {wordCountActive && <span style={{ color: textDim, marginLeft: 12 }}>left/right adjust (+/-100)</span>}
            </div>
            <div style={{ marginLeft: 32, marginBottom: 20 }}>
              {wordCountActive ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ color: primary }}>&lt; </span>
                  <span style={{ fontWeight: "bold", color: "#fff" }}>{wordCountValue}</span>
                  <span style={{ color: primary }}> &gt;</span>
                  <span style={{ color: textDim, marginLeft: 8 }}>words</span>
                </div>
              ) : frame >= wordCountEnd ? (
                <span style={{ color: textMuted }}>~{wordCountValue} words</span>
              ) : null}
            </div>
          </>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: 32,
            borderTop: `1px solid ${border}`,
            paddingTop: 16,
            color: textDim,
            fontSize: 14,
          }}
        >
          up/down navigate - Enter select - s settings - q quit
        </div>
      </div>
    </AbsoluteFill>
  );
};
