# 🐾 Pawmodoro

A cosy Pomodoro timer set in a little cabin, with a warm drink by your side and ambient sounds to help you focus.

## Features

- **Pomodoro timer** with focus, short break and long break phases (durations are configurable).
- **Calm mode**: the controls fade away while the timer runs and you don't touch the mouse.
- **Drinks**: pick coffee, green tea, chocolate or one of the witchy brews.
- **Ambient sounds**: fireplace, water heating, gentle wind, autumn leaves, Celtic music and wind chimes. Every sound is synthesized live with the Web Audio API, without any audio files, so it never loops the same way twice.
- **Languages**: Spanish, English and French.

## Sound design notes

Sound is the part of the project I'm still exploring, so these choices may evolve.

- **Synthesized instead of audio files.** I considered replacing the synthesized sounds with recorded MP3s in case they were too CPU-heavy. After measuring, the synthesized sounds turned out to be light (a few dozen oscillators at most). A seamless MP3 loop has to be fully decoded in memory, which takes about 10× its file size in RAM. Recordings also need license checks, and you can hear the loop after a few minutes. The original slowness came from the dev server, not the audio.
- **Generative, not looped.** The music and the wind chimes are composed on the fly. The Celtic music improvises phrases over random chord progressions. The wind chimes follow a simulated wind that drifts between lulls and gusts. No sequence repeats, so there is no loop to notice.
- **Cheap building blocks.** Noise sounds share one pre-generated looping buffer per noise color. Notes are scheduled a little ahead of time on a 200 ms timer, and each note's audio nodes are disconnected when it ends.
- **Still exploring:**
  - making the autumn leaves and the fireplace smoother on CPU (they create many short noise bursts);
  - suspending the audio engine when nothing is playing;
  - adding new calm, meditative voices.

## Getting started

```bash
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd run dev` if script execution is disabled.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run test:e2e` | Run the Playwright end-to-end tests (uses the locally installed Microsoft Edge) |

## Tech

React, TypeScript, Vite, Web Audio API and Playwright.
