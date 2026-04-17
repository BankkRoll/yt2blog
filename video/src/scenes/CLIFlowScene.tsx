import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TerminalWindow } from "../components/TerminalWindow";

/**
 * CLIFlowScene - Exact recreation of the yt2blog CLI flow
 *
 * Timing based on actual CLI (converted to 30fps):
 * - Logo line reveal: 40ms = ~1.2 frames
 * - Feature reveal: 150ms = ~4.5 frames
 * - Spinner interval: 80ms = ~2.4 frames
 * - Auto-dismiss: 1200ms = 36 frames
 */

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// ASCII Logo lines
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

const MODELS = [
  { name: "Claude 3.5 Sonnet", provider: "anthropic", input: "$3/M", output: "$15/M", context: "200K" },
  { name: "GPT-4o", provider: "openai", input: "$2.50/M", output: "$10/M", context: "128K" },
  { name: "Gemini 2.0 Flash", provider: "google", input: "$0.08/M", output: "$0.30/M", context: "1M" },
  { name: "Llama 3.3 70B", provider: "groq", input: "$0.59/M", output: "$0.79/M", context: "128K" },
];

const STYLES = [
  { name: "SEO-Optimized", desc: "Balanced keyword integration for search engines" },
  { name: "Medium Format", desc: "Structured for Medium.com publishing" },
  { name: "Newsletter Style", desc: "Conversational, weekly format" },
  { name: "Thread-Ready", desc: "Twitter thread compatible" },
  { name: "Technical Deep Dive", desc: "Code samples, architecture details" },
];

const PIPELINE_STEPS = [
  { name: "Fetching transcript", desc: "Getting video captions from YouTube" },
  { name: "Processing content", desc: "Segmenting transcript into chunks" },
  { name: "Analyzing topics", desc: "Extracting key themes and insights" },
  { name: "Creating outline", desc: "Building blog structure" },
  { name: "Writing sections", desc: "Generating content for each section" },
  { name: "Polishing blog", desc: "Final editing pass" },
];

const BLOG_CONTENT = [
  { type: "h1", text: "# How to Build a Successful SaaS Product in 2024" },
  { type: "empty", text: "" },
  { type: "h2", text: "## Introduction" },
  { type: "empty", text: "" },
  { type: "text", text: "This blog post explores the key findings from the video about" },
  { type: "text", text: "building successful SaaS products. We cover the essential" },
  { type: "text", text: "strategies and frameworks for achieving product-market fit." },
  { type: "empty", text: "" },
  { type: "h2", text: "## Key Takeaways" },
  { type: "empty", text: "" },
  { type: "h3", text: "### 1. Start with the Problem" },
  { type: "empty", text: "" },
  { type: "text", text: "The most successful SaaS founders don't start by asking" },
  { type: "text", text: "\"what can I build?\" Instead, they ask \"what problem" },
  { type: "text", text: "is worth solving?\"" },
  { type: "empty", text: "" },
  { type: "list", text: "• Identify pain points through customer interviews" },
  { type: "list", text: "• Validate demand before writing code" },
  { type: "list", text: "• Focus on problems people will pay to solve" },
  { type: "empty", text: "" },
  { type: "h3", text: "### 2. Build an MVP That Works" },
  { type: "empty", text: "" },
  { type: "text", text: "Your minimum viable product should be minimal, but it" },
  { type: "text", text: "must be viable. Users won't tolerate broken software." },
  { type: "empty", text: "" },
  { type: "list", text: "• Ship fast, but ship something that works" },
  { type: "list", text: "• Focus on core value proposition" },
  { type: "list", text: "• Iterate based on real user feedback" },
  { type: "empty", text: "" },
  { type: "h3", text: "### 3. Pricing Strategy Matters" },
  { type: "empty", text: "" },
  { type: "text", text: "Don't undervalue your product. If you're solving a real" },
  { type: "text", text: "problem, customers expect to pay for it." },
  { type: "empty", text: "" },
  { type: "h2", text: "## Conclusion" },
  { type: "empty", text: "" },
  { type: "text", text: "Success in SaaS comes from iteration, user feedback, and" },
  { type: "text", text: "a willingness to adapt. Start small, validate fast, and" },
  { type: "text", text: "scale what works." },
  { type: "empty", text: "" },
  { type: "text", text: "---" },
  { type: "text", text: "Generated with yt2blog • Powered by AI Gateway" },
];

export const CLIFlowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Colors (matching actual CLI default theme - cyan/magenta)
  const primary = "#00ffff";      // cyan
  const secondary = "#ff00ff";    // magenta
  const success = "#00ff00";      // green
  const warning = "#ffff00";      // yellow
  const info = "#0088ff";         // blue
  const textMuted = "#888888";    // gray
  const textDim = "#666666";      // dim gray

  // Spinner animation (80ms = 2.4 frames)
  const spinnerIndex = Math.floor(frame / 2.4) % SPINNER_FRAMES.length;

  // Cursor blink (500ms = 15 frames)
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // ==========================================
  // PHASE TIMING (all in frames at 30fps)
  // ==========================================

  // Phase 1: Splash (frames 0-150)
  const logoRevealStart = 10;
  const logoLineDelay = 1.2; // 40ms per line
  const badgesStart = logoRevealStart + LOGO_LINES.length * logoLineDelay + 5;
  const taglineStart = badgesStart + 5;
  const featuresStart = taglineStart + 10;
  const featureDelay = 4.5; // 150ms per feature
  const loadingStart = featuresStart + FEATURES.length * featureDelay + 10;
  const readyStart = loadingStart + 30; // 1 second of loading
  const splashEnd = 150;

  // Phase 2: Setup (frames 150-550)
  const setupStart = splashEnd;
  const setupHeaderStart = setupStart + 10;
  const apiKeyStatusStart = setupHeaderStart + 10;

  // Step timings
  const urlStepStart = apiKeyStatusStart + 15;
  const urlTypingStart = urlStepStart + 10;
  const urlTypingEnd = urlTypingStart + 40;
  const urlDone = urlTypingEnd + 10;

  const modelStepStart = urlDone + 10;
  const modelSelectStart = modelStepStart + 10;
  const modelSelectEnd = modelSelectStart + 60;
  const modelDone = modelSelectEnd + 10;

  const styleStepStart = modelDone + 10;
  const styleSelectStart = styleStepStart + 10;
  const styleSelectEnd = styleSelectStart + 40;
  const styleDone = styleSelectEnd + 10;

  const sectionsStepStart = styleDone + 10;
  const sectionsAdjustEnd = sectionsStepStart + 30;
  const sectionsDone = sectionsAdjustEnd + 10;

  const wordCountStepStart = sectionsDone + 10;
  const wordCountAdjustEnd = wordCountStepStart + 30;
  const setupEnd = 550;

  // Phase 3: Pipeline (frames 550-950)
  const pipelineStart = setupEnd;
  const pipelineHeaderStart = pipelineStart + 10;
  const configBoxStart = pipelineHeaderStart + 10;
  const pipelineProgressStart = configBoxStart + 20;

  // Each step takes ~50 frames (running for 45, then done)
  const stepDuration = 50;
  const pipelineStepStart = (i: number) => pipelineProgressStart + 15 + i * stepDuration;
  const pipelineSuccessStart = pipelineProgressStart + 15 + PIPELINE_STEPS.length * stepDuration;
  const pipelineEnd = 950;

  // Phase 4: Output (frames 950-1350)
  const outputStart = pipelineEnd;
  const outputHeaderStart = outputStart + 10;
  const statsBoxStart = outputHeaderStart + 10;
  const scrollIndicatorStart = statsBoxStart + 10;
  const contentStart = scrollIndicatorStart + 10;
  const contentLineDelay = 3; // Lines appear quickly
  const copyActionStart = contentStart + BLOG_CONTENT.length * contentLineDelay + 60;
  const saveActionStart = copyActionStart + 50;

  // ==========================================
  // RENDERING HELPERS
  // ==========================================

  const getOpacity = (startFrame: number, duration: number = 5) => {
    return interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  const getStepIcon = (stepStart: number, stepDone: number) => {
    if (frame < stepStart) return { icon: "○", color: textDim };
    if (frame < stepDone) return { icon: "◇", color: primary };
    return { icon: "●", color: success };
  };

  const getPipelineStepStatus = (stepIndex: number) => {
    const stepStart = pipelineStepStart(stepIndex);
    const stepEnd = stepStart + stepDuration - 5;
    if (frame < stepStart) return "pending";
    if (frame < stepEnd) return "running";
    return "done";
  };

  // URL typing animation
  const urlText = "https://youtube.com/watch?v=dQw4w9WgXcQ";
  const urlChars = Math.floor(
    interpolate(frame, [urlTypingStart, urlTypingEnd], [0, urlText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Model selection animation
  const selectedModelIndex = frame < modelSelectStart + 30 ? 1 : 0; // Moves from GPT-4o to Claude

  // Sections value animation
  const sectionsValue = Math.floor(
    interpolate(frame, [sectionsStepStart, sectionsAdjustEnd], [5, 6], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Word count animation
  const wordCountValue = Math.floor(
    interpolate(frame, [wordCountStepStart, wordCountAdjustEnd], [1500, 2000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) / 100
  ) * 100;

  // Elapsed time for pipeline
  const pipelineElapsed = Math.max(0, frame - pipelineStart);
  const elapsedSecs = Math.floor(pipelineElapsed / fps);
  const elapsedTenths = Math.floor((pipelineElapsed % fps) / 3);
  const elapsedDisplay = `${Math.floor(elapsedSecs / 60)}m ${elapsedSecs % 60}.${elapsedTenths}s`;

  // Max visible lines for output
  const maxVisibleLines = 12;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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

      <TerminalWindow title="yt2blog" width={1000} height={640}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 13, lineHeight: 1.5 }}>

          {/* ==================== PHASE 1: SPLASH ==================== */}
          {frame < splashEnd && (
            <>
              {/* Logo */}
              {LOGO_LINES.map((line, i) => {
                const lineStart = logoRevealStart + i * logoLineDelay;
                const opacity = getOpacity(lineStart, 3);
                const isArt = i >= 2 && i <= 7;
                return (
                  <div
                    key={`logo-${i}`}
                    style={{
                      opacity,
                      color: isArt ? primary : textDim,
                      fontSize: 10,
                      lineHeight: 1.1,
                      whiteSpace: "pre",
                      textAlign: "center",
                    }}
                  >
                    {line}
                  </div>
                );
              })}

              {/* Badges */}
              <div style={{ opacity: getOpacity(badgesStart), display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
                <span style={{ padding: "2px 8px", backgroundColor: primary, color: "#000", borderRadius: 3, fontSize: 10, fontWeight: "bold" }}>
                  v1.0.0
                </span>
                <span style={{ padding: "2px 8px", backgroundColor: secondary, color: "#fff", borderRadius: 3, fontSize: 10, fontWeight: "bold" }}>
                  AI Gateway
                </span>
              </div>

              {/* Tagline */}
              <div style={{ opacity: getOpacity(taglineStart), textAlign: "center", marginTop: 12, color: "#fff", fontWeight: "bold" }}>
                Transform YouTube videos into polished blog posts
              </div>

              {/* Features */}
              <div style={{ marginTop: 16 }}>
                {FEATURES.map((feature, i) => {
                  const featureStart = featuresStart + i * featureDelay;
                  return (
                    <div
                      key={`feature-${i}`}
                      style={{
                        opacity: getOpacity(featureStart, 4),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: success }}>✓</span>
                      <span style={{ color: textMuted }}>{feature}</span>
                    </div>
                  );
                })}
              </div>

              {/* Loading / Ready */}
              <div style={{ marginTop: 20, textAlign: "center" }}>
                {frame < readyStart ? (
                  <div style={{ opacity: getOpacity(loadingStart), display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ color: primary }}>{SPINNER_FRAMES[spinnerIndex]}</span>
                    <span style={{ color: textMuted }}>Loading...</span>
                  </div>
                ) : (
                  <div style={{ opacity: getOpacity(readyStart) }}>
                    <div style={{ color: warning, fontWeight: "bold" }}>▶ Press any key to start</div>
                    <div style={{ color: textDim, marginTop: 8 }}>───────────────────────────────</div>
                    <div style={{ color: textMuted, marginTop: 8 }}>Powered by AI Gateway</div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ==================== PHASE 2: SETUP ==================== */}
          {frame >= setupStart && frame < setupEnd && (
            <>
              {/* Header */}
              <div style={{ opacity: getOpacity(setupHeaderStart), marginBottom: 8 }}>
                <span style={{ color: primary }}>◆</span>
                <span style={{ color: "#fff", fontWeight: "bold", marginLeft: 8 }}>Setup</span>
                <span style={{ color: textMuted }}> — Configure your blog generation</span>
              </div>

              {/* API Key Status */}
              <div style={{ opacity: getOpacity(apiKeyStatusStart), marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ backgroundColor: success, color: "#000", padding: "1px 4px", fontWeight: "bold" }}>✓</span>
                <span style={{ color: success }}>AI_GATEWAY_API_KEY detected</span>
              </div>

              {/* Step 1: URL */}
              {frame >= urlStepStart && (
                <>
                  <div style={{ opacity: getOpacity(urlStepStart), display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: getStepIcon(urlStepStart, urlDone).color }}>{getStepIcon(urlStepStart, urlDone).icon}</span>
                    <span style={{ color: frame < urlDone ? "#fff" : success, fontWeight: frame < urlDone ? "bold" : "normal" }}>YouTube URL</span>
                    {frame < urlDone && <span style={{ color: textDim }}>(paste video URL)</span>}
                  </div>
                  {frame >= urlTypingStart && frame < urlDone && (
                    <div style={{ marginLeft: 24, marginTop: 4, display: "flex", alignItems: "center" }}>
                      <span style={{ color: primary }}>❯</span>
                      <span style={{ color: "#fff", marginLeft: 8 }}>{urlText.slice(0, urlChars)}</span>
                      {cursorVisible && frame < urlTypingEnd && <span style={{ width: 8, height: 14, backgroundColor: primary, marginLeft: 1 }} />}
                    </div>
                  )}
                  {frame >= urlDone && (
                    <div style={{ marginLeft: 24, color: textMuted, marginTop: 4 }}>{urlText.slice(0, 45)}...</div>
                  )}
                  {frame >= urlDone && frame < modelDone && <div style={{ color: textDim, marginLeft: 4, marginTop: 4 }}>│</div>}
                </>
              )}

              {/* Step 2: Model */}
              {frame >= modelStepStart && (
                <>
                  <div style={{ opacity: getOpacity(modelStepStart), display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ color: getStepIcon(modelStepStart, modelDone).color }}>{getStepIcon(modelStepStart, modelDone).icon}</span>
                    <span style={{ color: frame < modelDone ? "#fff" : success, fontWeight: frame < modelDone ? "bold" : "normal" }}>Model</span>
                    {frame >= modelSelectStart && frame < modelDone && <span style={{ color: textDim }}>(↑↓ select, c custom)</span>}
                  </div>
                  {frame >= modelSelectStart && frame < modelDone && (
                    <div style={{ marginLeft: 24, marginTop: 4, fontSize: 12 }}>
                      <div style={{ display: "flex", color: textDim, marginBottom: 4 }}>
                        <span style={{ width: 24 }}></span>
                        <span style={{ width: 160 }}>Model</span>
                        <span style={{ width: 80 }}>Provider</span>
                        <span style={{ width: 70 }}>Input</span>
                        <span style={{ width: 70 }}>Output</span>
                        <span style={{ width: 60 }}>Context</span>
                      </div>
                      {MODELS.map((model, i) => (
                        <div key={`model-${i}`} style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ width: 24, color: i === selectedModelIndex ? primary : "transparent" }}>{i === selectedModelIndex ? "❯" : " "}</span>
                          <span style={{ width: 160, color: i === selectedModelIndex ? "#fff" : textMuted, fontWeight: i === selectedModelIndex ? "bold" : "normal" }}>{model.name}</span>
                          <span style={{ width: 80, color: textDim }}>{model.provider}</span>
                          <span style={{ width: 70, color: success }}>{model.input}</span>
                          <span style={{ width: 70, color: warning }}>{model.output}</span>
                          <span style={{ width: 60, color: primary }}>{model.context}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {frame >= modelDone && (
                    <div style={{ marginLeft: 24, color: textMuted, marginTop: 4 }}>anthropic/claude-3-5-sonnet</div>
                  )}
                  {frame >= modelDone && frame < styleDone && <div style={{ color: textDim, marginLeft: 4, marginTop: 4 }}>│</div>}
                </>
              )}

              {/* Step 3: Style */}
              {frame >= styleStepStart && (
                <>
                  <div style={{ opacity: getOpacity(styleStepStart), display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ color: getStepIcon(styleStepStart, styleDone).color }}>{getStepIcon(styleStepStart, styleDone).icon}</span>
                    <span style={{ color: frame < styleDone ? "#fff" : success, fontWeight: frame < styleDone ? "bold" : "normal" }}>Blog Style</span>
                    {frame >= styleSelectStart && frame < styleDone && <span style={{ color: textDim }}>(↑↓ select)</span>}
                  </div>
                  {frame >= styleSelectStart && frame < styleDone && (
                    <div style={{ marginLeft: 24, marginTop: 4, fontSize: 12 }}>
                      {STYLES.map((style, i) => (
                        <div key={`style-${i}`} style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ color: i === 0 ? primary : "transparent", marginRight: 4 }}>{i === 0 ? "❯" : " "}</span>
                          <span style={{ color: i === 0 ? "#fff" : textMuted, fontWeight: i === 0 ? "bold" : "normal" }}>{style.name}</span>
                          <span style={{ color: textDim, marginLeft: 8 }}>— {style.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {frame >= styleDone && (
                    <div style={{ marginLeft: 24, color: textMuted, marginTop: 4 }}>SEO-Optimized</div>
                  )}
                  {frame >= styleDone && frame < sectionsDone && <div style={{ color: textDim, marginLeft: 4, marginTop: 4 }}>│</div>}
                </>
              )}

              {/* Step 4: Sections */}
              {frame >= sectionsStepStart && (
                <>
                  <div style={{ opacity: getOpacity(sectionsStepStart), display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ color: getStepIcon(sectionsStepStart, sectionsDone).color }}>{getStepIcon(sectionsStepStart, sectionsDone).icon}</span>
                    <span style={{ color: frame < sectionsDone ? "#fff" : success, fontWeight: frame < sectionsDone ? "bold" : "normal" }}>Sections</span>
                    {frame < sectionsDone && <span style={{ color: textDim }}>(←→ adjust)</span>}
                  </div>
                  <div style={{ marginLeft: 24, marginTop: 4 }}>
                    {frame < sectionsDone ? (
                      <>
                        <span style={{ color: primary }}>◀</span>
                        <span style={{ color: "#fff", fontWeight: "bold", margin: "0 8px" }}>{sectionsValue}</span>
                        <span style={{ color: primary }}>▶</span>
                        <span style={{ color: textMuted, marginLeft: 8 }}>sections</span>
                      </>
                    ) : (
                      <span style={{ color: textMuted }}>{sectionsValue} sections</span>
                    )}
                  </div>
                  {frame >= sectionsDone && frame < wordCountAdjustEnd && <div style={{ color: textDim, marginLeft: 4, marginTop: 4 }}>│</div>}
                </>
              )}

              {/* Step 5: Word Count */}
              {frame >= wordCountStepStart && (
                <>
                  <div style={{ opacity: getOpacity(wordCountStepStart), display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ color: getStepIcon(wordCountStepStart, wordCountAdjustEnd).color }}>{getStepIcon(wordCountStepStart, wordCountAdjustEnd).icon}</span>
                    <span style={{ color: frame < wordCountAdjustEnd ? "#fff" : success, fontWeight: frame < wordCountAdjustEnd ? "bold" : "normal" }}>Word Count</span>
                    {frame < wordCountAdjustEnd && <span style={{ color: textDim }}>(←→ adjust ±100)</span>}
                  </div>
                  <div style={{ marginLeft: 24, marginTop: 4 }}>
                    {frame < wordCountAdjustEnd ? (
                      <>
                        <span style={{ color: primary }}>◀</span>
                        <span style={{ color: "#fff", fontWeight: "bold", margin: "0 8px" }}>{wordCountValue}</span>
                        <span style={{ color: primary }}>▶</span>
                        <span style={{ color: textMuted, marginLeft: 8 }}>words</span>
                      </>
                    ) : (
                      <span style={{ color: textMuted }}>~{wordCountValue} words</span>
                    )}
                  </div>
                </>
              )}

              {/* Help Footer */}
              <div style={{ marginTop: 24, borderTop: `1px solid ${textDim}`, paddingTop: 8, color: textDim, fontSize: 12 }}>
                ↑↓ navigate • Enter select • s settings • q quit
              </div>
            </>
          )}

          {/* ==================== PHASE 3: PIPELINE ==================== */}
          {frame >= pipelineStart && frame < pipelineEnd && (
            <>
              {/* Header with timer */}
              <div style={{ opacity: getOpacity(pipelineHeaderStart), marginBottom: 8 }}>
                <span style={{ color: primary }}>◆</span>
                <span style={{ color: "#fff", fontWeight: "bold", marginLeft: 8 }}>Generating Blog</span>
                <span style={{ color: textMuted }}> — {elapsedDisplay}</span>
              </div>

              {/* Config box */}
              <div style={{ opacity: getOpacity(configBoxStart), border: `1px solid ${textDim}`, borderRadius: 4, padding: 8, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: success }}>📹</span>
                  <span style={{ fontWeight: "bold" }}>Video:</span>
                  <span style={{ color: textMuted }}>https://youtube.com/watch?v=dQw4w9...</span>
                </div>
                <div style={{ color: textMuted, marginLeft: 24 }}>Model: anthropic/claude-3-5-sonnet</div>
                <div style={{ color: textMuted, marginLeft: 24 }}>Style: seo | Target: ~{wordCountValue} words, {sectionsValue} sections</div>
              </div>

              {/* Pipeline Progress */}
              <div style={{ opacity: getOpacity(pipelineProgressStart), marginBottom: 8 }}>
                <span style={{ color: primary }}>◆</span>
                <span style={{ color: "#fff", fontWeight: "bold", marginLeft: 8 }}>Pipeline Progress</span>
              </div>

              {PIPELINE_STEPS.map((step, i) => {
                const status = getPipelineStepStatus(i);
                const stepStart = pipelineStepStart(i);
                return (
                  <div key={`step-${i}`} style={{ opacity: getOpacity(stepStart), display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 16, textAlign: "center" }}>
                      {status === "pending" && <span style={{ color: textDim }}>○</span>}
                      {status === "running" && <span style={{ color: primary }}>{SPINNER_FRAMES[spinnerIndex]}</span>}
                      {status === "done" && <span style={{ color: success }}>✓</span>}
                    </span>
                    <span style={{
                      color: status === "done" ? success : status === "running" ? "#fff" : textMuted,
                      fontWeight: status === "running" ? "bold" : "normal",
                    }}>
                      {step.name}
                    </span>
                    {status === "running" && <span style={{ color: textDim }}>— {step.desc}</span>}
                    {status === "done" && <span style={{ color: textDim, marginLeft: 4 }}>(1.{i + 1}s)</span>}
                  </div>
                );
              })}

              {/* Success message */}
              {frame >= pipelineSuccessStart && (
                <div style={{ opacity: getOpacity(pipelineSuccessStart), marginTop: 16 }}>
                  <span style={{ color: success }}>✓</span>
                  <span style={{ color: success, fontWeight: "bold", marginLeft: 8 }}>Blog generated successfully!</span>
                </div>
              )}

              {/* Help Footer */}
              <div style={{ marginTop: 24, borderTop: `1px solid ${textDim}`, paddingTop: 8, color: textDim, fontSize: 12 }}>
                Processing... • q quit
              </div>
            </>
          )}

          {/* ==================== PHASE 4: OUTPUT ==================== */}
          {frame >= outputStart && (() => {
            // Calculate how many lines have been "typed" so far
            const typedLineCount = Math.min(
              BLOG_CONTENT.length,
              Math.floor((frame - contentStart) / contentLineDelay) + 1
            );
            const totalLines = BLOG_CONTENT.length;

            // Auto-scroll to keep newest content visible
            const autoScrollOffset = Math.max(0, typedLineCount - maxVisibleLines);

            // Calculate scroll bar position
            const scrollProgress = totalLines > maxVisibleLines
              ? Math.min(1, autoScrollOffset / (totalLines - maxVisibleLines))
              : 0;
            const scrollBarFilled = Math.max(1, Math.floor(scrollProgress * 20));

            // Current line range
            const startLine = autoScrollOffset + 1;
            const endLine = Math.min(autoScrollOffset + maxVisibleLines, typedLineCount);

            // Lines above/below
            const linesAbove = autoScrollOffset;
            const linesBelow = Math.max(0, totalLines - autoScrollOffset - maxVisibleLines);

            return (
              <>
                {/* Header */}
                <div style={{ opacity: getOpacity(outputHeaderStart), display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <span style={{ color: success }}>✓</span>
                    <span style={{ color: success, fontWeight: "bold", marginLeft: 8 }}>Blog Generated</span>
                    <span style={{ color: textMuted }}> — 2,847 words</span>
                  </div>
                  <div>
                    {frame >= copyActionStart && frame < saveActionStart && (
                      <span style={{ color: success, opacity: getOpacity(copyActionStart) }}>Copied to clipboard!</span>
                    )}
                    {frame >= saveActionStart && (
                      <span style={{ color: success, opacity: getOpacity(saveActionStart) }}>Saved: blog-1713345600.md</span>
                    )}
                  </div>
                </div>

                {/* Stats box */}
                <div style={{ opacity: getOpacity(statsBoxStart), border: `1px solid ${textDim}`, borderRadius: 4, padding: 8, marginBottom: 12, display: "flex", gap: 24 }}>
                  <span><span style={{ color: textDim }}>Lines:</span> {totalLines}</span>
                  <span><span style={{ color: textDim }}>Words:</span> 2,847</span>
                  <span><span style={{ color: textDim }}>Format:</span> Markdown</span>
                </div>

                {/* Scroll indicator - updates as content scrolls */}
                <div style={{ opacity: getOpacity(scrollIndicatorStart), marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: textDim }}>[</span>
                  <span style={{ color: primary }}>{"█".repeat(scrollBarFilled)}</span>
                  <span style={{ color: textDim }}>{"░".repeat(20 - scrollBarFilled)}</span>
                  <span style={{ color: textDim }}>]</span>
                  <span style={{ color: textMuted, marginLeft: 8 }}>
                    Line {startLine}-{endLine} of {totalLines}
                  </span>
                </div>

                {/* Lines above indicator */}
                {linesAbove > 0 && (
                  <div style={{ color: textDim, fontSize: 12, marginBottom: 4 }}>
                    ↑ {linesAbove} more lines above
                  </div>
                )}

                {/* Content - scrolls as new lines appear */}
                <div style={{ border: `1px solid ${textDim}`, borderRadius: 4, padding: 8, height: 220, overflow: "hidden" }}>
                  {BLOG_CONTENT.slice(autoScrollOffset, autoScrollOffset + maxVisibleLines).map((line, i) => {
                    const actualLineIndex = autoScrollOffset + i;
                    const lineStart = contentStart + actualLineIndex * contentLineDelay;
                    const isVisible = frame >= lineStart;
                    const lineOpacity = isVisible ? getOpacity(lineStart, 3) : 0;

                    if (!isVisible) return <div key={`line-${i}`} style={{ height: 18 }} />;
                    if (line.type === "empty") return <div key={`line-${i}`} style={{ opacity: lineOpacity, height: 18 }} />;
                    if (line.type === "h1") return <div key={`line-${i}`} style={{ opacity: lineOpacity, color: primary, fontWeight: "bold" }}>{line.text}</div>;
                    if (line.type === "h2") return <div key={`line-${i}`} style={{ opacity: lineOpacity, color: success, fontWeight: "bold" }}>{line.text}</div>;
                    if (line.type === "h3") return <div key={`line-${i}`} style={{ opacity: lineOpacity, color: warning, fontWeight: "bold" }}>{line.text}</div>;
                    if (line.type === "list") return <div key={`line-${i}`} style={{ opacity: lineOpacity }}><span style={{ color: primary }}>•</span>{line.text.slice(1)}</div>;
                    return <div key={`line-${i}`} style={{ opacity: lineOpacity, color: "#e5e7eb" }}>{line.text}</div>;
                  })}
                </div>

                {/* Lines below indicator */}
                {linesBelow > 0 && typedLineCount >= totalLines && (
                  <div style={{ marginTop: 4, color: textDim, fontSize: 12 }}>
                    ↓ {linesBelow} more lines below
                  </div>
                )}

                {/* Typing indicator while content is being generated */}
                {typedLineCount < totalLines && (
                  <div style={{ marginTop: 4, color: textMuted, fontSize: 12 }}>
                    <span style={{ color: primary }}>{SPINNER_FRAMES[spinnerIndex]}</span>
                    <span style={{ marginLeft: 8 }}>Generating... {typedLineCount}/{totalLines} lines</span>
                  </div>
                )}

                {/* Help Footer */}
                <div style={{ marginTop: 16, borderTop: `1px solid ${textDim}`, paddingTop: 8, color: textDim, fontSize: 12 }}>
                  ↑↓ scroll • PgUp/PgDn page • c copy • s save • r restart • q quit
                </div>
              </>
            );
          })()}
        </div>
      </TerminalWindow>
    </AbsoluteFill>
  );
};
