/*
 * Generative wind chimes. A simulated wind drifts between lulls and gusts and
 * drives the strike probability, so nothing repeats. Tubes use the inharmonic
 * partials of a free bar, tuned to D major pentatonic.
 */
import { loopNoise, rand, type VoiceFactory } from './utils'

const LOOKAHEAD = 1.5
const STEP = 0.05

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

const TUBE_NOTES = [66, 69, 71, 74, 76, 78, 81]

const PARTIALS = [
  { ratio: 1, amp: 1, ring: 1 },
  { ratio: 2.756, amp: 0.35, ring: 0.45 },
  { ratio: 5.404, amp: 0.12, ring: 0.2 },
]

const BOWL_PARTIALS = [
  { ratio: 1, amp: 1 },
  { ratio: 2.71, amp: 0.4 },
  { ratio: 5.15, amp: 0.12 },
]

interface Tube {
  midi: number
  pan: StereoPannerNode
}

function strike(c: AudioContext, tube: Tube, t: number, vel: number) {
  const f = mtof(tube.midi) * (1 + rand(-0.0015, 0.0015))
  const ring = 8 * Math.pow(2, -(tube.midi - 66) / 24)
  for (const p of PARTIALS) {
    const dur = ring * p.ring
    const o = c.createOscillator()
    o.frequency.value = f * p.ratio
    const g = c.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vel * p.amp * rand(0.7, 1.1), t + 0.004)
    g.gain.setTargetAtTime(0, t + 0.004, dur / 6)
    o.connect(g).connect(tube.pan)
    o.onended = () => {
      o.disconnect()
      g.disconnect()
    }
    o.start(t)
    o.stop(t + dur)
  }
}

function bowl(c: AudioContext, out: AudioNode, t: number) {
  const f = mtof(Math.random() < 0.6 ? 50 : 45)
  const g = c.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.05, t + 0.8)
  g.gain.setTargetAtTime(0, t + 0.8, 4)
  g.connect(out)
  const nodes: AudioNode[] = [g]
  const oscs: OscillatorNode[] = []
  for (const p of BOWL_PARTIALS) {
    // Each partial is doubled with a slight detune so it slowly beats
    for (const detune of [-0.6, 0.6]) {
      const o = c.createOscillator()
      o.frequency.value = (f + detune) * p.ratio
      const pg = c.createGain()
      pg.gain.value = p.amp * 0.5
      o.connect(pg).connect(g)
      nodes.push(o, pg)
      oscs.push(o)
    }
  }
  for (const o of oscs) {
    o.start(t)
    o.stop(t + 22)
  }
  oscs[0].onended = () => nodes.forEach((n) => n.disconnect())
}

export const windChimes: VoiceFactory = (c, out) => {
  const tubes: Tube[] = TUBE_NOTES.map((midi, i) => {
    const pan = c.createStereoPanner()
    pan.pan.value = -0.6 + (1.2 * i) / (TUBE_NOTES.length - 1) + rand(-0.1, 0.1)
    pan.connect(out)
    return { midi, pan }
  })

  const breath = loopNoise(c, 'pink')
  const bf = c.createBiquadFilter()
  bf.type = 'bandpass'
  bf.frequency.value = 600
  bf.Q.value = 0.6
  const bg = c.createGain()
  bg.gain.value = 0
  breath.connect(bf).connect(bg).connect(out)

  let simTime = c.currentTime + 0.3
  let segStart = simTime
  let segLen = rand(4, 10)
  let from = 0
  let to = 0.35
  let lastTube = -1
  let lastStrike = 0
  let nextBreezeUpdate = simTime
  let nextBowl = simTime + rand(3, 8)

  const windAt = (t: number) => {
    while (t >= segStart + segLen) {
      segStart += segLen
      segLen = rand(5, 16)
      from = to
      // Lulls are frequent so silence stays part of the piece
      to = Math.random() < 0.35 ? rand(0, 0.12) : rand(0.25, 0.8)
    }
    const x = (t - segStart) / segLen
    return from + (to - from) * x * x * (3 - 2 * x)
  }

  const tick = () => {
    const horizon = c.currentTime + LOOKAHEAD
    while (simTime < horizon) {
      const w = windAt(simTime)
      const rate = 0.03 + 1.6 * Math.pow(w, 2.5)
      if (Math.random() < rate * STEP && simTime - lastStrike > 0.12) {
        // The clapper tends to hit a neighbouring tube, never the same one twice
        let i = lastTube < 0 || Math.random() < 0.4
          ? Math.floor(Math.random() * tubes.length)
          : lastTube + (Math.random() < 0.5 ? -1 : 1)
        i = Math.max(0, Math.min(tubes.length - 1, i))
        if (i === lastTube) i = (i + 1 + Math.floor(Math.random() * (tubes.length - 1))) % tubes.length
        const t = simTime + rand(0, STEP)
        const vel = (0.015 + 0.04 * w) * rand(0.6, 1)
        strike(c, tubes[i], t, vel)
        if (Math.random() < 0.25) {
          const j = Math.max(0, Math.min(tubes.length - 1, i + (Math.random() < 0.5 ? -1 : 1)))
          if (j !== i) strike(c, tubes[j], t + rand(0.07, 0.2), vel * 0.45)
        }
        lastTube = i
        lastStrike = simTime
      }
      if (simTime >= nextBreezeUpdate) {
        bg.gain.setTargetAtTime(0.002 + 0.006 * w, simTime, 0.8)
        nextBreezeUpdate = simTime + 0.5
      }
      if (simTime >= nextBowl) {
        bowl(c, out, simTime)
        nextBowl = simTime + rand(35, 90)
      }
      simTime += STEP
    }
  }

  tick()
  const timer = window.setInterval(tick, 200)

  return {
    stop() {
      window.clearInterval(timer)
      breath.stop()
      breath.disconnect()
      bf.disconnect()
      bg.disconnect()
      tubes.forEach((tube) => tube.pan.disconnect())
    },
  }
}
