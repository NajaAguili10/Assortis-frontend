import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,

    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
