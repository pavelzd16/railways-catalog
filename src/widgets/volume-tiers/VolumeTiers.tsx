import { LuLayers } from 'react-icons/lu'
import { cn } from '@/shared/lib/cn'
import { productGroup, TIER_NAMES, tierVolumes } from '@/shared/lib/product-groups'

/**
 * Ступени цены по объёму партии — словами, без процентов (решение пользователя
 * от 24.09.2026). Столбики-ступеньки растут к вагону: чем больше партия, тем
 * выгоднее тонна. Группы разделов и объёмы — из общего модуля: из него же
 * берёт ступени ответ про цену в «Частых вопросах».
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
          Чем больше партия — тем ниже цена за тонну
        </h2>
      </div>

      <ol className="grid grid-cols-4 gap-2">
        {tiers.map((tier, index) => {
          const best = index === tiers.length - 1
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
