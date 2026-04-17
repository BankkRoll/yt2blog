/**
 * @fileoverview Animated splash screen with logo and feature list
 * @module cli/screens/Splash
 */

import { Box, Text, useInput } from "ink";
import React, { useEffect, useState } from "react";

import { Spinner } from "../components/Spinner.js";
import { useTheme } from "../theme/index.js";

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
  "Multi-provider support via env vars",
];

interface SplashProps {
  onComplete: () => void;
}

/** Animated splash screen with logo reveal and feature list. */
export function Splash({ onComplete }: SplashProps) {
  const { theme } = useTheme();
  const [visibleLines, setVisibleLines] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);
  const [featureIndex, setFeatureIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useInput(() => {
    onComplete();
  });

  useEffect(() => {
    if (visibleLines < LOGO_LINES.length) {
      const timer = setTimeout(() => setVisibleLines((v) => v + 1), 40);
      return () => clearTimeout(timer);
    } else {
      setShowFeatures(true);
    }
  }, [visibleLines]);

  useEffect(() => {
    if (showFeatures && featureIndex < FEATURES.length) {
      const timer = setTimeout(() => setFeatureIndex((i) => i + 1), 150);
      return () => clearTimeout(timer);
    } else if (featureIndex >= FEATURES.length) {
      setReady(true);
    }
  }, [showFeatures, featureIndex]);

  useEffect(() => {
    if (ready) {
      const timer = setTimeout(onComplete, 1200);
      return () => clearTimeout(timer);
    }
  }, [ready, onComplete]);

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Box flexDirection="column" alignItems="center">
        {LOGO_LINES.slice(0, visibleLines).map((line, i) => (
          <Text
            key={i}
            color={
              i === 0 || i === LOGO_LINES.length - 1
                ? theme.palette.textDim
                : theme.palette.primary
            }
          >
            {line}
          </Text>
        ))}
      </Box>

      {showFeatures && (
        <Box marginTop={1}>
          <Text backgroundColor={theme.palette.primary} color="black" bold>
            {" v1.0.0 "}
          </Text>
          <Text> </Text>
          <Text backgroundColor={theme.palette.secondary} color="white" bold>
            {" AI Gateway "}
          </Text>
        </Box>
      )}

      {showFeatures && (
        <Box marginTop={1}>
          <Text color={theme.palette.text} bold>
            Transform YouTube videos into polished blog posts
          </Text>
        </Box>
      )}

      {showFeatures && (
        <Box flexDirection="column" marginTop={1} alignItems="center">
          {FEATURES.slice(0, featureIndex).map((feature, i) => (
            <Box key={i}>
              <Text color={theme.palette.success}>✓ </Text>
              <Text color={theme.palette.textMuted}>{feature}</Text>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={2}>
        {!ready ? (
          <Box>
            <Spinner style="dots" color={theme.palette.primary} />
            <Text color={theme.palette.textMuted}> Loading...</Text>
          </Box>
        ) : (
          <Box flexDirection="column" alignItems="center">
            <Text color={theme.palette.warning} bold>
              ▶ Press any key to start
            </Text>
            <Box marginTop={1}>
              <Text color={theme.palette.textDim}>
                ───────────────────────────────────
              </Text>
            </Box>
            <Box marginTop={1}>
              <Text color={theme.palette.textMuted}>Powered by AI Gateway</Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
