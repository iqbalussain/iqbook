import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

export default defineConfig({
  base: "./",

  plugins: [react(), mcpPlugin()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "::",
    port: 5173,
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    emptyOutDir: true
  }
});