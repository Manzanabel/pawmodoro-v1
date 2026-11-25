import type { Page } from '@playwright/test'
import { expect, gotoWithPausedClock, openMenu, pauseButton, startButton, test } from './fixtures'

const app = (page: Page) => page.locator('main.app')

test.use({ settings: { calmMode: true } })

test.beforeEach(async ({ page }) => {
  await gotoWithPausedClock(page)
})

test('the interface fades out after a few idle seconds while the timer runs', async ({ page }) => {
  await startButton(page).click()
  await expect(app(page)).not.toHaveClass(/is-calm/)

  await page.clock.fastForward(5_000)
  await expect(app(page)).toHaveClass(/is-calm/)
})

test('moving the mouse brings the interface back', async ({ page }) => {
  await startButton(page).click()
  await page.clock.fastForward(5_000)
  await expect(app(page)).toHaveClass(/is-calm/)

  await page.mouse.move(300, 300)
  await page.mouse.move(320, 320)
  await expect(app(page)).not.toHaveClass(/is-calm/)
})

test('pressing a key brings the interface back', async ({ page }) => {
  await startButton(page).click()
  await page.clock.fastForward(5_000)
  await expect(app(page)).toHaveClass(/is-calm/)

  await page.keyboard.press('Shift')
  await expect(app(page)).not.toHaveClass(/is-calm/)
})

test('stays visible while the timer is paused', async ({ page }) => {
  await startButton(page).click()
  await pauseButton(page).click()
  await page.clock.fastForward(10_000)
  await expect(app(page)).not.toHaveClass(/is-calm/)
})

test('stays visible while the menu is open', async ({ page }) => {
  await startButton(page).click()
  await openMenu(page, 'Sonidos')
  await page.clock.fastForward(10_000)
  await expect(app(page)).not.toHaveClass(/is-calm/)
})

test('can be turned off in the settings', async ({ page }) => {
  await openMenu(page, 'Ajustes')
  await page.getByRole('checkbox', { name: /Ocultar la interfaz/ }).uncheck()
  await page.keyboard.press('Escape')

  await startButton(page).click()
  await page.clock.fastForward(10_000)
  await expect(app(page)).not.toHaveClass(/is-calm/)
})
