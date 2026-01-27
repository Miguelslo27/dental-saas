import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.VITE_APP_PORT ? `http://localhost:${process.env.VITE_APP_PORT}` : 'http://localhost:5002',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: process.env.VITE_APP_PORT ? `http://localhost:${process.env.VITE_APP_PORT}` : 'http://localhost:5002',
    reuseExistingServer: !process.env.CI,
  },
})
