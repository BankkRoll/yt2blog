/**
 * @fileoverview Theme definitions and context for CLI styling
 * @module cli/theme/index
 */

import React, { createContext, useContext, useState } from "react";

export interface ThemePalette {
  primary: string;
  primaryMuted: string;
  secondary: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  text: string;
  textMuted: string;
  textDim: string;
  border: string;
  background: string;
  highlight: string;
  accent: string;
  link: string;
}

export interface Theme {
  name: string;
  id: string;
  palette: ThemePalette;
}

export const defaultTheme: Theme = {
  name: "Default",
  id: "default",
  palette: {
    primary: "cyan",
    primaryMuted: "cyanBright",
    secondary: "magenta",
    success: "green",
    error: "red",
    warning: "yellow",
    info: "blue",
    text: "white",
    textMuted: "gray",
    textDim: "gray",
    border: "gray",
    background: "black",
    highlight: "cyan",
    accent: "magenta",
    link: "blue",
  },
};

export const draculaTheme: Theme = {
  name: "Dracula",
  id: "dracula",
  palette: {
    primary: "#bd93f9",
    primaryMuted: "#6272a4",
    secondary: "#ff79c6",
    success: "#50fa7b",
    error: "#ff5555",
    warning: "#f1fa8c",
    info: "#8be9fd",
    text: "#f8f8f2",
    textMuted: "#6272a4",
    textDim: "#44475a",
    border: "#6272a4",
    background: "#282a36",
    highlight: "#bd93f9",
    accent: "#ff79c6",
    link: "#8be9fd",
  },
};

export const nordTheme: Theme = {
  name: "Nord",
  id: "nord",
  palette: {
    primary: "#88c0d0",
    primaryMuted: "#81a1c1",
    secondary: "#b48ead",
    success: "#a3be8c",
    error: "#bf616a",
    warning: "#ebcb8b",
    info: "#5e81ac",
    text: "#eceff4",
    textMuted: "#d8dee9",
    textDim: "#4c566a",
    border: "#4c566a",
    background: "#2e3440",
    highlight: "#88c0d0",
    accent: "#b48ead",
    link: "#81a1c1",
  },
};

export const catppuccinTheme: Theme = {
  name: "Catppuccin",
  id: "catppuccin",
  palette: {
    primary: "#cba6f7",
    primaryMuted: "#b4befe",
    secondary: "#f5c2e7",
    success: "#a6e3a1",
    error: "#f38ba8",
    warning: "#f9e2af",
    info: "#89b4fa",
    text: "#cdd6f4",
    textMuted: "#a6adc8",
    textDim: "#585b70",
    border: "#6c7086",
    background: "#1e1e2e",
    highlight: "#cba6f7",
    accent: "#f5c2e7",
    link: "#89dceb",
  },
};

export const tokyoNightTheme: Theme = {
  name: "Tokyo Night",
  id: "tokyo-night",
  palette: {
    primary: "#7aa2f7",
    primaryMuted: "#3d59a1",
    secondary: "#bb9af7",
    success: "#9ece6a",
    error: "#f7768e",
    warning: "#e0af68",
    info: "#2ac3de",
    text: "#c0caf5",
    textMuted: "#a9b1d6",
    textDim: "#565f89",
    border: "#3b4261",
    background: "#1a1b26",
    highlight: "#7aa2f7",
    accent: "#bb9af7",
    link: "#7dcfff",
  },
};

export const monokaiTheme: Theme = {
  name: "Monokai",
  id: "monokai",
  palette: {
    primary: "#66d9ef",
    primaryMuted: "#ae81ff",
    secondary: "#f92672",
    success: "#a6e22e",
    error: "#f92672",
    warning: "#e6db74",
    info: "#66d9ef",
    text: "#f8f8f2",
    textMuted: "#75715e",
    textDim: "#49483e",
    border: "#75715e",
    background: "#272822",
    highlight: "#66d9ef",
    accent: "#f92672",
    link: "#ae81ff",
  },
};

export const highContrastTheme: Theme = {
  name: "High Contrast",
  id: "high-contrast",
  palette: {
    primary: "whiteBright",
    primaryMuted: "white",
    secondary: "yellowBright",
    success: "greenBright",
    error: "redBright",
    warning: "yellowBright",
    info: "cyanBright",
    text: "whiteBright",
    textMuted: "white",
    textDim: "gray",
    border: "white",
    background: "black",
    highlight: "yellowBright",
    accent: "magentaBright",
    link: "cyanBright",
  },
};

export const neoBrutalismTheme: Theme = {
  name: "Neo Brutalism",
  id: "neo-brutalism",
  palette: {
    primary: "#E07850",
    primaryMuted: "#C06040",
    secondary: "#F0E060",
    success: "#70C070",
    error: "#FFFFFF",
    warning: "#F0E060",
    info: "#6090D0",
    text: "#FFFFFF",
    textMuted: "#D0D0D0",
    textDim: "#505050",
    border: "#FFFFFF",
    background: "#000000",
    highlight: "#E07850",
    accent: "#6090D0",
    link: "#F0E060",
  },
};

export const windows98Theme: Theme = {
  name: "Windows 98",
  id: "windows-98",
  palette: {
    primary: "#000080",
    primaryMuted: "#000060",
    secondary: "#808080",
    success: "#008000",
    error: "#FF0000",
    warning: "#FFFF00",
    info: "#008080",
    text: "#000000",
    textMuted: "#404040",
    textDim: "#606060",
    border: "#808080",
    background: "#008080",
    highlight: "#000080",
    accent: "#800080",
    link: "#0000FF",
  },
};

export const THEMES: Theme[] = [
  defaultTheme,
  draculaTheme,
  nordTheme,
  catppuccinTheme,
  tokyoNightTheme,
  monokaiTheme,
  highContrastTheme,
  neoBrutalismTheme,
  windows98Theme,
];

/** Returns theme by ID, falling back to defaultTheme. */
export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) || defaultTheme;
}

export const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (id: string) => void;
}>({
  theme: defaultTheme,
  setTheme: () => {},
});

/** Hook to access current theme and setTheme function. */
export function useTheme() {
  return useContext(ThemeContext);
}
