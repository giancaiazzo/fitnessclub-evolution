import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],

  server: {
    watch: {
      ignored: [
        "**/BackEnd/**",
        "**/.vs/**",
        "**/bin/**",
        "**/obj/**",
      ],
    },

    proxy: {
      "/api": {
        target: "http://localhost:5157",
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})