import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// SSR-specific config for building server bundle
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    ssr: true,
    outDir: "dist/server",
    rollupOptions: {
      input: "./src/entry-server.tsx",
      output: {
        format: "es",
      },
    },
  },
  ssr: {
    noExternal: ['react-helmet-async'],
  },
});
