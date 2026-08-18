import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['archive/**', 'node_modules/**', 'temp/**', 'dist/**'],
  },
});
