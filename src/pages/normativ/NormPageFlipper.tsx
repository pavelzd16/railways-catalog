import { useEffect, useMemo, useRef, useState } from 'react'
import { FiFileText, FiMaximize2 } from 'react-icons/fi'
import type { NormDocumentFull } from '@/entities/normativ/model/types'
import { documentViewer } from '@/entities/normativ/lib/norm-document-view'
import { MORE_SHEET_TEXT, clampSheet, sheetAt, sheetLabel, stepSheet } from '@/entities/normativ/lib/page-flipper'
import { FlipArrow } from './FlipArrow'
import { usePreloadNeighbours, useSwipe } from './use-page-flipper'
import { NormPageReader } from './NormPageReader'

/**
 * Листалка документа в тёмной шапке под заголовком: лист текущей страницы (белый, A4) между круглыми стрелками,
 * «Стр. N из M», свайп на телефоне. Нажатие на лист — окно чтения во весь экран. Картинки — по мере листания.
 * Без картинок, но с файлом — лист-заглушка с номером; без файла листалки нет («Документ по запросу» — в карточке).
 */
export function NormPageFlipper({ document }: { document: NormDocumentFull }) {
  const view = useMemo(() => documentViewer(document), [document])
  const [sheet, setSheet] = useState(1)
  const [reading, setReading] = useState(false)
  // После закрытия окна фокус — снова на листе (на телефоне касание не ставит фокус на кнопку, и вернуть его некуда).
  const sheetRef = useRef<HTMLButtonElement>(null)
  const wasReading = useRef(false)
  useEffect(() => {
    if (reading) wasReading.current = true
    else if (wasReading.current) {
      wasReading.current = false
      sheetRef.current?.focus({ preventScroll: true })
    }
  }, [reading])
  const current = clampSheet(sheet, view.sheets)
  const go = (delta: number) => setSheet((value) => stepSheet(value, delta, view.sheets))
  const swipe = useSwipe(go)
  usePreloadNeighbours(view, current)

  if (view.mode === 'request') return null

  if (view.mode === 'placeholder') {
    return (
      <section aria-label={`Документ ${document.code}`} className="normativ-flipper">
        <div className="normativ-flipper-stage">
          <div className="normativ-sheet">
            <SheetBlank code={document.code} name={document.name} />
          </div>
        </div>
        <p className="normativ-flipper-label">{view.facts}</p>
      </section>
    )
  }

  const shown = sheetAt(view, current)
  const label = sheetLabel(view, current)
  const open = () => {
    if (!swipe.consumeSwipe()) setReading(true)
  }

  return (
    <section aria-label={`Документ ${document.code}: страницы`} className="normativ-flipper">
      <div className="normativ-flipper-row">
        <FlipArrow direction={-1} disabled={current <= 1} onClick={() => go(-1)} />
        <div className="normativ-flipper-stage" {...swipe.handlers}>
          <button
            ref={sheetRef}
            type="button"
            onClick={open}
            aria-haspopup="dialog"
            aria-label={`${label}. Открыть крупно для чтения`}
            className="normativ-sheet normativ-sheet--button group"
          >
            {shown.kind === 'page' ? (
              <img
                key={shown.src}
                src={shown.src}
                alt={`Страница ${shown.page}: ${document.code}`}
                decoding="async"
                draggable={false}
                className="normativ-sheet-img"
              />
            ) : (
              <span className="normativ-sheet-more">
                <FiFileText className="h-8 w-8 text-[hsl(var(--primary))]" aria-hidden="true" />
                <span className="mt-3 block">{MORE_SHEET_TEXT}</span>
              </span>
            )}
            <span className="normativ-sheet-hint" aria-hidden="true">
              <FiMaximize2 className="h-4 w-4" />
              Читать
            </span>
          </button>
        </div>
        <FlipArrow direction={1} disabled={current >= view.sheets} onClick={() => go(1)} />
      </div>
      <p className="normativ-flipper-label" aria-live="polite">
        {label}
      </p>

      {reading && (
        <NormPageReader
          view={view}
          code={document.code}
          sheet={current}
          onSheetChange={(value) => setSheet(clampSheet(value, view.sheets))}
          onClose={() => setReading(false)}
        />
      )}
    </section>
  )
}

function SheetBlank({ code, name }: { code: string; name: string }) {
  return (
    <span className="normativ-sheet-blank">
      <FiFileText className="h-10 w-10 text-[hsl(var(--primary))]" aria-hidden="true" />
      <span className="mt-4 block text-[clamp(1.125rem,2.6vw,1.5rem)] font-bold leading-tight text-foreground">{code}</span>
      <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{name}</span>
      <span className="mt-auto block text-xs font-bold tracking-[0.08em] text-muted-foreground">PDF</span>
    </span>
  )
}
