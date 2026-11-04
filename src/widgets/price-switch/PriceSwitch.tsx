import { useState } from 'react'
import { formatPrice } from '@/shared/lib/catalog-helpers'
import { cn } from '@/shared/lib/cn'
import type { PriceConversion } from '@/shared/lib/price-convert'

/**
 * Цена за тонну с переключателем «т / кг / пог. м / шт». Крупная цифра меняется
 * по нажатию, а строка «В пересчёте…» под переключателем всегда есть в HTML:
 * по ней страница находится на запросы «цена за метр», «цена за штуку».
 */
export function PriceSwitch({ conversion }: { conversion: PriceConversion }) {
  const { options, massPerMeter } = conversion
  const [selectedKey, setSelectedKey] = useState(options[0].key)
  const selected = options.find((option) => option.key === selectedKey) ?? options[0]
  const others = options.filter((option) => option.key !== selected.key)

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-bold text-primary">от {formatPrice(selected.price)} ₽</span>
        <span className="text-sm text-muted-foreground">{selected.unit}</span>
      </div>

      <div
        role="group"
        aria-label="Показать цену"
        className="mt-3 inline-flex flex-wrap gap-1 rounded-lg border border-border bg-muted p-1"
      >
        {options.map((option) => {
          const active = option.key === selected.key
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedKey(option.key)}
              className={cn(
                'min-h-8 rounded-md px-3 text-sm font-semibold transition-colors',
                active
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-card hover:text-foreground',
              )}
            >
              {option.tab}
            </button>
          )
        })}
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        В пересчёте:{' '}
        {others.map((option, index) => (
          <span key={option.key} className="whitespace-nowrap">
            {index > 0 && ' · '}
            <span className="font-semibold text-foreground">{formatPrice(option.price)} ₽</span> {option.unit}
          </span>
        ))}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/80">
        Ориентировочно, по массе 1 м — {String(massPerMeter).replace('.', ',')} кг.
      </p>
    </div>
  )
}
