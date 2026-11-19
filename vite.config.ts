import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Using relative base path ensures deployment works seamlessly on any GitHub Pages repo URL
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
