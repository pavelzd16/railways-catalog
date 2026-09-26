// Геометрия и тайминги анимации маршрутов «склад → город». Чистые функции, без React.

import { REGIONY, SKLADY, type Gorod, type Sklad } from './goroda.ts'
import { naKarte, SHIRINA, VYSOTA } from './proekciya.ts'

export interface Tochka {
  x: number
  y: number
}

export interface TochkaSklada extends Tochka {
  sklad: Sklad
}

export interface TochkaGoroda extends Tochka {
  gorod: Gorod
  /** Номер первой дуги к городу — точка появляется, когда дуга дорисована. */
  nomer: number
}

export interface Marshrut extends Tochka {
  id: string
  sklad: Sklad
  gorod: Gorod
  /** SVG-путь дуги от склада к городу; x, y — её конец. */
  put: string
  dlina: number
  /** Период одного рейса вагончика, с. */
  period: number
  /** Сдвиг старта рейса, с. */
  start: number
  nomer: number
}

const IZGIB = 0.16 // прогиб дуги по умолчанию, доля хорды
const SKOROST = 130 // единиц viewBox в секунду
export const DOLYA_V_PUTI = 0.8 // остаток периода вагончик «стоит» в пункте назначения

const okrugl = (v: number) => Math.round(v * 10) / 10

function tochka(dolgota: number, shirota: number): Tochka {
  const [x, y] = naKarte(dolgota, shirota)
  return { x: okrugl(x), y: okrugl(y) }
}

export const TOCHKI_SKLADOV: TochkaSklada[] = SKLADY.map((sklad) => ({ sklad, ...tochka(sklad.dolgota, sklad.shirota) }))

export const VSE_GORODA: Gorod[] = REGIONY.flatMap((region) => region.goroda)

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

function marshrut(sklad: TochkaSklada, gorod: Gorod, nomer: number): Marshrut {
  const { x: x0, y: y0 } = sklad
  const { x: x1, y: y1 } = tochka(gorod.dolgota, gorod.shirota)
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
  const izgib = gorod.izgib?.[sklad.sklad.id] ?? IZGIB
  const cx = okrugl((x0 + x1) / 2 + nx * horda * izgib)
  const cy = okrugl((y0 + y1) / 2 + ny * horda * izgib)
  const dlina = dlinaKrivoy(x0, y0, cx, cy, x1, y1)
  return {
    id: `${sklad.sklad.id}-${gorod.id}`,
    sklad: sklad.sklad,
    gorod,
    x: x1,
    y: y1,
    put: `M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}`,
    dlina,
    period: okrugl(Math.max(2.4, dlina / SKOROST / DOLYA_V_PUTI)),
    start: okrugl((nomer * 0.37) % 4),
    nomer,
  }
}

// Сначала все дуги первого склада, потом второго — в этом порядке они и прорисовываются.
export const MARSHRUTY: Marshrut[] = TOCHKI_SKLADOV.flatMap((sklad) =>
  VSE_GORODA.filter((gorod) => !gorod.ryadomSoSkladom && gorod.sklady.includes(sklad.sklad.id)).map(
    (gorod) => [sklad, gorod] as const,
  ),
).map(([sklad, gorod], nomer) => marshrut(sklad, gorod, nomer))

const ID_SKLADOV = new Set(SKLADY.map((sklad) => sklad.id))

/** Города со своей точкой на карте: без тех, что вплотную к складу, и без самих складов. */
export const GORODA_NA_KARTE: TochkaGoroda[] = VSE_GORODA.filter(
  (gorod) => !gorod.ryadomSoSkladom && !ID_SKLADOV.has(gorod.id),
).map((gorod) => ({
  gorod,
  ...tochka(gorod.dolgota, gorod.shirota),
  nomer: Math.min(...MARSHRUTY.filter((m) => m.gorod.id === gorod.id).map((m) => m.nomer)),
}))

export const RAZMER = { shirina: SHIRINA, vysota: VYSOTA }
