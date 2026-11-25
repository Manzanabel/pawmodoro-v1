import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext, STORAGE_KEY, initialLang } from './context'
import { DICTIONARIES, type Lang } from './translations'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  // Persist the choice and keep <html lang> in sync (accessibility, hyphenation).
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t: DICTIONARIES[lang] }), [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
