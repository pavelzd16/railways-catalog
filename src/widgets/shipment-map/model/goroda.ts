// Склад и ключевые направления отгрузки для карты на странице «Доставка».
// Координаты — центры городов, градусы. `podpis` — с какой стороны от точки подпись на карте.
// `izgib` — прогиб дуги маршрута к северу в долях хорды (минус — к югу), чтобы соседние дуги не сливались.

export type StoronaPodpisi = 'sverhu' | 'snizu' | 'sleva' | 'sprava'

export interface Gorod {
  id: string
  nazvanie: string
  dolgota: number
  shirota: number
  podpis: StoronaPodpisi
  izgib?: number
}

export interface Region {
  nazvanie: string
  goroda: Gorod[]
}

export const SKLAD: Gorod = {
  id: 'zelenodolsk',
  nazvanie: 'Зеленодольск',
  dolgota: 48.518,
  shirota: 55.843,
  podpis: 'sverhu',
}

export const REGIONY: Region[] = [
  {
    nazvanie: 'Центральная Россия',
    goroda: [
      { id: 'moskva', nazvanie: 'Москва', dolgota: 37.617, shirota: 55.756, podpis: 'sverhu' },
      { id: 'smolensk', nazvanie: 'Смоленск', dolgota: 32.045, shirota: 54.782, podpis: 'sleva', izgib: -0.12 },
      { id: 'bryansk', nazvanie: 'Брянск', dolgota: 34.364, shirota: 53.243, podpis: 'sleva', izgib: -0.16 },
    ],
  },
  {
    nazvanie: 'Юг России',
    goroda: [
      { id: 'rostov', nazvanie: 'Ростов-на-Дону', dolgota: 39.718, shirota: 47.222, podpis: 'sprava', izgib: -0.14 },
      { id: 'krasnodar', nazvanie: 'Краснодар', dolgota: 38.975, shirota: 45.035, podpis: 'sleva', izgib: 0.3 },
      { id: 'astrahan', nazvanie: 'Астрахань', dolgota: 48.033, shirota: 46.348, podpis: 'sprava', izgib: -0.16 },
    ],
  },
  {
    nazvanie: 'Урал',
    goroda: [
      { id: 'ekaterinburg', nazvanie: 'Екатеринбург', dolgota: 60.605, shirota: 56.838, podpis: 'sverhu' },
      { id: 'chelyabinsk', nazvanie: 'Челябинск', dolgota: 61.403, shirota: 55.16, podpis: 'snizu' },
    ],
  },
  {
    nazvanie: 'Сибирь',
    goroda: [
      { id: 'novosibirsk', nazvanie: 'Новосибирск', dolgota: 82.92, shirota: 55.03, podpis: 'sverhu' },
    ],
  },
  {
    nazvanie: 'Казахстан',
    goroda: [
      { id: 'astana', nazvanie: 'Астана', dolgota: 71.449, shirota: 51.169, podpis: 'snizu', izgib: -0.14 },
    ],
  },
]
