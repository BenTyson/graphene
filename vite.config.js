import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      // Multi-entry: the main SPA shell + the chrome-less proforma embed page.
      input: {
        index: path.resolve(__dirname, 'client/index.html'),
        'proforma-embed': path.resolve(__dirname, 'client/proforma-embed.html')
      }
    }
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared')
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/news-images': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});