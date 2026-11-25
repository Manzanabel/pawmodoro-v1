import { useEffect, useState } from 'react'
import { DRINKS_BY_ID, isDrinkId, type DrinkId } from '../drinks/drinks'

const STORAGE_KEY = 'pawmodoro:drink'

function loadDrink(): DrinkId {
  const saved = localStorage.getItem(STORAGE_KEY)
  return isDrinkId(saved) ? saved : 'coffee'
}

/** Currently chosen drink, persisted between visits. */
export function useDrink() {
  const [drinkId, setDrinkId] = useState<DrinkId>(loadDrink)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, drinkId)
  }, [drinkId])

  return { drink: DRINKS_BY_ID[drinkId], setDrinkId }
}
