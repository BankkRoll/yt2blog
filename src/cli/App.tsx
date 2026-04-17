/**
 * @fileoverview Main App component for yt2blog CLI
 * @module cli/App
 */

import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { ThemeProvider } from "./theme/ThemeProvider.js";
import { useTheme } from "./theme/index.js";
import { Setup, type SetupConfig } from "./screens/Setup.js";
import { Pipeline } from "./screens/Pipeline.js";
import { Output } from "./screens/Output.js";
import { Splash } from "./screens/Splash.js";
import { Settings } from "./screens/Settings.js";

type Screen = "splash" | "setup" | "pipeline" | "output" | "settings";

export interface AppState {
  config: SetupConfig | null;
  blog: string | null;
  error: string | null;
  settings: Record<string, any>;
}

function AppContent() {
  const { exit } = useApp();
  const { theme } = useTheme();
  const [screen, setScreen] = useState<Screen>("splash");
  const [previousScreen, setPreviousScreen] = useState<Screen>("setup");
  const [state, setState] = useState<AppState>({
    config: null,
    blog: null,
    error: null,
    settings: {},
  });

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) {
      exit();
    }

    if (
      input === "s" &&
      screen !== "pipeline" &&
      screen !== "settings" &&
      screen !== "splash"
    ) {
      setPreviousScreen(screen);
      setScreen("settings");
    }
  });

  const handleSplashComplete = () => {
    setScreen("setup");
  };

  const handleSetupComplete = (config: SetupConfig) => {
    setState((prev) => ({ ...prev, config }));
    setScreen("pipeline");
  };

  const handlePipelineComplete = (blog: string) => {
    setState((prev) => ({ ...prev, blog }));
    setScreen("output");
  };

  const handlePipelineError = (error: string) => {
    setState((prev) => ({ ...prev, error }));
    setScreen("output");
  };

  const handleReset = () => {
    setState((prev) => ({ ...prev, config: null, blog: null, error: null }));
    setScreen("setup");
  };

  const handleSettingsBack = () => {
    setScreen(previousScreen);
  };

  const handleSettingsSave = (settings: Record<string, any>) => {
    setState((prev) => ({ ...prev, settings }));
    setScreen(previousScreen);
  };

  return (
    <Box flexDirection="column" padding={1}>
      {screen === "splash" && <Splash onComplete={handleSplashComplete} />}

      {screen === "setup" && (
        <Setup
          onComplete={handleSetupComplete}
          defaultModel={state.settings.defaultModel}
        />
      )}

      {screen === "pipeline" && state.config && (
        <Pipeline
          config={state.config}
          onComplete={handlePipelineComplete}
          onError={handlePipelineError}
          settings={state.settings}
        />
      )}

      {screen === "output" && (
        <Output
          blog={state.blog}
          error={state.error}
          onReset={handleReset}
          settings={state.settings}
        />
      )}

      {screen === "settings" && (
        <Settings
          onBack={handleSettingsBack}
          onSave={handleSettingsSave}
          currentSettings={state.settings}
        />
      )}

      <Box
        marginTop={1}
        borderStyle="single"
        borderColor={theme.palette.border}
        paddingX={1}
      >
        <Text color={theme.palette.textDim}>
          {screen === "splash" && "Press any key to continue..."}
          {screen === "setup" &&
            "↑↓ navigate • Enter select • s settings • q quit"}
          {screen === "pipeline" && "Processing... • q quit"}
          {screen === "output" &&
            "↑↓ scroll • c copy • s settings • r restart • q quit"}
          {screen === "settings" &&
            "↑↓ navigate • Enter select • Esc back • Ctrl+S save"}
        </Text>
      </Box>
    </Box>
  );
}

/** Root application component with theme provider wrapper. */
export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
