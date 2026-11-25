import type { Drink } from '../drinks/drinks'
import { C } from '../theme/palette'
import { DrinkVessel } from './DrinkVessel'
import './CabinScene.css'

/*
 * Cabin scene, drawn on a 1600×900 canvas.
 * Layout: forest window (left) · empty wall for the timer (center)
 * · stone fireplace (right) · reading armchair + side table with mug (bottom).
 */

// Deterministic pseudo-random so the scene always looks the same.
function rand(seed: number) {
  const x = Math.sin(seed * 9301.17) * 49297.31
  return x - Math.floor(x)
}

const WALL_PLANKS = Array.from({ length: 20 }, (_, i) => i * 80)
const FLOOR_PLANKS = Array.from({ length: 6 }, (_, i) => 728 + i * 30)

// Fireplace stones in staggered rows.
const STONES = (() => {
  const stones: { x: number; y: number; w: number; h: number; fill: string }[] = []
  const fills = [C.plumDeep, C.plum, '#4a3d42', C.plumDeep]
  let seed = 1
  for (let row = 0, y = 0; y < 720; row++, y += 46) {
    let x = 1040 - (row % 2 ? 40 : 0)
    while (x < 1460) {
      const w = 60 + Math.floor(rand(seed++) * 50)
      stones.push({
        x: Math.max(x, 1040) + 3,
        y: y + 3,
        w: Math.min(x + w, 1460) - Math.max(x, 1040) - 6,
        h: 40,
        fill: fills[Math.floor(rand(seed++) * fills.length)],
      })
      x += w
    }
  }
  return stones.filter((s) => s.w > 8)
})()

const STARS = Array.from({ length: 22 }, (_, i) => ({
  x: 175 + rand(i + 100) * 370,
  y: 165 + rand(i + 200) * 150,
  r: 0.8 + rand(i + 300) * 1.6,
  delay: rand(i + 400) * 4,
}))

const SPARKS = Array.from({ length: 9 }, (_, i) => ({
  x: 1215 + rand(i + 500) * 70,
  delay: rand(i + 600) * 3.5,
  dur: 2.2 + rand(i + 700) * 1.6,
}))

function Pine({ x, base, h, fill }: { x: number; base: number; h: number; fill: string }) {
  const w = h * 0.42
  return (
    <g fill={fill}>
      <polygon points={`${x},${base - h} ${x - w * 0.55},${base - h * 0.55} ${x + w * 0.55},${base - h * 0.55}`} />
      <polygon points={`${x},${base - h * 0.8} ${x - w * 0.8},${base - h * 0.28} ${x + w * 0.8},${base - h * 0.28}`} />
      <polygon points={`${x},${base - h * 0.55} ${x - w},${base} ${x + w},${base}`} />
    </g>
  )
}

interface Props {
  running: boolean
  drink: Drink
  /** 1 = full, 0 = empty. */
  drinkLevel: number
}

export function CabinScene({ running, drink, drinkLevel }: Props) {
  return (
    <svg
      className={`cabin ${running ? 'is-running' : ''}`}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.night} />
          <stop offset="1" stopColor={C.dusk} />
        </linearGradient>
        <radialGradient id="moonGlow">
          <stop offset="0" stopColor={C.mist} stopOpacity="0.45" />
          <stop offset="1" stopColor={C.mist} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fireGlow">
          <stop offset="0" stopColor={C.flame} stopOpacity="0.55" />
          <stop offset="0.35" stopColor={C.ember} stopOpacity="0.22" />
          <stop offset="1" stopColor={C.ember} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hearthGlow" cx="0.5" cy="0.9" r="0.7">
          <stop offset="0" stopColor={C.ember} stopOpacity="0.8" />
          <stop offset="1" stopColor={C.night} stopOpacity="1" />
        </radialGradient>
        <radialGradient id="vignette" cx="0.55" cy="0.55" r="0.8">
          <stop offset="0.45" stopColor={C.night} stopOpacity="0" />
          <stop offset="1" stopColor={C.night} stopOpacity="0.85" />
        </radialGradient>
        <clipPath id="glass">
          <rect x="170" y="160" width="380" height="360" />
        </clipPath>
      </defs>

      {/* ── Wooden wall ── */}
      <rect width="1600" height="720" fill={C.wood} />
      {WALL_PLANKS.map((x, i) => (
        <g key={x}>
          <rect x={x} y="0" width="80" height="720" fill={i % 2 ? C.ink : C.wood} opacity={i % 2 ? 0.12 : 0} />
          <rect x={x} y="0" width="3" height="720" fill={C.ink} opacity="0.55" />
        </g>
      ))}
      <rect width="1600" height="720" fill={C.ink} opacity="0.45" />
      {/* Ceiling beam */}
      <rect width="1600" height="46" fill={C.ink} opacity="0.75" />
      <rect y="46" width="1600" height="6" fill={C.ink} opacity="0.4" />

      {/* ── Floor ── */}
      <rect y="720" width="1600" height="180" fill={C.wood} />
      {FLOOR_PLANKS.map((y) => (
        <rect key={y} y={y} width="1600" height="2" fill={C.ink} opacity="0.5" />
      ))}
      <rect y="720" width="1600" height="180" fill={C.ink} opacity="0.5" />
      <rect y="710" width="1600" height="14" fill={C.ink} />

      {/* ── Forest window ── */}
      <rect x="150" y="140" width="420" height="400" rx="6" fill={C.wood} />
      <rect x="150" y="140" width="420" height="400" rx="6" fill={C.ink} opacity="0.35" />
      <g clipPath="url(#glass)">
        <rect x="170" y="160" width="380" height="360" fill="url(#sky)" />
        {STARS.map((s, i) => (
          <circle
            key={i}
            className="star"
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={C.mist}
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}
        <circle cx="465" cy="235" r="90" fill="url(#moonGlow)" />
        <circle cx="465" cy="235" r="26" fill={C.paper} opacity="0.9" />
        <circle cx="476" cy="229" r="24" fill={C.dusk} opacity="0.35" />
        <path d="M170 430 Q260 360 350 400 T550 380 V520 H170 Z" fill={C.dusk} />
        {[200, 255, 320, 390, 450, 515].map((x, i) => (
          <Pine key={x} x={x} base={470} h={120 + rand(i + 800) * 70} fill={C.forestDeep} />
        ))}
        <rect className="fog" x="120" y="440" width="520" height="60" rx="30" fill={C.mist} opacity="0.12" />
        {[180, 240, 300, 375, 440, 500, 548].map((x, i) => (
          <Pine key={x} x={x} base={530} h={110 + rand(i + 900) * 80} fill={C.forest} />
        ))}
      </g>
      {/* Frame and mullions */}
      <rect x="357" y="160" width="6" height="360" fill={C.wood} />
      <rect x="170" y="337" width="380" height="6" fill={C.wood} />
      <rect x="170" y="160" width="380" height="360" fill="none" stroke={C.ink} strokeWidth="4" opacity="0.5" />
      {/* Windowsill with a small plant */}
      <rect x="128" y="532" width="464" height="20" rx="3" fill={C.wood} />
      <rect x="128" y="548" width="464" height="6" fill={C.ink} opacity="0.5" />
      <g transform="translate(500 532)">
        <ellipse cx="-14" cy="-44" rx="9" ry="22" fill={C.forest} transform="rotate(-30 -14 -44)" />
        <ellipse cx="14" cy="-46" rx="9" ry="22" fill={C.forest} transform="rotate(30 14 -46)" />
        <ellipse cx="0" cy="-54" rx="9" ry="26" fill="#3d5a43" />
        <path d="M-14 -24 h28 l-4 24 h-20 Z" fill={C.ember} opacity="0.85" />
      </g>

      {/* ── Stone fireplace ── */}
      <rect x="1040" y="0" width="420" height="720" fill={C.ink} />
      {STONES.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx="12" fill={s.fill} opacity="0.85" />
      ))}
      <rect x="1040" y="0" width="420" height="720" fill={C.ink} opacity="0.3" />
      {/* Firebox */}
      <path d="M1130 712 V510 Q1130 440 1250 440 Q1370 440 1370 510 V712 Z" fill="url(#hearthGlow)" />
      <rect x="1080" y="704" width="340" height="24" rx="4" fill={C.plumDeep} />

      {/* Mantel */}
      <rect x="1050" y="380" width="400" height="26" rx="3" fill={C.wood} />
      <rect x="1050" y="402" width="400" height="10" fill={C.ink} opacity="0.6" />
      {/* Witch jars */}
      <g transform="translate(1100 380)">
        <rect x="0" y="-44" width="30" height="44" rx="6" fill={C.mist} opacity="0.35" />
        <rect x="0" y="-26" width="30" height="26" rx="6" fill={C.forest} />
        <rect x="7" y="-54" width="16" height="10" rx="2" fill={C.wood} />
        <rect x="42" y="-30" width="24" height="30" rx="10" fill={C.mist} opacity="0.35" />
        <rect x="42" y="-18" width="24" height="18" rx="9" fill={C.plum} />
        <rect x="49" y="-38" width="10" height="8" rx="2" fill={C.wood} />
      </g>
      {/* Candles */}
      {[1360, 1395].map((x, i) => (
        <g key={x} transform={`translate(${x} 380)`}>
          <rect x="-8" y={i ? -38 : -52} width="16" height={i ? 38 : 52} rx="3" fill={C.paper} opacity="0.9" />
          <ellipse className="candle" cx="0" cy={i ? -48 : -62} rx="5" ry="10" fill={C.flameCore} />
          <circle cx="0" cy={i ? -46 : -60} r="22" fill="url(#fireGlow)" />
        </g>
      ))}

      {/* Logs and fire */}
      <ellipse cx="1250" cy="700" rx="110" ry="14" fill={C.ember} opacity="0.6" className="embers" />
      <g className="fire" transform="translate(1250 690)">
        <path className="flame f1" d="M0 0 C-70 0 -80 -60 -40 -110 C-30 -70 -10 -80 -10 -130 C30 -90 70 -60 60 -20 C55 -5 30 0 0 0 Z" fill={C.ember} />
        <path className="flame f2" d="M0 0 C-45 0 -55 -40 -25 -80 C-15 -50 0 -60 5 -100 C30 -70 50 -40 40 -15 C35 -3 20 0 0 0 Z" fill={C.flame} />
        <path className="flame f3" d="M0 0 C-25 0 -30 -25 -12 -50 C-5 -35 5 -40 8 -62 C22 -40 28 -20 20 -8 C15 -2 10 0 0 0 Z" fill={C.flameCore} />
      </g>
      <g>
        <rect x="1170" y="680" width="170" height="22" rx="11" fill={C.wood} transform="rotate(-8 1255 691)" />
        <rect x="1160" y="688" width="170" height="22" rx="11" fill={C.wood} transform="rotate(9 1245 699)" />
        <rect x="1160" y="688" width="170" height="22" rx="11" fill={C.ink} opacity="0.35" transform="rotate(9 1245 699)" />
        <circle cx="1170" cy="676" r="9" fill={C.plumDeep} />
        <circle cx="1332" cy="684" r="9" fill={C.plumDeep} />
      </g>
      {SPARKS.map((s, i) => (
        <circle
          key={i}
          className="spark"
          cx={s.x}
          cy="640"
          r="2.2"
          fill={C.flameCore}
          style={{ animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
        />
      ))}

      {/* ── Rug ── */}
      <ellipse cx="860" cy="800" rx="340" ry="58" fill={C.plumDeep} />
      <ellipse cx="860" cy="800" rx="300" ry="44" fill="none" stroke={C.plum} strokeWidth="3" strokeDasharray="14 10" opacity="0.7" />
      <ellipse cx="860" cy="800" rx="220" ry="28" fill="none" stroke={C.ember} strokeWidth="2" opacity="0.45" />

      {/* ── Side table with mug ── */}
      <g transform="translate(640 0)">
        <ellipse cx="45" cy="768" rx="50" ry="8" fill={C.ink} opacity="0.5" />
        <rect x="0" y="650" width="90" height="12" rx="4" fill={C.wood} />
        <rect x="39" y="662" width="12" height="104" fill={C.wood} />
        <rect x="39" y="662" width="12" height="104" fill={C.ink} opacity="0.35" />
        <rect x="20" y="760" width="50" height="8" rx="3" fill={C.wood} />
        {/* Current drink, resting on the table top */}
        <g transform="translate(45 650)">
          <DrinkVessel drink={drink} level={drinkLevel} />
        </g>
      </g>

      {/* ── Reading armchair ── */}
      <g>
        <ellipse cx="870" cy="772" rx="140" ry="12" fill={C.ink} opacity="0.55" />
        <rect x="780" y="530" width="180" height="190" rx="46" fill={C.forest} />
        <rect x="780" y="530" width="180" height="190" rx="46" fill={C.forestDeep} opacity="0.3" />
        <rect x="790" y="660" width="160" height="70" rx="18" fill={C.forest} />
        <rect x="752" y="630" width="56" height="120" rx="24" fill={C.forest} />
        <rect x="932" y="630" width="56" height="120" rx="24" fill={C.forest} />
        <rect x="752" y="630" width="56" height="16" rx="8" fill={C.mist} opacity="0.08" />
        <rect x="932" y="630" width="56" height="16" rx="8" fill={C.mist} opacity="0.08" />
        <rect x="770" y="748" width="12" height="22" rx="3" fill={C.ink} />
        <rect x="958" y="748" width="12" height="22" rx="3" fill={C.ink} />
        {/* Cushion */}
        <rect x="830" y="600" width="80" height="60" rx="22" fill={C.plum} transform="rotate(-6 870 630)" />
        {/* Blanket */}
        <path d="M900 545 C960 560 975 620 965 700 L935 712 C945 640 925 590 890 570 Z" fill={C.ember} />
        <path d="M930 570 C950 600 955 640 950 690" fill="none" stroke={C.wood} strokeWidth="5" opacity="0.7" />
        {/* Open book on the armrest */}
        <g transform="translate(760 622) rotate(-10)">
          <path d="M0 0 q20 -8 40 0 v10 q-20 -8 -40 0 Z" fill={C.paper} />
          <path d="M40 0 q20 -8 40 0 v10 q-20 -8 -40 0 Z" fill={C.paper} opacity="0.85" />
          <rect x="-2" y="8" width="84" height="5" rx="2" fill={C.wood} />
        </g>
      </g>

      {/* ── Firelight and vignette ── */}
      <circle className="glow" cx="1250" cy="640" r="760" fill="url(#fireGlow)" pointerEvents="none" />
      <rect width="1600" height="900" fill="url(#vignette)" pointerEvents="none" />
    </svg>
  )
}
