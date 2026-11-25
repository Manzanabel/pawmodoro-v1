import type { Page } from '@playwright/test'
import {
  closeMenu,
  expect,
  gotoWithPausedClock,
  modeTab,
  openMenu,
  pauseButton,
  startButton,
  stepperButton,
  test,
  timerDisplay,
} from './fixtures'

const menuPanel = (page: Page) => page.getByRole('complementary', { name: 'Grimorio' })

test.beforeEach(async ({ page }) => {
  await gotoWithPausedClock(page)
})

test.describe('opening and closing', () => {
  test('menu is hidden until opened', async ({ page }) => {
    await expect(menuPanel(page)).toBeHidden()
    await openMenu(page)
    await expect(page.getByRole('tab', { name: 'Bebidas' })).toHaveAttribute('aria-selected', 'true')
  })

  test('closes with the × button', async ({ page }) => {
    await openMenu(page)
    await closeMenu(page)
    await expect(menuPanel(page)).toBeHidden()
  })

  test('closes with Escape', async ({ page }) => {
    await openMenu(page)
    await page.keyboard.press('Escape')
    await expect(menuPanel(page)).toBeHidden()
  })

  test('closes when clicking outside', async ({ page }) => {
    await openMenu(page)
    await page.mouse.click(200, 450)
    await expect(menuPanel(page)).toBeHidden()
  })
})

test('tabs show their content', async ({ page }) => {
  await openMenu(page)
  await expect(page.getByRole('radio', { name: 'Café' })).toBeVisible()

  await page.getByRole('tab', { name: 'Sonidos' }).click()
  await expect(page.getByText('Volumen general')).toBeVisible()

  await page.getByRole('tab', { name: 'Temporizador' }).click()
  await expect(page.getByRole('button', { name: 'Restaurar valores' })).toBeVisible()

  await page.getByRole('tab', { name: 'Ajustes' }).click()
  await expect(page.getByRole('radio', { name: 'English' })).toBeVisible()
})

test.describe('drinks', () => {
  test('choosing a drink changes the vessel in the scene and is remembered', async ({ page }) => {
    const vessel = page.locator('[data-drink]')
    await expect(vessel).toHaveAttribute('data-drink', 'coffee')

    await openMenu(page, 'Bebidas')
    const lavender = page.getByRole('radio', { name: 'Poción de lavanda' })
    await lavender.click()
    await expect(lavender).toHaveAttribute('aria-checked', 'true')
    await expect(vessel).toHaveAttribute('data-drink', 'lavender')

    await page.reload()
    await expect(vessel).toHaveAttribute('data-drink', 'lavender')
  })

  test.describe('with a 1-minute focus', () => {
    test.use({ settings: { focusMin: 1 } })

    test('the drink empties during focus and is refilled for the break', async ({ page }) => {
      const vessel = page.locator('[data-drink]')
      await expect(vessel).toHaveAttribute('data-level', '1.00')

      await startButton(page).click()
      await page.clock.fastForward(30_000)
      await expect(vessel).toHaveAttribute('data-level', '0.50')

      await page.clock.fastForward(31_000)
      await expect(modeTab(page, 'Descanso')).toHaveClass(/is-active/)
      await expect(vessel).toHaveAttribute('data-level', '1.00')
    })
  })
})

test.describe('timer settings', () => {
  test('changing the focus duration updates an idle timer and is remembered', async ({ page }) => {
    await openMenu(page, 'Temporizador')
    await stepperButton(page, 'Aumentar', 'Enfoque').click()
    await expect(timerDisplay(page)).toHaveText('26:00')

    await page.reload()
    await expect(timerDisplay(page)).toHaveText('26:00')
  })

  test.describe('at the lower limit', () => {
    test.use({ settings: { focusMin: 2 } })

    test('values are clamped to their limits', async ({ page }) => {
      await openMenu(page, 'Temporizador')
      const decrease = stepperButton(page, 'Disminuir', 'Enfoque')
      await decrease.click()
      await expect(timerDisplay(page)).toHaveText('01:00')
      await expect(decrease).toBeDisabled()
    })
  })

  test.describe('with custom values', () => {
    test.use({ settings: { focusMin: 40, shortMin: 10 } })

    test('restore defaults', async ({ page }) => {
      await expect(timerDisplay(page)).toHaveText('40:00')
      await openMenu(page, 'Temporizador')
      await page.getByRole('button', { name: 'Restaurar valores' }).click()
      await expect(timerDisplay(page)).toHaveText('25:00')
    })
  })

  test.describe('with a 1-minute focus', () => {
    test.use({ settings: { focusMin: 1 } })

    test('auto-start launches the next phase', async ({ page }) => {
      await openMenu(page, 'Temporizador')
      await page.getByRole('checkbox', { name: /Iniciar la siguiente fase/ }).check()
      await closeMenu(page)

      await startButton(page).click()
      await page.clock.fastForward(61_000)
      await expect(modeTab(page, 'Descanso')).toHaveClass(/is-active/)
      await expect(pauseButton(page)).toBeVisible()
    })
  })
})

test('the keyboard hint can be hidden', async ({ page }) => {
  const hint = page.getByText('espacio para comenzar / pausar')
  await expect(hint).toBeVisible()
  await openMenu(page, 'Ajustes')
  await page.getByRole('checkbox', { name: /Mostrar el atajo de teclado/ }).uncheck()
  await expect(hint).toBeHidden()
})

test('space bar does not toggle the timer while the menu is open', async ({ page }) => {
  await openMenu(page, 'Ajustes')
  await page.locator('.menu__panel').press('Space')
  await closeMenu(page)
  await expect(startButton(page)).toBeVisible()
})
