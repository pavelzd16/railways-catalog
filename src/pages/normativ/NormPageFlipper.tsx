import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { FiFileText } from 'react-icons/fi'
import type { NormDocumentFull } from '@/entities/normativ/model/types'
import { documentViewer } from '@/entities/normativ/lib/norm-document-view'
import { clampSheet, clampStart, revealSheet, sheetAt, shiftStart, stripImages, stripLabel, stripSheets, tileLabel } from '@/entities/normativ/lib/page-flipper'
import { FlipArrow } from './FlipArrow'
import { usePreloadSources, useStripSize, useSwipe } from './use-page-flipper'
import { NormPageReader } from './NormPageReader'

/**
 * Листалка документа в тёмной шапке под заголовком: полоса маленьких страниц (5 в ряд от 1280 px, иначе 3)
 * между круглыми стрелками, под каждой «Стр. N», общая подпись «Стр. 1–5 из 11», свайп на телефоне.
 * Стрелки сдвигают полосу на одну страницу; нажатие на страницу — окно чтения на ней. Картинки — видимые и соседние.
 * Без картинок, но с файлом — лист-заглушка с номером; без файла листалки нет («Документ по запросу» — в карточке).
 * На ПК полоса занимает всю свободную высоту левой колонки, так что её низ — вровень с низом карточки справа.
 */
export function NormPageFlipper({ document }: { document: NormDocumentFull }) {
  const view = useMemo(() => documentViewer(document), [document])
  const perRow = useStripSize()
  const [first, setFirst] = useState(1)
  const [sheet, setSheet] = useState(1)
  const [reading, setReading] = useState(false)
  // После закрытия окна фокус — снова на странице (на телефоне касание не ставит фокус на кнопку, и вернуть его некуда).
  const stripRef = useRef<HTMLDivElement>(null)
  const wasReading = useRef(false)
  const current = clampSheet(sheet, view.sheets)
  const start = clampStart(first, view.sheets, perRow)
  useEffect(() => {
    if (reading) wasReading.current = true
    else if (wasReading.current) {
      wasReading.current = false
      stripRef.current?.querySelector<HTMLElement>(`[data-sheet="${current}"]`)?.focus({ preventScroll: true })
    }
  }, [reading, current])
  const go = (delta: number) => setFirst(shiftStart(start, delta, view.sheets, perRow))
  const swipe = useSwipe(go)
  usePreloadSources(stripImages(view, start, perRow))

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

  const shown = stripSheets(start, view.sheets, perRow)
  const maxStart = clampStart(Number.MAX_SAFE_INTEGER, view.sheets, perRow)
  const open = (value: number) => {
    if (swipe.consumeSwipe()) return
    setSheet(value)
    setReading(true)
  }

  return (
    <section
      aria-label={`Документ ${document.code}: страницы`}
      className="normativ-flipper normativ-flipper--strip"
      style={{ '--strip-count': perRow } as CSSProperties}
    >
      <div className="normativ-strip-area" {...swipe.handlers}>
        <div className="normativ-strip-block">
          <FlipArrow direction={-1} disabled={start <= 1} onClick={() => go(-1)} />
          <div ref={stripRef} className="normativ-strip">
            {shown.map((value) => {
              const item = sheetAt(view, value)
              const name = tileLabel(view, value)
              return (
                <div key={value} className="normativ-tile">
                  <button
                    type="button"
                    data-sheet={value}
                    onClick={() => open(value)}
                    aria-haspopup="dialog"
                    aria-label={`${name}. Открыть крупно для чтения`}
                    className="normativ-sheet normativ-sheet--button normativ-sheet--tile"
                  >
                    {item.kind === 'page' ? (
                      <img
                        src={item.src}
                        alt={`Страница ${item.page}: ${document.code}`}
                        decoding="async"
                        draggable={false}
                        className="normativ-sheet-img"
                      />
                    ) : (
                      <span className="normativ-sheet-more normativ-sheet-more--tile">
                        <FiFileText className="h-5 w-5 text-[hsl(var(--primary))]" aria-hidden="true" />
                        <span className="mt-1 block">Дальше — в PDF</span>
                      </span>
                    )}
                  </button>
                  <span className="normativ-tile-label" aria-hidden="true">
                    {name}
                  </span>
                </div>
              )
            })}
          </div>
          <FlipArrow direction={1} disabled={start >= maxStart} onClick={() => go(1)} />
        </div>
      </div>
      <p className="normativ-flipper-label" aria-live="polite">
        {stripLabel(view, start, perRow)}
      </p>

      {reading && (
        <NormPageReader
          view={view}
          code={document.code}
          sheet={current}
          onSheetChange={(value) => {
            const next = clampSheet(value, view.sheets)
            setSheet(next)
            setFirst(revealSheet(start, next, view.sheets, perRow))
          }}
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
