import { defineConfig } from '@playwright/test'

const PORT = 5180

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Each worker runs a browser synthesizing audio; the dev machine (4 cores, 6 GB RAM) can only handle one.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Uses the locally installed Microsoft Edge, so no browser download is needed.
    // To use Playwright's bundled Chromium instead: remove `channel` and run `npx playwright install chromium`.
    channel: 'msedge',
    viewport: { width: 1600, height: 900 },
    // Fixed browser language so text-based selectors are stable (the app follows navigator.language).
    locale: 'es-ES',
    launchOptions: { args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'] },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Tests run against a fresh production build (lighter than the dev server,
  // and it's what actually ships). Never reuse a server, so the build is never stale.
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
