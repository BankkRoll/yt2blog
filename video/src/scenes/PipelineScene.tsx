import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeOutCubic, easeInOutCubic } from "../utils/easing";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const PIPELINE_STEPS = [
  { id: "transcript", label: "Fetching transcript", description: "Getting video captions from YouTube" },
  { id: "chunk", label: "Processing content", description: "Segmenting transcript into chunks" },
  { id: "analyze", label: "Analyzing topics", description: "Extracting key themes and insights" },
  { id: "outline", label: "Creating outline", description: "Building blog structure" },
  { id: "generate", label: "Writing sections", description: "Generating content for each section" },
  { id: "refine", label: "Polishing blog", description: "Final editing pass" },
];

export const PipelineScene: React.FC = () => {
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

  // Each step takes about 1 second
  const stepDuration = 1 * fps;

  // Get step status based on frame
  const getStepStatus = (index: number): "pending" | "running" | "success" => {
    const stepStart = 15 + index * stepDuration * 0.85;
    const stepEnd = stepStart + stepDuration;

    if (frame < stepStart) return "pending";
    if (frame < stepEnd) return "running";
    return "success";
  };

  // Progress bar for writing step
  const generateIndex = 4;
  const generateStart = 15 + generateIndex * stepDuration * 0.85;
  const generateEnd = generateStart + stepDuration;
  const generateProgress = interpolate(frame, [generateStart, generateEnd], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Elapsed time
  const elapsedSeconds = Math.floor(frame / fps);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedSecs = elapsedSeconds % 60;
  const elapsedTenths = Math.floor((frame % fps) / 3);
  const elapsedDisplay = `${elapsedMinutes}m ${elapsedSecs}.${elapsedTenths}s`;

  // Token usage
  const tokenStart = 2 * fps;
  const promptTokens = Math.floor(interpolate(frame, [tokenStart, tokenStart + 5 * fps], [0, 4521], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const completionTokens = Math.floor(interpolate(frame, [tokenStart + fps, tokenStart + 6 * fps], [0, 2847], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // All done
  const allDone = PIPELINE_STEPS.every((_, i) => getStepStatus(i) === "success");
  const successOpacity = interpolate(frame, [6.5 * fps, 7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Spinner animation
  const spinnerIndex = Math.floor(frame / 2.4) % SPINNER_FRAMES.length;

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

      <div style={{ width: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ color: primary, fontWeight: "bold" }}>* Generating Blog</span>
          <span style={{ color: textMuted }}> - {elapsedDisplay}</span>
        </div>

        {/* Config summary box */}
        <div
          style={{
            border: `1px solid ${border}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <span style={{ color: primary }}>|&gt;</span>
            <span style={{ fontWeight: "bold" }}>Video</span>
            <span style={{ color: textMuted }}>- https://youtube.com/watch?v=dQw4w...</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginLeft: 24 }}>
            <div><span style={{ color: textDim }}>Model:</span> <span style={{ color: textMuted }}>anthropic/claude-sonnet-4</span></div>
            <div><span style={{ color: textDim }}>Style:</span> <span style={{ color: textMuted }}>seo</span></div>
            <div><span style={{ color: textDim }}>Target:</span> <span style={{ color: textMuted }}>~2000 words, 6 sections</span></div>
          </div>
        </div>

        {/* Pipeline Progress Header */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ color: primary, fontWeight: "bold" }}>* Pipeline Progress</span>
        </div>

        {/* Pipeline Steps */}
        <div style={{ marginLeft: 8 }}>
          {PIPELINE_STEPS.map((step, i) => {
            const status = getStepStatus(i);
            const isGenerateStep = i === generateIndex;

            return (
              <div key={step.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 16, textAlign: "center" }}>
                    {status === "pending" && <span style={{ color: textDim }}>o</span>}
                    {status === "running" && <span style={{ color: primary }}>{SPINNER_FRAMES[spinnerIndex]}</span>}
                    {status === "success" && <span style={{ color: success }}>+</span>}
                  </span>
                  <span
                    style={{
                      color: status === "success" ? success
                        : status === "running" ? "#fff"
                        : textDim,
                      fontWeight: status === "running" ? "bold" : "normal",
                    }}
                  >
                    {step.label}
                  </span>
                  {status === "running" && (
                    <span style={{ color: textDim }}> - {step.description}</span>
                  )}
                </div>

                {/* Progress bar for generate step */}
                {isGenerateStep && status === "running" && (
                  <div style={{ marginLeft: 28, marginTop: 4 }}>
                    <span style={{ color: textDim }}>[</span>
                    <span style={{ color: primary }}>
                      {"=".repeat(Math.floor(generateProgress / 5))}
                    </span>
                    <span style={{ color: textDim }}>
                      {"-".repeat(20 - Math.floor(generateProgress / 5))}
                    </span>
                    <span style={{ color: textDim }}>]</span>
                    <span style={{ color: textMuted, marginLeft: 8 }}>{Math.floor(generateProgress)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Processing indicator or success message */}
        <div style={{ marginTop: 32 }}>
          {allDone ? (
            <div style={{ opacity: successOpacity, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: success }}>+</span>
              <span style={{ color: success, fontWeight: "bold" }}>Blog generated successfully!</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: primary }}>*</span>
              <span style={{ color: textMuted }}>Processing... Press q to cancel</span>
            </div>
          )}
        </div>

        {/* Token usage */}
        {frame > tokenStart && (
          <div
            style={{
              marginTop: 24,
              padding: "8px 16px",
              border: `1px solid ${border}`,
              borderRadius: 4,
              display: "inline-flex",
              gap: 24,
              fontSize: 14,
            }}
          >
            <span style={{ color: textDim }}>
              tokens: <span style={{ color: info }}>{promptTokens.toLocaleString()}</span>
              <span style={{ color: success }}>^</span>
            </span>
            <span style={{ color: textDim }}>
              <span style={{ color: warning }}>{completionTokens.toLocaleString()}</span>
              <span style={{ color: warning }}>v</span>
            </span>
            <span style={{ color: textDim }}>
              (~$0.0{Math.floor((promptTokens * 3 + completionTokens * 15) / 1000000 * 100).toString().padStart(2, "0")})
            </span>
          </div>
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
          Processing... - q quit
        </div>
      </div>
    </AbsoluteFill>
  );
};
