// Soft chime played when a phase ends. Uses the shared engine output,
// so it respects the master volume.
import { getOutput } from './engine'

export function playChime() {
  try {
    const { ctx, out } = getOutput()
    const now = ctx.currentTime
    // Two bell-like notes: E5 and B5
    ;[659.25, 987.77].forEach((freq, i) => {
      const t = now + i * 0.35
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2)
      osc.connect(gain).connect(out)
      osc.start(t)
      osc.stop(t + 2.3)
    })
  } catch {
    // No audio available: nothing to do.
  }
}
