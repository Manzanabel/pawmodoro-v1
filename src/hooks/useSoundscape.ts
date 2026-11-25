import { useCallback, useEffect, useState } from 'react'
import { setChannel, setMaster, type SoundId } from '../audio/engine'

// Labels come from the i18n dictionaries (t.sounds.names[id]).
export const SOUNDS: { id: SoundId; icon: string }[] = [
  { id: 'music', icon: '🎵' },
  { id: 'chimes', icon: '🎐' },
  { id: 'fire', icon: '🔥' },
  { id: 'kettle', icon: '🫖' },
  { id: 'wind', icon: '🌬️' },
  { id: 'leaves', icon: '🍂' },
]

interface ChannelState {
  on: boolean
  volume: number
}
interface Mix {
  master: number
  /** Quick mute: silences everything without losing the mix. */
  muted: boolean
  channels: Record<SoundId, ChannelState>
}

const STORAGE_KEY = 'pawmodoro:mix'

const DEFAULT_MIX: Mix = {
  master: 0.8,
  muted: false,
  channels: {
    music: { on: false, volume: 0.6 },
    chimes: { on: false, volume: 0.6 },
    fire: { on: false, volume: 0.7 },
    kettle: { on: false, volume: 0.4 },
    wind: { on: false, volume: 0.35 },
    leaves: { on: false, volume: 0.4 },
  },
}

function loadMix(): Mix {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MIX
    const saved = JSON.parse(raw) as Partial<Mix>
    return {
      master: saved.master ?? DEFAULT_MIX.master,
      muted: saved.muted ?? DEFAULT_MIX.muted,
      channels: { ...DEFAULT_MIX.channels, ...saved.channels },
    }
  } catch {
    return DEFAULT_MIX
  }
}

export function useSoundscape() {
  const [mix, setMix] = useState<Mix>(loadMix)

  // Sync the audio engine and persist the mix.
  useEffect(() => {
    setMaster(mix.muted ? 0 : mix.master)
    for (const { id } of SOUNDS) {
      const ch = mix.channels[id]
      setChannel(id, ch.on, ch.volume)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mix))
  }, [mix])

  const toggle = useCallback((id: SoundId) => {
    setMix((m) => ({
      ...m,
      channels: { ...m.channels, [id]: { ...m.channels[id], on: !m.channels[id].on } },
    }))
  }, [])

  const setVolume = useCallback((id: SoundId, volume: number) => {
    setMix((m) => ({
      ...m,
      channels: { ...m.channels, [id]: { ...m.channels[id], volume } },
    }))
  }, [])

  const setMasterVolume = useCallback((master: number) => {
    setMix((m) => ({ ...m, master }))
  }, [])

  const toggleMute = useCallback(() => {
    setMix((m) => ({ ...m, muted: !m.muted }))
  }, [])

  const anyOn = SOUNDS.some(({ id }) => mix.channels[id].on)

  return { mix, anyOn, toggle, setVolume, setMasterVolume, toggleMute }
}

export type Soundscape = ReturnType<typeof useSoundscape>
