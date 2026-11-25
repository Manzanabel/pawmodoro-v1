export interface Voice {
  stop: () => void
}
export type VoiceFactory = (ctx: AudioContext, out: AudioNode) => Voice


type NoiseColor = 'white' | 'pink' | 'brown'
const noiseCache = new WeakMap<AudioContext, Partial<Record<NoiseColor, AudioBuffer>>>()

export function noiseBuffer(c: AudioContext, color: NoiseColor) {
  const cache = noiseCache.get(c) ?? {}
  noiseCache.set(c, cache)
  const cached = cache[color]
  if (cached) return cached

  const len = c.sampleRate * 4
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  let last = 0
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1
    if (color === 'white') {
      d[i] = w
    } else if (color === 'pink') {
      // Paul Kellet's filter
      b0 = 0.99886 * b0 + w * 0.0555179
      b1 = 0.99332 * b1 + w * 0.0750759
      b2 = 0.969 * b2 + w * 0.153852
      b3 = 0.8665 * b3 + w * 0.3104856
      b4 = 0.55 * b4 + w * 0.5329522
      b5 = -0.7616 * b5 - w * 0.016898
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
      b6 = w * 0.115926
    } else {
      last = (last + 0.02 * w) / 1.02
      d[i] = last * 3.5
    }
  }
  cache[color] = buf
  return buf
}

/** Looping noise source, already started. */
export function loopNoise(c: AudioContext, color: NoiseColor) {
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, color)
  src.loop = true
  src.start(0, Math.random() * 3)
  return src
}

/** Slow oscillator (LFO) modulating a parameter: value = base ± depth. */
export function lfo(c: AudioContext, param: AudioParam, rate: number, depth: number) {
  const osc = c.createOscillator()
  osc.frequency.value = rate
  const g = c.createGain()
  g.gain.value = depth
  osc.connect(g).connect(param)
  osc.start()
  return osc
}

export const rand = (min: number, max: number) => min + Math.random() * (max - min)
