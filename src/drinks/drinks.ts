// Drink catalogue. Names live in the i18n dictionaries (t.drinks.names[id]).

export type DrinkId = 'coffee' | 'greenTea' | 'chocolate' | 'lavender' | 'moonTea'
export type Vessel = 'mug' | 'teacup' | 'flask'

export interface Drink {
  id: DrinkId
  icon: string
  vessel: Vessel
  /** Liquid color. */
  liquid: string
  /** Lighter tone for the liquid surface. */
  surface: string
  steam: string
  /** Witchy drinks give off little sparkles. */
  sparkles?: boolean
}

export const DRINKS: Drink[] = [
  { id: 'coffee', icon: '☕', vessel: 'mug', liquid: '#3b2416', surface: '#935a2c', steam: '#96a6b5' },
  { id: 'greenTea', icon: '🍵', vessel: 'teacup', liquid: '#8a8f3c', surface: '#b8bb6a', steam: '#96a6b5' },
  { id: 'chocolate', icon: '🍫', vessel: 'mug', liquid: '#5c3522', surface: '#8a5a3c', steam: '#988990' },
  { id: 'lavender', icon: '🔮', vessel: 'flask', liquid: '#7d5a99', surface: '#b394cc', steam: '#b394cc', sparkles: true },
  { id: 'moonTea', icon: '🌙', vessel: 'teacup', liquid: '#2d3e4e', surface: '#96a6b5', steam: '#c8d4e0', sparkles: true },
]

export const DRINKS_BY_ID = Object.fromEntries(DRINKS.map((d) => [d.id, d])) as Record<DrinkId, Drink>

export function isDrinkId(value: unknown): value is DrinkId {
  return typeof value === 'string' && value in DRINKS_BY_ID
}
