import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` comes from VITE_BASE_PATH (GitHub Pages subpath); defaults to "/".
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: { host: true, port: 5173 },
  build: { target: 'es2020', sourcemap: false },
});
