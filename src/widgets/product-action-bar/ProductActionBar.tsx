import { FiPhone } from 'react-icons/fi'
import { Button } from '@/shared/ui/Button'
import { PHONE_CALL, tel } from '@/shared/lib/phones'
import { useBottomClearance } from '@/shared/lib/use-bottom-clearance'
import { setProductChatTarget } from '@/shared/lib/site-overlays'

// Городского пока нет — значок звонит на мобильный (src/shared/lib/phones.ts).
const PHONE = PHONE_CALL

const iconLink =
  'inline-flex size-11 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

// Панель внизу экрана карточки товара на телефоне и планшете: на узком экране кнопки заявки
// уходят далеко вниз, под фото и характеристики. На широком экране не нужна — там они рядом.
export function ProductActionBar({
  onPrice,
  onSpecification,
}: {
  onPrice: () => void
  onSpecification: () => void
}) {
  const bar = useBottomClearance('--product-bar-height')

  return (
    <>
      {/* Место под панелью, чтобы она не закрывала низ страницы. */}
      <div style={{ height: 'var(--product-bar-height, 4.5rem)' }} className="lg:hidden" aria-hidden="true" />

      <div
        ref={bar}
        role="region"
        aria-label="Заявка по товару"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-2 pt-2 pb-[max(.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgb(28_31_34/0.08)] backdrop-blur sm:px-3 lg:hidden"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-[2.75rem_2.75rem_minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-1.5 sm:gap-2">
          <a href={tel(PHONE)} aria-label={`Позвонить: ${PHONE}`} title={`Позвонить: ${PHONE}`} className={iconLink}>
            <FiPhone className="h-5 w-5" aria-hidden="true" />
          </a>
          <div ref={setProductChatTarget} className="size-11" />
          <Button type="button" size="sm" onClick={onPrice} className="px-1! text-center text-[13px]! leading-tight">
            Узнать цену
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onSpecification}
            className="px-1! text-center text-[13px]! leading-tight"
          >
            Запросить спецификацию
          </Button>
        </div>
      </div>

    </>
  )
}
