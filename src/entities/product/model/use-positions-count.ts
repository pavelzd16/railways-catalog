import { useEffect, useState } from 'react'
import { productApi } from '../api/product.api'
import { POSITIONS_FALLBACK, roundPositions } from '@/shared/lib/positions-count'

// Шапка монтируется заново на каждой странице, число нужно и первому экрану главной —
// каталог спрашиваем один раз за визит.
let known: number | null = null
let request: Promise<number> | null = null

function loadPositions(): Promise<number> {
  request ??= productApi
    .getAll({ page: 1, limit: 1 })
    .then(({ pagination }) => {
      known = roundPositions(pagination.total) || POSITIONS_FALLBACK
      return known
    })
    .catch(() => POSITIONS_FALLBACK)
  return request
}

/** Круглое число позиций каталога; до ответа и при сбое — запасное. */
export function usePositionsCount(): number {
  const [count, setCount] = useState(known ?? POSITIONS_FALLBACK)
  useEffect(() => {
    let cancelled = false
    loadPositions().then((value) => {
      if (!cancelled) setCount(value)
    })
    return () => {
      cancelled = true
    }
  }, [])
  return count
}
