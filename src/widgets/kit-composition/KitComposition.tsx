import { FiLayers } from 'react-icons/fi'
import { Link } from 'react-router'
import { kitMassKg, type Kit, type KitPart } from '@/shared/lib/kit-composition'

const decimal = (value: number) => (Number.isInteger(value) ? value.toFixed(1) : String(value)).replace('.', ',')

const STEEL = { fill: '#c3c9d0', stroke: '#4b5563' }
const RUBBER = { fill: '#2f3437', stroke: '#1f2326' }
const INSULATOR = { fill: '#f1dfa8', stroke: '#8a6d1c' }

/** Номер позиции на схеме: кружок и выноска от точки на детали. */
function Callout({ n, x, y, toX, toY }: { n: number; x: number; y: number; toX: number; toY: number }) {
  return (
    <g>
      <line x1={toX} y1={toY} x2={x} y2={y} stroke="hsl(var(--primary))" strokeWidth={1.5} />
      <circle cx={toX} cy={toY} r={2.5} fill="hsl(var(--primary))" />
      <circle cx={x} cy={y} r={13} fill="#fff" stroke="hsl(var(--primary))" strokeWidth={2} />
      <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="hsl(var(--primary))">{n}</text>
    </g>
  )
}

/** Затяжка: гайка, шайба под ней (центр x, низ шайбы y). */
function NutWasher({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x - 10} y={y - 8} width={20} height={8} {...STEEL} />
      <rect x={x - 12} y={y - 24} width={24} height={16} {...STEEL} />
    </>
  )
}

/** Узел КБ-65 в поперечном разрезе, упрощённо; номера — позиции таблицы (черт. 77 альбома). Рисунок свой. */
function Kb65Scheme() {
  return (
    <svg viewBox="0 0 720 320" role="img" aria-labelledby="kit-scheme-title" className="h-auto w-full min-w-[520px]">
      <title id="kit-scheme-title">Схема узла скрепления КБ-65 в разрезе с номерами деталей</title>

      {/* шпала */}
      <rect x={40} y={230} width={640} height={70} rx={4} fill="hsl(var(--muted))" stroke="#9ca3af" />
      <text x={360} y={276} textAnchor="middle" fontSize={14} fill="#6b7280">Железобетонная шпала</text>

      {/* закладные болты уходят в шпалу */}
      <rect x={136} y={160} width={8} height={120} {...STEEL} />
      <rect x={576} y={160} width={8} height={120} {...STEEL} />
      <rect x={126} y={276} width={28} height={10} {...STEEL} strokeDasharray="3 2" />
      <rect x={566} y={276} width={28} height={10} {...STEEL} strokeDasharray="3 2" />

      {/* 1 — прокладка под подкладку, 2 — подкладка с ребордами */}
      <rect x={110} y={218} width={500} height={12} {...RUBBER} />
      <path d="M110 198 H226 V168 H256 V198 H464 V168 H494 V198 H610 V218 H110 Z" {...STEEL} />

      {/* 9 — изолирующие втулки в отверстиях подкладки, закладные болты сквозь них */}
      <rect x={130} y={198} width={20} height={20} {...INSULATOR} />
      <rect x={570} y={198} width={20} height={20} {...INSULATOR} />
      <rect x={136} y={196} width={8} height={24} {...STEEL} />
      <rect x={576} y={196} width={8} height={24} {...STEEL} />

      {/* 8 — скобы, 5 — шайбы, 3 — гайки закладных болтов */}
      <rect x={122} y={192} width={36} height={6} {...STEEL} />
      <rect x={562} y={192} width={36} height={6} {...STEEL} />
      <NutWasher x={140} y={192} />
      <NutWasher x={580} y={192} />

      {/* 10 — подрельсовая прокладка и рельс */}
      <rect x={258} y={191} width={204} height={7} {...RUBBER} />
      <path d="M258 191 H462 V182 L372 172 V62 L410 54 V20 H310 V54 L348 62 V172 L258 182 Z" fill="#d6dade" stroke="#4b5563" />
      <text x={420} y={42} fontSize={14} fill="#6b7280">Рельс Р65</text>

      {/* 4 — клеммные болты в пазах реборд, 6 — клеммы прижимают подошву рельса */}
      <rect x={237} y={110} width={8} height={98} {...STEEL} />
      <rect x={475} y={110} width={8} height={98} {...STEEL} />
      <path d="M222 168 V150 H272 V181 H262 V160 H232 V168 Z" {...STEEL} />
      <path d="M498 168 V150 H448 V181 H458 V160 H488 V168 Z" {...STEEL} />
      <NutWasher x={241} y={150} />
      <NutWasher x={479} y={150} />

      <Callout n={1} x={655} y={205} toX={604} toY={224} />
      <Callout n={2} x={540} y={136} toX={530} toY={204} />
      <Callout n={3} x={74} y={150} toX={128} toY={176} />
      <Callout n={4} x={241} y={82} toX={241} toY={112} />
      <Callout n={5} x={74} y={184} toX={130} toY={188} />
      <Callout n={6} x={515} y={104} toX={494} toY={156} />
      <Callout n={7} x={140} y={82} toX={140} toY={162} />
      <Callout n={8} x={74} y={218} toX={122} toY={195} />
      <Callout n={9} x={100} y={262} toX={134} toY={214} />
      <Callout n={10} x={432} y={118} toX={426} toY={194} />
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
          Узел КБ-65 в разрезе, упрощённо. Номера — позиции в таблице.
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
                  {/* На узком экране стандарт — строкой под названием, отдельный столбец не помещается. */}
                  <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                    <PartStandard part={part} />
                  </div>
                </td>
                <td className="px-3 py-3 text-right align-top font-medium text-foreground">{part.perNode * kit.nodes}</td>
                <td className="px-3 py-3 text-right align-top text-muted-foreground">{decimal(part.massKg)}</td>
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
