import { useCallback, useEffect, useState } from 'react'
import { playChime } from '../audio/chime'

export type Mode = 'focus' | 'short' | 'long'

export interface TimerConfig {
  /** Duration of each phase, in seconds. */
  durations: Record<Mode, number>
  /** Focus sessions before a long break. */
  longEvery: number
  /** Start the next phase automatically when one ends. */
  autoStart: boolean
}

/** Formats seconds as mm:ss. */
export function formatTime(seconds: number) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

const STORAGE_KEY = 'pawmodoro:today'

interface State {
  mode: Mode
  /**
   * Seconds left while paused. null = the phase hasn't been touched yet,
   * so it shows the full (configurable) duration of the current mode.
   */
  remaining: number | null
  /** End timestamp while running; null when paused. */
  endAt: number | null
  /** Pomodoros completed today. */
  completedToday: number
  /** Focus sessions completed in the current cycle. */
  cycle: number
}

function localDate() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function loadCompletedToday(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw) as { date: string; count: number }
    return date === localDate() ? count : 0
  } catch {
    return 0
  }
}

function secondsLeft(endAt: number) {
  return Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
}

/** Moves to the next phase. `counted` = whether the focus phase counts as completed. */
function advance(s: State, cfg: TimerConfig, counted: boolean): State {
  let next: State
  if (s.mode === 'focus') {
    const cycle = counted ? s.cycle + 1 : s.cycle
    const isLong = counted && cycle >= cfg.longEvery
    next = {
      ...s,
      mode: isLong ? 'long' : 'short',
      completedToday: counted ? s.completedToday + 1 : s.completedToday,
      cycle: isLong ? 0 : cycle,
      remaining: null,
      endAt: null,
    }
  } else {
    next = { ...s, mode: 'focus', remaining: null, endAt: null }
  }
  if (counted && cfg.autoStart) {
    next.endAt = Date.now() + cfg.durations[next.mode] * 1000
  }
  return next
}

export function usePomodoro(cfg: TimerConfig) {
  const [state, setState] = useState<State>(() => ({
    mode: 'focus',
    remaining: null,
    endAt: null,
    completedToday: loadCompletedToday(),
    cycle: 0,
  }))

  const total = cfg.durations[state.mode]
  const running = state.endAt !== null
  const remaining = state.remaining ?? total

  // Tick: based on the end timestamp, so it doesn't drift while the tab is in the background.
  useEffect(() => {
    if (state.endAt === null) return
    const endAt = state.endAt
    const id = window.setInterval(() => {
      const left = secondsLeft(endAt)
      if (left > 0) {
        setState((s) => (s.remaining === left ? s : { ...s, remaining: left }))
      } else {
        setState((s) => advance(s, cfg, true))
        playChime()
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [state.endAt, cfg])

  // Persist today's count.
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: localDate(), count: state.completedToday }),
    )
  }, [state.completedToday])

  const toggle = useCallback(() => {
    setState((s) =>
      s.endAt === null
        ? { ...s, endAt: Date.now() + (s.remaining ?? cfg.durations[s.mode]) * 1000 }
        : { ...s, remaining: secondsLeft(s.endAt), endAt: null },
    )
  }, [cfg])

  const reset = useCallback(() => {
    setState((s) => ({ ...s, remaining: null, endAt: null }))
  }, [])

  const skip = useCallback(() => {
    setState((s) => advance(s, cfg, false))
  }, [cfg])

  const setMode = useCallback((mode: Mode) => {
    setState((s) => ({ ...s, mode, remaining: null, endAt: null }))
  }, [])

  return {
    mode: state.mode,
    remaining,
    total,
    running,
    completedToday: state.completedToday,
    cycle: state.cycle,
    longEvery: cfg.longEvery,
    /** Changes every time the timer starts; handy to detect a new run. */
    endsAt: state.endAt,
    toggle,
    reset,
    skip,
    setMode,
  }
}
