#!/usr/bin/env node
/**
 * @fileoverview CLI entry point for YT2Blog application
 * @module index
 */

import "dotenv/config";
import React from "react";
import { render } from "ink";
import { App } from "./cli/App.js";

console.clear();

const { waitUntilExit } = render(<App />);

waitUntilExit().then(() => {
  console.log("\n👋 Thanks for using YT2Blog!\n");
});
