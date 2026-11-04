import { LuLayers } from 'react-icons/lu'
import { cn } from '@/shared/lib/cn'
import { productGroup, TIER_NAMES, tierVolumes } from '@/shared/lib/product-groups'

/**
 * Ступени цены по объёму партии — словами, без процентов (решение пользователя
 * от 24.09.2026). Столбики-ступеньки растут к вагону: чем больше объём, тем
 * выгоднее тонна. В квадратиках — только объём, подпись осталась лишь у
 * вагонной ступени (решение пользователя от 28.09.2026). Группы разделов и
 * объёмы — из общего модуля: из него же берёт ступени ответ про цену
 * в «Частых вопросах».
 */
const STEPS = [
  'h-1/4 bg-primary/25',
  'h-2/4 bg-primary/45',
  'h-3/4 bg-primary/70',
  'h-full bg-primary',
]

export interface VolumeTiersProps {
  /** Раздел товара: для штучных разделов блок не показываем. */
  categorySlug?: string
  /** Подраздел — по нему узнаём старогодные рельсы и шпалы. */
  subcategorySlug?: string
  /** Открыть форму заявки — чтобы менеджер назвал цену под объём. */
  onRequest?: () => void
  className?: string
}

export function VolumeTiers({
  categorySlug,
  subcategorySlug,
  onRequest,
  className,
}: VolumeTiersProps) {
  const volumes = tierVolumes(productGroup(categorySlug, subcategorySlug))
  if (!volumes) return null
  const tiers = TIER_NAMES.map((name, i) => ({ name, volume: volumes[i], step: STEPS[i] }))
  return (
    <section
      aria-labelledby="volume-tiers-title"
      className={cn('rounded-lg border border-border bg-card p-4', className)}
    >
      <div className="mb-4 flex items-center gap-2">
        <LuLayers aria-hidden className="size-4 shrink-0 text-primary" />
        <h2 id="volume-tiers-title" className="text-sm font-bold text-foreground">
          Чем больше объём — тем ниже цена за тонну
        </h2>
      </div>

      <ol className="grid grid-cols-4 gap-2">
        {tiers.map((tier, index) => {
          const best = index === tiers.length - 1
          return (
            <li
              key={tier.volume}
              className={cn(
                // Компактные квадратики (04.11.2026): ниже и мельче, чем были.
                'flex flex-col justify-center rounded-md border px-2 py-1.5 text-center',
                best ? 'border-primary bg-primary/5' : 'border-border',
              )}
            >
              <span aria-hidden className="mx-auto mb-1 flex h-4 w-4 items-end">
                <span className={cn('w-full rounded-[2px]', tier.step)} />
              </span>
              <span className="text-sm font-bold leading-tight text-foreground">
                {tier.volume}
              </span>
              {best && (
                <span className="mt-0.5 text-[11px] font-semibold leading-tight text-primary">
                  {tier.name}
                </span>
              )}
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
