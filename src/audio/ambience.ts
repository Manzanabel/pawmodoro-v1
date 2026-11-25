import { lfo, loopNoise, noiseBuffer, rand, type VoiceFactory } from './utils'

/** Short burst of filtered noise (crackle, rustle…). */
function burst(
  c: AudioContext,
  out: AudioNode,
  t: number,
  opts: { freq: number; q: number; dur: number; gain: number; pan?: number; type?: BiquadFilterType },
) {
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, 'white')
  const f = c.createBiquadFilter()
  f.type = opts.type ?? 'bandpass'
  f.frequency.value = opts.freq
  f.Q.value = opts.q
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(opts.gain, t + 0.002)
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur)
  const p = c.createStereoPanner()
  p.pan.value = opts.pan ?? 0
  src.connect(f).connect(g).connect(p).connect(out)
  src.start(t, Math.random() * 3)
  src.stop(t + opts.dur + 0.05)
}

/** Runs `fn` repeatedly at random intervals; returns a function to stop it. */
function every(minMs: () => number, fn: () => void) {
  let timer = 0
  let alive = true
  const tick = () => {
    if (!alive) return
    fn()
    timer = window.setTimeout(tick, minMs())
  }
  timer = window.setTimeout(tick, minMs())
  return () => {
    alive = false
    window.clearTimeout(timer)
  }
}

/* 🔥 Fireplace: low rumble + hiss + wood crackles */
export const fire: VoiceFactory = (c, out) => {
  const rumble = loopNoise(c, 'brown')
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 300
  const rg = c.createGain()
  rg.gain.value = 0.5
  const rLfo = lfo(c, rg.gain, 0.3, 0.12)
  rumble.connect(lp).connect(rg).connect(out)

  const hiss = loopNoise(c, 'pink')
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1600
  bp.Q.value = 0.6
  const hg = c.createGain()
  hg.gain.value = 0.05
  hiss.connect(bp).connect(hg).connect(out)

  const stopCrackles = every(
    () => 30 + Math.random() * Math.random() * 700,
    () => {
      const t = c.currentTime + 0.02
      const pan = rand(-0.3, 0.3)
      const n = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < n; i++) {
        burst(c, out, t + i * rand(0.005, 0.04), {
          freq: rand(1500, 5000),
          q: rand(0.8, 3),
          dur: rand(0.004, 0.03),
          gain: rand(0.15, 0.6),
          pan,
        })
      }
      // Every now and then, a deeper "pop"
      if (Math.random() < 0.08) {
        burst(c, out, t, { freq: rand(250, 600), q: 2, dur: rand(0.04, 0.09), gain: rand(0.4, 0.8), pan })
      }
    },
  )

  return {
    stop() {
      stopCrackles()
      rumble.stop()
      hiss.stop()
      rLfo.stop()
    },
  }
}

/* 🫖 Heating water: low rumble + bubbles that rise and fall in intensity */
export const kettle: VoiceFactory = (c, out) => {
  const rumble = loopNoise(c, 'brown')
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 220
  const rg = c.createGain()
  rg.gain.value = 0.35
  const rLfo = lfo(c, rg.gain, 0.15, 0.1)
  rumble.connect(lp).connect(rg).connect(out)

  const steam = loopNoise(c, 'pink')
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 3500
  const sg = c.createGain()
  sg.gain.value = 0.012
  const sLfo = lfo(c, sg.gain, 0.04, 0.008)
  steam.connect(hp).connect(sg).connect(out)

  const start = c.currentTime
  const stopBubbles = every(
    () => {
      // Slow ~40 s cycle: sometimes boiling harder, sometimes barely bubbling
      const intensity = 0.5 + 0.5 * Math.sin(((c.currentTime - start) / 40) * Math.PI * 2)
      return rand(40, 120) + (1 - intensity) * rand(80, 400)
    },
    () => {
      const t = c.currentTime + 0.02
      const f = rand(350, 1300)
      const d = rand(0.025, 0.08)
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, t)
      osc.frequency.exponentialRampToValueAtTime(f * rand(1.4, 2), t + d)
      const g = c.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(rand(0.02, 0.06), t + 0.005)
      g.gain.exponentialRampToValueAtTime(0.0001, t + d)
      const p = c.createStereoPanner()
      p.pan.value = rand(-0.25, 0.25)
      osc.connect(g).connect(p).connect(out)
      osc.start(t)
      osc.stop(t + d + 0.02)
    },
  )

  return {
    stop() {
      stopBubbles()
      rumble.stop()
      steam.stop()
      rLfo.stop()
      sLfo.stop()
    },
  }
}

/* 🌬️ Gentle wind: pink noise through a slowly sweeping filter */
export const wind: VoiceFactory = (c, out) => {
  const layers = [
    { freq: 500, sweep: 250, rate: 0.07, gRate: 0.05, q: 0.9 },
    { freq: 900, sweep: 400, rate: 0.045, gRate: 0.03, q: 1.6 },
  ].map(({ freq, sweep, rate, gRate, q }, i) => {
    const src = loopNoise(c, 'pink')
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = freq
    bp.Q.value = q
    const g = c.createGain()
    g.gain.value = i ? 0.25 : 0.45
    const p = c.createStereoPanner()
    p.pan.value = i ? 0.3 : -0.3
    src.connect(bp).connect(g).connect(p).connect(out)
    return [src, lfo(c, bp.frequency, rate, sweep), lfo(c, g.gain, gRate, i ? 0.18 : 0.3)]
  })

  return {
    stop() {
      layers.flat().forEach((n) => n.stop())
    },
  }
}

/* 🍂 Autumn leaves: rustles drifting from side to side */
export const leaves: VoiceFactory = (c, out) => {
  const stop = every(
    () => rand(1200, 5500),
    () => {
      const t0 = c.currentTime + 0.05
      const dur = rand(0.5, 1.8)
      const grains = Math.floor(dur * rand(60, 140))
      const panFrom = rand(-0.8, 0.8)
      const panTo = Math.max(-1, Math.min(1, panFrom + rand(-0.6, 0.6)))
      const peak = rand(0.08, 0.2)
      for (let i = 0; i < grains; i++) {
        const x = Math.random()
        const env = Math.sin(Math.PI * x) // denser in the middle of the rustle
        if (Math.random() > env) continue
        burst(c, out, t0 + x * dur, {
          freq: rand(2500, 7500),
          q: rand(0.7, 2),
          dur: rand(0.004, 0.02),
          gain: peak * env * rand(0.3, 1),
          pan: panFrom + (panTo - panFrom) * x,
        })
      }
    },
  )
  return { stop }
}
