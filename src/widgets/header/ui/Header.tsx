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
import { CopyButton } from '@/shared/ui/CopyButton'

const links = [
  ['Услуги', '/services'],
  ['Доставка', '/delivery'],
  ['Прайс', '/price'],
  ['О компании', '/about'],
  ['Контакты', '/contacts'],
]

export function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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
              className="hidden items-center gap-4 xl:flex"
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
          {/* Почта над телефоном: кнопка копирования стоит в одном столбце
              с иконкой телефона, адрес — ровно над номером. */}
          <div className="ml-auto flex shrink-0 flex-col justify-center">
            <div className="hidden items-center gap-2 px-2 text-sm md:flex">
              <CopyButton
                compact
                value="zakaz@traer.ru"
                label="Скопировать адрес почты"
                className="-mx-0.5"
              />
              <a
                href="mailto:zakaz@traer.ru"
                className="rounded-sm font-bold text-current/70 transition-colors hover:text-current"
              >
                zakaz@traer.ru
              </a>
            </div>
            <a
              href="tel:+78432270005"
              className="flex h-11 items-center gap-2 whitespace-nowrap rounded-lg px-2 font-bold hover:opacity-75 md:h-8"
              aria-label="Позвонить: +7 (843) 227-00-05"
            >
              <FiPhone className="h-5 w-5" />
              <span className="hidden md:inline">+7 (843) 227-00-05</span>
            </a>
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
            <Button
              className="whitespace-nowrap px-4!"
              onClick={() => setRequestOpen(true)}
            >
              Заказать звонок
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
