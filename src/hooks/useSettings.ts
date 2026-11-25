import { useCallback, useEffect, useState } from 'react'

export interface Settings {
  /** Durations in minutes. */
  focusMin: number
  shortMin: number
  longMin: number
  /** Focus sessions before a long break. */
  longEvery: number
  /** Start the next phase automatically when one ends. */
  autoStart: boolean
  /** Fade the UI out while the timer runs and the user is idle. */
  calmMode: boolean
  /** Show the "space to start / pause" hint. */
  showHint: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longEvery: 4,
  autoStart: false,
  calmMode: true,
  showHint: true,
}

/** Allowed range for each numeric setting. */
export const LIMITS = {
  focusMin: [1, 90],
  shortMin: [1, 30],
  longMin: [1, 60],
  longEvery: [2, 8],
} as const satisfies Partial<Record<keyof Settings, readonly [number, number]>>

const STORAGE_KEY = 'pawmodoro:settings'

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }, [])

  const resetTimerSettings = useCallback(() => {
    setSettings((s) => ({
      ...s,
      focusMin: DEFAULT_SETTINGS.focusMin,
      shortMin: DEFAULT_SETTINGS.shortMin,
      longMin: DEFAULT_SETTINGS.longMin,
      longEvery: DEFAULT_SETTINGS.longEvery,
      autoStart: DEFAULT_SETTINGS.autoStart,
    }))
  }, [])

  return { settings, update, resetTimerSettings }
}
