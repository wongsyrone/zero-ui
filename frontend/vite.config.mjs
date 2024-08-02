import process from "node:process";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import generateLocalesPlugin from "./vite-plugin-generate-locales.js";

export default defineConfig({
  base: "/app",
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/auth": "http://127.0.0.1:4000",
      "/api": "http://127.0.0.1:4000",
      "/controller": "http://127.0.0.1:4000",
      "/downfile": "http://127.0.0.1:4000",
    },
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), "../node_modules"],
    },
  },
  resolve: {
    alias: {
      components: "/src/components",
      utils: "/src/utils",
      external: "/src/external",
      generated: "/src/generated",
    },
  },
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    generateLocalesPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: "public/locales",
          dest: "",
        },
      ],
    }),
  ],
});
