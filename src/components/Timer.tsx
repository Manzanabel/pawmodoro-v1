import { formatTime, type Mode, type usePomodoro } from '../hooks/usePomodoro'
import { useI18n } from '../i18n/context'
import './Timer.css'

type Pomodoro = ReturnType<typeof usePomodoro>

const MODES: Mode[] = ['focus', 'short', 'long']

export function Timer({ pomo }: { pomo: Pomodoro }) {
  const { t } = useI18n()
  const progress = Math.max(0, Math.min(1, 1 - pomo.remaining / pomo.total))

  return (
    <section className={`timer mode-${pomo.mode}`} aria-label={t.timer.aria}>
      <nav className="timer__modes">
        {MODES.map((m) => (
          <button
            key={m}
            className={m === pomo.mode ? 'is-active' : ''}
            onClick={() => pomo.setMode(m)}
          >
            {t.timer.modes[m]}
          </button>
        ))}
      </nav>

      <div className="timer__time" role="timer" aria-live="off">
        {formatTime(pomo.remaining)}
      </div>

      <div className="timer__bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div className="timer__controls">
        <button className="ghost" onClick={pomo.reset} title={t.timer.reset} aria-label={t.timer.reset}>
          ↺
        </button>
        <button className="primary" onClick={pomo.toggle}>
          {pomo.running ? t.timer.pause : t.timer.start}
        </button>
        <button className="ghost" onClick={pomo.skip} title={t.timer.skip} aria-label={t.timer.skip}>
          ⏭
        </button>
      </div>

      <footer className="timer__tally">
        <span className="timer__cycle" title={t.timer.cycle}>
          {Array.from({ length: pomo.longEvery }, (_, i) => (
            <i key={i} className={i < pomo.cycle ? 'is-done' : ''} />
          ))}
        </span>
        <span>
          {t.timer.today} <strong>{pomo.completedToday}</strong>{' '}
          {t.timer.pomodoros(pomo.completedToday)}
        </span>
      </footer>
    </section>
  )
}
