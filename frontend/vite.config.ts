import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    alias: {
      '@': resolve(__dirname, './src'),
      '@monorepo/shared': resolve(__dirname, '../shared/src'),
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: [
      'app-e73c7944-f0fd-4540-9d40-ad56efda1d71.cleverapps.io'
    ]
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: { reporter: ['text', 'html'] }
  }
});
