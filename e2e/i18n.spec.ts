import { expect, openMenu, test } from './fixtures'

test('switching language translates the interface and is remembered', async ({ page }) => {
  await page.goto('/')
  await openMenu(page, 'Ajustes')
  await page.getByRole('radio', { name: 'English' }).click()

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
  await expect(page.getByText('Today: 0 pomodoros')).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
})

test.describe('French browser', () => {
  test.use({ locale: 'fr-FR' })

  test('uses the browser language on the first visit', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page.getByRole('button', { name: 'Commencer' })).toBeVisible()
    await expect(page.getByText(/Aujourd'hui\s:\s0 pomodoros/)).toBeVisible()
  })
})

test.describe('unsupported browser language', () => {
  test.use({ locale: 'de-DE' })

  test('falls back to Spanish', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page.getByRole('button', { name: 'Comenzar' })).toBeVisible()
  })
})
