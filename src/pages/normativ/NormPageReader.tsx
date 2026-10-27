import { useEffect, useId, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { FiFileText, FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi'
import type { DocumentViewer } from '@/entities/normativ/lib/norm-document-view'
import { MORE_SHEET_TEXT, sheetAt, sheetCounter, stepSheet } from '@/entities/normativ/lib/page-flipper'
import { useModalFocus } from '@/shared/lib/use-modal-focus'
import { FlipArrow } from './FlipArrow'
import { usePreloadNeighbours, useSwipe } from './use-page-flipper'

/**
 * Окно чтения документа во весь экран: страница крупно (по ширине экрана, до 1100 px), стрелки, «N / M»,
 * клавиши ← → и Esc, свайп, закрытие крестиком и кликом по фону. «Крупнее» (или нажатие на страницу) — до 1400 px,
 * на телефоне — в 2,5 раза шире экрана, с прокруткой во все стороны; в увеличенном виде свайп не листает. Прокрутка страницы под окном заблокирована,
 * фокус — в окне и возвращается на лист после закрытия (useModalFocus). Кнопок скачивания здесь нет — они в карточке.
 */
export function NormPageReader({
  view,
  code,
  sheet,
  onSheetChange,
  onClose,
}: {
  view: DocumentViewer
  code: string
  sheet: number
  onSheetChange: (sheet: number) => void
  onClose: () => void
}) {
  const panelRef = useModalFocus(true, (open) => !open && onClose())
  const scrollRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const go = (delta: number) => onSheetChange(stepSheet(sheet, delta, view.sheets))
  const swipe = useSwipe(go, 50)
  const [zoomed, setZoomed] = useState(false)
  usePreloadNeighbours(view, sheet)

  // ← → листают, пока окно открыто (Esc и Tab — в useModalFocus).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        onSheetChange(stepSheet(sheet, event.key === 'ArrowLeft' ? -1 : 1, view.sheets))
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sheet, view.sheets, onSheetChange])

  // Новая страница — с начала.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, left: 0 })
  }, [sheet])

  if (typeof document === 'undefined') return null
  const shown = sheetAt(view, sheet)
  const counter = sheetCounter(view, sheet)
  const closeOnBackdrop = (event: MouseEvent) => {
    if (event.target === event.currentTarget && !swipe.consumeSwipe()) onClose()
  }

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={`normativ-reader${zoomed ? ' normativ-reader--zoomed' : ''}`}
    >
      <div className="normativ-reader-bar">
        <p id={titleId} className="min-w-0 truncate font-bold">
          {code}
          <span className="sr-only"> — чтение документа</span>
        </p>
        <p className="shrink-0 tabular-nums text-[#d5dce2]" aria-live="polite">
          <span className="sr-only">Страница </span>
          {counter}
        </p>
        {shown.kind === 'page' && (
          <button
            type="button"
            onClick={() => setZoomed((value) => !value)}
            aria-pressed={zoomed}
            aria-label="Крупнее"
            title={zoomed ? 'Вернуть по ширине экрана' : 'Крупнее'}
            className="normativ-reader-tool"
          >
            {zoomed ? <FiZoomOut className="h-6 w-6" aria-hidden="true" /> : <FiZoomIn className="h-6 w-6" aria-hidden="true" />}
          </button>
        )}
        <button type="button" onClick={onClose} aria-label="Закрыть окно чтения" className="normativ-reader-tool">
          <FiX className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div ref={scrollRef} className="normativ-reader-scroll" onClick={closeOnBackdrop} {...(zoomed ? {} : swipe.handlers)}>
        <div className="normativ-reader-page" onClick={closeOnBackdrop}>
          {shown.kind === 'page' ? (
            <img
              key={shown.src}
              src={shown.src}
              alt={`Страница ${shown.page} из ${view.pageCount}: ${code}`}
              decoding="async"
              draggable={false}
              onClick={() => setZoomed((value) => !value)}
              className="normativ-reader-img"
            />
          ) : (
            <div className="normativ-reader-more">
              <FiFileText className="h-10 w-10 text-[hsl(var(--primary))]" aria-hidden="true" />
              <p className="mt-4">{MORE_SHEET_TEXT}</p>
            </div>
          )}
        </div>
      </div>

      <FlipArrow direction={-1} disabled={sheet <= 1} onClick={() => go(-1)} className="normativ-reader-arrow normativ-reader-arrow--prev" />
      <FlipArrow direction={1} disabled={sheet >= view.sheets} onClick={() => go(1)} className="normativ-reader-arrow normativ-reader-arrow--next" />
    </div>,
    document.body,
  )
}
