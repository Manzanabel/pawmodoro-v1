import type { Settings } from '../../hooks/useSettings'
import { useI18n } from '../../i18n/context'
import { LANGUAGES, type Lang } from '../../i18n/translations'
import { Switch } from './Switch'

interface Props {
  settings: Settings
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

export function SettingsTab({ settings, update }: Props) {
  const { t, lang, setLang } = useI18n()

  return (
    <div className="settings-list">
      <div className="lang-picker" role="radiogroup" aria-label={t.settings.language}>
        <span className="lang-picker__label">{t.settings.language}</span>
        <div className="lang-picker__options">
          {(Object.keys(LANGUAGES) as Lang[]).map((code) => (
            <button
              key={code}
              role="radio"
              aria-checked={code === lang}
              className={code === lang ? 'is-active' : ''}
              onClick={() => setLang(code)}
              lang={code}
            >
              {LANGUAGES[code]}
            </button>
          ))}
        </div>
      </div>

      <Switch
        checked={settings.calmMode}
        onChange={(v) => update('calmMode', v)}
        label={t.settings.calmMode}
        hint={t.settings.calmModeHint}
      />
      <Switch checked={settings.showHint} onChange={(v) => update('showHint', v)} label={t.settings.showHint} />
    </div>
  )
}
