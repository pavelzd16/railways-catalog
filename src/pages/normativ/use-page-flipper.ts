// Общее у листалки в шапке и окна чтения: свайп и подгрузка соседних страниц.
import { useCallback, useEffect, useRef, type TouchEvent } from 'react'
import type { DocumentViewer } from '@/entities/normativ/lib/norm-document-view'
import { imagesToLoad, swipeStep } from '@/entities/normativ/lib/page-flipper'

/** Соседние страницы подгружаются заранее (после показа текущей), остальные — только когда до них долистают. */
export function usePreloadNeighbours(view: DocumentViewer, sheet: number) {
  useEffect(() => {
    for (const src of imagesToLoad(view, sheet).slice(1)) {
      const image = new Image()
      image.decoding = 'async'
      image.src = src
    }
  }, [view, sheet])
}

/** Свайп пальцем по листу: влево — дальше, вправо — назад; щипок двумя пальцами не листает. */
export function useSwipe(onStep: (delta: number) => void, threshold?: number) {
  const start = useRef<{ x: number; y: number } | null>(null)
  // Время последнего свайпа: браузер может прислать «клик» сразу после жеста — его не считаем нажатием.
  const swipedAt = useRef(0)
  // Свайп был только что (полсекунды) — «клик» по листу не открывает окно; ответ один раз.
  const consumeSwipe = useCallback(() => {
    const recent = Date.now() - swipedAt.current < 500
    swipedAt.current = 0
    return recent
  }, [])
  return {
    consumeSwipe,
    handlers: {
      onTouchStart: (event: TouchEvent) => {
        start.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null
      },
      onTouchEnd: (event: TouchEvent) => {
        const from = start.current
        start.current = null
        const touch = event.changedTouches[0]
        if (!from || !touch) return
        const step = swipeStep(touch.clientX - from.x, touch.clientY - from.y, threshold)
        if (step) {
          swipedAt.current = Date.now()
          onStep(step)
        }
      },
    },
  }
}
