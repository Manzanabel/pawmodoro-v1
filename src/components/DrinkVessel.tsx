import type { ReactNode } from 'react'
import { C } from '../theme/palette'
import type { Drink, Vessel } from '../drinks/drinks'

/*
 * Glass vessel drawn in the cabin scene. Origin = bottom center, resting on the table.
 * The liquid drains with `level` (1 = full, 0 = empty), so the drink empties
 * as the focus session goes by.
 */

interface Shape {
  /** Glass outline (filled with translucent glass). */
  body: string
  /** Area the liquid can occupy. */
  clip: string
  /** Extra decorations drawn on top (handle, saucer, rim…). */
  extras: ReactNode
  /** Liquid surface when full / bottom of the liquid. */
  top: number
  bottom: number
  /** Where the steam starts. */
  steamY: number
}

const GLASS = { fill: C.paper, fillOpacity: 0.1, stroke: C.paper, strokeOpacity: 0.55, strokeWidth: 2 }

const SHAPES: Record<Vessel, Shape> = {
  mug: {
    body: 'M-20 -52 V-8 Q-20 0 -12 0 H12 Q20 0 20 -8 V-52 Z',
    clip: 'M-18 -50 V-8 Q-18 -2 -11 -2 H11 Q18 -2 18 -8 V-50 Z',
    extras: <path d="M20 -42 c18 0 18 26 0 26" fill="none" stroke={C.paper} strokeOpacity="0.55" strokeWidth="4" />,
    top: -44,
    bottom: -2,
    steamY: -56,
  },
  teacup: {
    body: 'M-30 -34 Q-29 -2 0 -2 Q29 -2 30 -34 Z',
    clip: 'M-28 -34 Q-27 -4 0 -4 Q27 -4 28 -34 Z',
    extras: (
      <>
        <path d="M27 -28 c12 0 12 14 0 14" fill="none" stroke={C.paper} strokeOpacity="0.55" strokeWidth="3.5" />
        <ellipse cx="0" cy="-1" rx="40" ry="4" fill={C.plum} />
        <ellipse cx="0" cy="-2" rx="40" ry="2.5" fill={C.paper} opacity="0.35" />
      </>
    ),
    top: -30,
    bottom: -4,
    steamY: -38,
  },
  flask: {
    body: 'M-7 -70 H7 V-42 A23 23 0 1 1 -7 -42 Z',
    clip: 'M-5 -70 H5 V-41 A21 21 0 1 1 -5 -41 Z',
    extras: <rect x="-10" y="-74" width="20" height="5" rx="2" fill={C.paper} opacity="0.6" />,
    top: -50,
    bottom: 0,
    steamY: -78,
  },
}

export function DrinkVessel({ drink, level }: { drink: Drink; level: number }) {
  const shape = SHAPES[drink.vessel]
  const clipId = `drink-clip-${drink.vessel}`
  const depth = shape.bottom - shape.top
  const drop = (1 - Math.max(0, Math.min(1, level))) * depth
  const steamOpacity = level > 0.03 ? 0.35 + 0.65 * level : 0

  return (
    <g className="drink" data-drink={drink.id} data-level={level.toFixed(2)}>
      <defs>
        <clipPath id={clipId}>
          <path d={shape.clip} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <g className="drink__liquid" style={{ transform: `translateY(${drop}px)` }}>
          <rect x="-45" y={shape.top} width="90" height={depth + 30} fill={drink.liquid} />
          <rect x="-45" y={shape.top} width="90" height="3" fill={drink.surface} opacity="0.8" />
        </g>
      </g>
      <path d={shape.body} {...GLASS} />
      {/* Glass highlight */}
      <path d={shape.body} fill="none" stroke={C.paper} strokeOpacity="0.25" strokeWidth="5" strokeDasharray="0 6 14 400" />
      {shape.extras}

      <g
        className="steam"
        fill="none"
        stroke={drink.steam}
        strokeWidth="3"
        strokeLinecap="round"
        style={{ opacity: steamOpacity }}
      >
        <path className="s1" d={`M-8 ${shape.steamY} c-6 -10 6 -16 0 -28`} />
        <path className="s2" d={`M2 ${shape.steamY} c-6 -10 6 -16 0 -30`} />
        <path className="s3" d={`M10 ${shape.steamY} c-6 -8 6 -14 0 -24`} />
      </g>

      {drink.sparkles && level > 0.03 && (
        <g className="drink__sparkles" fill={drink.surface}>
          {[-14, 0, 12].map((x, i) => (
            <path
              key={x}
              d={`M${x} ${shape.steamY - 6} l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 Z`}
              style={{ animationDelay: `${i * 0.9}s` }}
            />
          ))}
        </g>
      )}
    </g>
  )
}
