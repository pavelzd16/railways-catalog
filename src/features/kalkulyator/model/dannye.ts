/**
 * Справочные массы для калькулятора ВСП.
 *
 * Каждое число взято из текста стандарта: у записи указан документ и место в нём
 * (таблица, пункт, приложение). Ничего не пересчитано и не взято с чужих сайтов —
 * если стандарт массу не даёт (путевые шурупы, шпалы), позиции здесь нет.
 * Копии стандартов и страницы, с которых снято каждое значение, лежат вне
 * репозитория: tatrels/reference/kalkulyator/istochniki.
 *
 * Справочник составлен ООО «ИНВИА» для traer.ru 22 сентября 2026 года.
 * © ООО «ИНВИА». Состав, порядок и формулировки записей — наши; числа взяты
 * из стандартов и общим достоянием остаются.
 */

export type Istochnik = { doc: string; mesto: string }

export type Rels = {
  id: string
  name: string
  gruppa: string
  kgNaM: number
  istochnik: Istochnik
}

export type Izdelie = {
  id: string
  gruppa: string
  name: string
  kgNaSht: number
  istochnik: Istochnik
}

const R51685 = { doc: 'ГОСТ Р 51685-2013', mesto: 'приложение Д, таблица Д.1' }
const R7173 = { doc: 'ГОСТ 7173-54', mesto: 'пункт 5' }
const R6368 = { doc: 'ГОСТ 6368-82', mesto: 'приложение 1' }
const R4121 = { doc: 'ГОСТ 4121-96', mesto: 'таблица 2' }

export const RELSY: Rels[] = [
  { id: 'R50', name: 'Р50', gruppa: 'Магистральные', kgNaM: 51.8, istochnik: R51685 },
  { id: 'R65', name: 'Р65', gruppa: 'Магистральные', kgNaM: 64.88, istochnik: R51685 },
  { id: 'R65K', name: 'Р65К', gruppa: 'Магистральные', kgNaM: 64.67, istochnik: R51685 },
  { id: 'R75', name: 'Р75', gruppa: 'Магистральные', kgNaM: 74.6, istochnik: R51685 },
  { id: 'R43', name: 'Р43', gruppa: 'Для промышленного транспорта', kgNaM: 44.653, istochnik: R7173 },
  { id: 'R8', name: 'Р8', gruppa: 'Узкоколейные', kgNaM: 8.42, istochnik: R6368 },
  { id: 'R11', name: 'Р11', gruppa: 'Узкоколейные', kgNaM: 11.18, istochnik: R6368 },
  { id: 'R18', name: 'Р18', gruppa: 'Узкоколейные', kgNaM: 17.91, istochnik: R6368 },
  { id: 'R24', name: 'Р24', gruppa: 'Узкоколейные', kgNaM: 24.9, istochnik: R6368 },
  { id: 'KR70', name: 'КР70', gruppa: 'Крановые', kgNaM: 46.1, istochnik: R4121 },
  { id: 'KR80', name: 'КР80', gruppa: 'Крановые', kgNaM: 59.81, istochnik: R4121 },
  { id: 'KR100', name: 'КР100', gruppa: 'Крановые', kgNaM: 83.09, istochnik: R4121 },
  { id: 'KR120', name: 'КР120', gruppa: 'Крановые', kgNaM: 113.47, istochnik: R4121 },
  { id: 'KR140', name: 'КР140', gruppa: 'Крановые', kgNaM: 141.7, istochnik: R4121 },
]

/** Длины рельсов с болтовыми отверстиями по ГОСТ Р 51685-2013, п. 5.2.2 — самые ходовые. */
export const DLINY_RELSA = [25, 12.5]

const B11530 = { doc: 'ГОСТ 11530-2014', mesto: 'приложение А, таблица А.1' }
const G11532 = { doc: 'ГОСТ 11532-2014', mesto: 'приложение А, таблица А.1' }
const B16016 = { doc: 'ГОСТ 16016-2014', mesto: 'пункт 5.1.6, рисунок 1' }
const B16017 = { doc: 'ГОСТ 16017-2014', mesto: 'пункт 5.1.9, рисунок 1' }
const SH21797 = { doc: 'ГОСТ 21797-2014', mesto: 'пункт 5.1.11 (в ред. Изменения № 1)' }
const K22343 = { doc: 'ГОСТ 22343-90', mesto: 'приложение 1' }
const K5812 = { doc: 'ГОСТ 5812-2014', mesto: 'приложение А, таблица А.1' }
const P16277 = { doc: 'ГОСТ 16277-2016', mesto: 'приложение А, таблица А.1' }
const P32694 = { doc: 'ГОСТ 32694-2014', mesto: 'приложение А, таблица А.1' }
const N50 = { doc: 'ГОСТ 33184-2014', mesto: 'приложение А, рисунок 2' }
const N65 = { doc: 'ГОСТ 33184-2014', mesto: 'приложение Б, рисунок 4' }

export const GRUPPY = [
  'Накладки',
  'Болты стыковые',
  'Гайки к стыковым болтам',
  'Подкладки',
  'Болты закладные и клеммные',
  'Клеммы и шайбы',
  'Костыли',
] as const

export const IZDELIYA: Izdelie[] = [
  { id: 'nakl-r50-1', gruppa: 'Накладки', name: 'Накладка Р50, исп. 1 — 6 отверстий, 820 мм', kgNaSht: 18.74, istochnik: N50 },
  { id: 'nakl-r50-2', gruppa: 'Накладки', name: 'Накладка Р50, исп. 2 — 4 отверстия, 540 мм', kgNaSht: 12.23, istochnik: N50 },
  { id: 'nakl-r50-3', gruppa: 'Накладки', name: 'Накладка Р50, исп. 3 — для стрелочных переводов, 820 мм', kgNaSht: 18.93, istochnik: N50 },
  { id: 'nakl-r65-1', gruppa: 'Накладки', name: 'Накладка Р65/Р75, исп. 1 — 6 отверстий, 1000 мм', kgNaSht: 29.44, istochnik: N65 },
  { id: 'nakl-r65-2', gruppa: 'Накладки', name: 'Накладка Р65/Р75, исп. 2 — 4 отверстия, 800 мм', kgNaSht: 23.66, istochnik: N65 },
  { id: 'nakl-r65-3', gruppa: 'Накладки', name: 'Накладка Р65/Р75, исп. 3 — 4 отверстия, 800 мм', kgNaSht: 23.82, istochnik: N65 },
  { id: 'nakl-r65-4', gruppa: 'Накладки', name: 'Накладка Р65/Р75, исп. 4 — 4 отверстия, 900 мм', kgNaSht: 26.73, istochnik: N65 },
  { id: 'nakl-r65-5', gruppa: 'Накладки', name: 'Накладка Р65/Р75, исп. 5 — для стрелочных переводов, 1000 мм', kgNaSht: 29.72, istochnik: N65 },

  { id: 'bs-m22-135', gruppa: 'Болты стыковые', name: 'Болт стыковой М22×135', kgNaSht: 0.448, istochnik: B11530 },
  { id: 'bs-m24-150', gruppa: 'Болты стыковые', name: 'Болт стыковой М24×150', kgNaSht: 0.585, istochnik: B11530 },
  { id: 'bs-m27-130', gruppa: 'Болты стыковые', name: 'Болт стыковой М27×130', kgNaSht: 0.696, istochnik: B11530 },
  { id: 'bs-m27-160', gruppa: 'Болты стыковые', name: 'Болт стыковой М27×160', kgNaSht: 0.818, istochnik: B11530 },
  { id: 'bs-2m22-140', gruppa: 'Болты стыковые', name: 'Болт стыковой 2М22×140 (для изолирующих стыков)', kgNaSht: 0.449, istochnik: B11530 },
  { id: 'bs-2m24-140', gruppa: 'Болты стыковые', name: 'Болт стыковой 2М24×140 (для изолирующих стыков)', kgNaSht: 0.522, istochnik: B11530 },
  { id: 'bs-2m24-160', gruppa: 'Болты стыковые', name: 'Болт стыковой 2М24×160 (для изолирующих стыков)', kgNaSht: 0.592, istochnik: B11530 },
  { id: 'bs-2m27-150', gruppa: 'Болты стыковые', name: 'Болт стыковой 2М27×150 (для изолирующих стыков)', kgNaSht: 0.75, istochnik: B11530 },
  { id: 'bs-2m27-180', gruppa: 'Болты стыковые', name: 'Болт стыковой 2М27×180 (для изолирующих стыков)', kgNaSht: 0.872, istochnik: B11530 },

  { id: 'g-m22-1', gruppa: 'Гайки к стыковым болтам', name: 'Гайка М22, исп. 1', kgNaSht: 0.154, istochnik: G11532 },
  { id: 'g-m22-2', gruppa: 'Гайки к стыковым болтам', name: 'Гайка М22, исп. 2', kgNaSht: 0.152, istochnik: G11532 },
  { id: 'g-m24-1', gruppa: 'Гайки к стыковым болтам', name: 'Гайка М24, исп. 1', kgNaSht: 0.155, istochnik: G11532 },
  { id: 'g-m24-2', gruppa: 'Гайки к стыковым болтам', name: 'Гайка М24, исп. 2', kgNaSht: 0.153, istochnik: G11532 },
  { id: 'g-m27-1', gruppa: 'Гайки к стыковым болтам', name: 'Гайка М27, исп. 1', kgNaSht: 0.222, istochnik: G11532 },
  { id: 'g-m27-2', gruppa: 'Гайки к стыковым болтам', name: 'Гайка М27, исп. 2', kgNaSht: 0.22, istochnik: G11532 },

  { id: 'p-1kb65', gruppa: 'Подкладки', name: 'Подкладка 1 КБ65 (ж/б шпалы, Р65)', kgNaSht: 7.0, istochnik: P16277 },
  { id: 'p-2kb65', gruppa: 'Подкладки', name: 'Подкладка 2 КБ65 (ж/б шпалы, Р65)', kgNaSht: 6.85, istochnik: P16277 },
  { id: 'p-kb50', gruppa: 'Подкладки', name: 'Подкладка КБ50 (ж/б шпалы, Р50)', kgNaSht: 6.85, istochnik: P16277 },
  { id: 'p-kd65', gruppa: 'Подкладки', name: 'Подкладка КД65 (деревянные шпалы, Р65)', kgNaSht: 9.7, istochnik: P16277 },
  { id: 'p-kd50', gruppa: 'Подкладки', name: 'Подкладка КД50 (деревянные шпалы, Р50)', kgNaSht: 9.6, istochnik: P16277 },
  { id: 'p-sk65', gruppa: 'Подкладки', name: 'Подкладка СК65', kgNaSht: 8.3, istochnik: P16277 },
  { id: 'p-sk50', gruppa: 'Подкладки', name: 'Подкладка СК50', kgNaSht: 8.3, istochnik: P16277 },
  { id: 'p-d65', gruppa: 'Подкладки', name: 'Подкладка Д65 костыльная (Р65, Р75)', kgNaSht: 7.66, istochnik: P32694 },
  { id: 'p-dn6-65', gruppa: 'Подкладки', name: 'Подкладка ДН6-65 костыльная (Р65, Р75)', kgNaSht: 7.78, istochnik: P32694 },
  { id: 'p-sd65', gruppa: 'Подкладки', name: 'Подкладка СД65 костыльная (Р65, Р75)', kgNaSht: 7.22, istochnik: P32694 },
  { id: 'p-d50', gruppa: 'Подкладки', name: 'Подкладка Д50 костыльная (Р50)', kgNaSht: 6.2, istochnik: P32694 },
  { id: 'p-sd50', gruppa: 'Подкладки', name: 'Подкладка СД50 костыльная (Р50)', kgNaSht: 6.5, istochnik: P32694 },

  { id: 'bz-m22-175', gruppa: 'Болты закладные и клеммные', name: 'Болт закладной М22×175', kgNaSht: 0.635, istochnik: B16017 },
  { id: 'bk-m22-75', gruppa: 'Болты закладные и клеммные', name: 'Болт клеммный М22×75, исп. 1', kgNaSht: 0.345, istochnik: B16016 },
  { id: 'bk-m22-75-obl', gruppa: 'Болты закладные и клеммные', name: 'Болт клеммный М22×75, исп. 1 с облегчённой головкой', kgNaSht: 0.32, istochnik: B16016 },
  { id: 'bk-m22-65', gruppa: 'Болты закладные и клеммные', name: 'Болт клеммный М22×65, исп. 2', kgNaSht: 0.32, istochnik: B16016 },

  { id: 'klemma-pk', gruppa: 'Клеммы и шайбы', name: 'Клемма жёсткая ПК', kgNaSht: 0.64, istochnik: K22343 },
  { id: 'shaiba-2v', gruppa: 'Клеммы и шайбы', name: 'Шайба пружинная двухвитковая (к болтам М22 и шурупам ⌀24)', kgNaSht: 0.12, istochnik: SH21797 },

  { id: 'k-16-165', gruppa: 'Костыли', name: 'Костыль 16×16×165', kgNaSht: 0.378, istochnik: K5812 },
  { id: 'k-16-205', gruppa: 'Костыли', name: 'Костыль 16×16×205', kgNaSht: 0.458, istochnik: K5812 },
  { id: 'k-16-230', gruppa: 'Костыли', name: 'Костыль 16×16×230', kgNaSht: 0.509, istochnik: K5812 },
  { id: 'k-16-280', gruppa: 'Костыли', name: 'Костыль 16×16×280', kgNaSht: 0.609, istochnik: K5812 },
  { id: 'k-14-130', gruppa: 'Костыли', name: 'Костыль 14×14×130', kgNaSht: 0.2, istochnik: K5812 },
  { id: 'k-12-165', gruppa: 'Костыли', name: 'Костыль 12×12×165', kgNaSht: 0.135, istochnik: K5812 },
]

export function izdelie(id: string): Izdelie {
  const found = IZDELIYA.find((item) => item.id === id)
  if (!found) throw new Error(`Нет изделия ${id}`)
  return found
}

export function rels(id: string): Rels {
  const found = RELSY.find((item) => item.id === id)
  if (!found) throw new Error(`Нет рельса ${id}`)
  return found
}
