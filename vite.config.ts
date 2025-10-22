import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'copy-htaccess',
      closeBundle() {
        const source = path.resolve(__dirname, 'public/.htaccess');
        const dest = path.resolve(__dirname, 'dist/.htaccess');
        
        if (fs.existsSync(source)) {
          fs.copyFileSync(source, dest);
          console.log('✓ .htaccess file copied to dist folder for Apache hosting');
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
