// Листалка документа в шапке страницы и окно чтения: какой лист показан, подписи, какие картинки грузить, свайп.
// Чистые правила — без React, грузятся тестами node --test.
import type { DocumentViewer } from './norm-document-view.ts'

type FlipperView = Pick<DocumentViewer, 'pages' | 'pageCount' | 'more' | 'sheets'>

/** Надпись последнего листа у документа, чьи страницы не все в картинках: своих кнопок у листа нет — они в карточке. */
export const MORE_SHEET_TEXT = 'Дальше — в PDF-файле: скачать его можно в карточке документа'

export type Sheet = { kind: 'page'; page: number; src: string } | { kind: 'more'; from: number; to: number }

/** Номер листа в границах 1…sheets (листов нет — 1). */
export function clampSheet(sheet: number, sheets: number): number {
  const last = Math.max(1, Math.floor(sheets))
  if (!Number.isFinite(sheet)) return 1
  return Math.min(last, Math.max(1, Math.floor(sheet)))
}

/** Соседний лист: стрелки и клавиши листают по одному и не уходят за первый и последний. */
export function stepSheet(sheet: number, delta: number, sheets: number): number {
  return clampSheet(clampSheet(sheet, sheets) + delta, sheets)
}

export function sheetAt(view: FlipperView, sheet: number): Sheet {
  const index = clampSheet(sheet, view.sheets) - 1
  if (index < view.pages.length) return { kind: 'page', page: index + 1, src: view.pages[index] }
  return { kind: 'more', from: view.pages.length + 1, to: view.pageCount }
}

function moreRange({ from, to }: { from: number; to: number }): string {
  return to > from ? `${from}–${to}` : String(from)
}

/** Подпись под листом в шапке: «Стр. 3 из 11»; лист «Дальше» — «Стр. 101–130 — в PDF-файле». */
export function sheetLabel(view: FlipperView, sheet: number): string {
  const current = sheetAt(view, sheet)
  if (current.kind === 'more') return `Стр. ${moreRange(current)} — в PDF-файле`
  return `Стр. ${current.page} из ${view.pageCount}`
}

/** Счётчик в окне чтения: «3 / 11»; лист «Дальше» — «101–130 / 130». */
export function sheetCounter(view: FlipperView, sheet: number): string {
  const current = sheetAt(view, sheet)
  return `${current.kind === 'more' ? moreRange(current) : current.page} / ${view.pageCount}`
}

/** Картинки, которые нужны сейчас: текущая страница, затем следующая и предыдущая (остальные не грузятся). */
export function imagesToLoad(view: FlipperView, sheet: number): string[] {
  const current = clampSheet(sheet, view.sheets)
  const result: string[] = []
  for (const candidate of [current, current + 1, current - 1]) {
    const src = view.pages[candidate - 1]
    if (candidate >= 1 && src && !result.includes(src)) result.push(src)
  }
  return result
}

/** Свайп пальцем: влево — следующий лист (+1), вправо — предыдущий (−1); короткий или больше вертикальный — 0. */
export function swipeStep(dx: number, dy: number, threshold = 40): -1 | 0 | 1 {
  if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return 0
  return dx < 0 ? 1 : -1
}
