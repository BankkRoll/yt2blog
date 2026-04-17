import React from "react";
import { Composition } from "remotion";
import { YT2BlogAd } from "./Composition";

/**
 * Duration calculation with TransitionSeries:
 * - Opening: 150f + CLI Flow: 1230f + Themes: 270f + CTA: 240f = 1890f
 * - 3 transitions of 15f each = -45f overlap
 * - Total: 1845 frames = 61.5 seconds at 30fps
 */
const TOTAL_DURATION = 1845;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="YT2BlogAd"
        component={YT2BlogAd}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
