# Pawmodoro

Pomodoro timer built with React + TypeScript + Vite. Includes a menu, a calm mode and ambient sounds (fire, kettle, wind, leaves, music).

## Environment

- Windows with Git Bash. Python is NOT installed: never use Python. For scripts or bulk edits, use Node.js (`.mjs`) or edit files directly.
- Package manager: npm.
- Do not create files outside this repository (no scripts in `%TEMP%` or elsewhere). Put throwaway scripts in `.tmp/` (gitignored) and delete them when done.

## Working style

- When asked to analyze or diagnose, do not change code until I confirm.
- If something fails 2 times in a row, stop and explain the problem instead of retrying.
- Ask before long-running tasks (big refactors, writing many tests, repeated test runs).

## Tests

- Unit: Vitest. Always use `npx vitest run <file>`, never watch mode.
- E2E: Playwright on the locally installed Edge (`channel: 'msedge'` in `playwright.config.ts`, no projects defined): `npx playwright test <file> -g "<test name>"`.
- Never run the whole suite. Only run the test file related to the change, once per change.
- Tests must not leave resources open: clean up timers, close every `AudioContext`, and make sure every promise resolves. Use fake timers where possible.
- To check the UI, write a Playwright test. Never control my own browser (Edge/Chrome) via the DevTools protocol, and never use my browser profile.

## Processes

- Do not leave anything running. Stop every dev server, test runner or browser you start before finishing.
- Prefer letting Playwright start the dev server (`webServer` in `playwright.config.ts`) over starting it manually.

## Dependencies

- Never run `npm audit fix --force`.
- Do not add, remove or upgrade dependencies without asking.

## Sound engine

- All sounds are synthesized with Web Audio. Never add audio files.
- Keep the public API stable: `setChannel`, `setMaster`, `getOutput`, `SoundId`.
- Keep the character of each sound when changing the code.
- Mind CPU usage: reuse buffers (e.g. one shared looping noise buffer) instead of generating audio per sample in JS, disconnect nodes when they finish, avoid high-frequency timers, and suspend the `AudioContext` when nothing is playing.

## Code style

- No comments unless they are necessary. Comments are written in English, for developers.
