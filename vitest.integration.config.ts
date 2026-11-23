import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/**/*.int-test.ts'],
    globalSetup: ['src/testing/integration.setup.ts'],
    fileParallelism: false,
    env: {
      DATABASE_URL: 'mysql://quiz:quiz@localhost:3308/quiz_test',
      ADMIN_PASSWORD: 'integration-test-password',
      SESSION_SECRET: 'integration-test-session-secret-0123456789',
    },
  },
})
