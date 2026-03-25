import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './client',
  build: {
    outDir: '../dist',
    emptyOutDir: true
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