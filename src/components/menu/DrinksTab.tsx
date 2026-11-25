import { DRINKS, type Drink, type DrinkId } from '../../drinks/drinks'
import { useI18n } from '../../i18n/context'

interface Props {
  drink: Drink
  onChange: (id: DrinkId) => void
}

export function DrinksTab({ drink, onChange }: Props) {
  const { t } = useI18n()

  return (
    <div className="drink-grid" role="radiogroup" aria-label={t.drinks.label}>
      {DRINKS.map((d) => {
        const active = d.id === drink.id
        return (
          <button
            key={d.id}
            role="radio"
            aria-checked={active}
            className={`drink-card ${active ? 'is-active' : ''}`}
            onClick={() => onChange(d.id)}
          >
            <span className="drink-card__icon" aria-hidden="true">{d.icon}</span>
            <span>{t.drinks.names[d.id]}</span>
          </button>
        )
      })}
    </div>
  )
}
