import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isSingle = mode === 'singlefile';
  return {
    base: './',
    plugins: isSingle ? [react(), viteSingleFile()] : [react()],
    build: isSingle
      ? {
          outDir: 'dist-single',
          copyPublicDir: false,
          chunkSizeWarningLimit: 5000
        }
      : undefined,
    server: {
      port: 3000,
      open: true
    }
  };
});
