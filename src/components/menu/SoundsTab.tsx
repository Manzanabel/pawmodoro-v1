import { SOUNDS, type Soundscape } from '../../hooks/useSoundscape'
import { useI18n } from '../../i18n/context'

export function SoundsTab({ sound }: { sound: Soundscape }) {
  const { t } = useI18n()
  const { mix, toggle, setVolume, setMasterVolume } = sound

  return (
    <div className="sound-list">
      <label className="sound-row sound-row--master">
        <span>{t.sounds.master}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={mix.master}
          onChange={(e) => setMasterVolume(Number(e.target.value))}
        />
      </label>

      {SOUNDS.map(({ id, icon }) => {
        const ch = mix.channels[id]
        const label = t.sounds.names[id]
        return (
          <div key={id} className={`sound-row ${ch.on ? 'is-on' : ''}`}>
            <button
              className="sound-row__switch"
              onClick={() => toggle(id)}
              aria-pressed={ch.on}
              title={ch.on ? t.sounds.turnOff(label) : t.sounds.turnOn(label)}
            >
              <span className="sound-row__icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={ch.volume}
              aria-label={t.sounds.volumeOf(label)}
              onChange={(e) => setVolume(id, Number(e.target.value))}
            />
          </div>
        )
      })}
    </div>
  )
}
