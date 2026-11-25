import { expect, gotoWithPausedClock, modeTab, pauseButton, startButton, test, timerDisplay } from './fixtures'

test.beforeEach(async ({ page }) => {
  // Fake clock: lets us fast-forward minutes of timer in milliseconds.
  await gotoWithPausedClock(page)
})

test('starts on a 25-minute focus session', async ({ page }) => {
  await expect(timerDisplay(page)).toHaveText('25:00')
  await expect(modeTab(page, 'Enfoque')).toHaveClass(/is-active/)
  await expect(page.getByText('Hoy: 0 pomodoros')).toBeVisible()
  await expect(page).toHaveTitle('Pawmodoro')
})

test('start and pause with the button', async ({ page }) => {
  await startButton(page).click()
  await page.clock.fastForward(3_000)
  await expect(timerDisplay(page)).toHaveText('24:57')
  await expect(page).toHaveTitle('24:57 · Enfoque')

  await pauseButton(page).click()
  await page.clock.fastForward(10_000)
  await expect(timerDisplay(page)).toHaveText('24:57')
  await expect(page).toHaveTitle('Pawmodoro')
})

test('space bar toggles the timer', async ({ page }) => {
  await page.locator('body').press('Space')
  await expect(pauseButton(page)).toBeVisible()
  await page.locator('body').press('Space')
  await expect(startButton(page)).toBeVisible()
})

test('reset brings the phase back to its full duration', async ({ page }) => {
  await startButton(page).click()
  await page.clock.fastForward(60_000)
  await expect(timerDisplay(page)).toHaveText('24:00')
  await page.getByRole('button', { name: 'Reiniciar' }).click()
  await expect(timerDisplay(page)).toHaveText('25:00')
  await expect(startButton(page)).toBeVisible()
})

test('skipping a focus session does not count it', async ({ page }) => {
  await page.getByRole('button', { name: 'Saltar fase' }).click()
  await expect(modeTab(page, 'Descanso')).toHaveClass(/is-active/)
  await expect(timerDisplay(page)).toHaveText('05:00')
  await expect(page.getByText('Hoy: 0 pomodoros')).toBeVisible()
})

test('mode tabs switch the phase', async ({ page }) => {
  await modeTab(page, 'Descanso largo').click()
  await expect(timerDisplay(page)).toHaveText('15:00')
  await modeTab(page, 'Descanso').click()
  await expect(timerDisplay(page)).toHaveText('05:00')
})

test('completing a focus session counts it and moves to a break', async ({ page }) => {
  await startButton(page).click()
  await page.clock.fastForward(25 * 60_000 + 1_000)

  await expect(modeTab(page, 'Descanso')).toHaveClass(/is-active/)
  await expect(timerDisplay(page)).toHaveText('05:00')
  await expect(startButton(page)).toBeVisible() // waits for the user by default
  await expect(page.getByText('Hoy: 1 pomodoro', { exact: true })).toBeVisible()
  await expect(page.locator('.timer__cycle i.is-done')).toHaveCount(1)
})

test.describe('with short sessions', () => {
  test.use({ settings: { focusMin: 1, shortMin: 1, longEvery: 2 } })

  test('long break comes after the configured number of sessions', async ({ page }) => {
    await expect(page.locator('.timer__cycle i')).toHaveCount(2)

    for (const next of ['Descanso', 'Enfoque', 'Descanso largo'] as const) {
      await startButton(page).click()
      await page.clock.fastForward(61_000)
      await expect(modeTab(page, next)).toHaveClass(/is-active/)
    }
    await expect(page.getByText('Hoy: 2 pomodoros')).toBeVisible()
    // The cycle restarts after the long break
    await expect(page.locator('.timer__cycle i.is-done')).toHaveCount(0)
  })

  test("today's count survives a reload", async ({ page }) => {
    await startButton(page).click()
    await page.clock.fastForward(61_000)
    await expect(page.getByText('Hoy: 1 pomodoro', { exact: true })).toBeVisible()

    await page.reload()
    await expect(page.getByText('Hoy: 1 pomodoro', { exact: true })).toBeVisible()
  })
})
