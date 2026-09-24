import { LuLayers } from 'react-icons/lu'
import { cn } from '@/shared/lib/cn'

/**
 * Ступени цены по объёму партии — словами, без процентов (решение пользователя
 * от 24.09.2026). Столбики-ступеньки растут к вагону: чем больше партия, тем
 * выгоднее тонна.
 */
const TIERS = [
  { volume: 'от 1 т', name: 'Розница', step: 'h-1/4 bg-primary/25' },
  { volume: 'от 10 т', name: 'Мелкий опт', step: 'h-2/4 bg-primary/45' },
  { volume: 'от 18 т', name: 'Опт', step: 'h-3/4 bg-primary/70' },
  { volume: 'Вагон', name: 'Вагонная цена', step: 'h-full bg-primary' },
]

/** Разделы, где товар продают штуками и комплектами, а не тоннами. */
const PIECE_CATEGORIES = new Set([
  'putevoj-instrument',
  'zheleznodorozhnye-znaki',
  'strelochnye-perevody',
  'zheleznodorozhnye-pereezdy',
  'tupikovye-upory',
  'bashmaki-tormoznye',
  'zvenya-relsoshpalnoj-reshetki',
])

export interface VolumeTiersProps {
  /** Раздел товара: для штучных разделов блок не показываем. */
  categorySlug?: string
  /** Открыть форму заявки — чтобы менеджер назвал цену под объём. */
  onRequest?: () => void
  className?: string
}

export function VolumeTiers({ categorySlug, onRequest, className }: VolumeTiersProps) {
  if (categorySlug && PIECE_CATEGORIES.has(categorySlug)) return null
  return (
    <section
      aria-labelledby="volume-tiers-title"
      className={cn('rounded-lg border border-border bg-card p-4', className)}
    >
      <div className="mb-4 flex items-center gap-2">
        <LuLayers aria-hidden className="size-4 shrink-0 text-primary" />
        <h2 id="volume-tiers-title" className="text-sm font-bold text-foreground">
          Чем больше партия — тем ниже цена за тонну
        </h2>
      </div>

      <ol className="grid grid-cols-4 gap-2">
        {TIERS.map((tier, index) => {
          const best = index === TIERS.length - 1
          return (
            <li
              key={tier.volume}
              className={cn(
                'flex flex-col rounded-md border px-2 pb-2.5 pt-3 text-center',
                best ? 'border-primary bg-primary/5' : 'border-border',
              )}
            >
              <span aria-hidden className="mx-auto mb-2 flex h-8 w-8 items-end">
                <span className={cn('w-full rounded-sm', tier.step)} />
              </span>
              <span className="text-base font-bold leading-tight text-foreground">
                {tier.volume}
              </span>
              <span
                className={cn(
                  'mt-0.5 text-xs leading-tight',
                  best ? 'font-semibold text-primary' : 'text-muted-foreground',
                )}
              >
                {tier.name}
              </span>
            </li>
          )
        })}
      </ol>

      <p className="mt-3 text-xs text-muted-foreground">
        Цену под ваш объём назовёт менеджер.{' '}
        {onRequest && (
          <button
            type="button"
            onClick={onRequest}
            className="cursor-pointer font-semibold text-primary hover:underline"
          >
            Узнать цену партии →
          </button>
        )}
      </p>
    </section>
  )
}
