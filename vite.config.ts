import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

function copyHtaccess() {
  return {
    name: 'copy-htaccess',
    closeBundle() {
      const src = path.resolve(__dirname, 'public', '.htaccess');
      const dest = path.resolve(__dirname, 'dist', '.htaccess');

      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log('[copy-htaccess] .htaccess copied to dist');
      } else {
        console.warn('[copy-htaccess] public/.htaccess not found');
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Set base to '/subfolder/' if deploying under one
  // base: '/myapp/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    copyHtaccess()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
