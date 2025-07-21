import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '.next/',
        '.turbo/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tourism/database': path.resolve(__dirname, './packages/database'),
      '@tourism/ui': path.resolve(__dirname, './packages/ui'),
      '@tourism/ai-engine': path.resolve(__dirname, './packages/ai-engine'),
    }
  }
});