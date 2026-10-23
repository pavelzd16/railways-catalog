import { useEffect, useRef, useState } from 'react'
import { FiMenu, FiShoppingCart } from 'react-icons/fi'
import { Link, NavLink } from 'react-router'
import { Button } from '@/shared/ui/Button'
import { MobileMenu } from './MobileMenu'
import { CatalogMegaMenu } from './CatalogMegaMenu'
import { CatalogSearch } from './CatalogSearch'
import { useCart } from '@/entities/cart/model/use-cart'
import { RequestFormModal } from '@/shared/ui/RequestFormModal'
import { MessengerLinks } from '@/shared/ui/MessengerLinks'
import { positionsLabel } from '@/shared/lib/positions-count'
import { usePositionsCount } from '@/entities/product'
import { HeaderContacts } from './HeaderContacts'

const links = [
  ['Услуги', '/services'],
  ['Доставка', '/delivery'],
  ['Калькулятор', '/calculator'],
  ['Статьи', '/stati'],
  ['О компании', '/about'],
  ['Контакты', '/contacts'],
]

// ЧЕРНОВИК: варианты меню в серой полосе для сравнения (?menu=0…4).
// После выбора оставить один вариант, переключатель убрать.
const MENU_VARIANTS = [
  'Как сейчас',
  'Тёмные жирные + черта',
  'Плашки',
  'Оранжевые',
  'Отдельная строка',
]

function menuLinkClass(variant: number, isActive: boolean) {
  switch (variant) {
    case 1:
      return `whitespace-nowrap px-3 font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline ${isActive ? 'text-primary underline' : ''}`
    case 2:
      return `whitespace-nowrap rounded-md border px-3 py-1 font-medium shadow-sm transition-colors hover:border-primary hover:text-primary ${isActive ? 'border-primary bg-primary text-white hover:text-white' : 'border-border bg-white text-foreground'}`
    case 3:
      return `whitespace-nowrap font-semibold text-primary underline-offset-4 hover:underline ${isActive ? 'underline decoration-2' : ''}`
    case 4:
      return `-mb-px whitespace-nowrap border-b-[3px] py-2.5 text-[15px] font-semibold transition-colors hover:border-primary hover:text-primary ${isActive ? 'border-primary text-primary' : 'border-transparent text-foreground'}`
    default:
      return `whitespace-nowrap rounded-sm hover:text-primary ${isActive ? 'font-bold text-primary' : ''}`
  }
}

export function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalItems } = useCart()
  const positions = usePositionsCount()
  const [menu, setMenu] = useState(0)
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get('menu'))
    if (n >= 0 && n < MENU_VARIANTS.length) setMenu(n)
  }, [])
  const chooseMenu = (n: number) => {
    setMenu(n)
    const url = new URL(window.location.href)
    url.searchParams.set('menu', String(n))
    window.history.replaceState(window.history.state, '', url)
  }
  const navLinks = links.map(([label, to]) => (
    <NavLink
      key={to}
      to={`${to}?menu=${menu}`}
      className={({ isActive }) => menuLinkClass(menu, isActive)}
    >
      {label}
    </NavLink>
  ))
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
            {/* Счётчик ведёт в каталог; город и доставка — там, где хватает места. */}
            <div className="flex min-w-0 items-center gap-1 whitespace-nowrap">
              <Link to="/catalog" className="font-bold text-foreground hover:text-primary">
                {positionsLabel(positions)}
              </Link>
              <span className={`hidden ${menu >= 1 && menu <= 3 ? '2xl:inline' : 'xl:inline'}`}>· Зеленодольск · Поставки по России и СНГ</span>
            </div>
            {menu !== 4 && (
              <nav
                aria-label="Основная навигация"
                className={`hidden items-center lg:flex ${menu === 1 ? 'divide-x divide-foreground/25' : menu === 2 ? 'gap-2' : 'gap-4'}`}
              >
                {navLinks}
              </nav>
            )}
            <div className="hidden shrink-0 items-center gap-5 md:flex">
              <span className="whitespace-nowrap">Пн–Пт, 8:00–17:00</span>
              <MessengerLinks compact />
            </div>
          </div>
        </div>
      </div>
      <div className="container relative mx-auto px-6 xl:px-8">
        <div className="header-main flex items-center gap-3 xl:gap-5">
          <Link
            to="/"
            aria-label="ПроРельс — главная"
            className="shrink-0 rounded px-1 py-1"
          >
            {/* Логотип ПроРельс — вектор из файлов дизайнера («Вектор цветной 1.1» и «2.1»), ~8 КБ.
                Новая картинка — новое имя файла: старую по прежнему адресу браузеры держат в своей памяти. */}
            {/* Фон у логотипа прозрачный: на белой шапке — тёмные буквы, на тёмной
                при прокрутке — белые (переключает index.css по .is-scrolled). */}
            <img src="/logo-prorels.svg" alt="ПроРельс" width={368} height={82} className="header-logo-light h-auto w-[140px] xl:w-[180px]" />
            <img src="/logo-prorels-light.svg" alt="ПроРельс" width={368} height={82} className="header-logo-dark h-auto w-[140px] xl:w-[180px]" />
          </Link>
          {/* «Каталог» и «Заказать звонок» — с 1024 px: на 17-дюймовом мониторе
              с масштабом 125 % окно уже 1280 px, а кнопки там нужны. Меню
              с тремя полосками тогда не нужно — всё из него уже в шапке. */}
          <div className="hidden lg:block">
            <CatalogMegaMenu />
          </div>
          {/* Поиск не растягивается на всю свободную ширину: иначе на экранах
              уже xl он отжимает номер телефона и тот остаётся одной иконкой.
              Не шире 300 px — на больших мониторах длинная строка ни к чему. */}
          <div className="hidden min-w-0 max-w-75 flex-1 md:block">
            <CatalogSearch />
          </div>
          {/* Почта и мобильный столбиком по 24 px — влезает и в сжатую шапку;
              городской и остальное — в списке под мобильным. */}
          <HeaderContacts />
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
          <div className="hidden shrink-0 lg:block">
            {/* Срок перезвона прямо на кнопке. Две строки — кнопка 48 px,
                помещается и в сжатую шапку (72 px). */}
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-current/20 lg:hidden"
          >
            <FiMenu className="h-6 w-6" />
          </button>
        </div>
        {menu === 4 && (
          <div className="hidden lg:block">
            <div className="header-meta" inert={scrolled}>
              <div>
                <nav
                  aria-label="Основная навигация"
                  className="flex items-center gap-8 border-t border-border"
                >
                  {navLinks}
                </nav>
              </div>
            </div>
          </div>
        )}
        <div className="header-meta" inert={scrolled}>
          <div>
            <div className="pb-3 md:hidden">
              <CatalogSearch />
            </div>
          </div>
        </div>
      </div>
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-1 rounded-lg border border-border bg-white p-2 text-sm text-foreground shadow-lg">
          <b className="px-1">Вариант меню</b>
          {MENU_VARIANTS.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => chooseMenu(i)}
              className={`rounded px-2 py-1 text-left ${menu === i ? 'bg-primary text-white' : 'hover:bg-muted'}`}
            >
              {i}. {name}
            </button>
          ))}
        </div>
      )}
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
