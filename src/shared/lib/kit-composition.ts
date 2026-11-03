/**
 * «Состав комплекта» в карточке комплекта скрепления: какие детали, сколько штук, масса, ГОСТ и наша карточка детали.
 * Источник количеств и масс — Альбом чертежей верхнего строения железнодорожного пути (МПС, 1995), табл. 20
 * «Детали, входящие в комплект узла раздельного промежуточного скрепления КБ65»; номера позиций — по черт. 77 альбома.
 * Количества в таблице — на один узел (одна рельсовая нить на одной шпале); на шпалу идут два узла.
 * Ссылки на детали — адреса карточек на 03.11.2026; если товар переедет в другой раздел, сервер отдаст 301 по slug.
 */
export type KitPart = {
  /** Номер позиции на схеме. */
  pos: number
  name: string
  /** Штук в одном узле. */
  perNode: number
  /** Масса одной детали, кг. */
  massKg: number
  /** Номер стандарта текстом и адрес его страницы в /normativ, если она есть. */
  standard?: { code: string; slug?: string }
  /** Наша карточка этой детали. */
  product?: { sku: string; href: string }
}

export type Kit = {
  /** Заголовок над таблицей. */
  name: string
  /** Сколько узлов в одном комплекте этой карточки. */
  nodes: number
  /** «на шпалу» / «на узел» — подпись к столбцу количества. */
  unitLabel: string
  parts: KitPart[]
  source: string
}

const KB65_PARTS: KitPart[] = [
  { pos: 1, name: 'Прокладка под подкладку ЦП-328', perNode: 1, massKg: 0.64, standard: { code: 'ГОСТ 34078-2017', slug: 'gost-34078-2017' }, product: { sku: 'TM-0065', href: '/catalog/prokladki-amortizatsionnye-zhd-rels/rezinovye-prokladki-dlya-zhd-rels/product/prokladka-podkladochnaya-tsp-328-kb-65' } },
  { pos: 2, name: 'Подкладка КБ-65', perNode: 1, massKg: 7.0, standard: { code: 'ГОСТ 16277-2016', slug: 'gost-16277-2016' }, product: { sku: 'TM-0021', href: '/catalog/zhd-podkladki/podkladki-razdelnogo-skrepleniya/product/podkladka-kb-65-tm0021' } },
  { pos: 3, name: 'Гайка М22', perNode: 4, massKg: 0.126, standard: { code: 'ГОСТ 16018-2014', slug: 'gost-16018-2014' }, product: { sku: 'TM-0015', href: '/catalog/zhd-krepezh/gajki-dlya-boltov-relsovykh-stykov/product/gajka-m22' } },
  { pos: 4, name: 'Болт клеммный М22×75', perNode: 2, massKg: 0.345, standard: { code: 'ГОСТ 16016-2014', slug: 'gost-16016-2014' }, product: { sku: 'TM-0010', href: '/catalog/zhd-krepezh/zheleznodorozhnye-bolty/product/bolt-klemmnyj-m22h75' } },
  { pos: 5, name: 'Шайба двухвитковая 25', perNode: 4, massKg: 0.12, standard: { code: 'ГОСТ 21797-2014', slug: 'gost-21797-2014' }, product: { sku: 'TM-0958', href: '/catalog/zhd-krepezh/zheleznodorozhnye-shajby/product/shajba-dvuhvitkovaya-m25' } },
  { pos: 6, name: 'Клемма ПК', perNode: 2, massKg: 0.62, standard: { code: 'ГОСТ 22343-2014', slug: 'gost-22343-2014' }, product: { sku: 'TM-0050', href: '/catalog/zhd-krepezh/klemma-pk/product/klemma-pk' } },
  { pos: 7, name: 'Болт закладной М22×175', perNode: 2, massKg: 0.635, standard: { code: 'ГОСТ 16017-2014', slug: 'gost-16017-2014' }, product: { sku: 'TM-0033', href: '/catalog/zhd-krepezh/zheleznodorozhnye-bolty/product/bolt-zakladnoj-m22h175' } },
  { pos: 8, name: 'Скоба ЦП-138 для изолирующей втулки', perNode: 2, massKg: 0.09, standard: { code: 'чертёж ЦП-138' }, product: { sku: 'TM-0812', href: '/catalog/zhd-krepezh/zheleznodorozhnye-shajby/product/shajba-skoba-ploskaya-cp-138' } },
  { pos: 9, name: 'Втулка изолирующая ЦП-142', perNode: 2, massKg: 0.04, standard: { code: 'ТУ 3185-024-55239716-2006', slug: 'tu-3185-024-55239716-2006' }, product: { sku: 'TM-0023', href: '/catalog/izolyatsiya-rels/vtulka-izoliruyushchaya-tsp-142/product/vtulka-izoliruyushhaya-tsp-142' } },
  { pos: 10, name: 'Прокладка подрельсовая ЦП-143', perNode: 1, massKg: 0.23, standard: { code: 'ГОСТ 34078-2017', slug: 'gost-34078-2017' }, product: { sku: 'TM-0046', href: '/catalog/prokladki-amortizatsionnye-zhd-rels/rezinovye-prokladki-dlya-zhd-rels/product/prokladka-podrelsovaya-tsp-143' } },
]

const KB65_SOURCE = 'Состав и масса деталей — по Альбому чертежей верхнего строения железнодорожного пути (МПС, 1995), табл. 20, номера позиций — по черт. 77.'

const KITS: Record<string, Kit> = {
  'TM-0890': { name: 'Состав комплекта КБ-65 на одну шпалу', nodes: 2, unitLabel: 'на шпалу', parts: KB65_PARTS, source: KB65_SOURCE },
  'TM-0756': { name: 'Состав комплекта КБ-65 на один узел', nodes: 1, unitLabel: 'на узел', parts: KB65_PARTS, source: KB65_SOURCE },
}

export function kitForSku(sku: string | null | undefined): Kit | undefined {
  return sku ? KITS[sku] : undefined
}

/** Масса всех деталей комплекта, кг, с округлением до 0,1. */
export function kitMassKg(kit: Kit): number {
  const total = kit.parts.reduce((sum, part) => sum + part.perNode * kit.nodes * part.massKg, 0)
  return Math.round(total * 10) / 10
}
