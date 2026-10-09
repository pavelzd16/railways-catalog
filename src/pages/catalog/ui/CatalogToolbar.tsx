import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { FiChevronDown, FiSearch } from 'react-icons/fi'

// Высота шапки после прокрутки: 72 px строки с логотипом + 1 px рамки (index.css, .is-scrolled).
const STICKY_TOP = 73
// Развернули и ничего не делают — свернуть через 20 с; после «Применить» — через 3 с.
const IDLE_COLLAPSE_MS = 20_000
const APPLY_COLLAPSE_MS = 3_000

/**
 * Панель поиска каталога. На своём месте над списком — полная. С 768 px, когда
 * она прилипает под шапкой, сворачивается в тонкую строку «что и где ищем»
 * со стрелкой снизу; нажатие разворачивает её обратно.
 *
 * children получает afterApply — звать при каждом новом запросе: прилипшая
 * панель возвращает к началу выдачи и через 3 с сворачивается.
 */
export function CatalogToolbar({
  summary,
  children,
}: {
  summary: string
  children: (afterApply: () => void) => ReactNode
}) {
  const startRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const [stuck, setStuck] = useState(false)
  const [open, setOpen] = useState(false)
  // Выпадающие ГОСТ и Цена выходят за панель: обрезку снимаем, только когда
  // разворачивание закончилось, иначе содержимое вылезает поверх списка.
  const [settled, setSettled] = useState(false)
  const collapsed = stuck && !open

  const collapseIn = useCallback((ms: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(false), ms)
  }, [])

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px)')
    const check = () => {
      const top = startRef.current?.getBoundingClientRect().top
      const next = wide.matches && top !== undefined && top < STICKY_TOP
      setStuck(next)
      // Вернулись к началу списка — в следующий раз панель снова прилипнет свёрнутой.
      if (!next) {
        window.clearTimeout(timer.current)
        setOpen(false)
      }
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    wide.addEventListener('change', check)
    return () => {
      window.clearTimeout(timer.current)
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      wide.removeEventListener('change', check)
    }
  }, [])

  // Свернули, пока курсор стоял в поле, — убрать его, чтобы не печатать вслепую.
  useEffect(() => {
    const active = document.activeElement
    if (collapsed && active instanceof HTMLElement && panelRef.current?.contains(active))
      active.blur()
  }, [collapsed])

  const expand = () => {
    setOpen(true)
    collapseIn(IDLE_COLLAPSE_MS)
    window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLInputElement>('input[type="search"]')
        ?.focus({ preventScroll: true })
    }, 50)
  }
  const collapse = () => {
    window.clearTimeout(timer.current)
    setOpen(false)
  }
  // Печатают или выбирают — отсчёт 20 с начинается заново.
  const activity = () => {
    if (stuck && open) collapseIn(IDLE_COLLAPSE_MS)
  }
  const afterApply = () => {
    const start = startRef.current
    if (!stuck || !start) return
    // На 1 px ниже исходного места: выдача с начала, а панель остаётся прилипшей.
    window.scrollTo({
      top: start.getBoundingClientRect().top + window.scrollY - STICKY_TOP + 1,
    })
    collapseIn(APPLY_COLLAPSE_MS)
  }

  return (
    <>
      <div ref={startRef} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`catalog-toolbar z-30 mb-3 rounded-lg border md:sticky ${stuck ? 'is-stuck' : ''} ${collapsed ? 'is-collapsed' : ''} ${settled && !collapsed ? 'is-settled' : ''}`}
        style={{ top: STICKY_TOP }}
      >
        <div
          className="catalog-toolbar-body"
          inert={collapsed}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget)
              setSettled(!collapsed)
          }}
          onInput={activity}
          onChange={activity}
          onKeyDown={activity}
          onPointerDown={activity}
        >
          <div>
            <div className="px-3 py-2">{children(afterApply)}</div>
          </div>
        </div>
        {stuck && (
          <>
            <div className="catalog-toolbar-summary" inert={!collapsed}>
              <div>
                <button
                  type="button"
                  onClick={expand}
                  className="flex h-8 w-full min-w-0 items-center gap-2 px-3 text-left text-[13px] text-muted-foreground hover:text-foreground"
                >
                  <FiSearch aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{summary}</span>
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={collapsed ? expand : collapse}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Развернуть поиск' : 'Свернуть поиск'}
              title={collapsed ? 'Развернуть поиск' : 'Свернуть поиск'}
              className="catalog-toolbar-tab absolute top-full left-1/2 flex h-5 w-12 -translate-x-1/2 items-center justify-center rounded-b-md border border-t-0 text-muted-foreground hover:text-primary"
            >
              <FiChevronDown
                aria-hidden="true"
                className={`h-4 w-4 transition-transform duration-500 ${collapsed ? '' : 'rotate-180'}`}
              />
            </button>
          </>
        )}
      </div>
    </>
  )
}
