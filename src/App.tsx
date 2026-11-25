import { useCallback, useEffect, useMemo, useState } from 'react'
import { CabinScene } from './components/CabinScene'
import { DrinksTab } from './components/menu/DrinksTab'
import { Menu } from './components/menu/Menu'
import { SettingsTab } from './components/menu/SettingsTab'
import { SoundsTab } from './components/menu/SoundsTab'
import { TimerTab } from './components/menu/TimerTab'
import { Timer } from './components/Timer'
import { useCalm } from './hooks/useCalm'
import { useDrink } from './hooks/useDrink'
import { formatTime, usePomodoro, type TimerConfig } from './hooks/usePomodoro'
import { useSettings } from './hooks/useSettings'
import { useSoundscape } from './hooks/useSoundscape'
import { useI18n } from './i18n/context'
import './App.css'

function App() {
  const { t } = useI18n()
  const { settings, update, resetTimerSettings } = useSettings()
  const sound = useSoundscape()
  const { drink, setDrinkId } = useDrink()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const { focusMin, shortMin, longMin, longEvery, autoStart } = settings
  const timerConfig = useMemo<TimerConfig>(
    () => ({
      durations: { focus: focusMin * 60, short: shortMin * 60, long: longMin * 60 },
      longEvery,
      autoStart,
    }),
    [focusMin, shortMin, longMin, longEvery, autoStart],
  )
  const pomo = usePomodoro(timerConfig)
  const { toggle, running, remaining, mode, total, endsAt } = pomo

  // Calm mode: the UI fades out while reading; any activity brings it back.
  const calm = useCalm(settings.calmMode && running && !menuOpen, `${mode}-${endsAt}`)

  // The drink empties during focus and gets refilled for the break.
  const drinkLevel = mode === 'focus' ? remaining / total : 1

  // Space bar = start / pause (handy while reading).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || menuOpen) return
      const target = e.target as HTMLElement
      if (target.closest('button, input, textarea')) return
      e.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, menuOpen])

  // Remaining time in the browser tab title.
  useEffect(() => {
    document.title = running
      ? `${formatTime(remaining)} · ${t.timer.modes[mode]}`
      : 'Pawmodoro'
  }, [running, remaining, mode, t])

  const muted = sound.mix.muted

  return (
    <main className={`app ${calm ? 'is-calm' : ''}`}>
      <CabinScene running={running} drink={drink} drinkLevel={drinkLevel} />

      <div className="app__corner">
        <button
          className={`round-button ${sound.anyOn && !muted ? 'is-playing' : ''}`}
          onClick={sound.toggleMute}
          aria-pressed={muted}
          aria-label={muted ? t.mute.unmute : t.mute.mute}
          title={muted ? t.mute.unmute : t.mute.mute}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          className="round-button"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          aria-label={t.menu.open}
          title={t.menu.open}
        >
          📖
        </button>
      </div>

      <div className="app__ui">
        <h1 className="app__title">pawmodoro</h1>
        <Timer pomo={pomo} />
        {settings.showHint && <p className="app__hint">{t.appHint}</p>}
      </div>

      <Menu
        open={menuOpen}
        onClose={closeMenu}
        tabs={{
          drinks: <DrinksTab drink={drink} onChange={setDrinkId} />,
          sounds: <SoundsTab sound={sound} />,
          timer: <TimerTab settings={settings} update={update} onRestore={resetTimerSettings} />,
          settings: <SettingsTab settings={settings} update={update} />,
        }}
      />
    </main>
  )
}

export default App
