import { FiLayers } from 'react-icons/fi'
import { Link } from 'react-router'
import { kitMassKg, type Kit, type KitPart } from '@/shared/lib/kit-composition'

const decimal = (value: number) => (Number.isInteger(value) ? value.toFixed(1) : String(value)).replace('.', ',')

const LINE = '#1f2937'
const THIN = 0.6
const MAIN = 1.3

/** Номер позиции: кружок и выноска с точкой на детали. */
function Callout({ n, x, y, toX, toY }: { n: number; x: number; y: number; toX: number; toY: number }) {
  return (
    <g>
      <line x1={toX} y1={toY} x2={x} y2={y} stroke={LINE} strokeWidth={THIN} />
      <circle cx={toX} cy={toY} r={1.8} fill={LINE} />
      <circle cx={x} cy={y} r={12.5} fill="#fff" stroke="hsl(var(--primary))" strokeWidth={1.5} />
      <text x={x} y={y + 5.2} textAnchor="middle" fontSize={15} fontWeight={700} fill="hsl(var(--primary))">{n}</text>
    </g>
  )
}

/** Гайка сбоку: три видимые грани (x — ось, y — верх). */
function Nut({ x, y, w = 34, h = 22 }: { x: number; y: number; w?: number; h?: number }) {
  const l = x - w / 2
  const r = x + w / 2
  return (
    <g fill="#fff" stroke={LINE} strokeWidth={MAIN}>
      <path d={`M${l} ${y + 3} Q${l} ${y} ${l + 3} ${y} H${r - 3} Q${r} ${y} ${r} ${y + 3} V${y + h - 3} Q${r} ${y + h} ${r - 3} ${y + h} H${l + 3} Q${l} ${y + h} ${l} ${y + h - 3} Z`} />
      <line x1={x - w / 4} y1={y} x2={x - w / 4} y2={y + h} strokeWidth={THIN} />
      <line x1={x + w / 4} y1={y} x2={x + w / 4} y2={y + h} strokeWidth={THIN} />
    </g>
  )
}

/** Двухвитковая шайба: два витка и косой разрез (x — ось, y — верх). */
function SpringWasher({ x, y, w = 38, h = 8 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g fill="#fff" stroke={LINE} strokeWidth={MAIN}>
      <rect x={x - w / 2} y={y} width={w} height={h} />
      <line x1={x - w / 2} y1={y + h / 2} x2={x + w / 2} y2={y + h / 2} strokeWidth={THIN} />
      <line x1={x - 5} y1={y + h} x2={x + 5} y2={y} strokeWidth={THIN} />
    </g>
  )
}

/** Стержень болта М22 с фаской и резьбой сверху (x — ось). */
function Shank({ x, top, bottom }: { x: number; top: number; bottom: number }) {
  return (
    <g fill="#fff" stroke={LINE} strokeWidth={MAIN}>
      <path d={`M${x - 11} ${bottom} V${top + 3} L${x - 8} ${top} H${x + 8} L${x + 11} ${top + 3} V${bottom}`} />
      <line x1={x - 9} y1={top + 3} x2={x - 9} y2={top + 26} strokeWidth={THIN} />
      <line x1={x + 9} y1={top + 3} x2={x + 9} y2={top + 26} strokeWidth={THIN} />
    </g>
  )
}

/** Профиль рельса Р65: ось x = 0, подошва на y = -11; высота 180, подошва 150, головка 75, шейка 18 мм. */
const RAIL_P65 =
  'M75 -11 V-22 L24 -37 Q9 -41 9 -55 V-128 Q9 -142 24 -146 L37.5 -150 V-180 Q37.5 -191 26 -191 H-26 Q-37.5 -191 -37.5 -180 V-150 L-24 -146 Q-9 -142 -9 -128 V-55 Q-9 -41 -24 -37 L-75 -22 V-11 Z'

/** Подкладка КБ-65 с двумя ребордами. */
const PLATE = 'M-185 17 H185 V-5 H128 L118 -44 H77 V-5 H-77 V-44 H-118 L-128 -5 H-185 Z'

/** Клемма ПК правой стороны: пятой на реборде, носком на подошве рельса. */
const CLAMP = [[128, -44], [128, -56], [118, -66], [70, -66], [60, -56], [60, -30], [66, -25], [76, -25], [76, -44]]

/** Заливка детали: в разрезе — штриховка материала, на виде — белая. */
const fill = (view: boolean, material: 'steel' | 'rubber' | 'concrete') => (view ? '#fff' : `url(#kb65-${material})`)

/** Шпала, прокладки, подкладка и рельс — общие для обеих половин; половину отрезает clipPath. */
function Core({ view }: { view: boolean }) {
  return (
    <g>
      <path d="M-270 0 H-216 L-208 25 H208 L216 0 H270 V175 H-270 Z" fill={fill(view, 'concrete')} />

      {/* 1 — прокладка под подкладку корытом по площадке, 2 — подкладка */}
      <path d="M-216 -1 L-208 25 H208 L216 -1 H208 L201 17 H-201 L-208 -1 Z" fill={fill(view, 'rubber')} stroke={LINE} strokeWidth={MAIN} strokeLinejoin="round" />
      <path d={PLATE} fill={fill(view, 'steel')} stroke={LINE} strokeWidth={MAIN} strokeLinejoin="round" />

      {/* 10 — подрельсовая прокладка, 11 — рельс Р65 */}
      <rect x={-75} y={-11} width={150} height={6} fill={fill(view, 'rubber')} stroke={LINE} strokeWidth={MAIN} />
      <path d={RAIL_P65} fill={fill(view, 'steel')} stroke={LINE} strokeWidth={MAIN} strokeLinejoin="round" />
    </g>
  )
}

/**
 * Половина узла: клеммный болт с клеммой и закладной болт; s = 1 справа, -1 слева.
 * view — вид снаружи: детали внутри подкладки, клеммы и шпалы не видны.
 */
function NodeSide({ s, view }: { s: 1 | -1; view: boolean }) {
  const bx = 101 * s // ось клеммного болта — середина реборды
  const ax = 155 * s // ось закладного болта: между закладными 310 мм
  return (
    <g>
      {!view && (
        <>
          {/* паз в реборде и головка клеммного болта в нём */}
          <rect x={bx - 14} y={-32} width={28} height={30} fill="#fff" stroke={LINE} strokeWidth={THIN} />
          <rect x={bx - 13} y={-32} width={26} height={12} rx={2} fill="#fff" stroke={LINE} strokeWidth={MAIN} />
        </>
      )}

      {/* 6 — клемма */}
      <polygon points={CLAMP.map(([x, y]) => `${x * s},${y}`).join(' ')} fill={fill(view, 'steel')} stroke={LINE} strokeWidth={MAIN} strokeLinejoin="round" />

      {/* 4 — клеммный болт, 5 — шайба, 3 — гайка */}
      <Shank x={bx} top={-107} bottom={view ? -74 : -20} />
      <SpringWasher x={bx} y={-74} />
      <Nut x={bx} y={-96} />

      {!view && (
        <>
          {/* отверстие в шпале и закладная шайба с головкой болта */}
          <rect x={ax - 14} y={25} width={28} height={150} fill="#fff" stroke="none" />
          <path d={`M${ax - 14} 25 V108 M${ax + 14} 25 V108 M${ax - 20} 120 L${ax - 14} 138 V175 M${ax + 20} 120 L${ax + 14} 138 V175`} fill="none" stroke={LINE} strokeWidth={THIN} />
          <path d={`M${ax - 32} 106 H${ax + 32} L${ax + 26} 113 H${ax - 26} Z`} fill="url(#kb65-steel)" stroke={LINE} strokeWidth={MAIN} />
          <path d={`M${ax - 20} 113 H${ax + 20} L${ax + 16} 126 H${ax - 16} Z`} fill="#fff" stroke={LINE} strokeWidth={MAIN} />
          {/* 9 — изолирующая втулка в отверстии подкладки */}
          <rect x={ax - 17} y={-9} width={34} height={26} fill="url(#kb65-rubber)" stroke={LINE} strokeWidth={MAIN} />
        </>
      )}

      {/* 8 — скоба, 7 — закладной болт с шайбой 5 и гайкой 3 */}
      <rect x={ax - 26} y={-15} width={52} height={6} fill={fill(view, 'steel')} stroke={LINE} strokeWidth={MAIN} />
      <Shank x={ax} top={-55} bottom={view ? -23 : 113} />
      <SpringWasher x={ax} y={-23} />
      <Nut x={ax} y={-45} />
      <line x1={ax} y1={-62} x2={ax} y2={view ? 30 : 182} stroke={LINE} strokeWidth={THIN} strokeDasharray="14 3 2 3" />
    </g>
  )
}

/**
 * Узел КБ-65 в поперечном разрезе. Геометрия — по черт. 77 Альбома чертежей ВСП (МПС, 1995), перерисовано
 * в миллиметрах (1 единица = 1 мм); номера — позиции таблицы. Промежуточный узел, без стыковых накладок.
 */
function Kb65Scheme() {
  return (
    <svg viewBox="-282 -238 564 425" role="img" aria-labelledby="kit-scheme-title" className="h-auto w-full min-w-[440px]">
      <title id="kit-scheme-title">Узел скрепления КБ-65 в поперечном разрезе с номерами деталей</title>
      <defs>
        <pattern id="kb65-steel" width={5} height={5} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={5} height={5} fill="#fff" />
          <line x1={0} y1={0} x2={0} y2={5} stroke={LINE} strokeWidth={0.55} />
        </pattern>
        <pattern id="kb65-rubber" width={4} height={4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={4} height={4} fill="#fff" />
          <line x1={0} y1={0} x2={0} y2={4} stroke={LINE} strokeWidth={0.6} />
          <line x1={0} y1={0} x2={4} y2={0} stroke={LINE} strokeWidth={0.6} />
        </pattern>
        <pattern id="kb65-concrete" width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width={12} height={12} fill="#fff" />
          <line x1={0} y1={0} x2={0} y2={7} stroke="#9ca3af" strokeWidth={0.6} />
        </pattern>
        <clipPath id="kb65-left">
          <rect x={-300} y={-260} width={300} height={460} />
        </clipPath>
        <clipPath id="kb65-right">
          <rect x={0} y={-260} width={300} height={460} />
        </clipPath>
      </defs>

      {/* как на черт. 77: слева — вид снаружи, справа — разрез */}
      <g clipPath="url(#kb65-left)">
        <Core view />
      </g>
      <g clipPath="url(#kb65-right)">
        <Core view={false} />
      </g>

      {/* контур шпалы с подрельсовой площадкой глубиной 25 мм, снизу — линия обрыва */}
      <path d="M-270 175 V0 H-216 L-208 25 H208 L216 0 H270 V175" fill="none" stroke={LINE} strokeWidth={MAIN} />
      <path d="M-276 175 H-40 L-32 166 L-24 184 L-16 175 H276" fill="none" stroke={LINE} strokeWidth={THIN} />
      <text x={-135} y={120} textAnchor="middle" fontSize={13} fill="#4b5563">Железобетонная шпала</text>
      <text x={46} y={-176} fontSize={13} fill="#4b5563">Рельс Р65</text>

      <NodeSide s={-1} view />
      <NodeSide s={1} view={false} />

      {/* ось рельса и размер между закладными болтами */}
      <line x1={0} y1={-205} x2={0} y2={182} stroke={LINE} strokeWidth={THIN} strokeDasharray="14 3 2 3" />
      <g stroke={LINE} strokeWidth={THIN} fill={LINE}>
        <line x1={-155} y1={60} x2={155} y2={60} />
        <path d="M-155 60 l9 -3 v6 Z M155 60 l-9 -3 v6 Z" />
      </g>
      <text x={-70} y={54} textAnchor="middle" fontSize={13} fill={LINE} paintOrder="stroke" stroke="#fff" strokeWidth={4}>310</text>

      <Callout n={1} x={-258} y={-60} toX={-211} toY={8} />
      <Callout n={2} x={-205} y={-160} toX={-122} toY={-20} />
      <Callout n={3} x={-150} y={-150} toX={-110} toY={-86} />
      <Callout n={4} x={101} y={-150} toX={101} toY={-104} />
      <Callout n={5} x={140} y={-150} toX={117} toY={-70} />
      <Callout n={6} x={178} y={-150} toX={124} toY={-54} />
      <Callout n={7} x={205} y={-105} toX={157} toY={-52} />
      <Callout n={8} x={238} y={-95} toX={178} toY={-12} />
      <Callout n={9} x={262} y={-55} toX={168} toY={8} />
      <Callout n={10} x={62} y={100} toX={45} toY={-8} />
      <Callout n={11} x={-80} y={-200} toX={-24} toY={-172} />
    </svg>
  )
}

/** Номер стандарта детали: ссылкой на страницу в «ГОСТах и нормативах», если она есть, иначе текстом. */
function PartStandard({ part }: { part: KitPart }) {
  if (!part.standard) return <>—</>
  if (!part.standard.slug) return <>{part.standard.code}</>
  return (
    <Link
      to={`/normativ/${encodeURIComponent(part.standard.slug)}`}
      className="underline decoration-[hsl(var(--primary))] underline-offset-4 transition-colors hover:text-[hsl(var(--primary))]"
    >
      {part.standard.code}
    </Link>
  )
}

/** «Состав комплекта» в карточке комплекта скрепления: схема узла и таблица деталей со ссылками на детали и ГОСТы. */
export function KitComposition({ kit }: { kit: Kit }) {
  return (
    <section aria-labelledby="kit-composition-title" className="mb-12 border-t border-border pt-10">
      <div className="mb-5 flex items-center gap-2">
        <FiLayers aria-hidden className="h-5 w-5 text-primary" />

        <h2 id="kit-composition-title" className="section-title">
          {kit.name}
        </h2>
      </div>

      <p className="mb-6 max-w-4xl text-base leading-7 text-muted-foreground">
        {kit.nodes === 2
          ? 'На одну шпалу идут два узла скрепления — по одному под каждую рельсовую нить, поэтому количество деталей в таблице удвоено.'
          : 'Один узел крепит одну рельсовую нить на одной шпале; на шпалу нужно два таких комплекта.'}{' '}
        Каждая деталь есть в каталоге и отдельно — по ссылке в таблице, если нужно доукомплектовать узлы.
      </p>

      {/* На телефоне схема шире экрана и прокручивается: целиком в 360 px номера деталей не прочесть. */}
      <figure className="mb-8 max-w-3xl rounded-lg border border-border bg-card p-4">
        <div className="overflow-x-auto">
          <Kb65Scheme />
        </div>
        <figcaption className="mt-2 text-sm text-muted-foreground">
          Узел КБ-65: слева — вид, справа — разрез; по черт. 77 Альбома чертежей ВСП (МПС, 1995). Номера — позиции в таблице.
        </figcaption>
      </figure>

      <div className="max-w-4xl overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-3 font-medium">№</th>
              <th scope="col" className="px-3 py-3 font-medium">Деталь</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Шт. {kit.unitLabel}</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Масса 1 шт., кг</th>
              <th scope="col" className="hidden px-3 py-3 font-medium sm:table-cell">Стандарт</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {kit.parts.map((part) => (
              <tr key={part.pos}>
                <td className="px-3 py-3 align-top font-bold text-primary">{part.pos}</td>
                <td className="px-3 py-3 text-foreground">
                  {part.product ? (
                    <Link
                      to={part.product.href}
                      className="font-medium underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-[hsl(var(--primary))]"
                    >
                      {part.name}
                    </Link>
                  ) : (
                    part.name
                  )}
                  {!part.perNode && <div className="mt-1 text-xs text-muted-foreground">в комплект не входит</div>}
                  {/* На узком экране стандарт — строкой под названием, отдельный столбец не помещается. */}
                  <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                    <PartStandard part={part} />
                  </div>
                </td>
                <td className="px-3 py-3 text-right align-top font-medium text-foreground">{part.perNode ? part.perNode * kit.nodes : '—'}</td>
                <td className="px-3 py-3 text-right align-top text-muted-foreground">{part.massLabel ?? decimal(part.massKg)}</td>
                <td className="hidden px-3 py-3 align-top text-muted-foreground sm:table-cell">
                  <PartStandard part={part} />
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot className="border-t border-border bg-muted/50">
            <tr>
              <td colSpan={5} className="px-3 py-3 font-medium text-foreground">
                Масса комплекта — около {decimal(kitMassKg(kit))} кг
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-3 max-w-4xl text-xs text-muted-foreground">{kit.source}</p>
    </section>
  )
}
