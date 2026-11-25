import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '../../i18n/context'
import type { Dictionary } from '../../i18n/translations'
import './Menu.css'

export type TabId = keyof Dictionary['menu']['tabs']

const TAB_ICONS: Record<TabId, string> = {
  drinks: '☕',
  sounds: '🎵',
  timer: '⏳',
  settings: '⚙️',
}

interface Props {
  open: boolean
  onClose: () => void
  /** Content of each tab. */
  tabs: Record<TabId, ReactNode>
}

/** Side panel ("grimoire") holding every option, so the scene stays clean. */
export function Menu({ open, onClose, tabs }: Props) {
  const { t } = useI18n()
  const [tab, setTab] = useState<TabId>('drinks')
  const closeRef = useRef<HTMLButtonElement>(null)

  // Escape closes the menu; focus moves into it when it opens.
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div className={`menu-backdrop ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside
        className={`menu ${open ? 'is-open' : ''}`}
        aria-label={t.menu.title}
        aria-hidden={!open}
        inert={!open}
      >
        <header className="menu__header">
          <h2>{t.menu.title}</h2>
          <button ref={closeRef} className="menu__close" onClick={onClose} aria-label={t.menu.close}>
            ×
          </button>
        </header>

        <nav className="menu__tabs" role="tablist">
          {(Object.keys(TAB_ICONS) as TabId[]).map((id) => (
            <button
              key={id}
              role="tab"
              id={`menu-tab-${id}`}
              aria-selected={tab === id}
              aria-controls="menu-panel"
              className={tab === id ? 'is-active' : ''}
              onClick={() => setTab(id)}
            >
              <span aria-hidden="true">{TAB_ICONS[id]}</span>
              {t.menu.tabs[id]}
            </button>
          ))}
        </nav>

        <section className="menu__panel" id="menu-panel" role="tabpanel" aria-labelledby={`menu-tab-${tab}`}>
          {tabs[tab]}
        </section>
      </aside>
    </>
  )
}
