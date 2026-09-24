import { useEffect, useState } from 'react'

const TYPE_MS = 220
const ERASE_MS = 90
const HOLD_MS = 1800
const GAP_MS = 500

/**
 * Сколько примеров уже показано. Общий счёт на всю вкладку: поле поиска
 * пересоздаётся при каждом переходе по сайту (и в шапке их два — для широкого
 * экрана и для телефона), а круг примеров должен пройти один раз.
 */
const shown = { count: 0 }

/**
 * Подсказка поля, которая сама печатает примеры по одной букве, держит слово,
 * стирает и берёт следующее — покупатель видит, что сюда можно ввести название.
 * Пройдя все примеры один раз, по буквам набирает `still` и оставляет её
 * насовсем. Пока `paused` (поле в фокусе или уже заполнено) и при «меньше
 * движения» в системе стоит `still`. Сервер и первый кадр тоже отдают `still`,
 * поэтому гидратация не расходится.
 */
export function useTypingPlaceholder(
  phrases: readonly string[],
  still: string,
  paused: boolean,
) {
  const [text, setText] = useState(still)
  const [finished, setFinished] = useState(() => shown.count >= phrases.length)

  useEffect(() => {
    if (paused || finished) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Последней набирается сама `still` — её не стираем.
    const sequence = [...phrases, still]
    let phrase = shown.count
    let length = 0
    let erasing = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const current = sequence[phrase]
      const last = phrase === sequence.length - 1
      length += erasing ? -1 : 1
      setText(current.slice(0, length))

      if (!erasing && length === current.length) {
        if (last) {
          setFinished(true)
          return
        }
        erasing = true
        timer = setTimeout(tick, HOLD_MS)
      } else if (erasing && length === 0) {
        erasing = false
        phrase += 1
        shown.count = Math.max(shown.count, phrase)
        timer = setTimeout(tick, GAP_MS)
      } else {
        timer = setTimeout(tick, erasing ? ERASE_MS : TYPE_MS)
      }
    }

    timer = setTimeout(tick, GAP_MS)
    return () => clearTimeout(timer)
  }, [phrases, still, paused, finished])

  return paused || finished ? still : text
}
