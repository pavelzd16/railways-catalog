import { useEffect, useState } from 'react'

const TYPE_MS = 110
const ERASE_MS = 45
const HOLD_MS = 1800
const GAP_MS = 500

/**
 * Подсказка поля, которая сама печатает примеры по одной букве, держит слово,
 * стирает и берёт следующее — покупатель видит, что сюда можно ввести название.
 * Пока `paused` (поле в фокусе или уже заполнено) и при «меньше движения»
 * в системе стоит неподвижная подсказка `still`. Сервер и первый кадр тоже
 * отдают `still`, поэтому гидратация не расходится.
 */
export function useTypingPlaceholder(
  phrases: readonly string[],
  still: string,
  paused: boolean,
) {
  const [text, setText] = useState(still)

  useEffect(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let phrase = 0
    let length = 0
    let erasing = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const current = phrases[phrase]
      length += erasing ? -1 : 1
      setText(current.slice(0, length))

      if (!erasing && length === current.length) {
        erasing = true
        timer = setTimeout(tick, HOLD_MS)
      } else if (erasing && length === 0) {
        erasing = false
        phrase = (phrase + 1) % phrases.length
        timer = setTimeout(tick, GAP_MS)
      } else {
        timer = setTimeout(tick, erasing ? ERASE_MS : TYPE_MS)
      }
    }

    timer = setTimeout(tick, GAP_MS)
    return () => clearTimeout(timer)
  }, [phrases, paused])

  return paused ? still : text
}
