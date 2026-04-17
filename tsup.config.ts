import { defineConfig } from "tsup";

export default defineConfig([
  // Library build
  {
    entry: { lib: "src/lib.ts" },
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    target: "node18",
    external: ["react", "ink"],
  },
  // CLI build
  {
    entry: { cli: "src/index.tsx" },
    format: ["esm"],
    dts: false,
    clean: false,
    target: "node18",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
