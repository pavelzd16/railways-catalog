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
  /** Штук в одном узле; 0 — показана на схеме, но в комплект не входит (рельс). */
  perNode: number
  /** Масса одной детали, кг; null — точная отдельная масса неизвестна. */
  massKg: number | null
  /** Подпись массы вместо числа (у рельса — масса метра). */
  massLabel?: string
  /** Уточнение исполнения или состава без неподтверждённых замен. */
  note?: string
  /** Номер стандарта текстом и адрес его страницы в /normativ, если она есть. */
  standard?: { code: string; slug?: string }
  /** Наша карточка этой детали. */
  product?: { sku: string; href: string }
}

export type KitCallout = { n: number; x: number; y: number }
export type KitFigure = {
  src: string
  w: number
  h: number
  caption: string
  alt: string
  callouts?: KitCallout[]
  minWidth?: number
  /** Диаметр кружка в процентах ширины рисунка. */
  calloutSize?: number
}

export type Kit = {
  /** Заголовок над таблицей. */
  name: string
  /** Сколько узлов в одном комплекте этой карточки. */
  nodes: number
  /** «на шпалу» / «на узел» — подпись к столбцу количества. */
  unitLabel: string
  parts: KitPart[]
  figures: KitFigure[]
  allPartsLinked?: boolean
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
  { pos: 11, name: 'Рельс Р65', perNode: 0, massKg: 0, massLabel: '64,88 на 1 м', standard: { code: 'ГОСТ Р 51685-2022', slug: 'gost-r-51685-2022' }, product: { sku: 'TM-0039', href: '/catalog/zheleznodorozhnye-relsy/magistralnye-relsy/product/relsy-zheleznodorozhnye-r-65' } },
]

const KB65_FIGURES: KitFigure[] = [
  { src: '/schemes/kb-65-uzel-razrez-a-a.svg', w: 1160, h: 980, minWidth: 520,
    alt: 'Узел скрепления КБ-65 на железобетонной шпале, разрез А-А: подкладка, клеммы, клеммные и закладные болты, прокладки',
    caption: 'Узел КБ-65, разрез А-А. Наведите на номер — появится название детали, нажмите — покажем её в таблице.',
    callouts: [
  { n: 1, x: 94, y: 210 },
  { n: 2, x: 237, y: 213 },
  { n: 3, x: 308, y: 215 },
  { n: 4, x: 846, y: 233 },
  { n: 5, x: 921, y: 233 },
  { n: 6, x: 971, y: 233 },
  { n: 7, x: 1035, y: 288 },
  { n: 8, x: 1075, y: 290 },
  { n: 9, x: 1110, y: 291 },
  { n: 10, x: 393, y: 594 },
  { n: 11, x: 604, y: 120 },
] },
  { src: '/schemes/kb-65-uzel-vid-plan.svg', w: 1450, h: 1115,
    alt: 'Скрепление КБ-65 на трёх железобетонных шпалах у рельсового стыка: вид сбоку и план, расстояние между стыковыми шпалами 420 мм',
    caption: 'Узлы КБ-65 у рельсового стыка: вид сбоку и план. Разрез А-А — по средней шпале.' },
]

/** МПС, 1995: таблицы 21 и 27; АРС — МИИТ, 2008, с. 5–7. */
const KB50_PARTS: KitPart[] = [
  {
    "pos": 1,
    "name": "Болт клеммный М22×75",
    "perNode": 2,
    "massKg": 0.345,
    "product": {
      "sku": "TM-0010",
      "href": "/catalog/zhd-krepezh/zheleznodorozhnye-bolty/product/bolt-klemmnyj-m22h75"
    },
    "standard": {
      "code": "ГОСТ 16016-2014",
      "slug": "gost-16016-2014"
    }
  },
  {
    "pos": 2,
    "name": "Гайка М22",
    "perNode": 4,
    "massKg": 0.126,
    "product": {
      "sku": "TM-0015",
      "href": "/catalog/zhd-krepezh/gajki-dlya-boltov-relsovykh-stykov/product/gajka-m22"
    },
    "standard": {
      "code": "ГОСТ 16018-2014",
      "slug": "gost-16018-2014"
    }
  },
  {
    "pos": 3,
    "name": "Клемма СК (стыковая)",
    "perNode": 2,
    "massKg": 0.58,
    "note": "Показана на разрезе А-А."
  },
  {
    "pos": 4,
    "name": "Болт закладной М22×175",
    "perNode": 2,
    "massKg": 0.635,
    "product": {
      "sku": "TM-0033",
      "href": "/catalog/zhd-krepezh/zheleznodorozhnye-bolty/product/bolt-zakladnoj-m22h175"
    },
    "standard": {
      "code": "ГОСТ 16017-2014",
      "slug": "gost-16017-2014"
    }
  },
  {
    "pos": 5,
    "name": "Шайба двухвитковая 25",
    "perNode": 4,
    "massKg": 0.12,
    "product": {
      "sku": "TM-0958",
      "href": "/catalog/zhd-krepezh/zheleznodorozhnye-shajby/product/shajba-dvuhvitkovaya-m25"
    },
    "standard": {
      "code": "ГОСТ 21797-2014",
      "slug": "gost-21797-2014"
    }
  },
  {
    "pos": 6,
    "name": "Скоба ЦП-138 для изолирующей втулки",
    "perNode": 2,
    "massKg": 0.09,
    "product": {
      "sku": "TM-0812",
      "href": "/catalog/zhd-krepezh/zheleznodorozhnye-shajby/product/shajba-skoba-ploskaya-cp-138"
    }
  },
  {
    "pos": 7,
    "name": "Втулка изолирующая ЦП-142",
    "perNode": 2,
    "massKg": 0.04,
    "product": {
      "sku": "TM-0023",
      "href": "/catalog/izolyatsiya-rels/vtulka-izoliruyushchaya-tsp-142/product/vtulka-izoliruyushhaya-tsp-142"
    },
    "standard": {
      "code": "ТУ 3185-024-55239716-2006",
      "slug": "tu-3185-024-55239716-2006"
    }
  },
  {
    "pos": 8,
    "name": "Прокладка под подкладку КБ-50 (ЦП-153)",
    "perNode": 1,
    "massKg": 0.6,
    "standard": {
      "code": "ГОСТ 34078-2017",
      "slug": "gost-34078-2017"
    }
  },
  {
    "pos": 9,
    "name": "Подкладка КБ-50",
    "perNode": 1,
    "massKg": 6.95,
    "product": {
      "sku": "TM-0002",
      "href": "/catalog/zhd-podkladki/podkladki-razdelnogo-skrepleniya/product/podkladka-kb-50-tm0002"
    },
    "standard": {
      "code": "ГОСТ 16277-2016",
      "slug": "gost-16277-2016"
    }
  },
  {
    "pos": 10,
    "name": "Прокладка подрельсовая Р50",
    "perNode": 1,
    "massKg": 0.165,
    "standard": {
      "code": "ГОСТ 34078-2017",
      "slug": "gost-34078-2017"
    }
  },
  {
    "pos": 11,
    "name": "Клемма ПК (промежуточная)",
    "perNode": 2,
    "massKg": 0.62,
    "product": {
      "sku": "TM-0050",
      "href": "/catalog/zhd-krepezh/klemma-pk/product/klemma-pk"
    },
    "standard": {
      "code": "ГОСТ 22343-2014",
      "slug": "gost-22343-2014"
    }
  },
  {
    "pos": 12,
    "name": "Рельс Р50",
    "perNode": 0,
    "massKg": null,
    "massLabel": "51,8 на 1 м",
    "product": {
      "sku": "TM-0020",
      "href": "/catalog/zheleznodorozhnye-relsy/magistralnye-relsy/product/relsy-zheleznodorozhnye-r-50"
    },
    "standard": {
      "code": "ГОСТ Р 51685-2022",
      "slug": "gost-r-51685-2022"
    }
  }
]

const ZHBR65_PARTS: KitPart[] = [
  {
    "pos": 1,
    "name": "Прокладка изоляционная ЖБР-65",
    "perNode": 2,
    "massKg": 0.08
  },
  {
    "pos": 2,
    "name": "Клемма стыковая ЖБР-65",
    "perNode": 2,
    "massKg": 0.73
  },
  {
    "pos": 3,
    "name": "Гайка М22",
    "perNode": 2,
    "massKg": 0.126,
    "product": {
      "sku": "TM-0015",
      "href": "/catalog/zhd-krepezh/gajki-dlya-boltov-relsovykh-stykov/product/gajka-m22"
    },
    "standard": {
      "code": "ГОСТ 16018-2014",
      "slug": "gost-16018-2014"
    }
  },
  {
    "pos": 4,
    "name": "Болт закладной М22×175",
    "perNode": 2,
    "massKg": 0.635,
    "product": {
      "sku": "TM-0033",
      "href": "/catalog/zhd-krepezh/zheleznodorozhnye-bolty/product/bolt-zakladnoj-m22h175"
    },
    "standard": {
      "code": "ГОСТ 16017-2014",
      "slug": "gost-16017-2014"
    }
  },
  {
    "pos": 5,
    "name": "Прокладка подрельсовая ЖБР-65",
    "perNode": 1,
    "massKg": 0.52,
    "standard": {
      "code": "ГОСТ 34078-2017",
      "slug": "gost-34078-2017"
    }
  },
  {
    "pos": 6,
    "name": "Шайба чёрная 22",
    "perNode": 2,
    "massKg": 0.055
  },
  {
    "pos": 7,
    "name": "Втулка изолирующая ЖБР-65",
    "perNode": 2,
    "massKg": 0.02
  },
  {
    "pos": 8,
    "name": "Клемма промежуточная ЖБР-65",
    "perNode": 2,
    "massKg": 0.82,
    "note": "Показана на виде Б-Б."
  },
  {
    "pos": 9,
    "name": "Рельс Р65",
    "perNode": 0,
    "massKg": null,
    "massLabel": "64,88 на 1 м",
    "product": {
      "sku": "TM-0039",
      "href": "/catalog/zheleznodorozhnye-relsy/magistralnye-relsy/product/relsy-zheleznodorozhnye-r-65"
    },
    "standard": {
      "code": "ГОСТ Р 51685-2022",
      "slug": "gost-r-51685-2022"
    }
  }
]

const ARS4_PARTS: KitPart[] = [
  {
    "pos": 1,
    "name": "Клемма АРС-4",
    "perNode": 2,
    "massKg": 0.825,
    "product": {
      "sku": "TM-0019",
      "href": "/catalog/relsovoe-skreplenie-zhbr-ars/skreplenie-ars/product/klemma-ars-4"
    },
    "standard": {
      "code": "ГОСТ 33186-2014"
    }
  },
  {
    "pos": 2,
    "name": "Регулятор АРС-4",
    "perNode": 2,
    "massKg": null,
    "massLabel": "0,35 с фиксатором",
    "note": "Вместе с позицией 3 образует монорегулятор."
  },
  {
    "pos": 3,
    "name": "Фиксатор АРС-4",
    "perNode": 2,
    "massKg": null,
    "massLabel": "в массе регулятора"
  },
  {
    "pos": 4,
    "name": "Подклеммник АРС-4",
    "perNode": 2,
    "massKg": 0.218,
    "product": {
      "sku": "TM-0061",
      "href": "/catalog/relsovoe-skreplenie-zhbr-ars/skreplenie-ars/product/podklemmnik-ars-4"
    }
  },
  {
    "pos": 5,
    "name": "Анкер АРС-4",
    "perNode": 1,
    "massKg": null,
    "massLabel": "4,1–4,7",
    "note": "Единый рамный анкер замоноличен в шпалу.",
    "product": {
      "sku": "TM-0934",
      "href": "/catalog/relsovoe-skreplenie-zhbr-ars/skreplenie-ars/product/anker-ars-04-04-005-03"
    }
  },
  {
    "pos": 6,
    "name": "Уголок изолирующий АРС-4",
    "perNode": 2,
    "massKg": 0.032,
    "product": {
      "sku": "TM-0062",
      "href": "/catalog/relsovoe-skreplenie-zhbr-ars/ugolok-izoliruyushchij-ars-4/product/ugolok-izoliruyushhij-ars-4"
    }
  },
  {
    "pos": 7,
    "name": "Прокладка ЦП-204/АРС",
    "perNode": 1,
    "massKg": 0.52,
    "product": {
      "sku": "TM-0009",
      "href": "/catalog/prokladki-amortizatsionnye-zhd-rels/rezinovye-prokladki-dlya-zhd-rels/product/prokladka-rezinovaya-tsp-204"
    },
    "standard": {
      "code": "ГОСТ 34078-2017",
      "slug": "gost-34078-2017"
    }
  },
  {
    "pos": 8,
    "name": "Рельс Р65",
    "perNode": 0,
    "massKg": null,
    "massLabel": "64,88 на 1 м",
    "product": {
      "sku": "TM-0039",
      "href": "/catalog/zheleznodorozhnye-relsy/magistralnye-relsy/product/relsy-zheleznodorozhnye-r-65"
    },
    "standard": {
      "code": "ГОСТ Р 51685-2022",
      "slug": "gost-r-51685-2022"
    }
  }
]

const KB50_FIGURES: KitFigure[] = [
  {
    "src": "/schemes/kb-50-razrez-b-b.svg",
    "w": 730,
    "h": 885,
    "caption": "Узел КБ-50, разрез Б-Б. Наведите на номер — появится название детали, нажмите — покажем её в таблице.",
    "alt": "Промежуточный узел КБ-50 на железобетонной шпале, разрез Б-Б.",
    "callouts": [
      {
        "n": 1,
        "x": 347,
        "y": 94
      },
      {
        "n": 2,
        "x": 442,
        "y": 94
      },
      {
        "n": 11,
        "x": 516,
        "y": 94
      },
      {
        "n": 4,
        "x": 591,
        "y": 94
      },
      {
        "n": 5,
        "x": 672,
        "y": 161
      },
      {
        "n": 6,
        "x": 670,
        "y": 245
      },
      {
        "n": 7,
        "x": 670,
        "y": 322
      },
      {
        "n": 8,
        "x": 30,
        "y": 583
      },
      {
        "n": 9,
        "x": 31,
        "y": 501
      },
      {
        "n": 10,
        "x": 28,
        "y": 428
      },
      {
        "n": 12,
        "x": 187,
        "y": 126
      }
    ],
    "minWidth": 520,
    "calloutSize": 4
  },
  {
    "src": "/schemes/kb-50-razrez-a-a.svg",
    "w": 690,
    "h": 885,
    "caption": "Узел КБ-50 у стыка, разрез А-А. Клемма СК — позиция 3 в таблице.",
    "alt": "Стыковой узел КБ-50 с рельсовой накладкой и клеммой СК, разрез А-А."
  },
  {
    "src": "/schemes/kb-50-vid-plan.svg",
    "w": 1455,
    "h": 1048,
    "caption": "Узлы КБ-50: вид сбоку и план. Размеры 160 и 280 мм, направление преимущественного движения.",
    "alt": "КБ-50 на трёх шпалах у рельсового стыка: вид сбоку и план."
  }
]

const ZHBR65_FIGURES: KitFigure[] = [
  {
    "src": "/schemes/zhbr-65-razrez-a-a.svg",
    "w": 780,
    "h": 850,
    "caption": "Узел ЖБР-65, разрез А-А. Наведите на номер — появится название детали, нажмите — покажем её в таблице.",
    "alt": "Стыковой узел ЖБР-65, разрез А-А: клеммы, изоляция и закладные болты.",
    "callouts": [
      {
        "n": 1,
        "x": 32,
        "y": 171
      },
      {
        "n": 2,
        "x": 93,
        "y": 171
      },
      {
        "n": 3,
        "x": 151,
        "y": 171
      },
      {
        "n": 4,
        "x": 220,
        "y": 174
      },
      {
        "n": 5,
        "x": 588,
        "y": 173
      },
      {
        "n": 6,
        "x": 701,
        "y": 175
      },
      {
        "n": 7,
        "x": 758,
        "y": 175
      },
      {
        "n": 9,
        "x": 402,
        "y": 134
      }
    ],
    "minWidth": 520,
    "calloutSize": 4
  },
  {
    "src": "/schemes/zhbr-65-vid-b-b.svg",
    "w": 795,
    "h": 590,
    "caption": "Промежуточный узел ЖБР-65, вид Б-Б. Клемма — позиция 8 в таблице.",
    "alt": "Промежуточный узел ЖБР-65 с пружинными клеммами, вид Б-Б."
  },
  {
    "src": "/schemes/zhbr-65-vid-plan.svg",
    "w": 1620,
    "h": 1175,
    "caption": "Узлы ЖБР-65 у стыка: вид сбоку и план, расстояние 420 мм.",
    "alt": "ЖБР-65 на трёх железобетонных шпалах: вид сбоку и план."
  }
]

const ARS4_FIGURES: KitFigure[] = [
  {
    "src": "/schemes/ars-4-axonometry.svg",
    "w": 1640,
    "h": 840,
    "caption": "Узел АРС-4. Наведите на номер — появится название детали, нажмите — покажем её в таблице.",
    "alt": "Аксонометрия узла АРС-4: клеммы, регуляторы, анкеры и изолирующие детали.",
    "callouts": [
      {
        "n": 1,
        "x": 200,
        "y": 103
      },
      {
        "n": 2,
        "x": 438,
        "y": 103
      },
      {
        "n": 3,
        "x": 500,
        "y": 103
      },
      {
        "n": 4,
        "x": 70,
        "y": 103
      },
      {
        "n": 5,
        "x": 330,
        "y": 103
      },
      {
        "n": 6,
        "x": 1270,
        "y": 656
      },
      {
        "n": 7,
        "x": 1130,
        "y": 656
      },
      {
        "n": 8,
        "x": 941,
        "y": 85
      }
    ],
    "minWidth": 520,
    "calloutSize": 3
  },
  {
    "src": "/schemes/ars-4-razrez-vid.svg",
    "w": 705,
    "h": 1017,
    "caption": "Узел АРС-4: разрез и вид сбоку.",
    "alt": "Разрез узла АРС-4 с рамным анкером в шпале и вид сбоку."
  }
]

const KITS: Record<string, Kit> = {
  'TM-0890': { name: 'Состав комплекта КБ-65 на одну шпалу', nodes: 2, unitLabel: 'на шпалу', parts: KB65_PARTS, figures: KB65_FIGURES, allPartsLinked: true },
  'TM-0889': { name: 'Состав комплекта КБ-50 на одну шпалу', nodes: 2, unitLabel: 'на шпалу', parts: KB50_PARTS, figures: KB50_FIGURES },
  'TM-0230': { name: 'Состав комплекта ЖБР-65 на один узел', nodes: 1, unitLabel: 'на узел', parts: ZHBR65_PARTS, figures: ZHBR65_FIGURES },
  'TM-0757': { name: 'Состав комплекта АРС-4 на один узел', nodes: 1, unitLabel: 'на узел', parts: ARS4_PARTS, figures: ARS4_FIGURES },
  'TM-0756': { name: 'Состав комплекта КБ-65 на один узел', nodes: 1, unitLabel: 'на узел', parts: KB65_PARTS, figures: KB65_FIGURES, allPartsLinked: true },
}

export function kitForSku(sku: string | null | undefined): Kit | undefined {
  return sku ? KITS[sku] : undefined
}

/** Масса включённых деталей с округлением до 0,1 кг; null, если хотя бы одна масса неизвестна. */
export function kitMassKg(kit: Kit): number | null {
  const included = kit.parts.filter((part) => part.perNode > 0)
  if (included.some((part) => part.massKg === null)) return null
  const total = included.reduce((sum, part) => sum + part.perNode * kit.nodes * (part.massKg ?? 0), 0)
  return Math.round(total * 10) / 10
}
