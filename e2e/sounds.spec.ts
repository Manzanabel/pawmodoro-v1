import { expect, openMenu, test } from './fixtures'

const SOUND_NAMES = ['Música celta', 'Campanillas de viento', 'Chimenea', 'Agua calentando', 'Viento suave', 'Hojas de otoño']

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('every ambient sound can be turned on and off without errors', async ({ page }) => {
  // Synthesizing all six voices at once is CPU-heavy, especially with other workers running.
  test.slow()
  await openMenu(page, 'Sonidos')
  for (const name of SOUND_NAMES) {
    const toggle = page.getByRole('button', { name, exact: true })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  }
  // Let the synthesized voices run for a moment (errors would fail the test via the fixture)
  await page.waitForTimeout(1_500)
  for (const name of SOUND_NAMES) {
    const toggle = page.getByRole('button', { name, exact: true })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  }
})

test('the sound mix is remembered after a reload', async ({ page }) => {
  await openMenu(page, 'Sonidos')
  await page.getByRole('button', { name: 'Chimenea', exact: true }).click()
  await page.getByRole('slider', { name: 'Volumen de Chimenea' }).fill('0.25')

  await page.reload()
  await openMenu(page, 'Sonidos')
  await expect(page.getByRole('button', { name: 'Chimenea', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('slider', { name: 'Volumen de Chimenea' })).toHaveValue('0.25')
})

test('quick mute button', async ({ page }) => {
  const mute = page.getByRole('button', { name: 'Silenciar' })
  await mute.click()
  const unmute = page.getByRole('button', { name: 'Activar sonido' })
  await expect(unmute).toHaveAttribute('aria-pressed', 'true')

  await page.reload()
  await expect(page.getByRole('button', { name: 'Activar sonido' })).toBeVisible()
  await page.getByRole('button', { name: 'Activar sonido' }).click()
  await expect(page.getByRole('button', { name: 'Silenciar' })).toHaveAttribute('aria-pressed', 'false')
})
