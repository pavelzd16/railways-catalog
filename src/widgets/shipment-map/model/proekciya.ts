// Коническая равновеликая проекция Альберса для карты отгрузок: европейская Россия,
// Урал, Западная Сибирь и север Казахстана без заметных искажений.
// Контуры в kontury.ts построены этой же функцией (генератор — tatrels/reference/karta-otgruzok),
// поэтому константы ниже без пересборки контуров не менять.

const RAD = Math.PI / 180
const PARALLEL_1 = 47 * RAD
const PARALLEL_2 = 60 * RAD
const CENTR_SHIROTA = 52 * RAD
const CENTR_DOLGOTA = 57

const N = (Math.sin(PARALLEL_1) + Math.sin(PARALLEL_2)) / 2
const C = Math.cos(PARALLEL_1) ** 2 + 2 * N * Math.sin(PARALLEL_1)
const RHO_0 = Math.sqrt(C - 2 * N * Math.sin(CENTR_SHIROTA)) / N

// Рамка в единицах проекции: запад, восток, юг, север.
const RAMKA = { zapad: -0.36, vostok: 0.32, yug: -0.21, sever: 0.17 }

export const SHIRINA = 1000
const MASSHTAB = SHIRINA / (RAMKA.vostok - RAMKA.zapad)
export const VYSOTA = Math.round((RAMKA.sever - RAMKA.yug) * MASSHTAB)

/** Долгота/широта в градусах → точка в координатах viewBox (0…SHIRINA, 0…VYSOTA, y вниз). */
export function naKarte(dolgota: number, shirota: number): [number, number] {
  const rho = Math.sqrt(C - 2 * N * Math.sin(shirota * RAD)) / N
  const theta = N * (dolgota - CENTR_DOLGOTA) * RAD
  const x = rho * Math.sin(theta)
  const y = RHO_0 - rho * Math.cos(theta)
  return [(x - RAMKA.zapad) * MASSHTAB, (RAMKA.sever - y) * MASSHTAB]
}
