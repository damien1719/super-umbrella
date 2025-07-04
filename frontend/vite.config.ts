import { defineConfig } from 'vitest/config'; 
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { extensions: ['.js', '.ts', '.jsx', '.tsx'] },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: { reporter: ['text', 'html'] }
  }
});
