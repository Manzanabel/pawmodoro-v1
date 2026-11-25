import { useEffect, useState } from 'react'

const IDLE_MS = 4000
const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const

/**
 * "Calm mode": true while the timer runs and the user hasn't touched the mouse
 * or keyboard for a few seconds. Any activity brings the UI back.
 * `phase` wakes the UI up whenever it changes (e.g. a new phase starts).
 */
export function useCalm(active: boolean, phase: string) {
  // The phase in which the user went idle; null = user is active.
  const [idleIn, setIdleIn] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return
    let timer = window.setTimeout(() => setIdleIn(phase), IDLE_MS)
    const onActivity = () => {
      setIdleIn(null)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setIdleIn(phase), IDLE_MS)
    }
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    return () => {
      window.clearTimeout(timer)
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity))
    }
  }, [active, phase])

  return active && idleIn === phase
}
