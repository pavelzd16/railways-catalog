import { Fragment, useState, type ReactNode } from 'react'
import { formatPrice } from '@/shared/lib/catalog-helpers'
import { cn } from '@/shared/lib/cn'
import type { PriceConversion } from '@/shared/lib/price-convert'

/**
 * Цена за тонну с переключателем «т / кг / пог. м / шт». Крупная цифра меняется
 * по нажатию, а строка «В пересчёте…» справа от переключателя всегда есть в HTML:
 * по ней страница находится на запросы «цена за метр», «цена за штуку».
 * Компактно (решение пользователя 04.11.2026): плашка «Цена зависит от партии» —
 * в строке цены, пересчёт — справа от переключателя; на узком экране переносится вниз.
 */
export function PriceSwitch({ conversion, badge }: { conversion: PriceConversion; badge?: ReactNode }) {
  const { options, note } = conversion
  const [selectedKey, setSelectedKey] = useState(options[0].key)
  const selected = options.find((option) => option.key === selectedKey) ?? options[0]
  const others = options.filter((option) => option.key !== selected.key)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">от {formatPrice(selected.price)} ₽</span>
          <span className="text-sm text-muted-foreground">{selected.unit}</span>
        </span>
        {badge}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div
          role="group"
          aria-label="Показать цену"
          className="inline-flex shrink-0 flex-wrap gap-1 rounded-lg border border-border bg-muted p-1"
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

        <div className="min-w-0 basis-64 grow">
          <p className="text-sm text-muted-foreground">
            {/* «В пересчёте:» не отрывается от первой цифры при переносе строки. */}
            {/* Разделитель « · » — вне неразрывных кусков: строка переносится между ценами. */}
            {others.map((option, index) => (
              <Fragment key={option.key}>
                {index > 0 && ' · '}
                <span className="whitespace-nowrap">
                  {index === 0 && 'В пересчёте: '}
                  <span className="font-semibold text-foreground">{formatPrice(option.price)} ₽</span> {option.unit}
                </span>
              </Fragment>
            ))}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground/80">{note}</p>
        </div>
      </div>
    </div>
  )
}
