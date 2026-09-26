// Геометрия и тайминги анимации маршрутов «склад → город». Чистые функции, без React.

import { REGIONY, SKLAD, type Gorod } from './goroda.ts'
import { naKarte, SHIRINA, VYSOTA } from './proekciya.ts'

export interface Tochka {
  gorod: Gorod
  x: number
  y: number
}

export interface Marshrut extends Tochka {
  region: string
  /** SVG-путь дуги от склада к городу. */
  put: string
  dlina: number
  /** Период одного рейса вагончика, с. */
  period: number
  /** Сдвиг старта рейса, с. */
  start: number
}

const IZGIB = 0.16 // прогиб дуги по умолчанию, доля хорды
const SKOROST = 130 // единиц viewBox в секунду
export const DOLYA_V_PUTI = 0.8 // остаток периода вагончик «стоит» в пункте назначения

const okrugl = (v: number) => Math.round(v * 10) / 10

function tochka(gorod: Gorod): Tochka {
  const [x, y] = naKarte(gorod.dolgota, gorod.shirota)
  return { gorod, x: okrugl(x), y: okrugl(y) }
}

export const TOCHKA_SKLADA = tochka(SKLAD)

function dlinaKrivoy(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number) {
  let dlina = 0
  let px = x0
  let py = y0
  for (let i = 1; i <= 48; i++) {
    const t = i / 48
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1
    dlina += Math.hypot(x - px, y - py)
    px = x
    py = y
  }
  return dlina
}

function marshrut(region: string, cel: Tochka, nomer: number): Marshrut {
  const { x: x0, y: y0 } = TOCHKA_SKLADA
  const { x: x1, y: y1 } = cel
  const dx = x1 - x0
  const dy = y1 - y0
  const horda = Math.hypot(dx, dy)
  // Нормаль к хорде, повёрнутая к северу; знак izgib выбирает сторону.
  let nx = -dy / horda
  let ny = dx / horda
  if (ny > 0) {
    nx = -nx
    ny = -ny
  }
  const izgib = cel.gorod.izgib ?? IZGIB
  const cx = okrugl((x0 + x1) / 2 + nx * horda * izgib)
  const cy = okrugl((y0 + y1) / 2 + ny * horda * izgib)
  const dlina = dlinaKrivoy(x0, y0, cx, cy, x1, y1)
  return {
    ...cel,
    region,
    put: `M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}`,
    dlina,
    period: okrugl(Math.max(2.4, dlina / SKOROST / DOLYA_V_PUTI)),
    start: okrugl(nomer * 0.45),
  }
}

export const MARSHRUTY: Marshrut[] = REGIONY.flatMap((region) => region.goroda.map((gorod) => ({ region: region.nazvanie, gorod }))).map(
  ({ region, gorod }, nomer) => marshrut(region, tochka(gorod), nomer),
)

export const RAZMER = { shirina: SHIRINA, vysota: VYSOTA }
