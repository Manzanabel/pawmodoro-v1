/*
 * Pawmodoro sound engine: everything is synthesized with Web Audio, no files.
 * Each sound ("voice") lives in a channel with its own volume; channels feed
 * the master bus and, in varying amounts, a shared reverb.
 */
import { celticMusic } from './music'
import { windChimes } from './windChimes'
import { fire, kettle, leaves, wind } from './ambience'
import type { Voice, VoiceFactory } from './utils'

export type SoundId = 'fire' | 'kettle' | 'wind' | 'leaves' | 'music' | 'chimes'


const VOICES: Record<SoundId, VoiceFactory> = {
  fire,
  kettle,
  wind,
  leaves,
  music: celticMusic,
  chimes: windChimes,
}

/** How much of each channel is sent to the reverb. */
const REVERB_SEND: Record<SoundId, number> = {
  fire: 0.08,
  kettle: 0.1,
  wind: 0.2,
  leaves: 0.25,
  music: 0.55,
  chimes: 0.5,
}

const FADE = 0.4 // fade time constant (s)
const STOP_DELAY = 2500 // ms after fading out before releasing the voice

interface Channel {
  gain: GainNode
  voice: Voice | null
  stopTimer: number | null
}

let ctx: AudioContext | null = null
let master: GainNode
let reverb: ConvolverNode
// Kept outside the context so a volume set before audio starts isn't lost.
let masterVolume = 0.8
const channels = new Map<SoundId, Channel>()

function makeImpulse(c: AudioContext, seconds: number, decay: number) {
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
  }
  return buf
}

function getCtx() {
  if (ctx) return ctx
  ctx = new AudioContext()
  master = ctx.createGain()
  master.gain.value = masterVolume
  master.connect(ctx.destination)
  reverb = ctx.createConvolver()
  reverb.buffer = makeImpulse(ctx, 3.5, 2.6)
  reverb.connect(master)

  // Browsers block audio until the user interacts with the page.
  if (ctx.state === 'suspended') {
    const resume = () => {
      void ctx?.resume()
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
    }
    window.addEventListener('pointerdown', resume)
    window.addEventListener('keydown', resume)
  }
  return ctx
}

function getChannel(c: AudioContext, id: SoundId) {
  let ch = channels.get(id)
  if (!ch) {
    const gain = c.createGain()
    gain.gain.value = 0
    gain.connect(master)
    const send = c.createGain()
    send.gain.value = REVERB_SEND[id]
    gain.connect(send).connect(reverb)
    ch = { gain, voice: null, stopTimer: null }
    channels.set(id, ch)
  }
  return ch
}

export function setChannel(id: SoundId, on: boolean, volume: number) {
  if (!ctx && !on) return // don't create audio while everything is off
  const c = getCtx()
  const ch = getChannel(c, id)
  ch.gain.gain.setTargetAtTime(on ? volume : 0, c.currentTime, FADE)

  if (on) {
    if (ch.stopTimer !== null) {
      window.clearTimeout(ch.stopTimer)
      ch.stopTimer = null
    }
    ch.voice ??= VOICES[id](c, ch.gain)
  } else if (ch.voice && ch.stopTimer === null) {
    ch.stopTimer = window.setTimeout(() => {
      ch.voice?.stop()
      ch.voice = null
      ch.stopTimer = null
    }, STOP_DELAY)
  }
}

export function setMaster(volume: number) {
  masterVolume = volume
  if (!ctx) return
  master.gain.setTargetAtTime(volume, ctx.currentTime, 0.1)
}

/** Context + master bus for one-shot sounds (e.g. the chime), so they follow the master volume. */
export function getOutput(): { ctx: AudioContext; out: AudioNode } {
  const c = getCtx()
  return { ctx: c, out: master }
}

