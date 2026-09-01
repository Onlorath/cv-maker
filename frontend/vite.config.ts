import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("@react-pdf")) return "react-pdf";
            if (id.includes("pdfjs-dist")) return "pdfjs-dist";
            if (id.includes("lucide-react") || id.includes("zustand") || id.includes("sonner")) return "vendor-ui";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})

