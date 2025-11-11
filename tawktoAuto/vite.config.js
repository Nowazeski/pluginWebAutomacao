import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist-extension',
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'content.js'),
        background: resolve(__dirname, 'background.js'),
        popup: resolve(__dirname, 'popup.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    emptyOutDir: true,
  },
});
