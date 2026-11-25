/*
 * 🎵 Generative Celtic music: a "slow air" in D Dorian, 3/4 time.
 * - Low drone (D + A), like a very soft bagpipe.
 * - Harp arpeggios over an 8-bar progression.
 * - Tin whistle improvising phrases (A + A') that always resolve to D.
 */
import { lfo, loopNoise, rand, type VoiceFactory } from './utils'

const BPM = 66
const BEAT = 60 / BPM
const BAR = BEAT * 3
const LOOKAHEAD = 1.5 // seconds scheduled ahead of time

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

interface Chord {
  root: number // midi
  third: 3 | 4 // minor / major
}
const Dm: Chord = { root: 50, third: 3 }
const C: Chord = { root: 48, third: 4 }
const Am: Chord = { root: 45, third: 3 }
const G: Chord = { root: 43, third: 4 }
const F: Chord = { root: 41, third: 4 }

const PROGRESSIONS: Chord[][] = [
  [Dm, C, Dm, Am, Dm, G, C, Dm],
  [Dm, F, C, Dm, Dm, C, G, Dm],
  [Dm, Am, C, G, Dm, C, Am, Dm],
]

// D Dorian: D E F G A B C
const DORIAN = [2, 4, 5, 7, 9, 11, 0]
const MEL_LOW = 69 // A4
const MEL_HIGH = 86 // D6
const SCALE = Array.from({ length: MEL_HIGH - MEL_LOW + 1 }, (_, i) => MEL_LOW + i).filter((m) =>
  DORIAN.includes(m % 12),
)

const RHYTHMS = [
  [1.5, 0.5, 1],
  [1, 1, 1],
  [2, 1],
  [1, 0.5, 0.5, 1],
  [0.5, 0.5, 1, 1],
  [3],
]

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

function chordTones(ch: Chord) {
  const pcs = [ch.root % 12, (ch.root + ch.third) % 12, (ch.root + 7) % 12]
  return SCALE.filter((m) => pcs.includes(m % 12))
}

function nearest(options: number[], target: number) {
  return options.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a))
}

interface Note {
  beat: number // from the start of the phrase
  dur: number // in beats
  midi: number
}

/** 4-bar phrase. If `resolve`, it ends on D. */
function phrase(chords: Chord[], startMidi: number, resolve: boolean): Note[] {
  const notes: Note[] = []
  let cur = startMidi
  chords.forEach((ch, bar) => {
    const last = bar === chords.length - 1
    const rhythm = last ? pick([[3], [2, 1]]) : pick(RHYTHMS)
    let t = 0
    rhythm.forEach((dur, i) => {
      const isFinal = last && i === rhythm.length - 1
      if (isFinal && resolve) {
        cur = nearest([74, 86], cur)
      } else if (t === 0) {
        // Strong beat: chord tone close to the previous note
        cur = nearest(chordTones(ch), cur + rand(-4, 4))
      } else {
        // Weak beat: stepwise motion
        const idx = SCALE.indexOf(nearest(SCALE, cur))
        const step = pick([-2, -1, -1, 1, 1, 2])
        cur = SCALE[Math.max(0, Math.min(SCALE.length - 1, idx + step))]
      }
      // Some short notes become rests to let the melody breathe
      if (!(dur <= 0.5 && Math.random() < 0.15)) {
        notes.push({ beat: bar * 3 + t, dur, midi: cur })
      }
      t += dur
    })
  })
  return notes
}

/* ── Instruments ── */

function harp(c: AudioContext, out: AudioNode, t: number, midi: number, vel: number) {
  const f = mtof(midi)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vel, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 3)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(4500, t)
  lp.frequency.exponentialRampToValueAtTime(700, t + 1.2)
  lp.connect(g).connect(out)

  const o1 = c.createOscillator()
  o1.type = 'triangle'
  o1.frequency.value = f
  const o2 = c.createOscillator()
  o2.type = 'sine'
  o2.frequency.value = f * 2.001
  const g2 = c.createGain()
  g2.gain.value = 0.25
  o1.connect(lp)
  o2.connect(g2).connect(lp)
  for (const o of [o1, o2]) {
    o.start(t)
    o.stop(t + 3.1)
  }
  o1.onended = () => [o1, o2, g2, lp, g].forEach((n) => n.disconnect())
}

function whistle(c: AudioContext, out: AudioNode, t: number, midi: number, dur: number) {
  const f = mtof(midi)
  const end = t + dur
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.07, t + 0.05)
  g.gain.setValueAtTime(0.07, Math.max(t + 0.05, end - 0.12))
  g.gain.exponentialRampToValueAtTime(0.0001, end + 0.1)
  g.connect(out)

  const o = c.createOscillator()
  o.type = 'sine'
  // Celtic ornament ("cut"): a very short grace note above
  if (dur >= 1 && Math.random() < 0.3) {
    o.frequency.setValueAtTime(f * Math.pow(2, 2 / 12), t)
    o.frequency.setValueAtTime(f, t + 0.045)
  } else {
    o.frequency.setValueAtTime(f, t)
  }
  // Vibrato that fades in on long notes
  const vib = c.createOscillator()
  vib.frequency.value = 5.3
  const vibDepth = c.createGain()
  vibDepth.gain.setValueAtTime(0, t)
  vibDepth.gain.linearRampToValueAtTime(dur > 0.8 ? f * 0.006 : 0, t + Math.min(0.5, dur))
  vib.connect(vibDepth).connect(o.frequency)

  const o2 = c.createOscillator()
  o2.type = 'sine'
  o2.frequency.value = f * 2
  const g2 = c.createGain()
  g2.gain.value = 0.12
  o.connect(g)
  o2.connect(g2).connect(g)

  for (const n of [o, o2, vib]) {
    n.start(t)
    n.stop(end + 0.15)
  }
  o.onended = () => [o, o2, vib, vibDepth, g2, g].forEach((n) => n.disconnect())
}

/* ── The full voice ── */

export const celticMusic: VoiceFactory = (c, out) => {
  // Drone (D2 + A2) with a very slow swell
  const droneGain = c.createGain()
  droneGain.gain.setValueAtTime(0.0001, c.currentTime)
  droneGain.gain.exponentialRampToValueAtTime(0.03, c.currentTime + 4)
  const droneLfo = lfo(c, droneGain.gain, 0.06, 0.01)
  const droneLp = c.createBiquadFilter()
  droneLp.type = 'lowpass'
  droneLp.frequency.value = 450
  droneLp.connect(droneGain).connect(out)
  const drones = [38, 45, 50].map((m, i) => {
    const o = c.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = mtof(m)
    o.detune.value = rand(-4, 4)
    const g = c.createGain()
    g.gain.value = i === 2 ? 0.35 : 1
    o.connect(g).connect(droneLp)
    o.start()
    return o
  })
  // Bellows air
  const breath = loopNoise(c, 'pink')
  const bf = c.createBiquadFilter()
  bf.type = 'bandpass'
  bf.frequency.value = 900
  bf.Q.value = 0.8
  const bg = c.createGain()
  bg.gain.value = 0.004
  breath.connect(bf).connect(bg).connect(out)

  // Sequencer
  let nextBar = c.currentTime + 0.3
  let barIndex = 0 // position within the 8-bar pass
  let pass = 0
  let prog = PROGRESSIONS[0]
  let melody: Note[] = []

  const planPass = () => {
    prog = pass === 0 ? PROGRESSIONS[0] : pick(PROGRESSIONS)
    // The first pass is harp only (intro); afterwards the whistle sometimes rests
    if (pass === 0 || Math.random() < 0.2) {
      melody = []
      return
    }
    const a = phrase(prog.slice(0, 4), pick([74, 76, 77, 81]), false)
    // A': repeats the first bar of A and improvises the rest, resolving to D
    const head = a.filter((n) => n.beat < 3).map((n) => ({ ...n, beat: n.beat + 12 }))
    const lastHead = head.at(-1)?.midi ?? 76
    const tail = phrase(prog.slice(5, 8), lastHead, true).map((n) => ({ ...n, beat: n.beat + 15 }))
    melody = [...a, ...head, ...tail]
  }

  const scheduleBar = (t: number) => {
    if (barIndex === 0) planPass()
    const ch = prog[barIndex]
    const r = ch.root
    // Harp: bass note + eighth-note arpeggio
    harp(c, out, t, r - 12, 0.13)
    const arp = [r, r + 7, r + 12, r + 12 + ch.third, r + 19, r + 12 + ch.third]
    arp.forEach((m, i) => {
      const swing = i % 2 ? 0.02 : 0 // a touch of human feel
      harp(c, out, t + i * (BEAT / 2) + swing + rand(0, 0.012), m, i === 0 ? 0.1 : rand(0.05, 0.08))
    })
    // Whistle
    for (const n of melody) {
      if (n.beat >= barIndex * 3 && n.beat < barIndex * 3 + 3) {
        whistle(c, out, t + (n.beat - barIndex * 3) * BEAT, n.midi, n.dur * BEAT * 0.95)
      }
    }
    barIndex = (barIndex + 1) % 8
    if (barIndex === 0) pass++
  }

  const timer = window.setInterval(() => {
    while (nextBar < c.currentTime + LOOKAHEAD) {
      scheduleBar(nextBar)
      nextBar += BAR
    }
  }, 200)

  return {
    stop() {
      window.clearInterval(timer)
      drones.forEach((o) => o.stop())
      droneLfo.stop()
      breath.stop()
    },
  }
}
