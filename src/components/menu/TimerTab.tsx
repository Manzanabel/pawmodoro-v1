import { LIMITS, type Settings } from '../../hooks/useSettings'
import { useI18n } from '../../i18n/context'
import { Switch } from './Switch'

type NumericKey = keyof typeof LIMITS

interface Props {
  settings: Settings
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onRestore: () => void
}

export function TimerTab({ settings, update, onRestore }: Props) {
  const { t } = useI18n()
  const ts = t.timerSettings

  const rows: { key: NumericKey; label: string; unit: string }[] = [
    { key: 'focusMin', label: ts.focus, unit: ts.minutes },
    { key: 'shortMin', label: ts.short, unit: ts.minutes },
    { key: 'longMin', label: ts.long, unit: ts.minutes },
    { key: 'longEvery', label: ts.longEvery, unit: ts.sessions },
  ]

  return (
    <div className="settings-list">
      {rows.map(({ key, label, unit }) => {
        const [min, max] = LIMITS[key]
        const value = settings[key]
        const set = (v: number) => update(key, Math.max(min, Math.min(max, v)))
        return (
          <div key={key} className="stepper">
            <span className="stepper__label">{label}</span>
            <div className="stepper__control">
              <button onClick={() => set(value - 1)} disabled={value <= min} aria-label={`${ts.decrease}: ${label}`}>
                −
              </button>
              <output aria-live="polite">
                {value} <small>{unit}</small>
              </output>
              <button onClick={() => set(value + 1)} disabled={value >= max} aria-label={`${ts.increase}: ${label}`}>
                +
              </button>
            </div>
          </div>
        )
      })}

      <Switch checked={settings.autoStart} onChange={(v) => update('autoStart', v)} label={ts.autoStart} />

      <button className="link-button" onClick={onRestore}>
        {ts.restore}
      </button>
    </div>
  )
}
