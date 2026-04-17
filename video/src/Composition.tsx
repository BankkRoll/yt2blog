import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

// Import scenes
import { OpeningScene } from "./scenes/OpeningScene";
import { CLIFlowScene } from "./scenes/CLIFlowScene";
import { ThemesScene } from "./scenes/ThemesScene";
import { CTAScene } from "./scenes/CTAScene";

/**
 * YT2Blog Premium Ad - 60 second promotional video
 *
 * Simplified sequence with unified CLI flow:
 * 1. Opening (5s/150f) - Dark, cursor blink, type "npx yt2blog", enter flash
 * 2. CLI Flow (45s/1350f) - Complete terminal flow: splash -> setup -> pipeline -> output
 * 3. Themes (9s/270f) - 9 themes cycling
 * 4. CTA (8s/240f) - Final call to action
 *
 * Scene total: 2010f, Transitions: 3 × 15f = 45f overlap
 * Effective: ~1965f (~65 seconds)
 */

const TRANSITION_DURATION = 15;

export const YT2BlogAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {/* Scene 1: Premium Opening - Command typing */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <OpeningScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: Complete CLI Flow - Terminal with entire flow */}
        <TransitionSeries.Sequence durationInFrames={1230}>
          <CLIFlowScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: Theme Showcase */}
        <TransitionSeries.Sequence durationInFrames={270}>
          <ThemesScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4: Call to Action */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
