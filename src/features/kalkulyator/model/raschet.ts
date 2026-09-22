import { izdelie, rels, type Istochnik } from './dannye.ts'

/** Рельсы: из одной величины (метры, тонны или штуки рельсов) получить все три. */
export function perevestiRelsy(relsId: string, kolvo: number, ed: 'm' | 't' | 'sht', dlinaRelsa: number) {
  const kgNaM = rels(relsId).kgNaM
  const metry = ed === 'm' ? kolvo : ed === 't' ? (kolvo * 1000) / kgNaM : kolvo * dlinaRelsa
  return {
    metry,
    tonny: (metry * kgNaM) / 1000,
    /** Сколько целых рельсов заданной длины покрывают эти метры */
    relsov: Math.ceil(metry / dlinaRelsa - 1e-9),
  }
}

/** Изделие: из штук или веса получить штуки и килограммы. По весу — только целые штуки. */
export function perevestiIzdelie(id: string, kolvo: number, ed: 'sht' | 'kg' | 't') {
  const kgNaSht = izdelie(id).kgNaSht
  const kg = ed === 'kg' ? kolvo : ed === 't' ? kolvo * 1000 : kolvo * kgNaSht
  const sht = ed === 'sht' ? kolvo : Math.floor(kg / kgNaSht + 1e-9)
  return { sht, kg: ed === 'sht' ? kg : sht * kgNaSht }
}

export type Shpaly = 'zhb' | 'der'
export type PutRels = 'R50' | 'R65' | 'R75'

export type VvodPuti = {
  /** длина участка в метрах */
  dlinaM: number
  relsId: PutRels
  dlinaRelsa: number
  shpaly: Shpaly
  /** шпал на километр */
  epura: number
  nakladkaId: string
  boltId: string
  /** только для ж/б шпал */
  podkladkaZhbId: string
  /** только для деревянных шпал */
  podkladkaDerId: string
  kostylId: string
  kostyleyNaPodkladku: number
}

export type Stroka = {
  name: string
  sht: number
  /** null — масса в стандарте не установлена */
  tonny: number | null
  istochnik?: Istochnik
  primechanie?: string
}

/** Сколько болтовых отверстий у накладки: по рисункам 2 и 4 ГОСТ 33184-2014. */
const OTVERSTIYA: Record<string, number> = {
  'nakl-r50-1': 6, 'nakl-r50-2': 4,
  'nakl-r65-1': 6, 'nakl-r65-2': 4, 'nakl-r65-3': 4, 'nakl-r65-4': 4,
}

/**
 * Что из справочника подходит к типу рельса. Диаметр стыкового болта — под отверстия
 * накладки: у накладок Р50 ⌀26 мм (болт М24), у Р65/Р75 ⌀30 мм (болт М27), ГОСТ 33184-2014.
 * Подкладки КБ по ГОСТ 16277-2016 — только для Р50 и Р65, поэтому Р75 — на деревянных шпалах.
 */
export const DLYA_RELSA: Record<PutRels, {
  nakladki: string[]; bolty: string[]; gayka: string
  podkladkiZhb: string[]; podkladkiDer: string[]
}> = {
  R50: {
    nakladki: ['nakl-r50-1', 'nakl-r50-2'],
    bolty: ['bs-m24-150', 'bs-2m24-140', 'bs-2m24-160'],
    gayka: 'g-m24-2',
    podkladkiZhb: ['p-kb50'],
    podkladkiDer: ['p-d50', 'p-sd50'],
  },
  R65: {
    nakladki: ['nakl-r65-1', 'nakl-r65-2', 'nakl-r65-3', 'nakl-r65-4'],
    bolty: ['bs-m27-130', 'bs-m27-160', 'bs-2m27-150', 'bs-2m27-180'],
    gayka: 'g-m27-2',
    podkladkiZhb: ['p-1kb65', 'p-2kb65'],
    podkladkiDer: ['p-d65', 'p-dn6-65', 'p-sd65'],
  },
  R75: {
    nakladki: ['nakl-r65-1', 'nakl-r65-2', 'nakl-r65-3', 'nakl-r65-4'],
    bolty: ['bs-m27-130', 'bs-m27-160', 'bs-2m27-150', 'bs-2m27-180'],
    gayka: 'g-m27-2',
    podkladkiZhb: [],
    podkladkiDer: ['p-d65', 'p-dn6-65', 'p-sd65'],
  },
}

/** Костылей на подкладку по умолчанию — число отверстий под костыли у Д65/Д50 (ГОСТ 32694-2014, рис. 1 и 4). */
export const OTVERSTIY_POD_KOSTYLI = 5

export function proveritPut(v: VvodPuti): string[] {
  const oshibki: string[] = []
  if (!(v.dlinaM > 0 && v.dlinaM <= 500000)) oshibki.push('Длина пути — от 1 до 500 000 м')
  if (!(v.dlinaRelsa >= 6 && v.dlinaRelsa <= 100)) oshibki.push('Длина рельса — от 6 до 100 м')
  if (!(v.epura >= 1000 && v.epura <= 3000)) oshibki.push('Эпюра — от 1000 до 3000 шпал на км')
  if (v.shpaly === 'zhb' && DLYA_RELSA[v.relsId].podkladkiZhb.length === 0) oshibki.push('Для Р75 подкладки КБ стандартом не предусмотрены — выберите деревянные шпалы')
  if (v.shpaly === 'der' && !(Number.isInteger(v.kostyleyNaPodkladku) && v.kostyleyNaPodkladku >= 1 && v.kostyleyNaPodkladku <= 8)) oshibki.push('Костылей на подкладку — от 1 до 8')
  return oshibki
}

function stroka(id: string, sht: number, primechanie?: string): Stroka {
  const item = izdelie(id)
  return { name: item.name, sht, tonny: (sht * item.kgNaSht) / 1000, istochnik: item.istochnik, primechanie }
}

/** Ведомость материалов на участок звеньевого пути (две рельсовые нити). */
export function rasschitatPut(v: VvodPuti): Stroka[] {
  const r = rels(v.relsId)
  const relsovVNiti = Math.ceil(v.dlinaM / v.dlinaRelsa - 1e-9)
  const relsov = relsovVNiti * 2
  const stykov = relsov
  const shpal = Math.ceil((v.dlinaM / 1000) * v.epura - 1e-9)
  const otverstiy = OTVERSTIYA[v.nakladkaId]
  const boltov = stykov * otverstiy
  const podkladok = shpal * 2

  const vedomost: Stroka[] = [
    {
      name: `Рельс ${r.name} длиной ${String(v.dlinaRelsa).replace('.', ',')} м`,
      sht: relsov,
      tonny: (relsov * v.dlinaRelsa * r.kgNaM) / 1000,
      istochnik: r.istochnik,
      primechanie: `${relsovVNiti} шт. на каждую из двух нитей`,
    },
    {
      name: v.shpaly === 'zhb' ? 'Шпала железобетонная' : 'Шпала деревянная',
      sht: shpal,
      tonny: null,
      primechanie: `эпюра ${v.epura} шт/км; масса шпалы стандартом не установлена`,
    },
    stroka(v.nakladkaId, stykov * 2, `2 накладки на стык, стык на каждый рельс`),
    stroka(v.boltId, boltov, `${otverstiy} болтов на стык — по числу отверстий накладки`),
    stroka(DLYA_RELSA[v.relsId].gayka, boltov, 'по гайке на болт; исп. 2 — по примечанию 2 к таблице А.1'),
  ]

  if (v.shpaly === 'zhb') {
    vedomost.push(
      stroka(v.podkladkaZhbId, podkladok, '2 подкладки на шпалу'),
      stroka('bz-m22-175', podkladok * 2, '2 на подкладку — по отверстиям подкладки КБ (ГОСТ 16277-2016, рис. 1–2)'),
      stroka('bk-m22-75', podkladok * 2, '2 на подкладку — по клеммным пазам подкладки КБ'),
      stroka('klemma-pk', podkladok * 2, 'по клемме на клеммный болт'),
      stroka('shaiba-2v', podkladok * 4, 'по шайбе на закладной и клеммный болт'),
      {
        name: 'Гайка М22 к закладным и клеммным болтам',
        sht: podkladok * 4,
        tonny: null,
        primechanie: 'по гайке на болт; масса в собранных стандартах не приводится',
      },
    )
  } else {
    vedomost.push(
      stroka(v.podkladkaDerId, podkladok, '2 подкладки на шпалу'),
      stroka(v.kostylId, podkladok * v.kostyleyNaPodkladku, `${v.kostyleyNaPodkladku} на подкладку`),
    )
  }
  return vedomost
}

export function itogoTonn(vedomost: Stroka[]): number {
  return vedomost.reduce((sum, row) => sum + (row.tonny ?? 0), 0)
}
