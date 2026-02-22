import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/unit/**/*.{test,spec}.ts', 'tests/integration/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        global: { lines: 80, branches: 75, functions: 65 }
      },
      exclude: [
        'tests/**', 
        'src/types/**', 
        '**/*.d.ts', 
        'node_modules/**',
        'src/services/tle/fetchTLE.ts',  // Network operations tested via E2E
        'src/components/**',             // UI components tested via E2E
        'src/features/**/use*.ts',       // React hooks tested via integration
        'src/app/**',                    // Next.js pages tested via E2E
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
