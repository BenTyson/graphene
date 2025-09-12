import { defineConfig } from 'vite';

export default defineConfig({
  root: './client',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/news-images': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});