// Склады и направления отгрузки для карты на странице «Доставка».
// Координаты — центры городов, градусы. `podpis` — с какой стороны от точки подпись на карте.
// `sklady` — с каких складов везём в город. `izgib` — прогиб дуги от склада к городу
// в долях хорды: плюс — к северу, минус — к югу (по умолчанию 0.16), чтобы соседние дуги не сливались.

export type StoronaPodpisi = 'sverhu' | 'snizu' | 'sleva' | 'sprava'

/** Цвет маршрутов склада: основной — фирменный оранжевый, второй — синий. */
export type Ton = 'osnovnoy' | 'vtoroy'

export interface Sklad {
  id: string
  nazvanie: string
  /** «в Зеленодольске» — для легенды. */
  gde: string
  oblast: string
  /** Вторая строка подписи на карте. */
  primechanie: string
  dolgota: number
  shirota: number
  ton: Ton
  podpis: StoronaPodpisi
  /** На узком экране подпись без плашки: под точкой слева или справа от неё либо над точкой. */
  podpisNaTelefone: 'sleva' | 'sprava' | 'sverhu'
}

export interface Gorod {
  id: string
  nazvanie: string
  dolgota: number
  shirota: number
  podpis: StoronaPodpisi
  sklady: string[]
  izgib?: Record<string, number>
  /** Город вплотную к складу: отдельной точки и дуги на карте нет. */
  ryadomSoSkladom?: string
  /** Срок доставки из Казани (со склада в Зеленодольске) — со слов менеджера, 26.09.2026. */
  srok?: string
}

export interface Region {
  nazvanie: string
  goroda: Gorod[]
}

export const SKLADY: Sklad[] = [
  {
    id: 'zelenodolsk',
    nazvanie: 'Зеленодольск',
    gde: 'в Зеленодольске',
    oblast: 'Республика Татарстан',
    primechanie: 'склад под Казанью',
    dolgota: 48.518,
    shirota: 55.843,
    ton: 'osnovnoy',
    podpis: 'sverhu',
    podpisNaTelefone: 'sleva',
  },
  {
    id: 'ekaterinburg',
    nazvanie: 'Екатеринбург',
    gde: 'в Екатеринбурге',
    oblast: 'Свердловская область',
    primechanie: 'склад',
    dolgota: 60.605,
    shirota: 56.838,
    ton: 'vtoroy',
    podpis: 'sprava',
    podpisNaTelefone: 'sverhu',
  },
]

const Z = 'zelenodolsk'
const E = 'ekaterinburg'

export const REGIONY: Region[] = [
  {
    nazvanie: 'Центральная Россия',
    goroda: [
      { id: 'moskva', nazvanie: 'Москва', dolgota: 37.617, shirota: 55.756, podpis: 'sverhu', sklady: [Z], izgib: { [Z]: 0.32 }, srok: '2 дня' },
      { id: 'voronezh', nazvanie: 'Воронеж', dolgota: 39.2, shirota: 51.672, podpis: 'sleva', sklady: [Z], izgib: { [Z]: -0.1 }, srok: '2–3 дня' },
      { id: 'smolensk', nazvanie: 'Смоленск', dolgota: 32.045, shirota: 54.782, podpis: 'sleva', sklady: [Z], izgib: { [Z]: -0.12 }, srok: '2–3 дня' },
      { id: 'bryansk', nazvanie: 'Брянск', dolgota: 34.364, shirota: 53.243, podpis: 'sleva', sklady: [Z], izgib: { [Z]: -0.16 }, srok: '2–3 дня' },
    ],
  },
  {
    nazvanie: 'Северо-Запад',
    goroda: [
      { id: 'peterburg', nazvanie: 'Санкт-Петербург', dolgota: 30.316, shirota: 59.939, podpis: 'sprava', sklady: [Z], srok: '2–3 дня' },
    ],
  },
  {
    nazvanie: 'Поволжье и Приуралье',
    goroda: [
      { id: 'kazan', nazvanie: 'Казань', dolgota: 49.106, shirota: 55.796, podpis: 'sprava', sklady: [Z], ryadomSoSkladom: Z },
      { id: 'nizhniy', nazvanie: 'Нижний Новгород', dolgota: 44.002, shirota: 56.327, podpis: 'snizu', sklady: [Z], srok: '1–2 дня' },
      { id: 'samara', nazvanie: 'Самара', dolgota: 50.1, shirota: 53.195, podpis: 'sprava', sklady: [Z], srok: '1–2 дня' },
      { id: 'ufa', nazvanie: 'Уфа', dolgota: 55.958, shirota: 54.735, podpis: 'sleva', sklady: [Z, E], srok: '1–2 дня' },
      { id: 'perm', nazvanie: 'Пермь', dolgota: 56.229, shirota: 58.01, podpis: 'sverhu', sklady: [Z, E], srok: '2 дня' },
    ],
  },
  {
    nazvanie: 'Юг России',
    goroda: [
      { id: 'rostov', nazvanie: 'Ростов-на-Дону', dolgota: 39.718, shirota: 47.222, podpis: 'sprava', sklady: [Z], izgib: { [Z]: -0.14 }, srok: '3 дня' },
      { id: 'krasnodar', nazvanie: 'Краснодар', dolgota: 38.975, shirota: 45.035, podpis: 'sleva', sklady: [Z], izgib: { [Z]: 0.3 }, srok: '3–4 дня' },
      { id: 'volgograd', nazvanie: 'Волгоград', dolgota: 44.516, shirota: 48.708, podpis: 'sleva', sklady: [Z], srok: '2–3 дня' },
      { id: 'astrahan', nazvanie: 'Астрахань', dolgota: 48.033, shirota: 46.348, podpis: 'sprava', sklady: [Z], izgib: { [Z]: -0.16 }, srok: '3 дня' },
    ],
  },
  {
    nazvanie: 'Урал',
    goroda: [
      { id: 'ekaterinburg', nazvanie: 'Екатеринбург', dolgota: 60.605, shirota: 56.838, podpis: 'sverhu', sklady: [Z], srok: '2 дня' },
      { id: 'chelyabinsk', nazvanie: 'Челябинск', dolgota: 61.403, shirota: 55.16, podpis: 'snizu', sklady: [Z, E], srok: '2 дня' },
    ],
  },
  {
    nazvanie: 'Сибирь',
    goroda: [
      { id: 'novosibirsk', nazvanie: 'Новосибирск', dolgota: 82.92, shirota: 55.03, podpis: 'sverhu', sklady: [Z, E], izgib: { [E]: -0.08 }, srok: '4–5 дней' },
      { id: 'omsk', nazvanie: 'Омск', dolgota: 73.368, shirota: 54.989, podpis: 'snizu', sklady: [Z, E], izgib: { [Z]: 0.26, [E]: 0.1 }, srok: '3–4 дня' },
      { id: 'krasnoyarsk', nazvanie: 'Красноярск', dolgota: 92.867, shirota: 56.009, podpis: 'sverhu', sklady: [Z, E], izgib: { [Z]: 0.12 }, srok: '5–6 дней' },
    ],
  },
  {
    nazvanie: 'Казахстан',
    goroda: [
      { id: 'astana', nazvanie: 'Астана', dolgota: 71.449, shirota: 51.169, podpis: 'snizu', sklady: [Z, E], izgib: { [Z]: -0.14, [E]: -0.16 }, srok: '3–4 дня' },
    ],
  },
]
