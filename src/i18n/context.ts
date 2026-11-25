import { createContext, useContext } from 'react'
import { DICTIONARIES, LANGUAGES, type Dictionary, type Lang } from './translations'

export interface I18n {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Dictionary
}

export const STORAGE_KEY = 'pawmodoro:lang'

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && value in LANGUAGES
}

/** Saved language, otherwise the browser language, otherwise Spanish. */
export function initialLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (isLang(saved)) return saved
  const browser = navigator.language.slice(0, 2)
  return isLang(browser) ? browser : 'es'
}

export const I18nContext = createContext<I18n>({
  lang: 'es',
  setLang: () => {},
  t: DICTIONARIES.es,
})

export function useI18n() {
  return useContext(I18nContext)
}
