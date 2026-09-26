// Мини-игра на дороге транзитной доставки: грузовик объезжает попутные машины на трёх полосах.
// Чистая логика без React и canvas: состояние, шаг, автопилот («второй водитель»), резкий тормоз.
// Координаты — CSS-пиксели холста; машины едут справа налево относительно грузовика.

export const POLOS = 3
export const DLINA_GRUZOVIKA = 40
export const KM_NA_PX = 0.1 // «без торможений» в км

const SKOROST = 170 // px/с — насколько грузовик быстрее попутного потока
const PEREKHOD = 7 // полос в секунду при перестроении
const DLINY_MASHIN = [26, 30, 34]
export const CVETOV_MASHIN = 5
const VPEREDI = 190 // автопилот начинает объезд, когда до машины ближе
const PROKHOD = 40 // через полосу можно пройти, если машина там дальше (успеть перестроиться)
const TORMOZ_S = 1.5 // сколько длится резкое торможение с разгоном
const NAZAD = -0.7 // при торможении поток обгоняет грузовик: доля от SKOROST

export interface Mashina {
  x: number
  polosa: number
  dlina: number
  cvet: number
}

export interface Igra {
  shirina: number
  vysota: number
  gruzovik: { x: number; y: number; cel: number }
  mashiny: Mashina[]
  doSpavna: number
  /** Пройдено с последнего торможения, px. */
  proydeno: number
  /** Общий сдвиг дороги — для разметки. */
  sdvig: number
  /** Сколько ещё секунд длится резкое торможение; 0 — едем. */
  tormoz: number
}

export type Sobytie = 'tormoz' | 'poehali' | null

export function novayaIgra(shirina: number, vysota: number): Igra {
  const x = Math.max(36, Math.round(shirina * 0.16))
  return {
    shirina,
    vysota,
    gruzovik: { x, y: 1, cel: 1 },
    mashiny: [],
    doSpavna: shirina * 0.4,
    proydeno: 0,
    sdvig: 0,
    tormoz: 0,
  }
}

/** Расстояние от носа грузовика до ближайшей машины впереди на полосе; отрицательное — машина рядом. */
export function blizhayshaya(igra: Igra, polosa: number): number {
  const { x } = igra.gruzovik
  let min = Infinity
  for (const m of igra.mashiny) {
    if (m.polosa !== polosa || m.x + m.dlina < x - 6) continue
    min = Math.min(min, m.x - (x + DLINA_GRUZOVIKA))
  }
  return min
}

/** Полоса, куда повёл бы грузовик второй водитель. */
export function avtopilot(igra: Igra): number {
  const cel = igra.gruzovik.cel
  const svoya = blizhayshaya(igra, cel)
  if (svoya >= VPEREDI) return cel
  let luchshaya = cel
  let luchsheeRasstoyanie = svoya
  for (let k = 0; k < POLOS; k++) {
    if (k === cel) continue
    const shag = k > cel ? 1 : -1
    let dostupna = true
    for (let p = cel + shag; p !== k + shag; p += shag) {
      if (blizhayshaya(igra, p) <= PROKHOD) dostupna = false
    }
    const rasstoyanie = blizhayshaya(igra, k)
    if (dostupna && rasstoyanie > luchsheeRasstoyanie + 1) {
      luchshaya = k
      luchsheeRasstoyanie = rasstoyanie
    }
  }
  return luchshaya
}

/** Грузовик вот-вот упрётся в машину (или уже задевает её) — пора резко тормозить. */
export function vplotnuyu(igra: Igra): boolean {
  const polosa = igra.vysota / POLOS
  const g = igra.gruzovik
  const gy = (g.y + 0.5) * polosa
  const gh = polosa * 0.28
  return igra.mashiny.some((m) => {
    const perekrytieX = Math.min(g.x + DLINA_GRUZOVIKA, m.x + m.dlina) - Math.max(g.x, m.x)
    const my = (m.polosa + 0.5) * polosa
    return perekrytieX > -2 && Math.abs(gy - my) < gh + polosa * 0.26 - 1
  })
}

// Машины появляются так, чтобы всегда оставался проезд: у «стенки» из двух машин свободна полоса,
// где предыдущая машина дальше всего; если и она близко — выезжает одна машина.
function spavn(igra: Igra, sluchaynoe: () => number) {
  const khvosty = [0, 1, 2].map((p) =>
    Math.max(-Infinity, ...igra.mashiny.filter((m) => m.polosa === p).map((m) => m.x + m.dlina)),
  )
  const svobodnaya = khvosty.indexOf(Math.min(...khvosty))
  const dve = sluchaynoe() < 0.28 && khvosty[svobodnaya] < igra.shirina - 200
  const polosy = dve
    ? [0, 1, 2].filter((p) => p !== svobodnaya)
    : [Math.floor(sluchaynoe() * POLOS)]
  for (const polosa of polosy) {
    igra.mashiny.push({
      x: igra.shirina + 10 + Math.round(sluchaynoe() * 16),
      polosa,
      dlina: DLINY_MASHIN[Math.floor(sluchaynoe() * DLINY_MASHIN.length)],
      cvet: Math.floor(sluchaynoe() * CVETOV_MASHIN),
    })
  }
  igra.doSpavna = dve ? 190 + sluchaynoe() * 70 : 110 + sluchaynoe() * 90
}

/** Скорость потока относительно грузовика: при торможении резко уходит в минус, потом разгон. */
function skorost(igra: Igra): number {
  if (igra.tormoz <= 0) return SKOROST
  const proshlo = TORMOZ_S - igra.tormoz
  const nazad = SKOROST * NAZAD
  if (proshlo < 0.2) return SKOROST + (nazad - SKOROST) * (proshlo / 0.2)
  if (proshlo < 1) return nazad
  return nazad + (SKOROST - nazad) * ((proshlo - 1) / (TORMOZ_S - 1))
}

/** Доля резкого торможения, пока горят стоп-сигналы (0…1). */
export const stopSignal = (igra: Igra) => (igra.tormoz > 0.5 ? 1 : igra.tormoz / 0.5)

/**
 * Один кадр. `polosaIgroka` — полоса под курсором/пальцем или null, тогда рулит автопилот.
 * Возвращает событие кадра: начали резко тормозить или снова поехали.
 */
export function shag(igra: Igra, dt: number, polosaIgroka: number | null, sluchaynoe: () => number): Sobytie {
  const t = Math.min(dt, 0.05)
  const d = skorost(igra) * t
  const g = igra.gruzovik
  igra.sdvig += d
  for (const m of igra.mashiny) {
    // Машины позади грузовика тормозить не заставляем — они просто уходят назад.
    m.x -= m.x + m.dlina < g.x ? Math.abs(d) : d
  }
  igra.mashiny = igra.mashiny.filter((m) => m.x + m.dlina > -10 && m.x < igra.shirina + 80)
  igra.doSpavna -= Math.max(0, d)
  if (igra.doSpavna <= 0) spavn(igra, sluchaynoe)

  g.cel = polosaIgroka ?? avtopilot(igra)
  const k = PEREKHOD * t
  g.y = g.y < g.cel ? Math.min(g.cel, g.y + k) : Math.max(g.cel, g.y - k)

  if (igra.tormoz > 0) {
    igra.tormoz = Math.max(0, igra.tormoz - t)
    return igra.tormoz === 0 ? 'poehali' : null
  }

  igra.proydeno += d
  if (vplotnuyu(igra)) {
    igra.tormoz = TORMOZ_S
    igra.proydeno = 0
    return 'tormoz'
  }
  return null
}

/** Полоса по вертикальной координате внутри дороги. */
export const polosaPoY = (y: number, vysota: number) =>
  Math.max(0, Math.min(POLOS - 1, Math.floor((y / vysota) * POLOS)))
