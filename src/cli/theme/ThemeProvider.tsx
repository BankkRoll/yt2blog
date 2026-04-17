/**
 * @fileoverview ThemeProvider component for yt2blog
 * @module cli/theme/ThemeProvider
 */

import React, { useState } from "react";
import { ThemeContext, getTheme, defaultTheme, Theme } from "./index.js";

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: string;
}

/** Provides theme context to the component tree. */
export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = process.env.YT2BLOG_THEME || initialTheme;
    return saved ? getTheme(saved) : defaultTheme;
  });

  const setTheme = (id: string) => {
    const newTheme = getTheme(id);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
