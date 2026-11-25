import { test as base, expect, type Page } from '@playwright/test'
import type { Settings } from '../src/hooks/useSettings'

/**
 * Shared test fixtures:
 * - every test fails if the page throws or logs a console error;
 * - `settings` seeds the app settings before the first load (faster than clicking
 *   through the menu). Calm mode is off by default, otherwise fast-forwarding the
 *   clock would hide the controls mid-test; calm tests opt in.
 */
export const test = base.extend<{ pageErrors: string[]; settings: Partial<Settings> }>({
  settings: [{}, { option: true }],
  page: async ({ page, settings }, use) => {
    // Seeds only on the first load of the tab (sessionStorage survives reloads),
    // so tests that change settings and reload keep their own changes.
    await page.addInitScript((seed) => {
      if (sessionStorage.getItem('e2e:seeded')) return
      sessionStorage.setItem('e2e:seeded', '1')
      localStorage.setItem('pawmodoro:settings', JSON.stringify(seed))
    }, { calmMode: false, ...settings })
    await use(page)
  },
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      await use(errors)
      expect(errors, 'page errors').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

/* ── Helpers (UI texts are Spanish: the config pins the browser locale to es-ES) ── */

export const timerDisplay = (page: Page) => page.getByRole('timer')
export const startButton = (page: Page) => page.getByRole('button', { name: 'Comenzar' })
export const pauseButton = (page: Page) => page.getByRole('button', { name: 'Pausar' })
export const modeTab = (page: Page, name: 'Enfoque' | 'Descanso' | 'Descanso largo') =>
  page.getByRole('button', { name, exact: true })

export async function openMenu(page: Page, tab?: 'Bebidas' | 'Sonidos' | 'Temporizador' | 'Ajustes') {
  await page.getByRole('button', { name: 'Abrir menú' }).click()
  await expect(page.getByRole('complementary', { name: 'Grimorio' })).toBeVisible()
  if (tab) await page.getByRole('tab', { name: tab }).click()
}

export async function closeMenu(page: Page) {
  await page.getByRole('button', { name: 'Cerrar menú' }).click()
}

/** − / + button of a timer setting (e.g. "Enfoque"). */
export const stepperButton = (page: Page, dir: 'Disminuir' | 'Aumentar', label: string) =>
  page.getByRole('button', { name: `${dir}: ${label}`, exact: true })

/**
 * Installs a fake clock that only moves when the test says so
 * (`page.clock.fastForward(ms)`), then opens the app.
 */
export async function gotoWithPausedClock(page: Page) {
  const t0 = new Date('2026-01-15T10:00:00')
  await page.clock.install({ time: t0 })
  await page.goto('/')
  await page.clock.pauseAt(new Date(t0.getTime() + 60_000))
}
