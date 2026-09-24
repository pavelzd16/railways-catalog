import { useEffect, useRef, useState } from 'react'
import { FiMenu, FiPhone, FiShoppingCart } from 'react-icons/fi'
import { Link, NavLink } from 'react-router'
import { Button } from '@/shared/ui/Button'
import { MobileMenu } from './MobileMenu'
import { CatalogMegaMenu } from './CatalogMegaMenu'
import { CatalogSearch } from './CatalogSearch'
import { useCart } from '@/entities/cart/model/use-cart'
import { RequestFormModal } from '@/shared/ui/RequestFormModal'
import { MessengerLinks } from '@/shared/ui/MessengerLinks'
import { CopyButton, CopyValue } from '@/shared/ui/CopyButton'
import { useCopy } from '@/shared/ui/use-copy'
import { EMAIL_COPY_GOAL } from '@/shared/analytics/metrika'

const EMAIL = 'zakaz@traer.ru'
const COPY_EMAIL = 'Скопировать адрес почты'
const PHONE = '+7 (843) 227-00-05'
const PHONE_2 = '+7 (965) 615-50-59'
const COPY_PHONE = 'Скопировать номер телефона'

const links = [
  ['Услуги', '/services'],
  ['Доставка', '/delivery'],
  ['Калькулятор', '/calculator'],
  ['О компании', '/about'],
  ['Контакты', '/contacts'],
]

/** Номер на широком экране: нажатие на номер или значок копирует его, как почту. */
function HeaderPhone({ phone }: { phone: string }) {
  const copy = useCopy(phone)
  return (
    <div className="hidden h-6 items-center gap-2 px-2 md:flex">
      <CopyButton compact state={copy} label={COPY_PHONE} className="-mx-0.5" />
      <CopyValue
        state={copy}
        label={COPY_PHONE}
        className="whitespace-nowrap font-bold text-current hover:text-primary"
      >
        {phone}
      </CopyValue>
    </div>
  )
}

export function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const email = useCopy(EMAIL, EMAIL_COPY_GOAL)
  const { totalItems } = useCart()
  useEffect(() => {
    const scroll = () => {
      const scrollY = Math.max(0, window.scrollY)
      const headerHeight = headerRef.current?.offsetHeight
      if (headerHeight === undefined) return

      // Keep the thresholds apart so scroll anchoring during the height
      // transition cannot immediately trigger the opposite state.
      setScrolled((wasScrolled) =>
        wasScrolled ? scrollY > 8 : scrollY > headerHeight,
      )
    }
    const request = () => setRequestOpen(true)
    scroll()
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', scroll)
    window.addEventListener('open-request-form', request)
    return () => {
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', scroll)
      window.removeEventListener('open-request-form', request)
    }
  }, [])
  return (
    <header
      ref={headerRef}
      className={`site-header sticky top-0 z-40 border-b border-border bg-white ${scrolled ? 'is-scrolled' : ''}`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-3 focus:text-foreground"
      >
        Перейти к содержимому
      </a>
      <div
        className="header-meta bg-muted text-muted-foreground"
        inert={scrolled}
      >
        <div>
          <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-2 text-[13px] xl:px-8">
            <span>Зеленодольск · Поставки по России и СНГ</span>
            <nav
              aria-label="Основная навигация"
              className="hidden items-center gap-4 lg:flex"
            >
              {links.map(([label, to]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-sm hover:text-primary ${isActive ? 'font-bold text-primary' : ''}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="hidden items-center gap-5 md:flex">
              <span>Пн–Пт, 8:00–17:00</span>
              <MessengerLinks compact />
            </div>
          </div>
        </div>
      </div>
      <div className="container relative mx-auto px-6 xl:px-8">
        <div className="header-main flex items-center gap-3 xl:gap-5">
          <Link
            to="/"
            aria-label="ИНВИА — главная"
            className="shrink-0 rounded bg-white px-1 py-1"
          >
            <img src="/logo.png" alt="ИНВИА" className="w-25 xl:w-28" />
          </Link>
          <div className="hidden xl:block">
            <CatalogMegaMenu />
          </div>
          {/* Поиск не растягивается на всю свободную ширину: иначе на экранах
              уже xl он отжимает номер телефона и тот остаётся одной иконкой. */}
          <div className="hidden min-w-0 max-w-xl flex-1 md:block">
            <CatalogSearch />
          </div>
          {/* Почта и два номера столбиком: кнопки копирования стоят в одном
              столбце. Строки по 24 px — столбик влезает и в сжатую шапку. */}
          <div className="ml-auto flex shrink-0 flex-col justify-center">
            <div className="hidden h-6 items-center gap-2 px-2 text-sm md:flex">
              <CopyButton compact state={email} label={COPY_EMAIL} className="-mx-0.5" />
              <CopyValue
                state={email}
                label={COPY_EMAIL}
                className="font-bold text-current hover:text-primary"
              >
                {EMAIL}
              </CopyValue>
            </div>
            {/* На телефоне — значок звонка, оба номера есть в меню. */}
            <a
              href="tel:+78432270005"
              className="flex h-11 items-center rounded-lg px-2 hover:opacity-75 md:hidden"
              aria-label={`Позвонить: ${PHONE}`}
            >
              <FiPhone className="h-5 w-5" />
            </a>
            <HeaderPhone phone={PHONE} />
            <HeaderPhone phone={PHONE_2} />
          </div>
          <Link
            to="/cart"
            aria-label={`Корзина${totalItems ? `, товаров: ${totalItems}` : ''}`}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-current/20 hover:opacity-75"
          >
            <FiShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 rounded bg-accent px-1 text-xs font-bold text-accent-foreground">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
          <div className="hidden shrink-0 xl:block">
            {/* Срок перезвона прямо на кнопке. Две строки по высоте 56 px —
                помещаются и в сжатую шапку (72 px). */}
            <Button
              className="flex-col gap-0! whitespace-nowrap px-4! py-1.5! leading-tight"
              onClick={() => setRequestOpen(true)}
            >
              Заказать звонок
              <span className="text-xs font-medium opacity-90">
                перезвоним за 15 мин
              </span>
            </Button>
          </div>
          <button
            type="button"
            aria-label="Открыть меню"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-current/20 xl:hidden"
          >
            <FiMenu className="h-6 w-6" />
          </button>
        </div>
        <div className="header-meta" inert={scrolled}>
          <div>
            <div className="pb-3 md:hidden">
              <CatalogSearch />
            </div>
          </div>
        </div>
      </div>
      <MobileMenu open={mobileOpen} onOpenChange={setMobileOpen} />
      <RequestFormModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        title="Заказать звонок"
        description="Оставьте контакты — перезвоним в течение 15 минут"
        callback
      />
    </header>
  )
}
