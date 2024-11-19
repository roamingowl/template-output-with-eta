import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['dot', 'json'],
    outputFile: 'test-results.json',
    coverage:{
      provider: 'v8',
      reporter: ['json', 'text', 'lcov'],
    }
  },
})